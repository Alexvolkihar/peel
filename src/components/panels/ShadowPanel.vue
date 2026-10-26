<script setup>
import { SHADOW_KINDS } from '../../config'
import { useEditor } from '../../composables/useEditor'
import ChipGroup from '../ChipGroup.vue'
import SliderField from '../SliderField.vue'

const { scene } = useEditor()
const percent = (value) => `${Math.round(value * 100)} %`
const pixels = (value) => `${value} px`
</script>

<template>
  <h3>Ombre</h3>
  <ChipGroup v-model="scene.shadow.kind" :options="SHADOW_KINDS" />
  <template v-if="scene.shadow.kind !== 'none'">
    <SliderField v-model="scene.shadow.opacity" label="Opacité" :min="0.05" :max="0.9" :step="0.01" :format="percent" />
    <template v-if="scene.shadow.kind === 'drop'">
      <SliderField v-model="scene.shadow.blur" label="Flou" :min="0" :max="120" :format="pixels" />
      <SliderField v-model="scene.shadow.offset" label="Distance" :min="0" :max="120" :format="pixels" />
    </template>
  </template>
</template>
