import { ref } from 'vue'
import { subjectBox } from '../lib/render'
import { useEditor } from './useEditor'

/** Pointer handlers that erase/restore parts of the subject, plus the cursor ring to display. */
export function useBrush(canvas) {
  const { scene, assets, brush, startBrushStroke, brushSegment, endBrushStroke } = useEditor()
  const ring = ref(null) // { x, y } in CSS pixels, relative to the canvas
  let last = null

  /** Pointer position → pixel in the full-size cut-out (inverse of how the subject is drawn). */
  function toCutoutPixel(event) {
    const el = canvas.value
    const rect = el.getBoundingClientRect()
    const { cutout, box } = assets.value
    const { subject } = scene
    const { cx, cy, width, height } = subjectBox(el.width, el.height, cutout, subject)
    const scale = width / cutout.width
    const angle = (-subject.rotate * Math.PI) / 180
    const dx = ((event.clientX - rect.left) / rect.width) * el.width - cx
    const dy = ((event.clientY - rect.top) / rect.height) * el.height - cy
    const x = dx * Math.cos(angle) - dy * Math.sin(angle)
    const y = dx * Math.sin(angle) + dy * Math.cos(angle)
    return {
      point: { x: ((subject.flip ? -x : x) + width / 2) / scale + box.x, y: (y + height / 2) / scale + box.y },
      radius: (brush.size * (el.width / rect.width)) / scale,
    }
  }

  function track(event) {
    const rect = canvas.value.getBoundingClientRect()
    ring.value = { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  return {
    ring,
    handlers: {
      onPointerdown(event) {
        canvas.value.setPointerCapture(event.pointerId)
        const { point, radius } = toCutoutPixel(event)
        last = point
        startBrushStroke()
        brushSegment(point, point, radius)
      },
      onPointermove(event) {
        track(event)
        if (!last) return
        const { point, radius } = toCutoutPixel(event)
        brushSegment(last, point, radius)
        last = point
      },
      onPointerup() {
        last = null
        endBrushStroke()
      },
      onPointerleave() {
        ring.value = null
      },
    },
  }
}
