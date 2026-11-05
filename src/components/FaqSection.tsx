import React, { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { playWoodChimeSound, getWhatsAppUrl } from '../utils/helpers';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Qual é o prazo médio de entrega e instalação dos móveis em Jaú?',
      a: 'Nosso prazo padrão varia entre 25 e 40 dias úteis após a aprovação final do projeto executivo e conferência das medidas finais na obra. Trabalhamos com data contratual rigorosa e cronograma transparente de montagem para garantir que sua mudança ou reforma ocorra sem atrasos.'
    },
    {
      q: 'A visita técnica e medição no imóvel em Jaú têm algum custo?',
      a: 'Não. A primeira visita técnica, a medição no local e o desenvolvimento do projeto 3D preliminar com orçamento detalhado são totalmente gratuitos e sem compromisso para Jaú e cidades vizinhas imediatas.'
    },
    {
      q: 'Quais são as formas e condições de pagamento disponíveis?',
      a: 'Facilitamos o pagamento de acordo com o andamento do seu projeto: oferecemos condições especiais à vista, parcelamento em cartão de crédito, boletos programados e financiamento facilitado para residências completas. Consulte as condições personalizadas no momento do orçamento.'
    },
    {
      q: 'Qual a garantia dos móveis sob medida e das ferragens?',
      a: 'Todos os nossos móveis planejados possuem garantia estrutural contra defeitos de fabricação e montagem. As ferragens utilizadas (amortecedores, dobradiças e corrediças telescópicas) contam com garantia própria de marcas renomadas de alto padrão, garantindo durabilidade e fechamento suave contínuo.'
    },
    {
      q: 'A montagem é realizada por equipe própria da Império Móveis?',
      a: 'Sim, 100% própria. Não terceirizamos montadores. Nossa equipe é treinada diretamente na nossa marcenaria, conhece os detalhes do projeto e segue protocolos rigorosos de alinhamento milimétrico, limpeza do ambiente e proteção do seu piso durante o processo.'
    }
  ];

  const toggleFaq = (idx: number) => {
    playWoodChimeSound();
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full py-16 lg:py-24 bg-[#fef8f4] border-b border-[#ddd7cd]">
      <div className="max-w-[880px] mx-auto px-4 sm:px-8 flex flex-col space-y-12">
        
        {/* Header */}
        <div className="gsap-reveal text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#775a19] font-bold">
            <span>Dúvidas Comuns</span>
            <span className="text-[#d3c4b9]">•</span>
            <span>Transparência Total</span>
          </div>
          <h2 className="font-serif-atelier text-3xl sm:text-4xl text-[#1d1b19] font-semibold">
            Perguntas Frequentes sobre Nossos Móveis
          </h2>
          <p className="text-sm text-[#4f453c]">
            Confira as principais dúvidas sobre orçamento, prazos de entrega, medição e materiais utilizados na Império.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#f3ede9] border border-[#ddd7cd] overflow-hidden transition-all duration-200 shadow-wood-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-serif-atelier text-base sm:text-lg text-[#1d1b19] font-semibold focus:outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#81756b] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#775a19]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-[#4f453c] leading-relaxed border-t border-[#ddd7cd]/50 mt-2 pt-4">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Box */}
        <div className="p-8 rounded-2xl bg-[#ede7e3] border border-[#ddd7cd] text-center space-y-4 shadow-wood-sm">
          <h3 className="font-serif-atelier text-xl text-[#1d1b19] font-semibold">
            Ainda tem dúvidas sobre o seu projeto?
          </h3>
          <p className="text-xs sm:text-sm text-[#4f453c] max-w-lg mx-auto">
            Fale diretamente com nossa equipe de atendimento em Jaú e tire todas as suas dúvidas por WhatsApp agora mesmo.
          </p>
          <div>
            <a
              href={getWhatsAppUrl('Olá! Tenho uma dúvida sobre móveis planejados da Império Móveis Jaú.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playWoodChimeSound}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#775a19] hover:bg-[#c5a059] text-white transition-all text-xs font-semibold uppercase tracking-wider shadow-wood-sm"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Tirar Dúvidas com um Especialista</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
