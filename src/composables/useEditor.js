import { reactive, ref, shallowRef, computed } from 'vue'
import { removeBackground } from '@imgly/background-removal'
import { SIZES, EXPORT_FORMATS, createScene } from '../config'
import { cropToSubject, downloadBlob, loadImage, loadImageFromFile } from '../lib/image'
import { paintScene } from '../lib/render'

// Module-level state: a single editor session, no store library needed.
const stage = ref('home') // 'home' | 'loading' | 'editor'
const fileName = ref('image')
const errorMessage = ref('')
const progress = reactive({ ratio: 0, label: '' })
const scene = reactive(createScene())
const assets = shallowRef({ original: null, cutout: null, bgImage: null })

const dimensions = computed(() => {
  const { w, h } = SIZES.find((size) => size.id === scene.size)
  const { original } = assets.value
  return w ? { width: w, height: h } : { width: original.naturalWidth, height: original.naturalHeight }
})

function setAssets(patch) {
  assets.value = { ...assets.value, ...patch }
}

function trackProgress(key, current, total) {
  progress.ratio = total ? current / total : 0
  progress.label = key.startsWith('fetch') ? 'Téléchargement du modèle (une seule fois)…' : 'Détourage en cours…'
}

async function importFile(file) {
  if (!file?.type.startsWith('image/')) return
  errorMessage.value = ''
  fileName.value = file.name.replace(/\.[^.]+$/, '')
  stage.value = 'loading'
  progress.ratio = 0
  progress.label = 'Chargement du modèle…'

  try {
    const original = await loadImageFromFile(file)
    const cutBlob = await removeBackground(file, { progress: trackProgress })
    const cutout = cropToSubject(await loadImage(URL.createObjectURL(cutBlob)))
    Object.assign(scene, createScene())
    assets.value = { original, cutout, bgImage: null }
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
  assets.value = { original: null, cutout: null, bgImage: null }
}

export function useEditor() {
  return { stage, fileName, errorMessage, progress, scene, assets, dimensions, importFile, setBackgroundImage, exportImage, reset }
}
