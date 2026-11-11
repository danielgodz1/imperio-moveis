import React from 'react';
import { MapPin } from 'lucide-react';
import { EMPRESA } from '../data/empresa';

interface WorkshopLocationProps {
  onOpenVisitBooking?: () => void;
}

export const WorkshopLocation: React.FC<WorkshopLocationProps> = ({
  onOpenVisitBooking,
}) => {
  return (
    <div id="oficina" className="w-full grid grid-cols-1 lg:grid-cols-12 gap-32 items-start">
      {/* Coluna Esquerda (5 colunas): Dados do endereço em Jaú vindos de empresa.ts */}
      <div className="lg:col-span-5 flex flex-col items-start gap-24">
        <h3 className="tipo-h2 text-grafite">Onde estamos em Jaú</h3>
        <p className="tipo-corpo text-grafite-suave">
          Atendemos residências e comércios em {EMPRESA.cidadesAtendidas.join(', ')} e região. Agende sua visita ou chame nossa equipe para ir até a sua obra.
        </p>

        <div className="w-full flex flex-col gap-16 border-t border-grafite/20 pt-16">
          <div className="flex items-start gap-16">
            <MapPin className="w-5 h-5 text-grafite shrink-0 mt-1" strokeWidth={1.5} />
            <div className="flex flex-col gap-4">
              <span className="tipo-h3 text-grafite">Oficina e atendimento</span>
              <span className="tipo-corpo text-grafite-suave">
                {EMPRESA.endereco.logradouro} — {EMPRESA.endereco.bairro},{' '}
                {EMPRESA.endereco.cidade}/{EMPRESA.endereco.uf}
                {!EMPRESA.confirmado.endereco && ' [CONFIRMAR endereço atual com os donos]'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 pl-32">
            <span className="tipo-cota text-grafite font-semibold">Horário de atendimento</span>
            <span className="tipo-cota text-grafite-suave">
              {EMPRESA.horarios.resumo}
              {!EMPRESA.confirmado.horarios && ' [CONFIRMAR]'}
            </span>
          </div>

          {/* Mesmas informações da aba "Sobre" do Perfil da Empresa no Google */}
          <dl className="grid grid-cols-2 gap-x-16 gap-y-16 pl-32 pt-8">
            {(
              [
                ['Atendimento', EMPRESA.sobre.atendimento],
                ['Serviços', EMPRESA.sobre.servicos],
                ['Pagamento', EMPRESA.sobre.pagamentos],
                ['Acessibilidade', EMPRESA.sobre.acessibilidade],
              ] as const
            ).map(([titulo, itens]) => (
              <div key={titulo} className="flex flex-col gap-4">
                <dt className="tipo-cota text-grafite font-semibold">{titulo}</dt>
                {itens.map((item) => (
                  <dd key={item} className="tipo-cota text-grafite-suave">
                    {item}
                  </dd>
                ))}
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-16 pt-8">
          <a
            href={EMPRESA.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-24 h-[52px] rounded-curto border-[1.5px] border-grafite bg-transparent text-grafite hover:bg-grafite hover:text-papel transition-colors tipo-cota"
          >
            Ver no Google Maps
          </a>

          {onOpenVisitBooking && (
            <button
              type="button"
              onClick={onOpenVisitBooking}
              className="tipo-cota text-grafite link-traco cursor-pointer"
            >
              Agendar visita técnica
            </button>
          )}
        </div>
      </div>

      {/* Coluna Direita (7 colunas): Mapa incorporado sem borda arredondada nem sombra */}
      <div className="lg:col-span-7 w-full bg-papel-2 border border-grafite/20">
        <iframe
          className="w-full h-[360px] border-0 block"
          src={EMPRESA.mapsEmbedUrl}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa da ${EMPRESA.nome} em Jaú`}
        />
      </div>
    </div>
  );
};
