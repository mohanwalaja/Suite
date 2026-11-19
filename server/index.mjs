import express from 'express';
import path from 'node:path';
import { createApi } from './api.mjs';
try {
  process.loadEnvFile('.env');
} catch {}
const app = express();
app.disable('x-powered-by');
app.use(createApi());
app.use(express.static('dist'));
app.get('/{*path}', (req, res) => res.sendFile(path.resolve('dist/index.html')));
app.listen(Number(process.env.PORT) || 3000, '0.0.0.0', () =>
  console.log('AstroSivam Studio is ready.'),
);
