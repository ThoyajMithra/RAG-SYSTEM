import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxies /api requests to the Express backend during local dev,
// so the client can just call fetch('/api/...') with no CORS setup needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    proxy: {
      '/query': {
        target: 'https://rag-system-production.up.railway.app',
        changeOrigin: true
      },
      '/upload': {
        target: 'https://rag-system-production.up.railway.app',
        changeOrigin: true
      }
    }
  }
});
