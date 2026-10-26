<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { EXPORT_FORMATS } from '../config'
import { ANIMATIONS } from '../lib/animate'
import { useEditor } from '../composables/useEditor'

const { dimensions, batch, exportImage, exportAnimation, exportBatch } = useEditor()
const open = ref(false)
const format = ref('png')
const animation = ref('zoom')
const recording = ref(false)
const root = ref(null)

const closeOnOutside = (event) => !root.value?.contains(event.target) && (open.value = false)
const closeOnEscape = (event) => event.key === 'Escape' && (open.value = false)

onMounted(() => {
  document.addEventListener('pointerdown', closeOnOutside)
  document.addEventListener('keydown', closeOnEscape)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOnOutside)
  document.removeEventListener('keydown', closeOnEscape)
})

async function recordVideo() {
  recording.value = true
  try {
    await exportAnimation(animation.value)
  } finally {
    recording.value = false
  }
}
</script>

<template>
  <div ref="root" class="export">
    <button class="btn btn-blue" aria-haspopup="true" :aria-expanded="open" @click="open = !open">Exporter</button>
    <div v-if="open" class="pop" role="dialog" aria-label="Options d’export">
      <section>
        <h4>Image</h4>
        <div class="seg">
          <button v-for="key in Object.keys(EXPORT_FORMATS)" :key="key" :class="{ on: format === key }" @click="format = key">
            {{ key.toUpperCase() }}
          </button>
        </div>
        <p>{{ dimensions.width }} × {{ dimensions.height }} px</p>
        <button class="btn btn-black" @click="exportImage(format)">Télécharger</button>
      </section>

      <section>
        <h4>Animation produit</h4>
        <div class="seg">
          <button v-for="item in ANIMATIONS" :key="item.id" :class="{ on: animation === item.id }" @click="animation = item.id">
            {{ item.label }}
          </button>
        </div>
        <button class="btn btn-ghost" :disabled="recording" @click="recordVideo">
          {{ recording ? 'Enregistrement (3 s)…' : 'Exporter en vidéo WebM' }}
        </button>
      </section>

      <section>
        <h4>Traitement par lots</h4>
        <p>Applique le modèle, le fond, l’ombre et le format actuels à d’autres photos.</p>
        <label class="btn btn-ghost" :class="{ disabled: batch.running }">
          {{ batch.running ? `${batch.done} / ${batch.total} photos…` : 'Choisir des photos (ZIP)' }}
          <input type="file" accept="image/*" multiple hidden @change="exportBatch($event.target.files, format)" />
        </label>
      </section>
    </div>
  </div>
</template>

<style scoped>
.export { position: relative; }
.pop { position: absolute; right: 0; top: 54px; z-index: 10; display: grid; gap: 18px; width: min(300px, calc(100vw - 32px)); animation: drop-in .18s cubic-bezier(.16, 1, .3, 1); transform-origin: top right; padding: 18px; border: 1px solid var(--n200); border-radius: var(--r-md); background: #fff; box-shadow: 0 16px 40px rgba(15, 16, 17, .14); }
section { display: grid; gap: 10px; }
section + section { padding-top: 16px; border-top: 1px solid var(--n200); }
h4 { font-size: 14px; font-weight: 600; }
.seg { display: flex; padding: 4px; border-radius: 999px; background: var(--n100); }
.seg button { flex: 1; height: 32px; padding: 0 6px; border-radius: 999px; font-size: 12px; font-weight: 500; }
.seg button.on { background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, .12); }
@keyframes drop-in { from { opacity: 0; transform: translateY(-6px) scale(.98); } }
p { color: var(--muted); font-size: 13px; line-height: 1.4; }
.disabled { opacity: .6; pointer-events: none; }
</style>
