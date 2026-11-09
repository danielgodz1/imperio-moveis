import React from 'react';
import { MessageSquare } from 'lucide-react';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { WorkshopLocation } from './WorkshopLocation';

interface FechamentoProps {
  onNavigateContact: () => void;
  onOpenVisitBooking: () => void;
}

/** Só entram no site as respostas confirmadas; as demais voltam quando a loja definir. */
const PERGUNTAS_CURTAS = [
  {
    pergunta: 'Vocês fazem só os móveis ou o projeto completo?',
    resposta: 'O completo. A Tatiane assina os interiores e o Wellington fabrica e instala a marcenaria.',
    confirmado: true,
  },
  {
    pergunta: 'Como eu peço um orçamento?',
    resposta: 'Conte o que você quer pelo botão ou pelo WhatsApp. Com fotos ou medidas, a conversa anda mais rápido.',
    confirmado: true,
  },
  {
    pergunta: 'Qual é o prazo médio de fabricação e instalação?',
    resposta: '[CONFIRMAR prazo médio em dias]',
    confirmado: false,
  },
  {
    pergunta: 'A medição em Jaú tem algum custo?',
    resposta: '[CONFIRMAR política de visita e projeto 3D fora de Jaú]',
    confirmado: false,
  },
];

export const Fechamento: React.FC<FechamentoProps> = ({ onNavigateContact, onOpenVisitBooking }) => (
  <section id="fechamento" className="w-full bg-papel text-grafite">
    {/* Único bloco centralizado permitido pelo DESIGN.md */}
    <div className="max-w-[1280px] mx-auto px-16 sm:px-32 py-96 md:py-144 flex flex-col items-center text-center gap-32">
      <h2 className="tipo-display text-grafite max-w-[15ch]">Vamos desenhar o seu projeto?</h2>
      <p className="tipo-corpo text-grafite-suave">Fale direto com o Wellington e a Tatiane.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-16">
        <button
          type="button"
          onClick={onNavigateContact}
          className="w-full sm:w-auto h-[52px] px-32 rounded-curto bg-dourado text-preto hover:bg-preto hover:text-dourado font-semibold transition-colors duration-200 cursor-pointer"
        >
          Pedir orçamento
        </button>
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('fechamento_cta')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-8 h-[52px] px-24 rounded-curto border-[1.5px] border-grafite text-grafite hover:bg-grafite hover:text-papel font-semibold transition-colors duration-200"
        >
          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
          Chamar no WhatsApp
        </a>
      </div>
    </div>

    <div className="max-w-[1280px] mx-auto px-16 sm:px-32 pb-96 flex flex-col gap-64">
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-32 border-t-[1.5px] border-grafite pt-32">
        {PERGUNTAS_CURTAS.filter((p) => p.confirmado).map((item) => (
          <div key={item.pergunta} className="flex flex-col gap-8">
            <dt className="tipo-h3 text-grafite">{item.pergunta}</dt>
            <dd className="tipo-corpo text-grafite-suave">{item.resposta}</dd>
          </div>
        ))}
      </dl>
      <WorkshopLocation onOpenVisitBooking={onOpenVisitBooking} />
    </div>
  </section>
);
