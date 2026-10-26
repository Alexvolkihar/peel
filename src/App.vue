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
    <AppHeader />
    <EditorView v-if="stage === 'editor'" />
    <HomeView v-else />
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; min-height: 100%; background: #fff; }
</style>
