import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createApi } from './server/api.mjs';
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'astrosivam-workspace-api',
      configureServer(server) {
        if (process.env.STUDIO_AUDIT_ONLY === '1') return;
        const api = createApi({ ...process.env, ...loadEnv(mode, process.cwd(), '') });
        server.middlewares.use(api);
        server.httpServer?.once('close', api.shutdown);
      },
      configurePreviewServer(server) {
        const api = createApi({ ...process.env, ...loadEnv(mode, process.cwd(), '') });
        server.middlewares.use(api);
        server.httpServer?.once('close', api.shutdown);
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/lucide-react/')) return 'icons';
          if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/')) return 'react';
        },
      },
    },
  },
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
}));
