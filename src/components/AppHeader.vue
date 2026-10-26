<script setup>
import { useEditor } from '../composables/useEditor'
import ExportMenu from './ExportMenu.vue'

const { stage, fileName, importFile, reset } = useEditor()
const inEditor = () => stage.value === 'editor'
</script>

<template>
  <header class="nav" :class="{ compact: inEditor() }">
    <div class="inner">
      <a class="brand" href="#" @click.prevent="reset">
        <span class="logo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20V5h6a4 4 0 0 1 0 8H7M12 13l5 7" /></svg>
        </span>
        <span class="name">Atelier</span>
      </a>

      <template v-if="inEditor()">
        <span class="doc">{{ fileName }}</span>
        <div class="cta">
          <button class="btn btn-ghost" @click="reset">Nouvelle image</button>
          <ExportMenu />
        </div>
      </template>
      <template v-else>
        <nav class="links"><span>Produit</span><span>Formats</span><span>Ressources</span><span>Tarifs</span></nav>
        <div class="cta">
          <span class="signin">Se connecter</span>
          <label class="btn btn-black">
            Commencer à créer
            <input type="file" accept="image/*" hidden @change="importFile($event.target.files[0])" />
          </label>
        </div>
      </template>
    </div>
  </header>
</template>

<style scoped>
.nav { height: 80px; border-bottom: 1px solid var(--n200); background: #fff; }
.nav.compact { height: 64px; }
.inner { display: flex; align-items: center; gap: 36px; height: 100%; max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.brand { display: flex; align-items: center; gap: 10px; color: inherit; text-decoration: none; }
.logo { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, var(--purple), var(--blue)); }
.name { font-size: 22px; font-weight: 600; letter-spacing: -.02em; }
.links { display: flex; flex: 1; gap: 32px; font-weight: 500; }
.cta { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.signin { margin-right: 8px; font-size: 14px; font-weight: 500; }
.doc { color: var(--muted); font-weight: 500; }
</style>
