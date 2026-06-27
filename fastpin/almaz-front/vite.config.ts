import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Where the dev server forwards API calls (/users, /buy, ...).
// Defaults to production so a plain run still works; override with
// VITE_PROXY_TARGET (see .env.development) to hit a local backend,
// e.g. http://localhost:4000.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const API_TARGET = env.VITE_PROXY_TARGET || 'https://api.fastpin.uz'
  const isLocal = API_TARGET.startsWith('http://')

  const apiProxy = {
    target: API_TARGET,
    changeOrigin: true,
    secure: !isLocal,
    // The production backend pins CORS to its own origin, so spoof it.
    // A local backend doesn't care and the proxy is same-origin anyway.
    ...(isLocal ? {} : { headers: { Origin: API_TARGET } }),
  }

  return {
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
  }
})
