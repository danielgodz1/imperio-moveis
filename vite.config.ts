import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { injetarSeoNoHtml } from './src/utils/prerenderHtml';
import { RotaPublica } from './src/data/paginasLocais';

const ROTAS_PRERENDER: RotaPublica[] = [
  '/',
  '/contato',
  '/cozinhas-planejadas-jau',
  '/quartos-planejados-jau',
  '/closets-sob-medida-jau',
  '/home-office-planejado-jau',
];

function prerenderRotasLocaisPlugin(): Plugin {
  return {
    name: 'imperio-prerender-rotas-locais',
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname || process.cwd(), 'dist');
      const baseIndexPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(baseIndexPath)) return;

      const baseHtml = fs.readFileSync(baseIndexPath, 'utf-8');

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
