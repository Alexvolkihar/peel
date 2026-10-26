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

function createCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/** Crops a transparent-background image to the bounding box of its visible pixels. */
export function cropToSubject(img) {
  const source = createCanvas(img.naturalWidth, img.naturalHeight)
  const ctx = source.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)
  const { data, width, height } = ctx.getImageData(0, 0, source.width, source.height)

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
  if (maxX < 0) return source

  const out = createCanvas(maxX - minX + 1, maxY - minY + 1)
  out.getContext('2d').drawImage(source, minX, minY, out.width, out.height, 0, 0, out.width, out.height)
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
