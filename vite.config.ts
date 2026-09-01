import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/hackerthon_cowork_instructions/',
  plugins: [react()],
})
