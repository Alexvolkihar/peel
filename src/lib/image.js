const ALPHA_THRESHOLD = 8

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export const loadImageFromFile = (file) => loadImage(URL.createObjectURL(file))

export function createCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/** Copies an image into a canvas, downscaled so its longest side is at most `maxSide`. */
export function toCanvas(img, maxSide = Infinity) {
  const width = img.naturalWidth ?? img.width
  const height = img.naturalHeight ?? img.height
  const ratio = Math.min(1, maxSide / Math.max(width, height))
  const canvas = createCanvas(Math.round(width * ratio), Math.round(height * ratio))
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

/** Bounding box of the visible pixels of a canvas (the whole canvas when nothing is visible). */
export function findSubjectBox(canvas) {
  const { width, height } = canvas
  const { data } = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height)

  let minX = width, minY = height, maxX = -1, maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] <= ALPHA_THRESHOLD) continue
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
  }
  if (maxX < 0) return { x: 0, y: 0, width, height }
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
}

export function cropToBox(canvas, box) {
  const out = createCanvas(box.width, box.height)
  out.getContext('2d').drawImage(canvas, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height)
  return out
}

/** Draws `img` so it covers the whole W×H area (like CSS object-fit: cover). */
export function drawCover(ctx, img, W, H) {
  const iw = img.naturalWidth ?? img.width
  const ih = img.naturalHeight ?? img.height
  const ratio = Math.max(W / iw, H / ih)
  ctx.drawImage(img, (W - iw * ratio) / 2, (H - ih * ratio) / 2, iw * ratio, ih * ratio)
}

export function downloadBlob(blob, filename) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
