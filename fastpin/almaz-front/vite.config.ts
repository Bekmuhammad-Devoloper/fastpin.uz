import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = 'https://api.fastpin.uz'

const apiProxy = {
  target: API_TARGET,
  changeOrigin: true,
  secure: true,
  headers: { Origin: API_TARGET },
}

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['cloddily-equilibristic-renna.ngrok-free.dev'],
    proxy: {
      '/users': apiProxy,
      '/games': apiProxy,
      '/offers': apiProxy,
      '/announcements': apiProxy,
      '/admincart': apiProxy,
      '/payment': apiProxy,
      '/transactions': apiProxy,
      '/promocode': apiProxy,
      '/buy': apiProxy,
      '/uploads': apiProxy,
    },
  },
})
