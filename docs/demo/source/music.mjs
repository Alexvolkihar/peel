// Synthesises the soundtrack (A minor, 120 BPM) on a single beat grid and writes a 16-bit stereo WAV.
import { writeFileSync } from 'node:fs'

const RATE = 44100
const DURATION = 21
const BEAT = 0.5 // 120 BPM
const CUTS = [3, 7, 11, 14.5, 18]
const left = new Float32Array(RATE * DURATION)
const right = new Float32Array(RATE * DURATION)

let seed = 1234
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1
const midi = (n) => 440 * 2 ** ((n - 69) / 12)

function add(start, length, voice, gain, pan = 0) {
  const from = Math.floor(start * RATE)
  const count = Math.floor(length * RATE)
  const l = gain * (1 - Math.max(0, pan))
  const r = gain * (1 + Math.min(0, pan))
  for (let i = 0; i < count && from + i < left.length; i++) {
    const sample = voice(i / RATE, i)
    left[from + i] += sample * l
    right[from + i] += sample * r
  }
}

const kick = (t) => Math.sin(2 * Math.PI * (45 * t + 95 * (1 - Math.exp(-t * 28)) / 28 * 1.0 + 0)) * Math.exp(-t * 11)
function hat() { let prev = 0; return (t) => { const n = noise(); const hp = n - prev; prev = n; return hp * Math.exp(-t * 90) } }
function clap() { let low = 0; return (t) => { low += 0.35 * (noise() - low); return (noise() - low) * Math.exp(-t * 28) } }
const pluck = (freq) => (t) => (Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(4 * Math.PI * freq * t)) * Math.exp(-t * 14)
const bass = (freq) => (t) => (Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(4 * Math.PI * freq * t)) * Math.exp(-t * 3.2)
const pad = (freqs, length) => (t) => freqs.reduce((sum, f) => sum + Math.sin(2 * Math.PI * f * t), 0) / freqs.length * Math.min(1, t / 0.6) * Math.min(1, (length - t) / 0.6)
function riser(length) { let low = 0; return (t) => { const k = 0.02 + 0.5 * (t / length) ** 2; low += k * (noise() - low); return low * (t / length) ** 1.5 * 3 } }

// A minor loop: Am - F - C - G, one chord per bar (2 s)
const CHORDS = [
  { root: 33, tones: [69, 72, 76, 72] },
  { root: 29, tones: [65, 69, 72, 69] },
  { root: 36, tones: [72, 76, 79, 76] },
  { root: 31, tones: [67, 71, 74, 71] },
]

for (let bar = 0; bar * 2 < DURATION; bar++) {
  const t0 = bar * 2
  const chord = CHORDS[bar % 4]
  const length = Math.min(2, DURATION - t0)
  add(t0, length, pad([chord.root + 24, chord.root + 31, chord.root + 36].map(midi), length), 0.07)
  if (t0 < 3 || t0 >= 3) {
    for (let step = 0; step < 4; step++) add(t0 + step * BEAT, 0.5, bass(midi(chord.root)), step % 2 ? 0.2 : 0.3)
  }
}

for (let t = 3; t < 19; t += BEAT) {
  add(t, 0.35, kick, 0.8)
  add(t + BEAT / 2, 0.08, hat(), 0.12, 0.3)
  const beatInBar = Math.round((t % 2) / BEAT)
  if (beatInBar === 1 || beatInBar === 3) add(t, 0.2, clap(), 0.22)
}
for (let t = 0; t < 3; t += BEAT) add(t + BEAT / 2, 0.08, hat(), 0.07, 0.3)
for (let t = 3; t < 19; t += BEAT / 2) {
  const chord = CHORDS[Math.floor(t / 2) % 4]
  const index = Math.round((t % 2) / (BEAT / 2)) % 4
  add(t, 0.4, pluck(midi(chord.tones[index])), 0.13, -0.3)
}
for (const cut of CUTS) add(cut - 0.5, 0.5, riser(0.5), 0.16)
add(18, 1.2, kick, 0.5) // outro downbeat

// master: soft clip, fades, peak normalise
let peak = 0
for (let i = 0; i < left.length; i++) {
  const t = i / RATE
  const fade = Math.min(1, t / 0.05) * Math.min(1, (DURATION - t) / 1.5)
  left[i] = Math.tanh(left[i] * 1.2) * fade
  right[i] = Math.tanh(right[i] * 1.2) * fade
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]))
}
const scale = 0.89 / peak
const pcm = Buffer.alloc(left.length * 4)
for (let i = 0; i < left.length; i++) {
  pcm.writeInt16LE(Math.round(left[i] * scale * 32767), i * 4)
  pcm.writeInt16LE(Math.round(right[i] * scale * 32767), i * 4 + 2)
}
const header = Buffer.alloc(44)
header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8)
header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22)
header.writeUInt32LE(RATE, 24); header.writeUInt32LE(RATE * 4, 28); header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34)
header.write('data', 36); header.writeUInt32LE(pcm.length, 40)
writeFileSync(process.argv[2] ?? 'music.wav', Buffer.concat([header, pcm]))
console.log('wrote music, peak before normalise', peak.toFixed(2))
