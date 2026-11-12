// Serve o dist/ como a Vercel serve: mesmos cabeçalhos de segurança (CSP) do vercel.json,
// endereços sem .html, pastas com index.html e 404.html com status 404.
// Usado pelos testes de navegador (Playwright), pelo Lighthouse CI e para conferir a CSP antes do deploy.
// Uso: node scripts/servirDist.mjs [porta]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
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
// Brotli como na Vercel (sem isso o Lighthouse mede arquivos 3 a 4 vezes maiores que os reais).
const COMPRIMIR = /\.(js|css|html|svg|json|xml|txt)$/;
const cacheBr = new Map();
app.use((req, res, next) => {
  if (!String(req.headers['accept-encoding'] ?? '').split(',').some((c) => c.trim().startsWith('br'))) return next();
  let rel = decodeURIComponent(req.path);
  if (rel.endsWith('/')) rel += 'index.html';
  let arquivo = path.join(dist, rel);
  if (!path.extname(arquivo)) arquivo = fs.existsSync(arquivo + '.html') ? arquivo + '.html' : path.join(arquivo, 'index.html');
  if (!arquivo.startsWith(dist) || !COMPRIMIR.test(arquivo) || !fs.existsSync(arquivo)) return next();
  let corpo = cacheBr.get(arquivo);
  if (!corpo) {
    corpo = zlib.brotliCompressSync(fs.readFileSync(arquivo));
    cacheBr.set(arquivo, corpo);
  }
  res.setHeader('Content-Encoding', 'br');
  res.setHeader('Vary', 'Accept-Encoding');
  res.type(path.extname(arquivo));
  res.send(corpo);
});
app.use(express.static(dist, { extensions: ['html'] }));
app.use((_req, res) => res.status(404).sendFile(path.join(dist, '404.html')));
app.listen(porta, () => console.log(`dist em http://localhost:${porta}`));
