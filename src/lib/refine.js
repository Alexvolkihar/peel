import { createCanvas } from './image'

const MAX_TRANSPARENCY_THRESHOLD = 0.6 // alpha ratio cut at level 100
const EDGE_SOFTNESS = 50 // alpha range (0-255) over which the edge fades in
const MIN_ISLAND_RATIO = 0.1 // islands smaller than this share of the main subject are dropped

const smoothstep = (lo, hi, x) => {
  const t = Math.min(1, Math.max(0, (x - lo) / (hi - lo)))
  return t * t * (3 - 2 * t)
}

/** Labels 4-connected visible regions; returns the label of each pixel and the size of each region. */
function labelRegions(alpha, width, height) {
  const labels = new Int32Array(width * height)
  const sizes = [0]
  const stack = []
  for (let start = 0; start < labels.length; start++) {
    if (!alpha[start] || labels[start]) continue
    const label = sizes.length
    let size = 0
    labels[start] = label
    stack.push(start)
    while (stack.length) {
      const index = stack.pop()
      size++
      const x = index % width
      const neighbours = [
        x > 0 ? index - 1 : -1,
        x < width - 1 ? index + 1 : -1,
        index >= width ? index - width : -1,
        index < labels.length - width ? index + width : -1,
      ]
      for (const next of neighbours) {
        if (next < 0 || !alpha[next] || labels[next]) continue
        labels[next] = label
        stack.push(next)
      }
    }
    sizes.push(size)
  }
  return { labels, sizes }
}

/**
 * Cleans the model's alpha mask: removes faint "ghost" pixels (threshold from `level`, 0-100)
 * and drops small disconnected islands that are not part of the main subject.
 */
export function refineMask(source, level) {
  const { width, height } = source
  const ctx = source.getContext('2d', { willReadFrequently: true })
  const image = ctx.getImageData(0, 0, width, height)
  const { data } = image

  const low = (level / 100) * MAX_TRANSPARENCY_THRESHOLD * 255
  const alpha = new Uint8Array(width * height)
  for (let i = 0; i < alpha.length; i++) {
    alpha[i] = Math.round(255 * smoothstep(low, low + EDGE_SOFTNESS, data[i * 4 + 3]))
  }

  const { labels, sizes } = labelRegions(alpha, width, height)
  const minSize = Math.max(...sizes) * MIN_ISLAND_RATIO
  for (let i = 0; i < alpha.length; i++) {
    data[i * 4 + 3] = sizes[labels[i]] >= minSize ? alpha[i] : 0
  }

  const out = createCanvas(width, height)
  out.getContext('2d').putImageData(image, 0, 0)
  return out
}
