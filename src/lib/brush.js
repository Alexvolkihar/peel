import { createCanvas, cropToBox } from './image'

/**
 * Manual retouching layers, all in the cut-out's full-size coordinates:
 * `erase` and `keep` hold the brush strokes, `source` is the original photo used to bring pixels back.
 */
export function createEdits(original, { width, height }) {
  const source = createCanvas(width, height)
  source.getContext('2d').drawImage(original, 0, 0, width, height)
  return {
    source,
    erase: createCanvas(width, height),
    keep: createCanvas(width, height),
    layer: createCanvas(width, height), // scratch canvases reused by composeCutout
    work: createCanvas(width, height),
  }
}

function drawLine(canvas, operation, from, to, radius) {
  const ctx = canvas.getContext('2d')
  ctx.globalCompositeOperation = operation
  ctx.lineCap = 'round'
  ctx.lineWidth = radius * 2
  ctx.strokeStyle = '#000'
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
}

/** A stroke adds to one layer and removes from the other, so the last stroke always wins. */
export function paintStroke(edits, mode, from, to, radius) {
  const [target, other] = mode === 'erase' ? [edits.erase, edits.keep] : [edits.keep, edits.erase]
  drawLine(target, 'source-over', from, to, radius)
  drawLine(other, 'destination-out', from, to, radius)
}

export function clearEdits(edits) {
  for (const layer of [edits.erase, edits.keep]) layer.getContext('2d').clearRect(0, 0, layer.width, layer.height)
}

/** Cleaned cut-out + manual edits, cropped to `box`. */
export function composeCutout(refined, edits, box) {
  if (!edits) return cropToBox(refined, box)

  const { work, layer } = edits
  const workCtx = work.getContext('2d')
  const layerCtx = layer.getContext('2d')

  layerCtx.globalCompositeOperation = 'copy'
  layerCtx.drawImage(edits.source, 0, 0)
  layerCtx.globalCompositeOperation = 'destination-in'
  layerCtx.drawImage(edits.keep, 0, 0)

  workCtx.globalCompositeOperation = 'copy'
  workCtx.drawImage(refined, 0, 0)
  workCtx.globalCompositeOperation = 'source-over'
  workCtx.drawImage(layer, 0, 0)
  workCtx.globalCompositeOperation = 'destination-out'
  workCtx.drawImage(edits.erase, 0, 0)
  workCtx.globalCompositeOperation = 'source-over'

  return cropToBox(work, box)
}
