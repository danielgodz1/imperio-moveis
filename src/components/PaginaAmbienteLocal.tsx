import React from 'react';
import { ArrowLeft, MessageSquare, Box } from 'lucide-react';
import { PaginaAmbienteConfig } from '../data/paginasLocais';
import { Foto } from './Foto';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';
import { BriefingOrcamento } from './BriefingOrcamento';

interface PaginaAmbienteLocalProps {
  config: PaginaAmbienteConfig;
  onNavigateHome: () => void;
  onOpenBriefing: (ambienteInicial?: string) => void;
}

export const PaginaAmbienteLocal: React.FC<PaginaAmbienteLocalProps> = ({
  config,
  onNavigateHome,
  onOpenBriefing,
}) => {
  const irParaSecaoHome = (ancora: string) => {
    onNavigateHome();
    setTimeout(() => {
      scrollToTarget(ancora, -72);
    }, 150);
  };

  return (
    <article className="w-full bg-papel text-grafite min-h-screen py-64">
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-64">
        {/* 1. Navegação de retorno e Cabeçalho da Página Local */}
        <header className="flex flex-col items-start gap-20 border-b border-grafite/20 pb-32">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-8 tipo-cota text-grafite link-traco cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a página inicial</span>
          </button>

          <span className="tipo-cota text-grafite-suave uppercase tracking-wider">
            Império Móveis Planejados — Jaú e Região
          </span>

          <h1 className="tipo-h1 text-grafite max-w-4xl">{config.h1}</h1>

          <p className="tipo-subtitulo text-grafite-suave max-w-3xl">
            {config.subtitulo}
          </p>

          <div className="flex flex-wrap items-center gap-16 pt-8">
            <button
              type="button"
              onClick={() => onOpenBriefing(config.ambienteBriefing)}
              className="inline-flex items-center justify-center gap-8 px-24 h-[52px] rounded-curto bg-dourado text-preto hover:bg-preto hover:text-dourado border border-dourado transition-colors tipo-cota font-semibold cursor-pointer"
            >
              <span>Pedir orçamento de {config.ambienteBriefing.toLowerCase()}</span>
            </button>

            <a
              href={getWhatsAppUrl(
                `Oi! Vi a página de ${config.ambienteBriefing.toLowerCase()} em Jaú e gostaria de conversar sobre um projeto.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick(`pagina_local_${config.ambiente3D}`)}
              className="inline-flex items-center justify-center gap-8 px-24 h-[52px] rounded-curto border-[1.5px] border-grafite bg-transparent text-grafite hover:bg-grafite hover:text-papel transition-colors tipo-cota"
            >
              <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
              <span>Chamar no WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => irParaSecaoHome('#obras')}
              className="tipo-cota text-grafite link-traco cursor-pointer"
            >
              Ver portfólio completo de obras
            </button>
          </div>
        </header>

        {/* 2. Galeria de 2 a 3 fotos reais daquele ambiente em 4K */}
        <section aria-label="Obras reais executadas pela Império" className="flex flex-col gap-24">
          <h2 className="tipo-h2 text-grafite">
            Obras reais executadas em Jaú e região
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-24 items-start">
            {config.fotos.map((foto, idx) => (
              <figure
                key={foto.srcBase}
                className={`${
                  config.fotos.length === 2
                    ? 'md:col-span-6'
                    : idx === 0
                    ? 'md:col-span-6'
                    : 'md:col-span-3'
                } flex flex-col gap-12`}
              >
                <div className="w-full overflow-hidden bg-papel-2 border border-grafite/15">
                  <Foto
                    srcBase={foto.srcBase}
                    alt={foto.alt}
                    proporcao={foto.razao}
                    prioridade={idx === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="w-full h-auto block"
                  />
                </div>
                <figcaption className="tipo-cota text-grafite-suave">
                  {foto.legenda}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* 3. Texto autoral baseado nas obras reais + Especificações técnicas */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-48 items-start pt-32 border-t border-grafite/20">
          <div className="lg:col-span-7 flex flex-col gap-20">
            <h2 className="tipo-h2 text-grafite">
              Como projetamos e fabricamos cada {config.ambienteBriefing.toLowerCase()}
            </h2>
            {config.paragrafosReais.map((paragrafo, idx) => (
              <p key={idx} className="tipo-corpo text-grafite-suave">
                {paragrafo}
              </p>
            ))}

            <div className="pt-12 flex flex-wrap items-center gap-16">
              <button
                type="button"
                onClick={() => irParaSecaoHome('#quarto-3d')}
                className="inline-flex items-center gap-8 px-20 h-[48px] rounded-curto bg-preto text-papel hover:bg-dourado hover:text-preto transition-colors tipo-cota cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>Testar módulos e acabamentos no simulador 3D</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-20 bg-papel-2 p-24 sm:p-32 border border-grafite/20">
            <h3 className="tipo-h3 text-grafite">
              Padrão construtivo Império
            </h3>
            <dl className="flex flex-col gap-20">
              {config.especificacoesReais.map((item) => (
                <div
                  key={item.titulo}
                  className="flex flex-col gap-4 pb-16 border-b border-grafite/15 last:border-b-0 last:pb-0"
                >
                  <dt className="tipo-cota text-grafite font-semibold">
                    {item.titulo}
                  </dt>
                  <dd className="tipo-cota text-grafite-suave">
                    {item.detalhe}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 4. Formulário curto de orçamento integrado na própria página */}
        <section className="pt-48 border-t border-grafite/20 grid grid-cols-1 lg:grid-cols-12 gap-48 items-start">
          <div className="lg:col-span-5 flex flex-col gap-16">
            <span className="tipo-cota text-grafite-suave uppercase tracking-wider">
              Orçamento direto com os donos
            </span>
            <h2 className="tipo-h2 text-grafite">
              Solicite seu projeto de {config.ambienteBriefing.toLowerCase()} em Jaú
            </h2>
            <p className="tipo-corpo text-grafite-suave">
              Preencha os 3 passos ao lado e abriremos a conversa no WhatsApp com a Tatiane (arquitetura) e o Wellington (marcenaria).
            </p>
          </div>

          <div className="lg:col-span-7 bg-papel p-24 sm:p-32 border border-grafite/20">
            <BriefingOrcamento
              modo="inline"
              ambienteInicial={config.ambienteBriefing}
            />
          </div>
        </section>
      </div>
    </article>
  );
};
