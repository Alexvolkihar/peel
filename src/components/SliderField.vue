<script setup>
defineProps({
  label: String,
  min: Number,
  max: Number,
  step: { type: Number, default: 1 },
  format: { type: Function, default: String },
})
const model = defineModel({ type: Number })
</script>

<template>
  <div class="field">
    <div class="head">
      <label :for="`slider-${label}`">{{ label }}</label>
      <output>{{ format(model) }}</output>
    </div>
    <input :id="`slider-${label}`" v-model.number="model" type="range" :min="min" :max="max" :step="step" />
  </div>
</template>

<style scoped>
.field { display: grid; gap: 8px; margin-bottom: 20px; }
.head { display: flex; align-items: baseline; justify-content: space-between; }
label { color: #3d3d42; font-size: 13px; font-weight: 500; }
output { color: var(--muted); font-size: 13px; }
input { width: 100%; height: 20px; cursor: pointer; }
</style>
