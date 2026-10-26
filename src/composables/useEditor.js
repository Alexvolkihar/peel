import { reactive, ref, shallowRef, computed, watch } from 'vue'
import { SIZES, EXPORT_FORMATS, CUTOUT_MAX_SIDE, createScene } from '../config'
import { cropToSubject, downloadBlob, loadImageFromFile } from '../lib/image'
import { refineMask } from '../lib/refine'
import { keepMainSubject } from '../lib/mainSubject'
import { cutOutSubject } from '../lib/segmentation'
import { paintScene } from '../lib/render'

// Module-level state: a single editor session, no store library needed.
const stage = ref('home') // 'home' | 'loading' | 'editor'
const fileName = ref('image')
const errorMessage = ref('')
const progress = reactive({ ratio: 0, label: '' })
const modelId = ref('rmbg')
const busy = ref(false) // a (re)cut-out is running
const scene = reactive(createScene())
const assets = shallowRef({ original: null, rawCutout: null, cutout: null, bgImage: null })

const dimensions = computed(() => {
  const { w, h } = SIZES.find((size) => size.id === scene.size)
  const { original } = assets.value
  return w ? { width: w, height: h } : { width: original.naturalWidth, height: original.naturalHeight }
})

function setAssets(patch) {
  assets.value = { ...assets.value, ...patch }
}

function refineSubject(rawCutout) {
  const refined = refineMask(rawCutout, scene.cutoutLevel)
  const { on, separation } = scene.mainSubject
  return cropToSubject(on ? keepMainSubject(refined, separation) : refined)
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
    setAssets({ rawCutout, cutout: refineSubject(rawCutout) })
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
    assets.value = { original: await loadImageFromFile(file), rawCutout: null, cutout: null, bgImage: null }
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

function exportImage(format) {
  const { width, height } = dimensions.value
  const canvas = Object.assign(document.createElement('canvas'), { width, height })
  const { mime, ext } = EXPORT_FORMATS[format]
  paintScene(canvas.getContext('2d'), { width, height }, scene, assets.value, { flatten: format !== 'png' })
  canvas.toBlob((blob) => downloadBlob(blob, `${fileName.value}.${ext}`), mime, 0.95)
}

function reset() {
  stage.value = 'home'
  assets.value = { original: null, rawCutout: null, cutout: null, bgImage: null }
}

watch(() => [scene.cutoutLevel, scene.mainSubject.on, scene.mainSubject.separation], () => {
  if (assets.value.rawCutout) setAssets({ cutout: refineSubject(assets.value.rawCutout) })
})

watch(modelId, async () => {
  if (stage.value !== 'editor') return
  errorMessage.value = ''
  try {
    await runCutOut()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Ce modèle a échoué sur cette image.'
  }
})

export function useEditor() {
  return { stage, modelId, busy, fileName, errorMessage, progress, scene, assets, dimensions, importFile, setBackgroundImage, exportImage, reset }
}
