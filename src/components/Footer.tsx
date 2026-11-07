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
      className="w-full bg-[#f8f2ef] text-[#4f453c] text-xs border-t border-[#ddd7cd]"
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
                className="h-10 w-10 object-cover rounded-lg shadow-sm border border-[#ddd7cd] bg-[#1b1b1b]"
              />
              <span className="font-serif-atelier text-xl font-bold text-[#52371c] group-hover:text-[#c5a059] transition-colors">
                {EMPRESA.nomeCurto}
              </span>
            </button>

            <p className="text-xs text-[#4f453c] leading-relaxed">
              Marcenaria sob medida e arquitetura de interiores em Jaú e região central de São Paulo. Precisão milimétrica, ferragens nobres e compromisso arquitetônico em cada detalhe.
            </p>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f3ede9] border border-[#ddd7cd]">
              <ShieldCheck className="w-4 h-4 text-[#c5a059] shrink-0" />
              <span className="text-[11px] font-bold text-[#1d1b19] uppercase tracking-wider">
                Garantia &amp; Montagem Própria
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/imperio.moveis.jau"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#f3ede9] border border-[#ddd7cd] flex items-center justify-center hover:bg-[#52371c] hover:text-white transition-colors"
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
                className="w-10 h-10 rounded-full bg-[#f3ede9] border border-[#ddd7cd] flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
                title="WhatsApp (14) 99849-2834"
                aria-label="WhatsApp (14) 99849-2834"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Ambientes Planejados */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif-atelier text-base font-bold text-[#1d1b19] mb-1">
              Ambientes Planejados
            </h3>
            <ul className="flex flex-col gap-2.5">
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <a
                  href="/cozinhas-planejadas-jau"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateRoute('/cozinhas-planejadas-jau');
                  }}
                  className="hover:text-[#52371c] transition-colors cursor-pointer text-left"
                >
                  Cozinhas Planejadas
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <a
                  href="/quartos-planejados-jau"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateRoute('/quartos-planejados-jau');
                  }}
                  className="hover:text-[#52371c] transition-colors cursor-pointer text-left"
                >
                  Quartos &amp; Suítes
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <a
                  href="/closets-sob-medida-jau"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateRoute('/closets-sob-medida-jau');
                  }}
                  className="hover:text-[#52371c] transition-colors cursor-pointer text-left"
                >
                  Closets Sob Medida
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <button
                  type="button"
                  onClick={() => irParaSecao('#obras')}
                  className="hover:text-[#52371c] transition-colors cursor-pointer text-left"
                >
                  Salas &amp; Home Theater
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <a
                  href="/home-office-planejado-jau"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateRoute('/home-office-planejado-jau');
                  }}
                  className="hover:text-[#52371c] transition-colors cursor-pointer text-left"
                >
                  Home Office Executivo
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <button
                  type="button"
                  onClick={() => irParaSecao('#quarto-3d')}
                  className="hover:text-[#52371c] transition-colors cursor-pointer text-left"
                >
                  Simulador 3D Interativo
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Institucional */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif-atelier text-base font-bold text-[#1d1b19] mb-1">
              Institucional
            </h3>
            <ul className="flex flex-col gap-2.5">
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <button
                  type="button"
                  onClick={() => irParaSecao('#donos')}
                  className="hover:text-[#52371c] transition-colors cursor-pointer text-left"
                >
                  Sobre a Império
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <button
                  type="button"
                  onClick={() => irParaSecao('#obras')}
                  className="hover:text-[#52371c] transition-colors cursor-pointer text-left"
                >
                  Projetos Autorais
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <button
                  type="button"
                  onClick={() => irParaSecao('#avaliacoes')}
                  className="hover:text-[#52371c] transition-colors cursor-pointer text-left"
                >
                  Depoimentos no Google
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <button
                  type="button"
                  onClick={() => onNavigateRoute('/contato')}
                  className="hover:text-[#52371c] transition-colors cursor-pointer font-bold text-[#52371c] text-left"
                >
                  Solicitar Cotação
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Atendimento Local */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif-atelier text-base font-bold text-[#1d1b19] mb-1">
              Atendimento Local
            </h3>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-[#1d1b19]">
                  {EMPRESA.endereco.bairro}, {EMPRESA.endereco.cidade} – {EMPRESA.endereco.uf}
                </p>
                <p className="text-[11px] text-[#4f453c]">
                  {EMPRESA.endereco.logradouro}
                </p>
                <p className="text-[10px] text-[#81756b]">
                  {EMPRESA.horarios.observacao}
                </p>
                <a
                  href={EMPRESA.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#52371c] hover:underline font-bold inline-block mt-0.5"
                >
                  Ver no Google Maps →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2.5 mt-2">
              <Clock className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#1d1b19]">Horário de Funcionamento</p>
                <p className="text-[11px]">Seg à Sex: 08h às 18h</p>
                <p className="text-[11px]">Sábados: 08h às 12h</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 mt-2">
              <Phone className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#1d1b19]">Central Telefônica</p>
                <a
                  href={`tel:+${EMPRESA.whatsapp}`}
                  className="text-[11px] font-mono font-bold text-[#1d1b19] hover:text-[#52371c]"
                >
                  {EMPRESA.telefone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Copyright */}
      <div className="bg-[#f3ede9] py-6 border-t border-[#ddd7cd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#81756b] text-center md:text-left">
          <p>
            © {anoAtual} {EMPRESA.nome}. Todos os direitos reservados. {EMPRESA.fundadores}.
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onNavigateRoute('/contato')}
              className="hover:text-[#52371c] cursor-pointer"
            >
              Privacidade (LGPD)
            </button>
            <span>•</span>
            <span className="font-bold text-[#52371c]">Jaú / SP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
