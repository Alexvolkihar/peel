<script setup>
import { ref, watch, onMounted } from 'vue'
import { TABS } from '../config'
import { useEditor } from '../composables/useEditor'
import { useSubjectDrag } from '../composables/useSubjectDrag'
import { paintScene } from '../lib/render'
import BackgroundPanel from './panels/BackgroundPanel.vue'
import ShadowPanel from './panels/ShadowPanel.vue'
import SizePanel from './panels/SizePanel.vue'
import AdjustPanel from './panels/AdjustPanel.vue'
import CutoutPanel from './panels/CutoutPanel.vue'

const PANELS = { cutout: CutoutPanel, background: BackgroundPanel, shadow: ShadowPanel, size: SizePanel, adjust: AdjustPanel }

const { scene, assets, dimensions, busy, progress } = useEditor()
const activeTab = ref('cutout')
const canvas = ref(null)
const dragHandlers = useSubjectDrag(scene.subject)

function render() {
  const { width, height } = dimensions.value
  canvas.value.width = width
  canvas.value.height = height
  paintScene(canvas.value.getContext('2d'), dimensions.value, scene, assets.value)
}

onMounted(render)
watch([scene, assets], render, { deep: true })
</script>

<template>
  <main class="editor">
    <aside class="rail">
      <button v-for="tab in TABS" :key="tab.id" :class="{ on: activeTab === tab.id }" @click="activeTab = tab.id">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path :d="tab.icon" /></svg>
        <span>{{ tab.label }}</span>
      </button>
    </aside>

    <section class="panel"><component :is="PANELS[activeTab]" /></section>

    <section class="work">
      <div class="board" :style="{ aspectRatio: `${dimensions.width}/${dimensions.height}` }">
        <canvas ref="canvas" v-on="dragHandlers" />
        <div v-if="busy" class="busy">
          <div class="spinner" />
          <p>{{ progress.label }} <template v-if="progress.ratio">{{ Math.round(progress.ratio * 100) }} %</template></p>
        </div>
      </div>
      <p class="tip">Glisse pour déplacer · molette pour redimensionner</p>
    </section>
  </main>
</template>

<style scoped>
.editor { display: grid; grid-template-columns: 88px 300px 1fr; height: calc(100vh - 64px); background: var(--sand); }
.rail { display: flex; flex-direction: column; gap: 6px; padding: 12px 8px; border-right: 1px solid var(--n200); background: #fff; }
.rail button { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 0; border-radius: 14px; color: #555; font-size: 11px; font-weight: 500; }
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
.tip { color: var(--muted); font-size: 13px; }
@media (max-width: 900px) {
  .editor { grid-template-columns: 1fr; height: auto; }
  .rail { flex-direction: row; overflow-x: auto; }
  .board { width: 100%; height: auto; }
}
</style>
