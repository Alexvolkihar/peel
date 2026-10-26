<script setup>
import { useEditor } from '../../composables/useEditor'
import SliderField from '../SliderField.vue'

const { scene } = useEditor()
const sliders = [
  { key: 'scale', label: 'Taille', min: 0.1, max: 2, step: 0.01 },
  { key: 'rotate', label: 'Rotation', min: -180, max: 180 },
  { key: 'brightness', label: 'Luminosité', min: 50, max: 150 },
  { key: 'contrast', label: 'Contraste', min: 50, max: 150 },
  { key: 'saturate', label: 'Saturation', min: 0, max: 200 },
]

const center = () => Object.assign(scene.subject, { x: 0.5, y: 0.5 })
</script>

<template>
  <h3>Retouche</h3>
  <SliderField v-for="slider in sliders" :key="slider.key" v-model="scene.subject[slider.key]" v-bind="slider" />
  <div class="actions">
    <button class="btn btn-ghost" @click="scene.subject.flip = !scene.subject.flip">Miroir</button>
    <button class="btn btn-ghost" @click="center">Centrer</button>
  </div>
</template>

<style scoped>
.actions { display: flex; gap: 8px; }
</style>
