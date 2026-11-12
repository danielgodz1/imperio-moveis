import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { gerarHtml404, injetarSeoFoto, injetarSeoNoHtml } from './src/utils/prerenderHtml';
import { execSync } from 'child_process';
import { PAGINAS_AMBIENTES_LOCAIS, RotaPublica } from './src/data/paginasLocais';
import { EMPRESA } from './src/data/empresa';
import { OBRAS_REAIS } from './src/data/portfolioData';
import { caminhoFoto } from './src/v2/rotasV2';

const ROTAS_PRERENDER: RotaPublica[] = [
  '/',
  '/contato',
  '/projetar',
  '/obras',
  '/cozinhas-planejadas-jau',
  '/quartos-planejados-jau',
  '/closets-sob-medida-jau',
  '/home-office-planejado-jau',
  '/privacidade',
  '/termos',
];

const xml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Data do último commit (data real de alteração); sem git, o lastmod fica de fora. */
function dataUltimoCommit(): string | null {
  try {
    return execSync('git log -1 --format=%cs', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || null;
  } catch {
    return null;
  }
}

/**
 * Sitemap gerado das mesmas rotas pré-renderizadas, com as fotos de obra de cada página
 * (extensão de imagens do Google). Sem changefreq/priority: o Google ignora esses campos.
 */
export function gerarSitemap(lastmod: string | null): string {
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
    const imagens = fotosDe(rota)
      .map((src) => `
    <image:image><image:loc>${xml(EMPRESA.url + src)}</image:loc></image:image>`)
      .join('');
    return `  <url>
    <loc>${xml(loc)}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}${imagens}
  </url>`;
  });
  // Uma página por foto de obra (/obras/:id), com a própria foto.
  for (const obra of OBRAS_REAIS) {
    urls.push(`  <url>
    <loc>${xml(EMPRESA.url + caminhoFoto(obra))}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <image:image><image:loc>${xml(`${EMPRESA.url}${obra.arquivo}.jpg`)}</image:loc></image:image>
  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join(String.fromCharCode(10))}
</urlset>
`;
}

function prerenderRotasLocaisPlugin(): Plugin {
  return {
    name: 'imperio-prerender-rotas-locais',
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname || process.cwd(), 'dist');
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
        '/cozinhas-planejadas-jau': 'PaginaAmbienteLocal',
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

      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), gerarSitemap(dataUltimoCommit()), 'utf-8');
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
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
