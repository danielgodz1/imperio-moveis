import React, { useState } from 'react';
import { MessageSquare, MapPin } from 'lucide-react';
import { EMPRESA } from '../data/empresa';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';

interface FooterProps {
  onNavigateRoute: (path: string) => void;
  onOpenBriefing: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateRoute,
  onOpenBriefing,
}) => {
  const [logoErro, setLogoErro] = useState(false);
  const anoAtual = new Date().getFullYear();

  const irParaSecao = (ancora: string) => {
    if (window.location.pathname !== '/') {
      onNavigateRoute('/');
      setTimeout(() => scrollToTarget(ancora, -72), 120);
      return;
    }
    scrollToTarget(ancora, -72);
  };

  return (
    <footer
      id="rodape"
      data-tema="noite"
      className="w-full bg-preto text-papel border-t border-papel/15 py-64"
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-48">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-32 items-start">
          {/* Coluna 1 (4 colunas): Marca, descrição curta e botões Instagram / WhatsApp */}
          <div className="lg:col-span-4 flex flex-col items-start gap-16">
            <button
              type="button"
              onClick={() => irParaSecao('#hero')}
              className="flex items-center gap-12 text-left cursor-pointer group"
            >
              {!logoErro ? (
                <img
                  src="/logo-imperio.png"
                  alt={EMPRESA.nome}
                  className="h-9 w-auto object-contain"
                  onError={() => setLogoErro(true)}
                />
              ) : (
                <span className="inline-flex items-center gap-8">
                  <span className="w-8 h-8 border-[1.5px] border-dourado text-dourado flex items-center justify-center tipo-logo text-base leading-none">
                    M
                  </span>
                  <span className="tipo-logo text-3xl text-papel tracking-wider group-hover:text-dourado transition-colors">
                    {EMPRESA.nomeCurto.toUpperCase()}
                  </span>
                </span>
              )}
            </button>

            <p className="tipo-corpo text-papel/85">
              Marcenaria e arquitetura de interiores em Jaú e região.
            </p>

            <div className="flex flex-wrap items-center gap-12 pt-4">
              <a
                href={EMPRESA.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-16 h-[42px] rounded-curto border border-papel/30 text-papel hover:border-dourado hover:text-dourado transition-colors tipo-cota"
              >
                Instagram {EMPRESA.instagram}
              </a>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('rodape_whatsapp')}
                className="inline-flex items-center justify-center gap-8 px-16 h-[42px] rounded-curto bg-dourado text-preto hover:bg-preto hover:text-dourado border border-dourado transition-colors tipo-cota font-semibold"
              >
                <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Coluna 2 (2 colunas): Ambientes */}
          <div className="lg:col-span-2 flex flex-col items-start gap-12">
            <span className="tipo-cota text-dourado uppercase tracking-wider">
              Ambientes
            </span>
            <a
              href="/cozinhas-planejadas-jau"
              onClick={(e) => {
                e.preventDefault();
                onNavigateRoute('/cozinhas-planejadas-jau');
              }}
              className="tipo-cota text-papel/85 hover:text-dourado link-traco transition-colors"
            >
              Cozinhas
            </a>
            <a
              href="/quartos-planejados-jau"
              onClick={(e) => {
                e.preventDefault();
                onNavigateRoute('/quartos-planejados-jau');
              }}
              className="tipo-cota text-papel/85 hover:text-dourado link-traco transition-colors"
            >
              Quartos
            </a>
            <a
              href="/closets-sob-medida-jau"
              onClick={(e) => {
                e.preventDefault();
                onNavigateRoute('/closets-sob-medida-jau');
              }}
              className="tipo-cota text-papel/85 hover:text-dourado link-traco transition-colors"
            >
              Closets
            </a>
            <a
              href="/home-office-planejado-jau"
              onClick={(e) => {
                e.preventDefault();
                onNavigateRoute('/home-office-planejado-jau');
              }}
              className="tipo-cota text-papel/85 hover:text-dourado link-traco transition-colors"
            >
              Home office
            </a>
            <button
              type="button"
              onClick={() => irParaSecao('#quarto-3d')}
              className="tipo-cota text-papel/85 hover:text-dourado link-traco cursor-pointer"
            >
              Projeto 3D
            </button>
          </div>

          {/* Coluna 3 (2 colunas): Institucional */}
          <div className="lg:col-span-2 flex flex-col items-start gap-12">
            <span className="tipo-cota text-dourado uppercase tracking-wider">
              Institucional
            </span>
            <button
              type="button"
              onClick={() => irParaSecao('#donos')}
              className="tipo-cota text-papel/85 hover:text-dourado link-traco cursor-pointer"
            >
              Sobre nós
            </button>
            <button
              type="button"
              onClick={() => irParaSecao('#obras')}
              className="tipo-cota text-papel/85 hover:text-dourado link-traco cursor-pointer"
            >
              Projetos
            </button>
            <button
              type="button"
              onClick={() => irParaSecao('#avaliacoes')}
              className="tipo-cota text-papel/85 hover:text-dourado link-traco cursor-pointer"
            >
              Avaliações
            </button>
            <button
              type="button"
              onClick={onOpenBriefing}
              className="tipo-cota text-dourado link-traco cursor-pointer text-left"
            >
              Pedir orçamento
            </button>
          </div>

          {/* Coluna 4 (4 colunas): Atendimento local (dados de empresa.ts) */}
          <div className="lg:col-span-4 flex flex-col items-start gap-12">
            <span className="tipo-cota text-dourado uppercase tracking-wider">
              Atendimento local
            </span>

            <div className="flex items-start gap-8 text-papel/85 tipo-cota">
              <MapPin className="w-4 h-4 text-dourado shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>
                {EMPRESA.endereco.logradouro} — {EMPRESA.endereco.bairro},{' '}
                {EMPRESA.endereco.cidade}/{EMPRESA.endereco.uf} — CEP{' '}
                {EMPRESA.endereco.cep}
                {!EMPRESA.confirmado.endereco && ' [CONFIRMAR]'}
              </span>
            </div>

            <a
              href={EMPRESA.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tipo-cota text-dourado link-traco"
            >
              Ver no Google Maps
            </a>

            <span className="tipo-cota text-papel/80">
              Horário: {EMPRESA.horarios.resumo}
              {!EMPRESA.confirmado.horarios && ' [CONFIRMAR]'}
            </span>

            <a
              href={`tel:+${EMPRESA.whatsapp}`}
              className="tipo-cota text-papel hover:text-dourado transition-colors"
            >
              Telefone / WhatsApp: {EMPRESA.telefone}
            </a>

            {EMPRESA.confirmado.garantia && (
              <span className="tipo-cota text-papel/80">
                Garantia &amp; Montagem Própria
              </span>
            )}
          </div>
        </div>

        <div className="pt-24 border-t border-papel/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-16 tipo-cota text-papel/60">
          <span>
            © {anoAtual} {EMPRESA.nome}
          </span>
          <span>
            {EMPRESA.fundadores} — Jaú/SP
          </span>
        </div>
      </div>
    </footer>
  );
};
