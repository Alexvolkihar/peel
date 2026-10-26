<script setup>
import { ref } from 'vue'
import { useEditor } from '../composables/useEditor'

const FEATURES = ['Détourage IA', 'Scènes et fonds', 'Ombres', 'Pinceau', 'Animation produit', 'Traitement par lots']

const { stage, progress, errorMessage, importFile } = useEditor()
const dragging = ref(false)

function onDrop(event) {
  dragging.value = false
  importFile(event.dataTransfer.files[0])
}
</script>

<template>
  <main class="home">
    <div class="wrap">
      <h1>
        <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="#0f1011" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><rect x="4" y="4" width="40" height="40" rx="12" /><path d="M4 22h40M14 44 30 28M24 44l14-14M33 44l8-8" /></svg>
        <span>Supprimez les fonds <wbr />instantanément</span>
      </h1>
      <p class="sub">Supprime automatiquement le fond de n’importe quelle image de produit, directement dans ton navigateur&nbsp;: aucun envoi, aucun compte.</p>

      <div class="stage">
        <figure class="card left" aria-hidden="true">
          <svg viewBox="0 0 200 220">
            <defs>
              <pattern id="checker" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#fff" /><rect width="12" height="12" fill="#ececf1" /><rect x="12" y="12" width="12" height="12" fill="#ececf1" /></pattern>
            </defs>
            <rect width="200" height="220" fill="url(#checker)" />
            <g transform="translate(60 38)"><rect x="24" y="0" width="32" height="18" rx="4" fill="#0f1011" /><path d="M26 18h28v14c14 8 20 18 20 34v82a10 10 0 0 1-10 10H16a10 10 0 0 1-10-10V66c0-16 6-26 20-34z" fill="#492ffb" /><rect x="16" y="82" width="48" height="52" rx="6" fill="#fff" /><rect x="24" y="94" width="32" height="6" rx="3" fill="#492ffb" /><rect x="24" y="108" width="22" height="6" rx="3" fill="#ebe8ff" /></g>
          </svg>
        </figure>

        <div class="drop" :class="{ over: dragging }" @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop">
          <template v-if="stage === 'loading'">
            <div class="spinner" role="status" aria-label="Détourage en cours" />
            <p class="label" aria-live="polite">{{ progress.label }}</p>
            <div class="bar" role="progressbar" :aria-valuenow="Math.round(progress.ratio * 100)" aria-valuemin="0" aria-valuemax="100"><i :style="{ transform: `scaleX(${progress.ratio})` }" /></div>
          </template>
          <template v-else>
            <svg class="up" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
            <label class="btn btn-blue btn-lg glow">
              Commencer à partir d’une photo
              <input type="file" accept="image/*" hidden @change="importFile($event.target.files[0])" />
            </label>
            <p class="hint">ou glisse une image ici, ou colle-la (⌘V)</p>
            <p class="formats">JPG, PNG ou WebP</p>
            <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
          </template>
        </div>

        <figure class="card right" aria-hidden="true">
          <svg viewBox="0 0 200 240">
            <rect width="200" height="240" fill="#e5ed49" />
            <ellipse cx="100" cy="206" rx="78" ry="16" fill="rgba(15,16,17,.14)" />
            <rect x="26" y="168" width="148" height="38" fill="#fff" /><ellipse cx="100" cy="206" rx="74" ry="14" fill="#ebe8ff" /><ellipse cx="100" cy="168" rx="74" ry="14" fill="#fff" />
            <g transform="translate(60 22)"><rect x="24" y="0" width="32" height="18" rx="4" fill="#0f1011" /><path d="M26 18h28v14c14 8 20 18 20 34v62a10 10 0 0 1-10 10H16a10 10 0 0 1-10-10V66c0-16 6-26 20-34z" fill="#492ffb" /><rect x="16" y="82" width="48" height="40" rx="6" fill="#fff" /><rect x="24" y="92" width="32" height="6" rx="3" fill="#492ffb" /><rect x="24" y="106" width="22" height="6" rx="3" fill="#ebe8ff" /></g>
          </svg>
        </figure>
      </div>

      <ul class="features">
        <li v-for="feature in FEATURES" :key="feature">{{ feature }}</li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
.home { flex: 1; overflow: hidden; background: linear-gradient(#fafafa, #fff 60%); text-align: center; }
.wrap { max-width: 1180px; margin: 0 auto; padding: 72px 24px 80px; }
h1 { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 18px; font-size: clamp(32px, 4.6vw, 58px); font-weight: 400; line-height: 1.1; letter-spacing: -.025em; text-wrap: balance; }
.sub { max-width: 700px; margin: 24px auto 0; color: var(--muted); font-size: clamp(17px, 1.6vw, 20px); line-height: 1.5; text-wrap: balance; }

.stage { position: relative; display: flex; align-items: center; justify-content: center; margin-top: 64px; }
.drop { z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; width: min(640px, 100%); height: 400px; padding: 24px; border: 1.5px dashed var(--n200); border-radius: var(--r-xl); background: #fafaff; box-shadow: 0 20px 60px rgba(73, 47, 251, .08), 0 2px 8px rgba(15, 16, 17, .04); transition: border-color .2s, background .2s, transform .2s; }
.drop.over { border-color: var(--blue); background: var(--lilac); transform: scale(1.01); }
.up { color: var(--purple); }
.glow { box-shadow: 0 0 0 8px rgba(113, 70, 255, .14), 0 10px 30px rgba(73, 47, 251, .35); }
.glow:hover { box-shadow: 0 0 0 10px rgba(113, 70, 255, .18), 0 12px 34px rgba(73, 47, 251, .42); }
.hint { color: var(--muted); font-size: 15px; }
.formats { color: var(--muted); font-size: 13px; }
.label { font-weight: 500; }
.error { color: #c42b2b; font-size: 14px; font-weight: 500; }

.card { position: absolute; margin: 0; overflow: hidden; border-radius: 22px; background: #fff; box-shadow: 0 24px 50px rgba(15, 16, 17, .16); }
.card svg { display: block; width: 100%; height: 100%; }
.card.left { bottom: -36px; left: 0; width: 190px; height: 209px; transform: rotate(-11deg); }
.card.right { top: -64px; right: 0; width: 200px; height: 240px; transform: rotate(8deg); }

.features { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 88px auto 0; padding: 0; list-style: none; max-width: 720px; }
.features li { padding: 8px 16px; border: 1px solid var(--n200); border-radius: 999px; background: #fff; font-size: 14px; font-weight: 500; }

.spinner { width: 36px; height: 36px; border: 3px solid var(--lilac); border-top-color: var(--blue); border-radius: 50%; animation: spin .8s linear infinite; }
.bar { width: min(280px, 80%); height: 6px; overflow: hidden; border-radius: 6px; background: var(--lilac); }
.bar i { display: block; width: 100%; height: 100%; background: var(--blue); transform-origin: left; transition: transform .2s; }
@keyframes spin { to { transform: rotate(360deg); } }

/* the one authored moment: the hero settles in, then the cards pop in beside the drop zone */
h1, .sub, .drop, .features { animation: rise .7s cubic-bezier(.16, 1, .3, 1) both; }
.sub { animation-delay: .08s; }
.drop { animation-delay: .16s; }
.card.left, .card.right { animation: pop .8s cubic-bezier(.16, 1, .3, 1) .35s both; }
.features { animation-delay: .45s; }
@keyframes rise { from { opacity: 0; transform: translateY(16px); } }
@keyframes pop { from { opacity: 0; scale: .9; } }

@media (max-width: 900px) {
  .wrap { padding-top: 40px; }
  .card { display: none; }
  .drop { height: 340px; }
  .features { margin-top: 48px; }
}
</style>
