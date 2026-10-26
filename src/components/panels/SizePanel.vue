<script setup>
import { SIZES } from '../../config'
import { useEditor } from '../../composables/useEditor'

const { scene } = useEditor()
</script>

<template>
  <h3>Format</h3>
  <div class="sizes">
    <button v-for="size in SIZES" :key="size.id" :class="{ on: scene.size === size.id }" @click="scene.size = size.id">
      <i :style="{ aspectRatio: size.ratio }" />
      <span>{{ size.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.sizes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
button { display: grid; justify-items: center; gap: 10px; padding: 14px 8px 10px; border: 1px solid var(--n200); border-radius: 16px; background: #fff; font-size: 13px; font-weight: 500; }
i { display: block; height: 44px; border-radius: 4px; background: var(--n300); }
button.on { border-color: var(--blue); background: var(--lilac); }
button.on i { background: var(--blue); }
</style>
