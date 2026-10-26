export const ANIMATIONS = [
  { id: 'zoom', label: 'Zoom lent' },
  { id: 'float', label: 'Flottement' },
  { id: 'swing', label: 'Balancier' },
]

const DURATION_SECONDS = 3
const FPS = 30
const TAU = Math.PI * 2

/** Subject settings at progress `t` (0-1, looping) for the chosen animation. */
export function animateSubject(style, subject, t) {
  const wave = Math.sin(t * TAU)
  switch (style) {
    case 'zoom':
      return { ...subject, scale: subject.scale * (1 + 0.1 * (1 - Math.cos(t * TAU)) / 2) }
    case 'float':
      return { ...subject, y: subject.y + 0.025 * wave }
    case 'swing':
      return { ...subject, rotate: subject.rotate + 4 * wave }
    default:
      return subject
  }
}

/** Records `draw(t)` on a canvas in real time and resolves with a WebM blob. */
export function recordCanvas(canvas, draw) {
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
  const recorder = new MediaRecorder(canvas.captureStream(FPS), { mimeType, videoBitsPerSecond: 8_000_000 })
  const chunks = []
  recorder.ondataavailable = (event) => chunks.push(event.data)

  return new Promise((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }))
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (DURATION_SECONDS * 1000))
      draw(t)
      if (t < 1) requestAnimationFrame(tick)
      else recorder.stop()
    }
    recorder.start()
    requestAnimationFrame(tick)
  })
}
