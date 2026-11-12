import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { gerarHtml404, injetarSeoNoHtml } from './src/utils/prerenderHtml';
import { execSync } from 'child_process';
import { PAGINAS_AMBIENTES_LOCAIS, RotaPublica } from './src/data/paginasLocais';
import { EMPRESA } from './src/data/empresa';

const ROTAS_PRERENDER: RotaPublica[] = [
  '/',
  '/contato',
  '/projetar',
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

      for (const rota of ROTAS_PRERENDER) {
        const htmlRota = injetarSeoNoHtml(baseHtml, rota);
        if (rota === '/') {
          fs.writeFileSync(baseIndexPath, htmlRota, 'utf-8');
        } else {
          const subDir = path.join(distDir, rota.replace(/^\//, ''));
          fs.mkdirSync(subDir, { recursive: true });
          fs.writeFileSync(path.join(subDir, 'index.html'), htmlRota, 'utf-8');
        }
      }
      // Prévia da V2: HTML próprio (a Vercel não reescreve para /index.html com cleanUrls),
      // com noindex e fora do sitemap.
      const htmlV2 = injetarSeoNoHtml(baseHtml, '/v2').replace(
        /<meta\s+name="robots"[^>]*>/,
        '<meta name="robots" content="noindex" />',
      );
      fs.mkdirSync(path.join(distDir, 'v2'), { recursive: true });
      fs.writeFileSync(path.join(distDir, 'v2', 'index.html'), htmlV2, 'utf-8');
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
