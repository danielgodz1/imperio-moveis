import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Camera,
} from 'lucide-react';
import { EMPRESA } from '../data/empresa';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';

interface FooterProps {
  onNavigateRoute: (path: string) => void;
  onOpenBriefing: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateRoute }) => {
  const anoAtual = new Date().getFullYear();

  const irParaSecao = (ancora: string) => {
    if (window.location.pathname !== '/') {
      onNavigateRoute('/');
      setTimeout(() => scrollToTarget(ancora, -80), 140);
      return;
    }
    scrollToTarget(ancora, -80);
  };

  return (
    <footer
      id="rodape"
      data-tema="noite"
      className="w-full bg-[#120e0b] text-[#f2e8d8]/85 text-xs border-t border-[#c9a04e]/25"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Coluna 1: Marca, Descrição, Garantia & Montagem Própria e Redes */}
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => irParaSecao('#hero')}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <img
                src="/logo-quadrado.jpg"
                alt={EMPRESA.nome}
                className="h-11 w-11 object-cover rounded-lg shadow-sm border border-[#c9a04e]/40 bg-[#1b1b1b]"
              />
              <div className="flex flex-col">
                <span className="font-serif-atelier text-xl font-bold text-[#f2e8d8] group-hover:text-[#c9a04e] transition-colors leading-none">
                  {EMPRESA.nomeCurto}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a04e] mt-1">
                  Móveis &amp; Arquitetura
                </span>
              </div>
            </button>

            <p className="text-xs text-[#f2e8d8]/75 leading-relaxed">
              Marcenaria sob medida e arquitetura de interiores em Jaú e região central de São Paulo. Wellington Cabral e Tatiane Cabral — no ramo desde 2015.
            </p>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1d1612] border border-[#c9a04e]/30">
              <ShieldCheck className="w-4 h-4 text-[#c9a04e] shrink-0" />
              <span className="text-[11px] font-bold text-[#f2e8d8] uppercase tracking-wider">
                Garantia &amp; Montagem Própria
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/imperio.moveis.jau"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1d1612] border border-[#c9a04e]/35 text-[#f2e8d8] flex items-center justify-center hover:bg-[#c9a04e] hover:text-[#15100c] transition-colors"
                title="Instagram @imperio.moveis.jau"
                aria-label="Instagram @imperio.moveis.jau"
              >
                <Camera className="w-4 h-4" />
              </a>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('rodape_whatsapp')}
                className="w-10 h-10 rounded-full bg-[#1d1612] border border-[#c9a04e]/35 text-[#f2e8d8] flex items-center justify-center hover:bg-[#c9a04e] hover:text-[#15100c] transition-colors"
                title="WhatsApp (14) 99849-2834"
                aria-label="WhatsApp (14) 99849-2834"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/imperio.moveis.jau"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#c9a04e] hover:underline ml-1"
              >
                @imperio.moveis.jau
              </a>
            </div>
          </div>

          {/* Coluna 2: Ambientes Planejados */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif-atelier text-base font-bold text-[#f2e8d8] mb-1">
              Ambientes Planejados
            </h3>
            <ul className="flex flex-col gap-2.5">
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a04e]" />
                <a
                  href="/cozinhas-planejadas-jau"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateRoute('/cozinhas-planejadas-jau');
                  }}
                  className="text-[#f2e8d8]/80 hover:text-[#c9a04e] transition-colors cursor-pointer text-left"
                >
                  Cozinhas Planejadas
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a04e]" />
                <a
                  href="/quartos-planejados-jau"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateRoute('/quartos-planejados-jau');
                  }}
                  className="text-[#f2e8d8]/80 hover:text-[#c9a04e] transition-colors cursor-pointer text-left"
                >
                  Quartos &amp; Suítes
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a04e]" />
                <a
                  href="/closets-sob-medida-jau"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateRoute('/closets-sob-medida-jau');
                  }}
                  className="text-[#f2e8d8]/80 hover:text-[#c9a04e] transition-colors cursor-pointer text-left"
                >
                  Closets Sob Medida
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a04e]" />
                <button
                  type="button"
                  onClick={() => irParaSecao('#obras')}
                  className="text-[#f2e8d8]/80 hover:text-[#c9a04e] transition-colors cursor-pointer text-left"
                >
                  Salas &amp; Comercial
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a04e]" />
                <a
                  href="/home-office-planejado-jau"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateRoute('/home-office-planejado-jau');
                  }}
                  className="text-[#f2e8d8]/80 hover:text-[#c9a04e] transition-colors cursor-pointer text-left"
                >
                  Home Office Executivo
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a04e]" />
                <button
                  type="button"
                  onClick={() => irParaSecao('#quarto-3d')}
                  className="text-[#c9a04e] font-semibold hover:underline transition-colors cursor-pointer text-left"
                >
                  Projete seu Ambiente em 3D
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Institucional */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif-atelier text-base font-bold text-[#f2e8d8] mb-1">
              Institucional
            </h3>
            <ul className="flex flex-col gap-2.5">
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a04e]" />
                <button
                  type="button"
                  onClick={() => irParaSecao('#donos')}
                  className="text-[#f2e8d8]/80 hover:text-[#c9a04e] transition-colors cursor-pointer text-left"
                >
                  Sobre os Fundadores
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a04e]" />
                <button
                  type="button"
                  onClick={() => irParaSecao('#obras')}
                  className="text-[#f2e8d8]/80 hover:text-[#c9a04e] transition-colors cursor-pointer text-left"
                >
                  As Obras (Portfólio 4K)
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a04e]" />
                <button
                  type="button"
                  onClick={() => irParaSecao('#processo')}
                  className="text-[#f2e8d8]/80 hover:text-[#c9a04e] transition-colors cursor-pointer text-left"
                >
                  Nosso Processo &amp; Maquinário
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a04e]" />
                <button
                  type="button"
                  onClick={() => irParaSecao('#avaliacoes')}
                  className="text-[#f2e8d8]/80 hover:text-[#c9a04e] transition-colors cursor-pointer text-left"
                >
                  Avaliações de Clientes
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#c9a04e]" />
                <button
                  type="button"
                  onClick={() => onNavigateRoute('/contato')}
                  className="text-[#c9a04e] hover:underline transition-colors cursor-pointer font-bold text-left"
                >
                  Pedir Orçamento ↗
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Atendimento Local */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif-atelier text-base font-bold text-[#f2e8d8] mb-1">
              Atendimento Local
            </h3>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#c9a04e] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-[#f2e8d8]">
                  {EMPRESA.endereco.bairro}, {EMPRESA.endereco.cidade} – {EMPRESA.endereco.uf}
                </p>
                <p className="text-[11px] text-[#f2e8d8]/75">
                  {EMPRESA.endereco.logradouro}
                </p>
                <p className="text-[10px] text-[#f2e8d8]/55">
                  {EMPRESA.horarios.observacao}
                </p>
                <a
                  href={EMPRESA.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#c9a04e] hover:underline font-bold inline-block mt-0.5"
                >
                  Ver no Google Maps →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2.5 mt-2">
              <Clock className="w-4 h-4 text-[#c9a04e] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#f2e8d8]">Horário de Funcionamento</p>
                <p className="text-[11px] text-[#f2e8d8]/75">Seg à Sex: 08h às 18h</p>
                <p className="text-[11px] text-[#f2e8d8]/75">Sábados: 08h às 12h</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 mt-2">
              <Phone className="w-4 h-4 text-[#c9a04e] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#f2e8d8]">WhatsApp &amp; Telefone</p>
                <a
                  href={`tel:+${EMPRESA.whatsapp}`}
                  className="text-xs font-mono font-bold text-[#c9a04e] hover:underline"
                >
                  {EMPRESA.telefone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Copyright Escura */}
      <div className="bg-[#0b0907] py-6 border-t border-[#c9a04e]/15">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#f2e8d8]/60 text-center md:text-left">
          <p>
            © {anoAtual} {EMPRESA.nome}. Todos os direitos reservados. {EMPRESA.fundadores}.
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onNavigateRoute('/contato')}
              className="hover:text-[#c9a04e] cursor-pointer"
            >
              Privacidade (LGPD)
            </button>
            <span>•</span>
            <span className="font-bold text-[#c9a04e]">Jaú / SP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
