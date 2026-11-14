import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { gerarHtml404, injetarSeoFoto, injetarSeoNoHtml, injetarSeoProjetos3D } from './src/utils/prerenderHtml';
import { execSync } from 'child_process';
import { PAGINAS_AMBIENTES_LOCAIS, RotaPublica } from './src/data/paginasLocais';
import { EMPRESA } from './src/data/empresa';
import { OBRAS_REAIS } from './src/data/portfolioData';
import { CAMINHO_PROJETOS_3D, caminhoFoto } from './src/v2/rotasV2';
import { PROJETOS_3D } from './src/data/projetos3d';

const ROTAS_PRERENDER: RotaPublica[] = [
  '/',
  '/contato',
  '/projetar',
  '/obras',
  '/marcenaria-em-jau',
  '/cozinhas-planejadas-jau',
  '/quartos-e-closets-planejados-jau',
  '/quartos-planejados-jau',
  '/closets-sob-medida-jau',
  '/home-office-planejado-jau',
  '/privacidade',
  '/termos',
];

const xml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Data do último commit (data real de alteração); sem git, usa data atual ISO YYYY-MM-DD. */
function dataUltimoCommit(): string {
  try {
    return execSync('git log -1 --format=%cs', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Sitemap gerado das rotas pré-renderizadas, com extensões xmlns:image e xmlns:video do Google,
 * <lastmod>, <changefreq> e <priority>.
 */
export function gerarSitemap(lastmod: string | null): string {
  const data = lastmod || new Date().toISOString().slice(0, 10);
  const fotosDe = (rota: RotaPublica): string[] => {
    if (rota === '/') {
      const todas = Object.values(PAGINAS_AMBIENTES_LOCAIS).flatMap((p) => p.fotos.map((f) => `${f.srcBase}.jpg`));
      return ['/og-hero.jpg', ...new Set(todas)];
    }
    if (rota === '/projetar') return ['/projetar/cozinha-render.jpg'];
    if (rota === '/obras') return OBRAS_REAIS.map((o) => `${o.arquivo}.jpg`);
    const pagina = PAGINAS_AMBIENTES_LOCAIS[rota as keyof typeof PAGINAS_AMBIENTES_LOCAIS];
    return pagina ? pagina.fotos.map((f) => `${f.srcBase}.jpg`) : [];
  };
  const urls = ROTAS_PRERENDER.map((rota) => {
    const loc = rota === '/' ? `${EMPRESA.url}/` : `${EMPRESA.url}${rota}`;
    const priority = rota === '/' ? '1.0' : rota in PAGINAS_AMBIENTES_LOCAIS ? '0.9' : '0.8';
    const imagens = fotosDe(rota)
      .map((src) => `
    <image:image><image:loc>${xml(EMPRESA.url + src)}</image:loc></image:image>`)
      .join('');
    const videoHome =
      rota === '/'
        ? `
    <video:video>
      <video:thumbnail_loc>${xml(`${EMPRESA.url}/videos/notebook-poster.jpg`)}</video:thumbnail_loc>
      <video:title>Apresentação de Projeto 3D de Móveis Planejados em Jaú - Império Móveis</video:title>
      <video:description>Apresentação em notebook do projeto 3D realista de cozinha planejada sob medida 100% MDF em Jaú SP, do desenho técnico à obra executada pela Império Móveis Planejados.</video:description>
      <video:content_loc>${xml(`${EMPRESA.url}/videos/notebook-1080.mp4`)}</video:content_loc>
      <video:duration>10</video:duration>
      <video:publication_date>2026-01-15T08:00:00-03:00</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>`
        : '';
    return `  <url>
    <loc>${xml(loc)}</loc>
    <lastmod>${data}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${imagens}${videoHome}
  </url>`;
  });
  // Projetos 3D (renders de projeto), com todas as imagens.
  urls.push(`  <url>
    <loc>${xml(EMPRESA.url + CAMINHO_PROJETOS_3D)}</loc>
    <lastmod>${data}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${PROJETOS_3D.map((p) => `
    <image:image><image:loc>${xml(`${EMPRESA.url}${p.arquivo}.jpg`)}</image:loc></image:image>`).join('')}
  </url>`);
  // Uma página por foto de obra (/obras/:id), com a própria foto.
  for (const obra of OBRAS_REAIS) {
    urls.push(`  <url>
    <loc>${xml(EMPRESA.url + caminhoFoto(obra))}</loc>
    <lastmod>${data}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <image:image><image:loc>${xml(`${EMPRESA.url}${obra.arquivo}.jpg`)}</image:loc></image:image>
  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join(String.fromCharCode(10))}
</urlset>
`;
}

function prerenderRotasLocaisPlugin(): Plugin {
  return {
    name: 'imperio-prerender-rotas-locais',
    closeBundle() {
      const rootDir = import.meta.dirname || process.cwd();
      const distDir = path.resolve(rootDir, 'dist');
      const baseIndexPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(baseIndexPath)) return;

      const baseHtml = fs.readFileSync(baseIndexPath, 'utf-8');
      fs.writeFileSync(path.join(distDir, '404.html'), gerarHtml404(baseHtml), 'utf-8');

      const gravar = (rota: string, html: string) => {
        if (rota === '/') {
          fs.writeFileSync(baseIndexPath, html, 'utf-8');
          return;
        }
        const pasta = path.join(distDir, rota.replace(/^\//, ''));
        fs.mkdirSync(pasta, { recursive: true });
        fs.writeFileSync(path.join(pasta, 'index.html'), html, 'utf-8');
      };

      // Site (V2): HTML inicial em cada endereço oficial e uma página por foto de obra.
      for (const rota of ROTAS_PRERENDER) gravar(rota, injetarSeoNoHtml(baseHtml, rota));
      for (const obra of OBRAS_REAIS) gravar(caminhoFoto(obra), injetarSeoFoto(baseHtml, obra));
      gravar(CAMINHO_PROJETOS_3D, injetarSeoProjetos3D(baseHtml));

      // V1 (layout anterior) em /v1: fora do Google, canônico apontando para a página do site,
      // fonte da V1 pré-carregada e o código dela (AppV1 + página) pedido junto.
      const arquivos = fs.readdirSync(path.join(distDir, 'assets'));
      const pedaco = (nome: string) => arquivos.find((f) => f.startsWith(`${nome}-`) && f.endsWith('.js'));
      const PEDACO_V1: Record<string, string> = {
        '/projetar': 'PaginaProjetar',
        '/obras': 'PaginaObras',
        '/contato': 'ContactQuotationPage',
        '/privacidade': 'PaginaLegal',
        '/termos': 'PaginaLegal',
        '/marcenaria-em-jau': 'PaginaAmbienteLocal',
        '/cozinhas-planejadas-jau': 'PaginaAmbienteLocal',
        '/quartos-e-closets-planejados-jau': 'PaginaAmbienteLocal',
        '/quartos-planejados-jau': 'PaginaAmbienteLocal',
        '/closets-sob-medida-jau': 'PaginaAmbienteLocal',
        '/home-office-planejado-jau': 'PaginaAmbienteLocal',
      };
      for (const rota of ROTAS_PRERENDER) {
        const extras = [pedaco('AppV1'), PEDACO_V1[rota] ? pedaco(PEDACO_V1[rota]) : undefined]
          .filter(Boolean)
          .map((arq) => `<link rel="modulepreload" crossorigin href="/assets/${arq}">`)
          .concat('<link rel="preload" as="font" type="font/woff2" href="/fontes/archivo-latin.woff2" crossorigin />')
          .join('\n    ');
        const html = injetarSeoNoHtml(baseHtml, rota, 'v1')
          .replace(/<meta\s+name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow" />')
          .replace(/<link rel="preload" as="font"[^>]*instrument-serif[^>]*>\s*/g, '')
          .replace(/<link rel="preload" as="font"[^>]*geist[^>]*>\s*/g, '')
          .replace('</head>', `    ${extras}\n  </head>`);
        gravar(rota === '/' ? '/v1' : `/v1${rota}`, html);
      }

      const sitemapXml = gerarSitemap(dataUltimoCommit());
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
      fs.writeFileSync(path.join(rootDir, 'public', 'sitemap.xml'), sitemapXml, 'utf-8');
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), prerenderRotasLocaisPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || process.cwd(), '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
