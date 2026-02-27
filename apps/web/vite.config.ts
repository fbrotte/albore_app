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
  server: {
    port: 8013,
    proxy: {
      '/api': {
        target: 'http://localhost:8012',
        changeOrigin: true,
        timeout: 120000, // 2 minutes for long operations
      },
      '/trpc': {
        target: 'http://localhost:8012',
        changeOrigin: true,
        timeout: 120000, // 2 minutes for long operations like invoice extraction
      },
    },
  },
})
