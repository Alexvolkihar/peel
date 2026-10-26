import { createCanvas, toCanvas } from './image'
import { labelRegions } from './refine'

const WORK_SIDE = 384 // the split is computed on a small copy, then scaled back up smoothly
const MAX_SEPARATION_RATIO = 0.06 // share of WORK_SIDE eroded at separation 100
const VISIBLE_ALPHA = 128
const CENTER_WEIGHT = 0.5

function neighbours(index, width, height) {
  const x = index % width
  const list = []
  if (x > 0) list.push(index - 1)
  if (x < width - 1) list.push(index + 1)
  if (index >= width) list.push(index - width)
  if (index < width * (height - 1)) list.push(index + width)
  return list
}

function erode(mask, width, height, times) {
  let current = mask
  for (let step = 0; step < times; step++) {
    const next = new Uint8Array(current)
    for (let i = 0; i < current.length; i++) {
      if (current[i] && neighbours(i, width, height).some((n) => !current[n])) next[i] = 0
    }
    current = next
  }
  return current
}

/** Grows `seed` by `times` pixels, never leaving `allowed`. */
function dilateWithin(seed, allowed, width, height, times) {
  let current = seed
  for (let step = 0; step < times; step++) {
    const next = new Uint8Array(current)
    for (let i = 0; i < current.length; i++) {
      if (current[i]) neighbours(i, width, height).forEach((n) => allowed[n] && (next[n] = 1))
    }
    current = next
  }
  return current
}

/** Picks the biggest region, favouring the one closest to the image centre. */
function pickMainRegion(labels, sizes, width, height) {
  const sums = sizes.map(() => ({ x: 0, y: 0 }))
  labels.forEach((label, i) => {
    if (!label) return
    sums[label].x += i % width
    sums[label].y += Math.floor(i / width)
  })
  const half = Math.hypot(width, height) / 2
  let best = 0
  let bestScore = -1
  for (let label = 1; label < sizes.length; label++) {
    const off = Math.hypot(sums[label].x / sizes[label] - width / 2, sums[label].y / sizes[label] - height / 2)
    const score = sizes[label] * (1 - CENTER_WEIGHT * (off / half))
    if (score > bestScore) [best, bestScore] = [label, score]
  }
  return best
}

/**
 * Keeps only the main subject of a cut-out canvas: thin contacts between subjects are cut by
 * eroding the mask (`separation`, 0-100), the best region is kept, then grown back.
 */
export function keepMainSubject(source, separation) {
  const small = toCanvas(source, WORK_SIDE)
  const { width, height } = small
  const { data } = small.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height)
  const visible = Uint8Array.from({ length: width * height }, (_, i) => (data[i * 4 + 3] >= VISIBLE_ALPHA ? 1 : 0))

  const radius = Math.max(1, Math.round((separation / 100) * MAX_SEPARATION_RATIO * WORK_SIDE))
  const { labels, sizes } = labelRegions(erode(visible, width, height, radius), width, height)
  if (sizes.length < 2) return source // erosion removed everything: leave the cut-out untouched

  const main = pickMainRegion(labels, sizes, width, height)
  const seed = Uint8Array.from(labels, (label) => (label === main ? 1 : 0))
  const kept = dilateWithin(seed, visible, width, height, radius + 1)

  const mask = createCanvas(width, height)
  const maskCtx = mask.getContext('2d')
  const pixels = maskCtx.createImageData(width, height)
  kept.forEach((on, i) => on && (pixels.data[i * 4 + 3] = 255))
  maskCtx.putImageData(pixels, 0, 0)

  const out = createCanvas(source.width, source.height)
  const ctx = out.getContext('2d')
  ctx.drawImage(source, 0, 0)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(mask, 0, 0, out.width, out.height)
  return out
}
