<script setup>
import { computed } from 'vue'
import { MODELS } from '../../lib/segmentation'
import { useEditor } from '../../composables/useEditor'
import SliderField from '../SliderField.vue'

const { scene, modelId, busy, errorMessage } = useEditor()
const hint = computed(() => MODELS.find((model) => model.id === modelId.value).hint)
</script>

<template>
  <h3>Détourage</h3>

  <div class="group">
    <label>Modèle</label>
    <div class="models">
      <button v-for="model in MODELS" :key="model.id" :class="{ on: modelId === model.id }" :disabled="busy" @click="modelId = model.id">
        {{ model.label }}
      </button>
    </div>
    <p class="hint">{{ hint }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>

  <SliderField v-model="scene.cutoutLevel" label="Netteté du détourage" :min="0" :max="100" />

  <label class="toggle">
    <input v-model="scene.mainSubject.on" type="checkbox" />
    <span>Garder uniquement le sujet principal</span>
  </label>
  <SliderField v-if="scene.mainSubject.on" v-model="scene.mainSubject.separation" label="Séparation des sujets" :min="5" :max="60" />
</template>

<style scoped>
.group { margin-bottom: 20px; }
.group > label { display: block; margin-bottom: 8px; color: #555; font-size: 13px; font-weight: 500; }
.models { display: grid; gap: 8px; }
.models button { padding: 12px 14px; border: 1px solid var(--n200); border-radius: 14px; background: #fff; font-size: 14px; font-weight: 500; text-align: left; }
.models button.on { border-color: var(--blue); background: var(--lilac); }
.models button:disabled { opacity: .6; cursor: wait; }
.hint { margin-top: 8px; color: var(--muted); font-size: 13px; line-height: 1.4; }
.error { margin-top: 8px; color: #ff4040; font-size: 13px; }
.toggle { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; font-size: 14px; font-weight: 500; cursor: pointer; }
.toggle input { width: 18px; height: 18px; accent-color: var(--blue); }
</style>
