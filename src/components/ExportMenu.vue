<script setup>
import { ref } from 'vue'
import { EXPORT_FORMATS } from '../config'
import { useEditor } from '../composables/useEditor'

const { dimensions, exportImage } = useEditor()
const open = ref(false)
const format = ref('png')

function download() {
  exportImage(format.value)
  open.value = false
}
</script>

<template>
  <div class="export">
    <button class="btn btn-blue" @click="open = !open">Exporter</button>
    <div v-if="open" class="pop">
      <div class="seg">
        <button v-for="key in Object.keys(EXPORT_FORMATS)" :key="key" :class="{ on: format === key }" @click="format = key">
          {{ key.toUpperCase() }}
        </button>
      </div>
      <p>{{ dimensions.width }} × {{ dimensions.height }} px</p>
      <button class="btn btn-black" @click="download">Télécharger</button>
    </div>
  </div>
</template>

<style scoped>
.export { position: relative; }
.pop { position: absolute; right: 0; top: 54px; z-index: 10; display: grid; gap: 12px; width: 240px; padding: 16px; border: 1px solid var(--n200); border-radius: var(--r-md); background: #fff; box-shadow: 0 16px 40px rgba(15, 16, 17, .14); }
.seg { display: flex; padding: 4px; border-radius: 999px; background: var(--n100); }
.seg button { flex: 1; height: 32px; border-radius: 999px; font-size: 13px; font-weight: 500; }
.seg button.on { background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, .12); }
p { color: var(--muted); font-size: 13px; }
</style>
