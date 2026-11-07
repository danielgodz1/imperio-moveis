import React from 'react';
import { MessageSquare } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';
import { WorkshopLocation } from './WorkshopLocation';

interface FechamentoProps {
  onNavigateContact: () => void;
  onOpenVisitBooking: () => void;
}

const PERGUNTAS_CURTAS = [
  {
    pergunta: 'Vocês fazem só os móveis ou o projeto completo da casa?',
    resposta:
      'Oferecemos o pacote completo: a Tatiane é arquiteta e assina o projeto de interiores; o Wellington fabrica e instala a marcenaria.',
  },
  {
    pergunta: 'Qual é o prazo médio de fabricação e instalação?',
    resposta:
      'O cronograma é combinado conforme o porte da obra após a aprovação do projeto 3D e medição final. [CONFIRMAR prazo médio em dias]',
  },
  {
    pergunta: 'A medição técnica em Jaú tem algum custo?',
    resposta:
      'Fazemos a conversa inicial e o alinhamento do projeto sem compromisso. [CONFIRMAR política de visita e projeto 3D fora de Jaú]',
  },
  {
    pergunta: 'Quais cidades além de Jaú vocês atendem?',
    resposta:
      'Atendemos famílias e comércios em Jaú e cidades da região central paulista. [CONFIRMAR raio de atendimento]',
  },
];

export const Fechamento: React.FC<FechamentoProps> = ({
  onNavigateContact,
  onOpenVisitBooking,
}) => {
  return (
    <section
      id="fechamento"
      className="w-full py-96 md:py-144 bg-papel text-grafite"
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-96">
        {/* 1. Perguntas curtas em lista simples (sem acordeão decorativo) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 items-start">
          <div className="lg:col-span-5 flex flex-col items-start gap-16">
            <h2 className="tipo-h1 text-grafite">Perguntas diretas</h2>
            <p className="tipo-corpo text-grafite-suave">
              O que você precisa saber antes de chamar nossa equipe.
            </p>
          </div>

          <dl className="lg:col-span-7 flex flex-col gap-32">
            {PERGUNTAS_CURTAS.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-8 pb-24 border-b border-grafite/20 last:border-b-0"
              >
                <dt className="tipo-h3 text-grafite">{item.pergunta}</dt>
                <dd className="tipo-corpo text-grafite-suave">{item.resposta}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* 2. Bloco Onde Estamos */}
        <div className="pt-48 border-t border-grafite/20">
          <WorkshopLocation onOpenVisitBooking={onOpenVisitBooking} />
        </div>

        {/* 3. CTA Final (único bloco centralizado permitido pelo DESIGN.md) */}
        <div className="pt-64 border-t border-grafite/20 flex flex-col items-center text-center gap-24 max-w-3xl mx-auto">
          <h2 className="tipo-h1 text-grafite">
            Vamos desenhar e fabricar o seu projeto?
          </h2>
          <p className="tipo-corpo text-grafite-suave">
            Fale direto com o Wellington e a Tatiane pelo WhatsApp ou envie as medidas do seu ambiente.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-16 pt-8">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-8 px-32 h-[52px] rounded-curto bg-dourado text-preto hover:bg-preto hover:text-dourado border border-dourado transition-colors duration-200 tipo-cota font-semibold"
            >
              <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
              <span>Chamar no WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onNavigateContact}
              className="inline-flex items-center justify-center px-24 h-[52px] rounded-curto border-[1.5px] border-grafite bg-transparent text-grafite hover:bg-grafite hover:text-papel transition-colors duration-200 tipo-cota cursor-pointer"
            >
              Preencher formulário de orçamento
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

