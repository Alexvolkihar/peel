<script setup>
defineProps({ options: { type: Array, required: true } })
const model = defineModel({ type: String })
</script>

<template>
  <div class="chips">
    <button v-for="option in options" :key="option.id" :class="{ on: model === option.id }" @click="model = option.id">
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
button { height: 36px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--n200); font-size: 14px; font-weight: 500; background: #fff; }
button:hover { background: var(--n100); }
button.on { background: var(--black); color: #fff; border-color: var(--black); }
</style>
