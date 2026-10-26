import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: { exclude: ['@imgly/background-removal'] }, // ships its own wasm/worker assets
})
