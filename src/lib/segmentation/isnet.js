import { removeBackground } from '@imgly/background-removal'
import { loadImageFromFile, toCanvas } from '../image'

/** ISNet (via @imgly): isolates the main subject well; ratio is the model download progress. */
export async function cutOutWithIsnet(image, maxSide, onProgress) {
  const source = toCanvas(image, maxSide)
  const blob = await new Promise((resolve) => source.toBlob(resolve, 'image/png'))
  const result = await removeBackground(blob, {
    progress: (key, current, total) => {
      if (key.startsWith('fetch')) onProgress(total ? current / total : 0)
    },
  })
  return toCanvas(await loadImageFromFile(result), maxSide)
}
