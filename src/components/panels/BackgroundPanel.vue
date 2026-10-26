<script setup>
import { BG_KINDS, COLORS, GRADIENTS } from '../../config'
import { SCENES } from '../../lib/scenes'
import { useEditor } from '../../composables/useEditor'
import ChipGroup from '../ChipGroup.vue'
import SliderField from '../SliderField.vue'

const { scene, setBackgroundImage } = useEditor()
</script>

<template>
  <h3>Arrière-plan</h3>
  <ChipGroup v-model="scene.bg.kind" :options="BG_KINDS" />

  <div v-if="scene.bg.kind === 'color'" class="swatches">
    <button
      v-for="color in COLORS"
      :key="color"
      :style="{ background: color }"
      :class="{ on: scene.bg.color === color }"
      @click="scene.bg.color = color"
    />
    <label class="custom"><input v-model="scene.bg.color" type="color" /></label>
  </div>

  <div v-else-if="scene.bg.kind === 'gradient'" class="swatches">
    <button
      v-for="gradient in GRADIENTS"
      :key="gradient.join()"
      :style="{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }"
      :class="{ on: scene.bg.gradient === gradient }"
      @click="scene.bg.gradient = gradient"
    />
  </div>

  <div v-else-if="scene.bg.kind === 'scene'" class="scenes">
    <button v-for="item in SCENES" :key="item.id" :class="{ on: scene.bg.scene === item.id }" @click="scene.bg.scene = item.id">{{ item.label }}</button>
  </div>

  <SliderField v-else-if="scene.bg.kind === 'blur'" v-model="scene.bg.blur" label="Intensité du flou" :min="2" :max="80" :format="(v) => `${v} px`" />

  <label v-else-if="scene.bg.kind === 'image'" class="btn btn-ghost full">
    Choisir une image
    <input type="file" accept="image/*" hidden @change="setBackgroundImage($event.target.files[0])" />
  </label>
</template>

<style scoped>
.swatches { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.swatches button, .custom { aspect-ratio: 1; border-radius: 14px; border: 1px solid var(--n200); }
.swatches button.on { outline: 2.5px solid var(--blue); outline-offset: 2px; }
.custom { position: relative; overflow: hidden; background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red); }
.custom input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.full { width: 100%; }
.scenes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.scenes button { padding: 14px 8px; border: 1px solid var(--n200); border-radius: 14px; background: #fff; font-size: 13px; font-weight: 500; }
.scenes button.on { border-color: var(--blue); background: var(--lilac); }
</style>
