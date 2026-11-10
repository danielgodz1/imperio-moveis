import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NIVEIS, definirNivel, useNivel } from './nivel';

/** Seletor de demonstração, visível para todo visitante. */
export const SeletorNivel: React.FC = () => {
  const nivel = useNivel();
  const [aberto, setAberto] = useState(false);

  const atual = NIVEIS.find((n) => n.id === nivel) ?? NIVEIS[NIVEIS.length - 1];

  return (
    <div className="fixed top-[88px] right-16 sm:right-24 z-40 w-[min(320px,calc(100vw-32px))] flex flex-col items-end">
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className="h-[44px] px-16 inline-flex items-center gap-8 rounded-curto bg-papel text-grafite border-[1.5px] border-grafite tipo-cota font-semibold cursor-pointer"
      >
        <span>Nível: {atual.nome}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${aberto ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {aberto && (
        <div className="mt-8 w-full bg-papel text-grafite border-[1.5px] border-grafite p-16 flex flex-col gap-16">
          <p className="tipo-cota text-grafite-suave">O mesmo site em três níveis de entrega.</p>
          <div className="flex flex-col gap-8">
            {NIVEIS.map((n) => {
              const selecionado = n.id === nivel;
              return (
                <button
                  key={n.id}
                  type="button"
                  aria-pressed={selecionado}
                  onClick={() => {
                    definirNivel(n.id);
                    setAberto(false);
                  }}
                  className={`text-left p-16 rounded-curto border-[1.5px] cursor-pointer transition-colors ${
                    selecionado ? 'bg-grafite text-papel border-grafite' : 'border-grafite/30 hover:border-grafite'
                  }`}
                >
                  <span className="block tipo-h3">{n.nome}</span>
                  <span className={`block tipo-cota mt-4 ${selecionado ? 'text-papel/85' : 'text-grafite-suave'}`}>{n.resumo}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-8 border-t border-grafite/20 pt-16">
            <span className="tipo-cota font-semibold">Neste nível</span>
            <ul className="flex flex-col gap-4">
              {atual.inclui.map((item) => (
                <li key={item} className="tipo-cota text-grafite-suave">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
