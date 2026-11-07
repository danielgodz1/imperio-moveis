import React from 'react';
import { getWhatsAppUrl } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';

interface FooterProps {
  onNavigateContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateContact }) => {
  return (
    <footer
      id="rodape"
      data-tema="noite"
      className="w-full bg-preto text-papel border-t border-papel/15 py-64"
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-48">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-32 items-start">
          {/* Coluna 1 (5 colunas): Marca e Fundadores */}
          <div className="md:col-span-5 flex flex-col items-start gap-12">
            <span className="tipo-logo text-3xl text-papel">IMPÉRIO</span>
            <span className="tipo-cota text-dourado">
              Móveis Planejados e Arquitetura de Interiores
            </span>
            <p className="tipo-corpo text-papel/80 pt-4">
              Wellington Cabral e Tatiane Cabral. No ramo desde 2015 em Jaú/SP.
            </p>
          </div>

          {/* Coluna 2 (4 colunas): Contato direto e Instagram */}
          <div className="md:col-span-4 flex flex-col items-start gap-12">
            <span className="tipo-cota text-papel/60">Canais diretos</span>
            <a
              href="https://www.instagram.com/imperio.moveis.jau/"
              target="_blank"
              rel="noopener noreferrer"
              className="tipo-corpo text-papel hover:text-dourado link-traco transition-colors"
            >
              @imperio.moveis.jau
            </a>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="tipo-corpo text-papel hover:text-dourado link-traco transition-colors"
            >
              WhatsApp (14) 99849-2834
            </a>
          </div>

          {/* Coluna 3 (3 colunas): Navegação rápida */}
          <div className="md:col-span-3 flex flex-col items-start gap-12">
            <span className="tipo-cota text-papel/60">Seções</span>
            <button
              type="button"
              onClick={() => scrollToTarget('#obras', -72)}
              className="tipo-cota text-papel hover:text-dourado link-traco cursor-pointer"
            >
              As obras
            </button>
            <button
              type="button"
              onClick={() => scrollToTarget('#processo', -72)}
              className="tipo-cota text-papel hover:text-dourado link-traco cursor-pointer"
            >
              Do risco à obra
            </button>
            <button
              type="button"
              onClick={() => scrollToTarget('#quarto-3d', -72)}
              className="tipo-cota text-papel hover:text-dourado link-traco cursor-pointer"
            >
              Projete seu quarto em 3D
            </button>
            <button
              type="button"
              onClick={onNavigateContact}
              className="tipo-cota text-dourado link-traco cursor-pointer"
            >
              Pedir orçamento
            </button>
          </div>
        </div>

        <div className="pt-24 border-t border-papel/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-16 tipo-cota text-papel/60">
          <span>Império Móveis Planejados — Jaú, SP</span>
          <span>Logo vetorial oficial (coroa com M) pendente de envio pelo cliente [CONFIRMAR]</span>
        </div>
      </div>
    </footer>
  );
};
