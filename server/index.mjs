import express from 'express';
import path from 'node:path';
import { createApi } from './api.mjs';
try {
  process.loadEnvFile('.env');
} catch {}
const app = express();
app.disable('x-powered-by');
const api = createApi();
app.use(api);
app.use(express.static('dist'));
app.get('/{*path}', (req, res) => res.sendFile(path.resolve('dist/index.html')));
const server = app.listen(Number(process.env.PORT) || 3000, '0.0.0.0', () =>
  console.log('AstroSivam Studio is ready.'),
);
server.once('close', api.shutdown);
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => server.close());
}
