#!/usr/bin/env node
/**
 * Script de Auditoria de Dominância de SEO Local, Coordenadas, Desambiguação de Homônimos e Performance
 * Uso: node .agents/skills/dominancia-seo-local-engajamento/scripts/auditar-alavancagem-seo.mjs [caminho-html]
 */
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const htmlPath = process.argv[2]
  ? path.resolve(root, process.argv[2])
  : fs.existsSync(path.join(root, 'dist', 'index.html'))
    ? path.join(root, 'dist', 'index.html')
    : path.join(root, 'index.html');

const sitemapPath = fs.existsSync(path.join(root, 'dist', 'sitemap.xml'))
  ? path.join(root, 'dist', 'sitemap.xml')
  : path.join(root, 'public', 'sitemap.xml');

const robotsPath = path.join(root, 'public', 'robots.txt');

if (!fs.existsSync(htmlPath)) {
  console.error(`Arquivo HTML não encontrado em: ${htmlPath}`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, 'utf8') : '';

const checks = [
  {
    categoria: 'Blindagem de Animações',
    nome: 'Interceptador prefers-reduced-motion no <head>',
    ok: /prefers-reduced-motion\\s\*:/.test(html) || /prefers-reduced-motion/.test(html),
  },
  {
    categoria: 'Meta Tags & Geo-Tagging',
    nome: 'Tag <title> otimizada presente',
    ok: /<title>[^<]{20,90}<\/title>/.test(html),
  },
  {
    categoria: 'Meta Tags & Geo-Tagging',
    nome: 'Meta description com CNPJ (Desambiguação E-E-A-T)',
    ok: /<meta\s+name="description"\s+content="[^"]*CNPJ\s+\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}[^"]*"/i.test(html),
  },
  {
    categoria: 'Meta Tags & Geo-Tagging',
    nome: 'Meta author com CNPJ',
    ok: /<meta\s+name="author"\s+content="[^"]*CNPJ\s+\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}[^"]*"/i.test(html),
  },
  {
    categoria: 'Meta Tags & Geo-Tagging',
    nome: 'Geo Meta Tags (geo.region, geo.placename, geo.position, ICBM)',
    ok:
      /<meta\s+name="geo\.region"/i.test(html) &&
      /<meta\s+name="geo\.placename"/i.test(html) &&
      /<meta\s+name="geo\.position"/i.test(html) &&
      /<meta\s+name="ICBM"/i.test(html),
  },
  {
    categoria: 'Super-Grafo Schema.org (@graph)',
    nome: 'JSON-LD com @graph interconectado',
    ok: /"@graph"\s*:\s*\[/.test(html),
  },
  {
    categoria: 'Super-Grafo Schema.org (@graph)',
    nome: 'Entidade LocalBusiness / FurnitureStore com legalName e taxID',
    ok: /"legalName"/.test(html) && /"taxID"/.test(html) && /"GeoCoordinates"/.test(html),
  },
  {
    categoria: 'Super-Grafo Schema.org (@graph)',
    nome: 'Entidades VideoObject, WebSite, WebPage, BreadcrumbList e FAQPage',
    ok:
      /"VideoObject"/.test(html) &&
      /"WebSite"/.test(html) &&
      /"WebPage"/.test(html) &&
      /"BreadcrumbList"/.test(html) &&
      /"FAQPage"/.test(html),
  },
  {
    categoria: 'Conteúdo Pré-Hidratado & Semântica',
    nome: 'Exatamente 1 tag <h1> no documento HTML',
    ok: (html.match(/<h1[\s>]/gi) || []).length === 1,
  },
  {
    categoria: 'Conteúdo Pré-Hidratado & Semântica',
    nome: 'Múltiplas seções <h2> e subseções <h3> pré-renderizadas no #root',
    ok: (html.match(/<h2[\s>]/gi) || []).length >= 5 && (html.match(/<h3[\s>]/gi) || []).length >= 6,
  },
  {
    categoria: 'Conteúdo Pré-Hidratado & Semântica',
    nome: 'Tag semântica <address> com Razão Social e CNPJ no rodapé',
    ok: /<address[\s>][\s\S]*?CNPJ[\s\S]*?<\/address>/i.test(html),
  },
  {
    categoria: 'Imagens & Core Web Vitals',
    nome: 'Zero imagens com alt="" vazio no HTML pré-renderizado',
    ok: !/<img[^>]+alt=""[^>]*>/i.test(html),
  },
  {
    categoria: 'Infraestrutura de Crawl',
    nome: 'robots.txt com Sitemap configurado',
    ok: /Sitemap:\s*https:\/\//i.test(robots),
  },
  {
    categoria: 'Infraestrutura de Crawl',
    nome: 'sitemap.xml com extensões xmlns:image e xmlns:video',
    ok: /xmlns:image=/.test(sitemap) && /xmlns:video=/.test(sitemap) && /<video:video>/.test(sitemap),
  },
];

let falhas = 0;
console.log(`\n=== AUDITORIA DE DOMINÂNCIA SEO LOCAL & ENGENHARIA WEB (${path.basename(htmlPath)}) ===\n`);
for (const c of checks) {
  const status = c.ok ? 'PASS' : 'FAIL';
  if (!c.ok) falhas++;
  console.log(`[${status}] (${c.categoria}) ${c.nome}`);
}

console.log(`\nResultado: ${checks.length - falhas}/${checks.length} verificações aprovadas.`);
if (falhas > 0) process.exit(1);
