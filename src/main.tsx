import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { precarregarRota } from './paginasSobDemanda';

// O pôster do notebook do HTML inicial é reaproveitado pela abertura do React (PalcoNotebook):
// o mesmo elemento continua na tela, sem pulo e sem contar como um novo "maior elemento" (LCP).
(window as Window & { __posterInicial?: Element | null }).__posterInicial = document.querySelector(
  '#root .poster-notebook-estatico, #root .poster-notebook-v2'
);

// Espera o código da página aberta para não trocar o HTML pré-renderizado por uma tela vazia.
precarregarRota(window.location.pathname)
  .catch(() => undefined)
  .finally(() => createRoot(document.getElementById('root')!).render(<App />));
