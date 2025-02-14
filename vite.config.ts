import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-borme': {
        target: 'https://boe.es',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-borme/, '/datosabiertos/api/borme')
      }
    }
  }
});
