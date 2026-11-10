import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { OBRAS_REAIS } from '../data/portfolioData';
import { AmbienteCategoria, ObraItem } from '../types';
import { Foto } from './Foto';
import { AnotacoesObra } from './AnotacoesObra';
import { temMovimento, useNivel } from '../vitrine/nivel';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';

const CATEGORIAS: Array<{ valor: AmbienteCategoria | 'todas'; rotulo: string }> = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'cozinhas', rotulo: 'Cozinhas' },
  { valor: 'quartos', rotulo: 'Quartos' },
  { valor: 'lojas', rotulo: 'Lojas' },
];

const AMBIENTE_BRIEFING: Record<string, string> = {
  cozinhas: 'Cozinha',
  quartos: 'Quarto',
  lojas: 'Comercial',
};

const POR_PAGINA = 6;

interface ObrasProps {
  onOpenBriefing: (ambienteInicial?: string) => void;
}

export const Obras: React.FC<ObrasProps> = ({ onOpenBriefing }) => {
  const nivel = useNivel();
  const [categoriaAtiva, setCategoriaAtiva] = useState<AmbienteCategoria | 'todas'>('todas');
  const [verTodas, setVerTodas] = useState(false);
  const [obraAmpliada, setObraAmpliada] = useState<ObraItem | null>(null);
  const botaoFecharRef = useRef<HTMLButtonElement>(null);

  const filtradas =
    categoriaAtiva === 'todas' ? OBRAS_REAIS : OBRAS_REAIS.filter((o) => o.ambiente === categoriaAtiva);
  const visiveis = verTodas ? filtradas : filtradas.slice(0, POR_PAGINA);

  useEffect(() => {
    if (!obraAmpliada) return;
    botaoFecharRef.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setObraAmpliada(null);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        botaoFecharRef.current?.focus();
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [obraAmpliada]);

  return (
    <section id="obras" className="w-full bg-papel text-grafite">
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 pt-96 md:pt-144 pb-64 flex flex-col gap-48">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-24">
          <h2 className="tipo-display text-grafite max-w-[12ch]">Obra pronta, foto real.</h2>
          <nav aria-label="Filtrar obras por ambiente" className="flex flex-wrap items-center gap-8">
            {CATEGORIAS.map((cat) => {
              const ativo = categoriaAtiva === cat.valor;
              return (
                <button
                  key={cat.valor}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => {
                    setCategoriaAtiva(cat.valor);
                    setVerTodas(false);
                  }}
                  className={`h-[44px] px-16 rounded-curto border-[1.5px] font-semibold cursor-pointer transition-colors ${
                    ativo ? 'bg-grafite text-papel border-grafite' : 'border-grafite/30 text-grafite hover:border-grafite'
                  }`}
                >
                  {cat.rotulo}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="columns-1 md:columns-2 gap-x-24 [column-fill:balance]">
          {visiveis.map((obra, i) => {
            const destaque = i < 2;
            return (
              <figure key={obra.id} className="break-inside-avoid flex flex-col gap-8 mb-48">
                <button
                  type="button"
                  onClick={() => setObraAmpliada(obra)}
                  aria-label={`Ampliar foto: ${obra.titulo}`}
                  className="relative block w-full cursor-zoom-in text-left"
                >
                  <Foto
                    srcBase={obra.arquivo}
                    alt={obra.alt}
                    proporcao={obra.proporcao}
                    prioridade={destaque}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="w-full"
                  />
                  {temMovimento(nivel) && <AnotacoesObra anotacoes={obra.anotacoes} />}
                </button>
                <figcaption className="flex flex-col gap-4">
                  <span className="tipo-h3 text-grafite">{obra.titulo}</span>
                  <span className="tipo-cota text-grafite-suave">{obra.cota}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        {!verTodas && filtradas.length > POR_PAGINA && (
          <button
            type="button"
            onClick={() => setVerTodas(true)}
            className="self-start h-[52px] px-24 rounded-curto border-[1.5px] border-grafite text-grafite hover:bg-grafite hover:text-papel font-semibold transition-colors cursor-pointer"
          >
            Ver mais {filtradas.length - POR_PAGINA} obras
          </button>
        )}
      </div>

      {/* Convite logo depois da prova: quem gostou não precisa rolar até o fim */}
      <div data-tema="noite" className="w-full bg-preto text-papel">
        <div className="max-w-[1280px] mx-auto px-16 sm:px-32 py-64 md:py-96 flex flex-col lg:flex-row lg:items-center justify-between gap-32">
          <p className="tipo-display text-papel max-w-[14ch]">A próxima pode ser a sua.</p>
          <div className="flex flex-col items-start gap-16">
            <p className="tipo-corpo text-papel/85 max-w-[36ch]">
              Conte o que você quer em menos de um minuto. A resposta chega pelo WhatsApp.
            </p>
            <div className="flex flex-wrap items-center gap-16">
              <button
                type="button"
                onClick={() => onOpenBriefing(categoriaAtiva === 'todas' ? undefined : AMBIENTE_BRIEFING[categoriaAtiva])}
                className="h-[52px] px-32 rounded-curto bg-dourado text-preto hover:bg-papel font-semibold transition-colors cursor-pointer"
              >
                Pedir orçamento
              </button>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('obras_cta')}
                className="inline-flex items-center gap-8 text-papel link-traco"
              >
                <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                Chamar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {obraAmpliada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={obraAmpliada.titulo}
          onClick={() => setObraAmpliada(null)}
          className="fixed inset-0 z-50 bg-preto/95 text-papel flex flex-col items-center justify-center p-16 sm:p-32"
        >
          <div onClick={(e) => e.stopPropagation()} className="max-w-[1100px] w-full flex flex-col gap-16">
            <div className="flex items-start justify-between gap-16 border-b border-papel/20 pb-16">
              <div className="flex flex-col gap-4">
                <h3 className="tipo-h3 text-papel">{obraAmpliada.titulo}</h3>
                <span className="tipo-cota text-papel/75">{obraAmpliada.cota}</span>
              </div>
              <button
                ref={botaoFecharRef}
                type="button"
                onClick={() => setObraAmpliada(null)}
                aria-label="Fechar foto ampliada"
                className="shrink-0 inline-flex items-center gap-8 px-16 h-[40px] rounded-curto border border-papel text-papel hover:bg-dourado hover:text-preto hover:border-dourado transition-colors tipo-cota cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
                <span>Fechar</span>
              </button>
            </div>
            <div className="max-h-[76vh] w-full flex items-center justify-center overflow-hidden">
              <Foto srcBase={obraAmpliada.arquivo} alt={obraAmpliada.alt} sizes="95vw" className="max-h-[76vh] w-auto" imgClassName="object-contain max-h-[76vh] w-auto mx-auto" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
