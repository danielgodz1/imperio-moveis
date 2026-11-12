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
 * Espera o pôster do HTML inicial ser pintado antes de montar o React (no máximo 2,5 s).
 * Se o React montasse antes, o navegador contaria o pôster como dependente de todo o
 * JavaScript, e o "maior elemento" (LCP) ficaria segundos mais tarde nas medições.
 */
const doisQuadros = () => new Promise<void>((ok) => requestAnimationFrame(() => requestAnimationFrame(() => ok())));

function posterPintado(): Promise<void> {
  // Sem pôster: só garante que o HTML inicial já foi pintado (dois quadros) antes do React.
  if (!(posterInicial instanceof HTMLImageElement)) return doisQuadros();
  const pintado = posterInicial
    .decode()
    .catch(() => undefined)
    .then(doisQuadros);
  const limite = new Promise<void>((ok) => setTimeout(ok, 2500));
  return Promise.race([pintado, limite]);
}

// Espera também o código da página aberta para não trocar o HTML pré-renderizado por uma tela vazia.
Promise.all([precarregarRota(window.location.pathname).catch(() => undefined), posterPintado()]).finally(() =>
  createRoot(document.getElementById('root')!).render(<App />)
);
