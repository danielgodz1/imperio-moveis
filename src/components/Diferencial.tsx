import React from 'react';
import { Check, Minus } from 'lucide-react';

interface DiferencialProps {
  onOpenBriefing: () => void;
}

/** O que muda quando arquitetura e marcenaria são a mesma empresa. Só fatos do jeito de trabalhar. */
const LINHAS: Array<{ comum: string; imperio: string }> = [
  {
    comum: 'Você contrata o arquiteto e a marcenaria em lugares separados.',
    imperio: 'Arquiteta e marceneiro na mesma empresa, na mesma conversa.',
  },
  {
    comum: 'O projeto de interiores é cobrado à parte.',
    imperio: 'O projeto de arquitetura de interiores já vem incluso, sem custo extra.',
  },
  {
    comum: 'O desenho chega pronto e a fábrica adapta como dá.',
    imperio: 'Quem projeta e quem fabrica trabalham lado a lado, do traço à instalação.',
  },
  {
    comum: 'Você só vê o móvel no dia da entrega.',
    imperio: 'Você vê o ambiente em 3D antes de fabricar.',
  },
];

/**
 * Diferencial da Império em comparação direta. Duas colunas de texto (não cartões):
 * a comum fica apagada, a da Império em destaque, separadas por linhas de lápis.
 */
export const Diferencial: React.FC<DiferencialProps> = ({ onOpenBriefing }) => (
  <section id="diferencial" className="w-full bg-papel-2 text-grafite py-96 md:py-144">
    <div className="max-w-[1280px] mx-auto px-16 sm:px-32 grid grid-cols-1 lg:grid-cols-12 gap-48">
      <div className="lg:col-span-4 flex flex-col items-start gap-24">
        <h2 className="tipo-display text-grafite">O projeto de arquitetura já vem junto.</h2>
        <p className="tipo-corpo text-grafite-suave">
          Na maioria dos lugares você paga um profissional para projetar e outro para fabricar. Aqui é uma coisa só.
        </p>
        <button
          type="button"
          onClick={onOpenBriefing}
          className="px-24 h-[52px] rounded-curto border-[1.5px] border-grafite text-grafite hover:bg-preto hover:text-papel hover:border-preto transition-colors tipo-cota font-semibold cursor-pointer"
        >
          Pedir orçamento com projeto
        </button>
      </div>

      <div className="lg:col-span-8">
        <div className="hidden sm:grid grid-cols-2 gap-32 pb-16 border-b-[1.5px] border-grafite">
          <span className="tipo-cota text-grafite-suave">Do jeito comum</span>
          <span className="tipo-cota text-grafite font-semibold">Na Império</span>
        </div>
        <ul className="flex flex-col">
          {LINHAS.map((l) => (
            <li key={l.imperio} className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-32 py-24 border-b border-grafite/20">
              <p className="flex items-start gap-8 tipo-corpo text-grafite-suave">
                <Minus className="w-[18px] h-[18px] mt-[5px] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>
                  <span className="sr-only">Do jeito comum: </span>
                  {l.comum}
                </span>
              </p>
              <p className="flex items-start gap-8 tipo-corpo text-grafite font-semibold">
                <Check className="w-[18px] h-[18px] mt-[5px] shrink-0" strokeWidth={2} aria-hidden="true" />
                <span>
                  <span className="sr-only">Na Império: </span>
                  {l.imperio}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
