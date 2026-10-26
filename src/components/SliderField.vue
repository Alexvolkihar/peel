<script setup>
defineProps({ label: String, min: Number, max: Number, step: { type: Number, default: 1 } })
const model = defineModel({ type: Number })
</script>

<template>
  <div class="field">
    <label>{{ label }}</label>
    <input v-model.number="model" type="range" :min="min" :max="max" :step="step" />
  </div>
</template>

<style scoped>
.field { display: grid; gap: 8px; margin-bottom: 18px; }
label { font-size: 13px; font-weight: 500; color: #555; }
input { width: 100%; accent-color: var(--blue); }
</style>
