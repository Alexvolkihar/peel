<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useEditor } from './composables/useEditor'
import AppHeader from './components/AppHeader.vue'
import HomeView from './components/HomeView.vue'
import EditorView from './components/EditorView.vue'

const { stage, importFile } = useEditor()

function onPaste(event) {
  if (stage.value === 'home') importFile(event.clipboardData?.files[0])
}

onMounted(() => window.addEventListener('paste', onPaste))
onBeforeUnmount(() => window.removeEventListener('paste', onPaste))
</script>

<template>
  <div class="app">
    <div v-if="stage !== 'editor'" class="announce">
      <span class="dot" /><b>Nouveau</b>
      <span>Détourage 100 % local : tes photos ne quittent jamais ton ordinateur.</span>
    </div>
    <AppHeader />
    <EditorView v-if="stage === 'editor'" />
    <HomeView v-else />
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; min-height: 100%; background: #fff; }
.announce { display: flex; align-items: center; justify-content: center; gap: 10px; height: 56px; background: #1a1a1c; color: #fff; font-size: 13px; }
.announce span:last-child { color: #d9d9d9; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--purple); }
</style>
