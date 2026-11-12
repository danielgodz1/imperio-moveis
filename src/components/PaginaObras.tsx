import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { OBRAS_REAIS } from '../data/portfolioData';
import { Foto } from './Foto';
import { AnotacoesObra } from './AnotacoesObra';

const NOME_AMBIENTE: Record<string, string> = { cozinhas: 'Cozinhas', quartos: 'Quartos', lojas: 'Lojas e comercial' };

interface PaginaObrasProps {
  onNavegar: (rota: string) => void;
  onOpenBriefing: (ambiente?: string) => void;
}

/**
 * Portfólio completo (/obras): todas as obras reais, com foto, ambiente, materiais e cidade.
 * Pré-renderizada com ItemList de ImageObject no HTML (prerenderHtml), para o Google entender
 * que são trabalhos reais da empresa.
 */
export const PaginaObras: React.FC<PaginaObrasProps> = ({ onNavegar, onOpenBriefing }) => {
  const grupos = ['cozinhas', 'quartos', 'lojas']
    .map((a) => ({ ambiente: a, obras: OBRAS_REAIS.filter((o) => o.ambiente === a) }))
    .filter((g) => g.obras.length > 0);
  return (
    <section className="w-full bg-papel text-grafite pt-144 pb-96">
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-64">
        <header className="flex flex-col gap-16 max-w-[60ch]">
          <nav aria-label="Trilha" className="tipo-cota text-grafite-suave flex items-center gap-8">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavegar('/');
              }}
              className="inline-flex items-center gap-8 hover:text-grafite"
            >
              <ArrowLeft className="w-[16px] h-[16px]" strokeWidth={1.5} />
              Início
            </a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Obras</span>
          </nav>
          <h1 className="tipo-h1">Obras de móveis planejados em Jaú e região</h1>
          <p className="tipo-corpo text-grafite-suave">
            Cozinhas, quartos e lojas projetados pela nossa arquiteta e fabricados na nossa marcenaria. Todas as fotos são de obras entregues pela Império Móveis Planejados.
          </p>
        </header>

        {grupos.map((g) => (
          <section key={g.ambiente} aria-labelledby={`obras-${g.ambiente}`} className="flex flex-col gap-32">
            <h2 id={`obras-${g.ambiente}`} className="tipo-h2 border-b-[1.5px] border-grafite pb-16">
              {NOME_AMBIENTE[g.ambiente]}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-32 gap-y-64">
              {g.obras.map((o) => (
                <li key={o.id} className="flex flex-col gap-16">
                  <figure className="relative" style={{ aspectRatio: o.proporcao }}>
                    <Foto srcBase={o.arquivo} alt={o.alt} proporcao={o.proporcao} sizes="(min-width: 768px) 46vw, 100vw" className="w-full h-full" imgStyle={{ objectFit: 'cover' }} />
                    {o.anotacoes && <AnotacoesObra anotacoes={o.anotacoes} />}
                  </figure>
                  <h3 className="tipo-h3">{o.titulo}</h3>
                  <p className="tipo-cota text-grafite-suave">{o.cota}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="flex flex-wrap items-center gap-16 pt-32 border-t border-grafite/20">
          <button type="button" onClick={() => onOpenBriefing()} className="px-24 h-[52px] rounded-curto bg-dourado text-preto hover:bg-preto hover:text-dourado transition-colors tipo-cota font-semibold cursor-pointer">
            Quero um projeto assim
          </button>
          <a
            href="/projetar"
            onClick={(e) => {
              e.preventDefault();
              onNavegar('/projetar');
            }}
            className="tipo-cota text-grafite link-traco"
          >
            Montar o meu ambiente em 3D
          </a>
        </div>
      </div>
    </section>
  );
};
