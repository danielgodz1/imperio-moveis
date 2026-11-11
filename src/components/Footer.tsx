import React from 'react';
import { EMPRESA } from '../data/empresa';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';
import { tem3D, useNivel } from '../vitrine/nivel';

interface FooterProps {
  onNavigateRoute: (path: string) => void;
  onOpenBriefing: () => void;
}

const AMBIENTES = [
  { rotulo: 'Cozinhas planejadas', rota: '/cozinhas-planejadas-jau' },
  { rotulo: 'Quartos e suítes', rota: '/quartos-planejados-jau' },
  { rotulo: 'Closets sob medida', rota: '/closets-sob-medida-jau' },
  { rotulo: 'Home office', rota: '/home-office-planejado-jau' },
];

const SITE = [
  { rotulo: 'As obras', ancora: '#obras' },
  { rotulo: 'Como trabalhamos', ancora: '#processo' },
  { rotulo: 'Monte seu ambiente em 3D', ancora: '#quarto-3d' },
  { rotulo: 'Avaliações', ancora: '#avaliacoes' },
  { rotulo: 'Quem somos', ancora: '#donos' },
];

const LINK = 'text-papel/85 hover:text-dourado transition-colors cursor-pointer text-left link-traco decoration-papel/25';
const TITULO = 'tipo-cota text-papel/60';

export const Footer: React.FC<FooterProps> = ({ onNavigateRoute, onOpenBriefing }) => {
  const anoAtual = new Date().getFullYear();
  const com3D = tem3D(useNivel());

  const irParaSecao = (ancora: string) => {
    if (window.location.pathname !== '/') {
      onNavigateRoute('/');
      setTimeout(() => scrollToTarget(ancora, -80), 140);
      return;
    }
    scrollToTarget(ancora, -80);
  };

  return (
    <footer id="rodape" data-tema="noite" className="w-full bg-preto text-papel">
      {/* Fecha a história do site e leva a um único próximo passo */}
      <div className="border-t border-papel/15">
        <div className="max-w-[1280px] mx-auto px-16 sm:px-32 py-64 md:py-96 flex flex-col lg:flex-row lg:items-end justify-between gap-32">
          <p className="tipo-display text-papel max-w-[11ch]">Do risco à obra.</p>
          <div className="flex flex-col items-start gap-16">
            <p className="tipo-corpo text-papel/80 max-w-[34ch]">
              Marcenaria e arquitetura de interiores em Jaú e região, desde {EMPRESA.anoInicio}.
            </p>
            <button
              type="button"
              onClick={onOpenBriefing}
              className="h-[52px] px-32 rounded-curto bg-dourado text-preto font-semibold hover:bg-papel transition-colors duration-200 cursor-pointer"
            >
              Pedir orçamento
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-papel/15">
        <div className="max-w-[1280px] mx-auto px-16 sm:px-32 py-48 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] gap-x-32 gap-y-48">
          <div className="flex flex-col items-start gap-16">
            <button type="button" onClick={() => irParaSecao('#hero')} className="flex items-center gap-16 text-left cursor-pointer group" aria-label="Voltar ao início">
              <img src="/logo-quadrado.jpg" alt="" className="h-48 w-48 object-cover border border-papel/25" />
              <span className="flex flex-col gap-4">
                <span className="tipo-logo text-[1.75rem] text-papel group-hover:text-dourado transition-colors">{EMPRESA.nomeCurto}</span>
                <span className="tipo-cota text-papel/70">{EMPRESA.subtitulo}</span>
              </span>
            </button>
            <p className="tipo-cota text-papel/70 max-w-[32ch]">{EMPRESA.fundadores}.</p>
          </div>

          <nav aria-label="Ambientes" className="flex flex-col gap-16">
            <h3 className={TITULO}>Ambientes</h3>
            <ul className="flex flex-col gap-8">
              {AMBIENTES.map((a) => (
                <li key={a.rota}>
                  <a
                    href={a.rota}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateRoute(a.rota);
                    }}
                    className={LINK}
                  >
                    {a.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Site" className="flex flex-col gap-16">
            <h3 className={TITULO}>No site</h3>
            <ul className="flex flex-col gap-8">
              {SITE.filter((s) => com3D || s.ancora !== '#quarto-3d').map((s) => (
                <li key={s.ancora}>
                  <button type="button" onClick={() => irParaSecao(s.ancora)} className={LINK}>
                    {s.rotulo}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-16">
            <h3 className={TITULO}>Fale com a gente</h3>
            <address className="not-italic flex flex-col gap-16 tipo-cota text-papel/85">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('rodape_whatsapp')}
                className="tipo-h3 text-papel hover:text-dourado transition-colors"
              >
                {EMPRESA.telefone}
              </a>
              <a href={EMPRESA.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-papel/85 hover:text-dourado transition-colors link-traco decoration-papel/25 self-start">
                {EMPRESA.instagram}
              </a>
              <span className="flex flex-col gap-4">
                <span>{EMPRESA.endereco.logradouro}</span>
                <span>
                  {EMPRESA.endereco.bairro}, {EMPRESA.endereco.cidade}/{EMPRESA.endereco.uf}
                  {!EMPRESA.confirmado.endereco && ' [CONFIRMAR]'}
                </span>
                <a href={EMPRESA.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-papel hover:text-dourado transition-colors link-traco self-start">
                  Ver no mapa
                </a>
              </span>
              <span className="flex flex-col gap-4 text-papel/70">
                <span>{EMPRESA.horarios.semana}</span>
                {(EMPRESA.horarios.sabado || !EMPRESA.confirmado.horarios) && (
                  <span>
                    {EMPRESA.horarios.sabado}
                    {!EMPRESA.confirmado.horarios && ' [CONFIRMAR]'}
                  </span>
                )}
              </span>
            </address>
          </div>
        </div>
      </div>

      <div className="border-t border-papel/15">
        <div className="max-w-[1280px] mx-auto px-16 sm:px-32 pt-24 pb-96 sm:py-24 flex flex-col sm:flex-row sm:items-center justify-between gap-8 tipo-cota text-papel/60">
          <p>
            © {anoAtual} {EMPRESA.nome}
          </p>
          <button type="button" onClick={() => onNavigateRoute('/contato')} className="text-left sm:text-right hover:text-papel transition-colors cursor-pointer link-traco decoration-papel/25">
            Privacidade e LGPD
          </button>
        </div>
      </div>
    </footer>
  );
};
