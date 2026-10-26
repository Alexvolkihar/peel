<script setup>
import { useEditor } from '../composables/useEditor'
import ExportMenu from './ExportMenu.vue'

const { stage, fileName, importFile, reset } = useEditor()
</script>

<template>
  <header class="nav" :class="{ compact: stage === 'editor' }">
    <div class="inner">
      <a class="brand" href="#" aria-label="Peel, retour à l’accueil" @click.prevent="reset">
        <span class="logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20V5h6a4 4 0 0 1 0 8H7" /></svg>
        </span>
        <span class="name">Peel</span>
      </a>

      <template v-if="stage === 'editor'">
        <span class="doc" :title="fileName">{{ fileName }}</span>
        <div class="cta">
          <button class="btn btn-ghost new" @click="reset">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            <span>Nouvelle image</span>
          </button>
          <ExportMenu />
        </div>
      </template>
      <div v-else class="cta">
        <label class="btn btn-black">
          Commencer à créer
          <input type="file" accept="image/*" hidden @change="importFile($event.target.files[0])" />
        </label>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav { height: 80px; border-bottom: 1px solid var(--n200); background: #fff; }
.nav.compact { height: 64px; }
.inner { display: flex; align-items: center; gap: 24px; height: 100%; max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.brand { display: flex; align-items: center; gap: 10px; border-radius: 12px; color: inherit; text-decoration: none; }
.logo { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, var(--purple), var(--blue)); }
.name { font-size: 22px; font-weight: 600; letter-spacing: -.02em; }
.nav.compact .inner { max-width: none; padding: 0 20px; } /* editor: header spans the full width like the tool rail */
.cta { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.doc { min-width: 0; overflow: hidden; color: var(--muted); font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 640px) {
  .inner { gap: 12px; padding: 0 16px; }
  .new span, .doc { display: none; }
  .new { width: 44px; padding: 0; }
}
</style>
