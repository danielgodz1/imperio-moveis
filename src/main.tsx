import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { precarregarRota } from './paginasSobDemanda';

// Espera o código da página aberta para não trocar o HTML pré-renderizado por uma tela vazia.
precarregarRota(window.location.pathname)
  .catch(() => undefined)
  .finally(() => createRoot(document.getElementById('root')!).render(<App />));
