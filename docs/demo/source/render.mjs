// Renders video.html frame by frame through Chrome DevTools: each frame is a pure function of time.
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
const [, , port, htmlUrl, outDir, fps = '30', duration = '21', posterAt = '5.6'] = process.argv
const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0; const pending = new Map()
ws.onmessage = ({ data }) => { const m = JSON.parse(data); if (m.id && pending.has(m.id)) pending.get(m.id)(m) }
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result.result.value
mkdirSync(outDir, { recursive: true })
await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: htmlUrl })
await new Promise((r) => setTimeout(r, 2500))
await ev('window.ready.then(() => true)')
const frame = async (t, file) => {
  await ev(`window.render(${t})`)
  writeFileSync(file, Buffer.from((await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 })).result.data, 'base64'))
}
const total = Math.round(Number(duration) * Number(fps))
for (let i = 0; i < total; i++) await frame(i / Number(fps), `${outDir}/f${String(i).padStart(4, '0')}.jpg`)
await frame(Number(posterAt), `${outDir}/poster.jpg`)
copyFileSync(`${outDir}/poster.jpg`, `${outDir}/f0000.jpg`) // frame 0 = strongest settled frame, so every thumbnail shows it
console.log('frames:', total)
process.exit(0)
