const MIN_SCALE = 0.1
const MAX_SCALE = 2
const WHEEL_STEP = 1.05

/** Lets the user drag the subject and resize it with the wheel on a canvas. */
export function useSubjectDrag(subject) {
  let start = null

  return {
    onPointerdown(event) {
      const { width, height } = event.currentTarget.getBoundingClientRect()
      start = { pointerX: event.clientX, pointerY: event.clientY, x: subject.x, y: subject.y, width, height }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointermove(event) {
      if (!start) return
      subject.x = start.x + (event.clientX - start.pointerX) / start.width
      subject.y = start.y + (event.clientY - start.pointerY) / start.height
    },
    onPointerup() {
      start = null
    },
    onWheel(event) {
      event.preventDefault()
      const factor = event.deltaY < 0 ? WHEEL_STEP : 1 / WHEEL_STEP
      subject.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, subject.scale * factor))
    },
  }
}
