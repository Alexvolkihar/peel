<script setup>
import { ref } from 'vue'
import { useEditor } from '../composables/useEditor'

const { stage, progress, errorMessage, importFile } = useEditor()
const dragging = ref(false)

function onDrop(event) {
  dragging.value = false
  importFile(event.dataTransfer.files[0])
}
</script>

<template>
  <main class="home">
    <p class="crumbs">Accueil &nbsp;›&nbsp; Outils &nbsp;›&nbsp; <span>Suppression de fond</span></p>
    <h1>
      <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="#0f1011" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"><rect x="4" y="4" width="40" height="40" rx="12" /><path d="M4 22h40M14 44 30 28M24 44l14-14M33 44l8-8" /></svg>
      Supprimez les fonds instantanément
    </h1>
    <p class="sub">Supprime automatiquement le fond de n’importe quelle image de produit, directement dans ton navigateur : aucun envoi, aucun compte.</p>

    <div class="stage">
      <div class="polaroid left"><div class="photo a" /></div>
      <div class="drop" :class="{ over: dragging }" @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop">
        <template v-if="stage === 'loading'">
          <div class="spinner" />
          <p class="label">{{ progress.label }}</p>
          <div class="bar"><i :style="{ width: `${Math.round(progress.ratio * 100)}%` }" /></div>
        </template>
        <template v-else>
          <label class="btn btn-blue btn-lg glow">
            Commencer à partir d’une photo
            <input type="file" accept="image/*" hidden @change="importFile($event.target.files[0])" />
          </label>
          <p class="hint">ou glisse une image ici, ou colle-la (⌘V)</p>
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </template>
      </div>
      <div class="polaroid right"><div class="photo b" /></div>
    </div>
  </main>
</template>

<style scoped>
.home { flex: 1; padding: 28px 24px 80px; overflow: hidden; background: linear-gradient(#fafafa, #fff 60%); text-align: center; }
.crumbs { max-width: 1280px; margin: 0 auto 36px; color: var(--muted); font-size: 13px; text-align: left; }
h1 { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 18px; font-size: clamp(32px, 4.4vw, 58px); font-weight: 400; line-height: 1.1; letter-spacing: -.025em; }
.sub { max-width: 780px; margin: 22px auto 0; color: var(--muted); font-size: 20px; line-height: 1.5; }
.stage { position: relative; display: flex; align-items: center; justify-content: center; max-width: 1180px; margin: 64px auto 0; }
.drop { z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; width: 640px; height: 430px; border: 1.5px dashed transparent; border-radius: var(--r-lg); background: #fafaff; box-shadow: 0 20px 60px rgba(73, 47, 251, .08), 0 2px 8px rgba(15, 16, 17, .04); transition: .2s; }
.drop.over { border-color: var(--blue); background: var(--lilac); }
.glow { box-shadow: 0 0 0 8px rgba(113, 70, 255, .14), 0 10px 30px rgba(73, 47, 251, .35); }
.hint { color: var(--muted); font-size: 14px; }
.label { font-weight: 500; }
.error { color: #ff4040; font-size: 14px; }
.polaroid { position: absolute; overflow: hidden; border-radius: 22px; background: #fff; box-shadow: 0 24px 50px rgba(15, 16, 17, .18); }
.polaroid.left { bottom: -40px; left: -30px; width: 190px; height: 190px; transform: rotate(-12deg); }
.polaroid.right { top: -80px; right: -10px; width: 230px; height: 250px; transform: rotate(9deg); }
.photo { width: 100%; height: 100%; }
.photo.a { background: linear-gradient(90deg, #fff 45%, #a8a8a0 45%); }
.photo.b { background: linear-gradient(160deg, #cfa77a, #6a5a48 70%, #fff 70%); }
.spinner { width: 36px; height: 36px; border: 3px solid var(--lilac); border-top-color: var(--blue); border-radius: 50%; animation: spin .8s linear infinite; }
.bar { width: 280px; height: 6px; overflow: hidden; border-radius: 6px; background: var(--lilac); }
.bar i { display: block; height: 100%; background: var(--blue); transition: width .2s; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) { .polaroid { display: none; } .drop { width: 100%; height: 340px; } }
</style>
