import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 👈 escucha en todas las interfaces de red
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://10.218.111.171:4001',
        changeOrigin: true,
      }
    }
  }
})
