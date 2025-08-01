import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    strictPort: true
  },
  server: {
    port: 4173,
    host: '0.0.0.0'
  }
}) 