<script setup>
import { useEditor } from '../../composables/useEditor'
import ChipGroup from '../ChipGroup.vue'
import SliderField from '../SliderField.vue'

const MODES = [
  { id: 'erase', label: 'Gommer' },
  { id: 'restore', label: 'Restaurer' },
]

const { brush, resetBrushEdits } = useEditor()
</script>

<template>
  <h3>Pinceau</h3>
  <ChipGroup v-model="brush.mode" :options="MODES" />
  <SliderField v-model="brush.size" label="Taille" :min="4" :max="80" />
  <p class="hint">
    <b>Gommer</b> retire ce que tu peins. <b>Restaurer</b> ramène la photo d’origine, même là où le détourage l’avait supprimée.
  </p>
  <button class="btn btn-ghost" @click="resetBrushEdits">Annuler toutes les retouches</button>
</template>

<style scoped>
.hint { margin-bottom: 16px; color: var(--muted); font-size: 13px; line-height: 1.5; }
</style>
