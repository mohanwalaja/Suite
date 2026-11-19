import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createApi } from './server/api.mjs';
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'astrosivam-workspace-api',
      configureServer(server) {
        server.middlewares.use(createApi({ ...process.env, ...loadEnv(mode, process.cwd(), '') }));
      },
      configurePreviewServer(server) {
        server.middlewares.use(createApi({ ...process.env, ...loadEnv(mode, process.cwd(), '') }));
      },
    },
  ],
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
}));
