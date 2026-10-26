<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { TABS } from '../config'
import { useEditor } from '../composables/useEditor'
import { useBrush } from '../composables/useBrush'
import { useSubjectDrag } from '../composables/useSubjectDrag'
import { paintScene } from '../lib/render'
import BackgroundPanel from './panels/BackgroundPanel.vue'
import ShadowPanel from './panels/ShadowPanel.vue'
import SizePanel from './panels/SizePanel.vue'
import AdjustPanel from './panels/AdjustPanel.vue'
import CutoutPanel from './panels/CutoutPanel.vue'
import BrushPanel from './panels/BrushPanel.vue'

const PANELS = { cutout: CutoutPanel, brush: BrushPanel, background: BackgroundPanel, shadow: ShadowPanel, size: SizePanel, adjust: AdjustPanel }

const { scene, assets, dimensions, busy, progress, brush, undoBrush, redoBrush } = useEditor()
const activeTab = ref('cutout')
const canvas = ref(null)
const dragHandlers = useSubjectDrag(scene.subject)
const { ring, handlers: brushHandlers } = useBrush(canvas)
const handlers = computed(() => (activeTab.value === 'brush' ? brushHandlers : dragHandlers))

function render() {
  const { width, height } = dimensions.value
  canvas.value.width = width
  canvas.value.height = height
  paintScene(canvas.value.getContext('2d'), dimensions.value, scene, assets.value)
}

function onKeydown(event) {
  if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return
  event.preventDefault()
  if (event.shiftKey) redoBrush()
  else undoBrush()
}

onMounted(() => {
  render()
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
watch([scene, assets], render, { deep: true })
</script>

<template>
  <main class="editor">
    <div class="rail" role="tablist" aria-label="Outils" aria-orientation="vertical">
      <button v-for="tab in TABS" :key="tab.id" role="tab" :aria-selected="activeTab === tab.id" :class="{ on: activeTab === tab.id }" @click="activeTab = tab.id">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path :d="tab.icon" /></svg>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <section class="panel" role="tabpanel">
      <Transition name="swap" mode="out-in"><div :key="activeTab"><component :is="PANELS[activeTab]" /></div></Transition>
    </section>

    <section class="work">
      <div class="board" :style="{ aspectRatio: `${dimensions.width}/${dimensions.height}` }">
        <canvas ref="canvas" role="img" aria-label="Aperçu de l’image" :class="{ brushing: activeTab === 'brush' }" v-bind="handlers" />
        <i v-if="activeTab === 'brush' && ring" class="ring" aria-hidden="true" :style="{ left: `${ring.x}px`, top: `${ring.y}px`, width: `${brush.size * 2}px`, height: `${brush.size * 2}px` }" />
        <div v-if="busy" class="busy" role="status" aria-live="polite">
          <div class="spinner" />
          <p>{{ progress.label }} <template v-if="progress.ratio">{{ Math.round(progress.ratio * 100) }} %</template></p>
        </div>
      </div>
      <p class="tip">{{ activeTab === 'brush' ? 'Peins sur l’image pour gommer ou restaurer' : 'Glisse pour déplacer · molette pour redimensionner' }}</p>
    </section>
  </main>
</template>

<style scoped>
.editor { display: grid; grid-template-columns: 92px 300px 1fr; height: calc(100vh - 64px); background: var(--sand); }
.rail { display: flex; flex-direction: column; gap: 6px; padding: 12px 8px; border-right: 1px solid var(--n200); background: #fff; }
.rail button { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 0; border-radius: 14px; color: #55555a; font-size: 12px; font-weight: 500; transition: background .15s, color .15s; }
.rail button:hover { background: var(--n100); }
.rail button.on { background: var(--lilac); color: var(--blue); }
.panel { overflow-y: auto; padding: 22px 20px; border-right: 1px solid var(--n200); background: #fff; }
.panel :deep(h3) { margin-bottom: 16px; font-size: 18px; font-weight: 600; letter-spacing: -.01em; }
.work { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 0; padding: 28px; }
.board { position: relative; height: calc(100vh - 64px - 110px); max-width: 100%; overflow: hidden; border-radius: 18px; box-shadow: 0 20px 60px rgba(15, 16, 17, .16); background: #fff conic-gradient(#eee 25%, #fff 0 50%, #eee 0 75%, #fff 0) 0 0 / 20px 20px; }
.busy { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 12px; background: rgba(255, 255, 255, .8); font-size: 14px; font-weight: 500; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--lilac); border-top-color: var(--blue); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
canvas { display: block; width: 100%; height: 100%; cursor: grab; touch-action: none; }
canvas:active { cursor: grabbing; }
canvas.brushing, canvas.brushing:active { cursor: none; }
.ring { position: absolute; border: 2px solid var(--blue); border-radius: 50%; background: rgba(73, 47, 251, .12); transform: translate(-50%, -50%); pointer-events: none; }
.tip { color: var(--muted); font-size: 13px; }
.swap-enter-active, .swap-leave-active { transition: opacity .12s ease-out, transform .12s ease-out; }
.swap-enter-from, .swap-leave-to { opacity: 0; transform: translateX(-6px); }

@media (max-width: 900px) {
  /* image first, then the tool strip, then the active panel */
  .editor { display: flex; flex-direction: column; height: auto; min-height: calc(100vh - 64px); }
  .work { order: 1; padding: 16px; }
  .rail { order: 2; flex-direction: row; gap: 4px; overflow-x: auto; padding: 8px; border-top: 1px solid var(--n200); border-right: 0; }
  .rail button { flex: 0 0 auto; min-width: 76px; padding: 8px 6px; }
  .panel { order: 3; border-right: 0; border-top: 1px solid var(--n200); }
  .board { width: 100%; height: auto; max-height: 60vh; }
}
</style>
