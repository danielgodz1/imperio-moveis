#!/usr/bin/env node
/**
 * Script de Auditoria 360º de Dominância de SEO Local, GEO, AEO, Coordenadas, Desambiguação e Performance
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
const llmsPath = path.join(root, 'public', 'llms.txt');
const llmsFullPath = path.join(root, 'public', 'llms-full.txt');

if (!fs.existsSync(htmlPath)) {
  console.error(`Arquivo HTML não encontrado em: ${htmlPath}`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, 'utf8') : '';
const llms = fs.existsSync(llmsPath) ? fs.readFileSync(llmsPath, 'utf8') : '';
const llmsFull = fs.existsSync(llmsFullPath) ? fs.readFileSync(llmsFullPath, 'utf8') : '';

const checks = [
  {
    categoria: 'Blindagem de Animações',
    nome: 'Interceptador prefers-reduced-motion no <head>',
    ok: /prefers-reduced-motion/.test(html),
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
    categoria: 'AEO / OEA (Posição Zero & Voz)',
    nome: 'Schemas HowTo e SpeakableSpecification no @graph',
    ok: /"HowTo"/.test(html) && /"HowToStep"/.test(html) && /"SpeakableSpecification"/.test(html),
  },
  {
    categoria: 'AEO / OEA (Posição Zero & Voz)',
    nome: 'Blocos de resposta direta (.aeo-resposta-direta) e tabela comparativa <table> no HTML inicial',
    ok: /class="[^"]*aeo-resposta-direta[^"]*"/.test(html) && /<table[\s>][\s\S]*?<thead>[\s\S]*?<tbody>[\s\S]*?<\/table>/i.test(html),
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
    categoria: 'CRO & Engajamento WhatsApp',
    nome: 'CTAs contextuais de WhatsApp por ambiente com rastreamento UTM',
    ok: /utm_campaign=ambiente_cozinhas/.test(html) && /utm_campaign=ambiente_closets/.test(html),
  },
  {
    categoria: 'Imagens & Core Web Vitals',
    nome: 'Zero imagens com alt="" vazio no HTML pré-renderizado',
    ok: !/<img[^>]+alt=""[^>]*>/i.test(html),
  },
  {
    categoria: 'GEO & Infraestrutura de Crawl IA',
    nome: 'robots.txt liberando Googlebot, Bingbot, GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot e Google-Extended',
    ok:
      /User-agent:\s*Googlebot/i.test(robots) &&
      /User-agent:\s*GPTBot/i.test(robots) &&
      /User-agent:\s*OAI-SearchBot/i.test(robots) &&
      /User-agent:\s*PerplexityBot/i.test(robots) &&
      /User-agent:\s*ClaudeBot/i.test(robots) &&
      /User-agent:\s*Google-Extended/i.test(robots) &&
      /Sitemap:\s*https:\/\//i.test(robots),
  },
  {
    categoria: 'GEO & Infraestrutura de Crawl IA',
    nome: 'Arquivos public/llms.txt e public/llms-full.txt estruturados com CNPJ e fatos técnicos',
    ok: /48\.945\.152\/0001-93/.test(llms) && /MDF Naval/i.test(llmsFull) && llms.length > 500 && llmsFull.length > 1500,
  },
  {
    categoria: 'Infraestrutura de Crawl',
    nome: 'sitemap.xml com extensões xmlns:image e xmlns:video',
    ok: /xmlns:image=/.test(sitemap) && /xmlns:video=/.test(sitemap) && /<video:video>/.test(sitemap),
  },
];

let falhas = 0;
console.log(`\n=== AUDITORIA 360º SEO + GEO + AEO + CRO (${path.basename(htmlPath)}) ===\n`);
for (const c of checks) {
  const status = c.ok ? 'PASS' : 'FAIL';
  if (!c.ok) falhas++;
  console.log(`[${status}] (${c.categoria}) ${c.nome}`);
}

console.log(`\nResultado: ${checks.length - falhas}/${checks.length} verificações aprovadas.`);
if (falhas > 0) process.exit(1);
