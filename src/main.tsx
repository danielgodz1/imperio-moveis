// O CSS principal vem primeiro: ele declara a ordem das camadas do Tailwind (base, components,
// utilities). Se o CSS da V2 (importado pelo App) viesse antes, a camada "components" ficaria
// abaixo da "base" e os títulos perderiam o tamanho.
import './index.css';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { precarregarRota } from './paginasSobDemanda';

// O pôster do notebook do HTML inicial é reaproveitado pela abertura do React (PalcoNotebook):
// o mesmo elemento continua na tela, sem pulo e sem contar como um novo "maior elemento" (LCP).
const posterInicial = document.querySelector('#root .poster-notebook-estatico, #root .poster-notebook-v2');
(window as Window & { __posterInicial?: Element | null }).__posterInicial = posterInicial;

/**
 * Espera o HTML inicial ficar pronto na tela antes de montar o React (no máximo 3 s): as fontes
 * do site, o pôster do notebook e as fotos marcadas como prioridade. Se o React montasse antes,
 * ele recriaria título e foto que ainda nem tinham sido pintados no tamanho final, e o navegador
 * contaria o "maior elemento" (LCP) só depois de todo o JavaScript.
 */
const doisQuadros = () => new Promise<void>((ok) => requestAnimationFrame(() => requestAnimationFrame(() => ok())));

function paginaInicialPintada(): Promise<void> {
  const imagens = Array.from(document.querySelectorAll<HTMLImageElement>('#root img[fetchpriority="high"]'));
  if (posterInicial instanceof HTMLImageElement && !imagens.includes(posterInicial)) imagens.push(posterInicial);
  const pronto = Promise.all([
    document.fonts?.ready.catch(() => undefined),
    ...imagens.map((img) => img.decode().catch(() => undefined)),
  ]).then(doisQuadros);
  const limite = new Promise<void>((ok) => setTimeout(ok, 3000));
  return Promise.race([pronto, limite]);
}

// Espera também o código da página aberta para não trocar o HTML pré-renderizado por uma tela vazia.
Promise.all([precarregarRota(window.location.pathname).catch(() => undefined), paginaInicialPintada()]).finally(() =>
  createRoot(document.getElementById('root')!).render(<App />)
);
