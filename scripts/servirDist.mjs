// Serve o dist/ como a Vercel serve: mesmos cabeçalhos de segurança (CSP) do vercel.json,
// endereços sem .html, pastas com index.html e 404.html com status 404.
// Usado pelos testes de navegador (Playwright), pelo Lighthouse CI e para conferir a CSP antes do deploy.
// Uso: node scripts/servirDist.mjs [porta]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');
const porta = Number(process.argv[2] ?? process.env.PORTA ?? 4173);
const config = JSON.parse(fs.readFileSync(path.join(raiz, 'vercel.json'), 'utf8'));
const globais = config.headers.find((h) => h.source === '/(.*)').headers;
const reescritas = new Map(config.rewrites.filter((r) => !r.source.includes('(')).map((r) => [r.source, r.destination]));

const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  for (const { key, value } of globais) {
    // Localmente é http: sem HSTS e sem forçar https.
    if (key !== 'Strict-Transport-Security') res.setHeader(key, value.replace(/; upgrade-insecure-requests$/, ''));
  }
  next();
});
app.use((req, _res, next) => {
  const destino = reescritas.get(req.path.replace(/\/+$/, '') || '/');
  if (destino) req.url = destino;
  next();
});
app.use(express.static(dist, { extensions: ['html'] }));
app.use((_req, res) => res.status(404).sendFile(path.join(dist, '404.html')));
app.listen(porta, () => console.log(`dist em http://localhost:${porta}`));
