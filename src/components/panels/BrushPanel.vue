<script setup>
import { useEditor } from '../../composables/useEditor'
import ChipGroup from '../ChipGroup.vue'
import SliderField from '../SliderField.vue'

const MODES = [
  { id: 'erase', label: 'Gommer' },
  { id: 'restore', label: 'Restaurer' },
]

const { brush, undoBrush, redoBrush, resetBrushEdits } = useEditor()
</script>

<template>
  <h3>Pinceau</h3>
  <ChipGroup v-model="brush.mode" :options="MODES" />
  <SliderField v-model="brush.size" label="Taille" :min="4" :max="80" />
  <SliderField v-model="brush.softness" label="Douceur du bord" :min="0" :max="100" />
  <p class="hint">
    <b>Gommer</b> retire ce que tu peins. <b>Restaurer</b> ramène la photo d’origine, même là où le détourage l’avait supprimée.
  </p>
  <div class="actions">
    <button class="btn btn-ghost" :disabled="!brush.undoable" @click="undoBrush">Annuler</button>
    <button class="btn btn-ghost" :disabled="!brush.redoable" @click="redoBrush">Rétablir</button>
  </div>
  <p class="hint">Raccourcis : ⌘Z pour annuler, ⇧⌘Z pour rétablir.</p>
  <button class="btn btn-ghost" :disabled="!brush.undoable" @click="resetBrushEdits">Tout effacer</button>
</template>

<style scoped>
.actions { display: flex; gap: 8px; margin-bottom: 12px; }
.hint { margin-bottom: 16px; color: var(--muted); font-size: 13px; line-height: 1.5; }
</style>
