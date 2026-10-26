import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers'
import { createCanvas, toCanvas } from '../image'

const MODEL_ID = 'briaai/RMBG-1.4'
const MODEL_SIZE = 1024
const PROCESSOR_CONFIG = {
  do_normalize: true,
  do_pad: false,
  do_rescale: true,
  do_resize: true,
  image_mean: [0.5, 0.5, 0.5],
  image_std: [1, 1, 1],
  resample: 2,
  rescale_factor: 1 / 255,
  feature_extractor_type: 'ImageFeatureExtractor',
  size: { width: MODEL_SIZE, height: MODEL_SIZE },
}

env.allowLocalModels = false

let loading = null // model and processor are loaded once, then cached by the browser

function loadModel(onProgress) {
  loading ??= Promise.all([
    AutoModel.from_pretrained(MODEL_ID, { config: { model_type: 'custom' }, progress_callback: onProgress }),
    AutoProcessor.from_pretrained(MODEL_ID, { config: PROCESSOR_CONFIG }),
  ])
  return loading
}

/**
 * Removes the background of `image` and returns a canvas whose alpha channel is the predicted mask.
 * `onProgress(ratio)` reports the model download (0-1); it stays silent once the model is cached.
 */
export async function cutOutWithRmbg(image, maxSide, onProgress) {
  const files = new Map()
  const [model, processor] = await loadModel((event) => {
    if (event.status !== 'progress') return
    files.set(event.file, event)
    const loaded = [...files.values()].reduce((sum, f) => sum + f.loaded, 0)
    const total = [...files.values()].reduce((sum, f) => sum + f.total, 0)
    onProgress(total ? loaded / total : 0)
  })

  const canvas = toCanvas(image, maxSide)
  const source = await RawImage.fromCanvas(canvas)
  const { pixel_values } = await processor(source)
  const { output } = await model({ input: pixel_values })
  const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(canvas.width, canvas.height)

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < mask.data.length; i++) pixels.data[i * 4 + 3] = mask.data[i]
  const out = createCanvas(canvas.width, canvas.height)
  out.getContext('2d').putImageData(pixels, 0, 0)
  return out
}
