import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: mode === 'firebase' ? [{
      find: /^(?:\.\.\/utils\/|\.\/utils\/)sharedStore$/,
      replacement: fileURLToPath(new URL('./src/utils/firebaseSharedStore.js', import.meta.url))
    }] : []
  },
  plugins: [react()],
}))
