import { reactive, ref, shallowRef, computed, watch } from 'vue'
import { zipSync } from 'fflate'
import { EXPORT_FORMATS, CUTOUT_MAX_SIDE, createScene } from '../config'
import { clearEdits, commitStroke, composeCutout, createEdits, paintSegment, redoStroke, undoStroke } from '../lib/brush'
import { downloadBlob, loadImageFromFile } from '../lib/image'
import { animateSubject, recordCanvas } from '../lib/animate'
import { buildCutout, sceneDimensions } from '../lib/pipeline'
import { cutOutSubject } from '../lib/segmentation'
import { paintScene } from '../lib/render'

// Module-level state: a single editor session, no store library needed.
const stage = ref('home') // 'home' | 'loading' | 'editor'
const fileName = ref('image')
const errorMessage = ref('')
const progress = reactive({ ratio: 0, label: '' })
const modelId = ref('rmbg')
const busy = ref(false) // a (re)cut-out is running
const batch = reactive({ running: false, done: 0, total: 0 })
const scene = reactive(createScene())
const brush = reactive({ mode: 'erase', size: 24, softness: 40, undoable: 0, redoable: 0 }) // size = radius in screen px, softness 0-100
const assets = shallowRef({})

const EMPTY_ASSETS = { original: null, rawCutout: null, refined: null, box: null, edits: null, cutout: null, bgImage: null }

const dimensions = computed(() => sceneDimensions(scene, assets.value.original))

function setAssets(patch) {
  assets.value = { ...assets.value, ...patch }
}

/** Rebuilds the subject from the raw mask, keeping the manual brush edits. */
function rebuildCutout() {
  const { rawCutout, edits } = assets.value
  const { refined, box } = buildCutout(rawCutout, scene)
  setAssets({ refined, box, cutout: composeCutout(refined, edits, box) })
}

function trackDownload(ratio) {
  progress.ratio = ratio
  progress.label = 'Téléchargement du modèle (une seule fois)…'
}

async function runCutOut() {
  busy.value = true
  progress.ratio = 0
  progress.label = 'Détourage en cours…'
  try {
    const rawCutout = await cutOutSubject(modelId.value, assets.value.original, CUTOUT_MAX_SIDE, trackDownload)
    setAssets({ rawCutout, edits: createEdits(assets.value.original, rawCutout) })
    syncBrushHistory()
    rebuildCutout()
  } finally {
    busy.value = false
  }
}

async function importFile(file) {
  if (!file?.type.startsWith('image/')) return
  errorMessage.value = ''
  fileName.value = file.name.replace(/\.[^.]+$/, '')
  stage.value = 'loading'

  try {
    assets.value = { ...EMPTY_ASSETS, original: await loadImageFromFile(file) }
    Object.assign(scene, createScene())
    await runCutOut()
    stage.value = 'editor'
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Le détourage a échoué. Essaie une autre image.'
    stage.value = 'home'
  }
}

async function setBackgroundImage(file) {
  if (!file) return
  setAssets({ bgImage: await loadImageFromFile(file) })
  scene.bg.kind = 'image'
}

const renderCanvas = (dims) => Object.assign(document.createElement('canvas'), dims)
const toBlob = (canvas, mime) => new Promise((resolve) => canvas.toBlob(resolve, mime, 0.95))

/** Renders the current scene settings on `photoAssets` as an image blob. */
async function renderToBlob(photoAssets, format) {
  const dims = sceneDimensions(scene, photoAssets.original)
  const canvas = renderCanvas(dims)
  paintScene(canvas.getContext('2d'), dims, scene, photoAssets, { flatten: format !== 'png' })
  return toBlob(canvas, EXPORT_FORMATS[format].mime)
}

async function exportImage(format) {
  downloadBlob(await renderToBlob(assets.value, format), `${fileName.value}.${EXPORT_FORMATS[format].ext}`)
}

async function exportAnimation(style) {
  const dims = dimensions.value
  const canvas = renderCanvas(dims)
  const ctx = canvas.getContext('2d')
  const blob = await recordCanvas(canvas, (t) => {
    const animated = { ...scene, subject: animateSubject(style, scene.subject, t) }
    paintScene(ctx, dims, animated, assets.value, { flatten: true })
  })
  downloadBlob(blob, `${fileName.value}-${style}.webm`)
}

/** Applies the current look (model, background, shadow, size…) to other photos and downloads a ZIP. */
async function exportBatch(files, format) {
  const images = [...files].filter((file) => file.type.startsWith('image/'))
  Object.assign(batch, { running: true, done: 0, total: images.length })
  const entries = {}
  try {
    for (const file of images) {
      const original = await loadImageFromFile(file)
      const rawCutout = await cutOutSubject(modelId.value, original, CUTOUT_MAX_SIDE, () => {})
      const { refined, box } = buildCutout(rawCutout, scene)
      const blob = await renderToBlob({ original, cutout: composeCutout(refined, null, box), bgImage: assets.value.bgImage }, format)
      const base = file.name.replace(/\.[^.]+$/, '')
      const key = `${base}.${EXPORT_FORMATS[format].ext}`
      entries[key in entries ? `${base}-${batch.done + 1}.${EXPORT_FORMATS[format].ext}` : key] = new Uint8Array(await blob.arrayBuffer())
      batch.done++
    }
    downloadBlob(new Blob([zipSync(entries, { level: 0 })], { type: 'application/zip' }), 'lot-atelier.zip')
  } finally {
    batch.running = false
  }
}

function reset() {
  stage.value = 'home'
  assets.value = EMPTY_ASSETS
}

watch(() => [scene.cutoutLevel, scene.mainSubject.on, scene.mainSubject.separation], () => {
  if (assets.value.rawCutout) rebuildCutout()
})

let currentStroke = null
let recomposeQueued = false

/** Recomposes the cut-out; during a stroke this runs at most once per frame. */
function recomposeBrush() {
  if (recomposeQueued) return
  recomposeQueued = true
  requestAnimationFrame(() => {
    recomposeQueued = false
    const { edits, refined, box } = assets.value
    if (edits) setAssets({ cutout: composeCutout(refined, edits, box) })
  })
}

function syncBrushHistory() {
  const { edits } = assets.value
  brush.undoable = edits?.strokes.length ?? 0
  brush.redoable = edits?.undone.length ?? 0
}

function startBrushStroke() {
  currentStroke = { mode: brush.mode, softness: brush.softness / 100, segments: [] }
}

function brushSegment(from, to, radius) {
  const segment = { from, to, radius }
  currentStroke.segments.push(segment)
  paintSegment(assets.value.edits, currentStroke, segment)
  recomposeBrush()
}

function endBrushStroke() {
  if (!currentStroke) return
  commitStroke(assets.value.edits, currentStroke)
  currentStroke = null
  syncBrushHistory()
}

function undoBrush() {
  undoStroke(assets.value.edits)
  syncBrushHistory()
  recomposeBrush()
}

function redoBrush() {
  redoStroke(assets.value.edits)
  syncBrushHistory()
  recomposeBrush()
}

function resetBrushEdits() {
  clearEdits(assets.value.edits)
  syncBrushHistory()
  recomposeBrush()
}

export function useEditor() {
  return {
    stage, modelId, busy, batch, brush, fileName, errorMessage, progress, scene, assets, dimensions,
    importFile, startBrushStroke, brushSegment, endBrushStroke, undoBrush, redoBrush, resetBrushEdits, setBackgroundImage, exportImage, exportAnimation, exportBatch, reset,
  }
}
