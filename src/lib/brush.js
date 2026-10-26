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
    strokes: [], // history: each stroke is { mode, softness, segments: [{ from, to, radius }] }
    undone: [],
  }
}

const SOFT_BLUR_RATIO = 0.35 // blur radius at softness 1, relative to the brush radius
const BLUR_REACH = 1.5 // the blur spreads this many radii beyond the line, so the line is shrunk to compensate

function drawLine(canvas, operation, from, to, radius, softness) {
  const ctx = canvas.getContext('2d')
  const blur = radius * SOFT_BLUR_RATIO * softness
  ctx.globalCompositeOperation = operation
  ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none'
  ctx.lineCap = 'round'
  ctx.lineWidth = Math.max(1, 2 * (radius - BLUR_REACH * blur))
  ctx.strokeStyle = '#000'
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
}

/** A stroke adds to one layer and removes from the other, so the last stroke always wins. */
export function paintSegment(edits, { mode, softness }, { from, to, radius }) {
  const [target, other] = mode === 'erase' ? [edits.erase, edits.keep] : [edits.keep, edits.erase]
  drawLine(target, 'source-over', from, to, radius, softness)
  drawLine(other, 'destination-out', from, to, radius, softness)
}

function clearLayers(edits) {
  for (const layer of [edits.erase, edits.keep]) layer.getContext('2d').clearRect(0, 0, layer.width, layer.height)
}

function replay(edits) {
  clearLayers(edits)
  edits.strokes.forEach((stroke) => stroke.segments.forEach((segment) => paintSegment(edits, stroke, segment)))
}

/** Records a finished stroke; a new stroke invalidates what was undone. */
export function commitStroke(edits, stroke) {
  edits.strokes.push(stroke)
  edits.undone.length = 0
}

export function undoStroke(edits) {
  if (!edits.strokes.length) return
  edits.undone.push(edits.strokes.pop())
  replay(edits)
}

export function redoStroke(edits) {
  if (!edits.undone.length) return
  edits.strokes.push(edits.undone.pop())
  replay(edits)
}

export function clearEdits(edits) {
  edits.strokes.length = 0
  edits.undone.length = 0
  clearLayers(edits)
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
