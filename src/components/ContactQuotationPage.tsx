import React from 'react';
import { MapPin } from 'lucide-react';
import { EMPRESA } from '../data/empresa';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { BriefingOrcamento } from './BriefingOrcamento';

interface ContactQuotationPageProps {
  onBackToHome: () => void;
  ambienteInicial?: string;
}

export const ContactQuotationPage: React.FC<ContactQuotationPageProps> = ({
  onBackToHome,
  ambienteInicial,
}) => {
  return (
    <div id="contato-pagina" className="w-full bg-papel text-grafite min-h-screen py-64">
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-64">
        {/* Navegação de retorno */}
        <div className="flex flex-col items-start gap-16 border-b border-grafite/20 pb-32">
          <button
            type="button"
            onClick={onBackToHome}
            className="tipo-cota text-grafite link-traco cursor-pointer"
          >
            Voltar para o início
          </button>

          <h1 className="tipo-h1 text-grafite">
            Pedir orçamento de móveis planejados em Jaú
          </h1>
          <p className="tipo-corpo text-grafite-suave">
            Responda os 3 passos rápidos abaixo. Ao confirmar, abrimos a conversa no WhatsApp com o resumo pronto para o Wellington e a Tatiane.
          </p>
        </div>

        {/* Grade de 12 colunas: 7 colunas BriefingOrcamento + 5 colunas contato direto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-48 items-start">
          <div className="lg:col-span-7 bg-papel p-24 sm:p-32 border border-grafite/20">
            <BriefingOrcamento
              modo="inline"
              ambienteInicial={ambienteInicial}
            />
          </div>

          {/* Coluna Direita (5 colunas): Atendimento Direto */}
          <div className="lg:col-span-5 flex flex-col gap-32 bg-papel-2 p-24 sm:p-32 border border-grafite/20">
            <div className="flex flex-col gap-8">
              <h2 className="tipo-h2 text-grafite">Prefere falar direto?</h2>
              <p className="tipo-corpo text-grafite-suave">
                Você também pode enviar fotos do ambiente ou a planta baixa direto pelo WhatsApp.
              </p>
            </div>

            <div className="flex flex-col gap-8 border-t border-grafite/20 pt-16">
              <span className="tipo-cota text-grafite-suave">WhatsApp em Jaú</span>
              <span className="tipo-h3 text-grafite">{EMPRESA.telefone}</span>
            </div>

            <div className="flex items-start gap-16 border-t border-grafite/20 pt-16">
              <MapPin className="w-5 h-5 text-grafite shrink-0 mt-1" strokeWidth={1.5} />
              <div className="flex flex-col gap-4">
                <span className="tipo-cota text-grafite font-semibold">
                  Endereço em Jaú{!EMPRESA.confirmado.endereco && ' [CONFIRMAR]'}
                </span>
                <span className="tipo-cota text-grafite-suave">
                  {EMPRESA.endereco.logradouro} — {EMPRESA.endereco.bairro},{' '}
                  {EMPRESA.endereco.cidade}/{EMPRESA.endereco.uf}
                </span>
              </div>
            </div>

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('contato_direto')}
              className="inline-flex items-center justify-center px-24 h-[52px] rounded-curto border-[1.5px] border-grafite bg-transparent text-grafite hover:bg-grafite hover:text-papel transition-colors tipo-cota"
            >
              Abrir WhatsApp direto
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
