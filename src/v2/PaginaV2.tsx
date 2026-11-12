import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import './v2.css';
import { scrollToTarget } from '../hooks/useScrollytelling';
import { BriefingOrcamento } from '../components/BriefingOrcamento';
import { FiltroLapis } from '../components/LinhaLapis';
import { HeroV2 } from './HeroV2';
import { AvaliacoesV2, FechamentoV2, HistoriaV2, ManifestoV2, NumerosV2, ObrasV2, ProcessoV2, Projeto3DV2, RodapeV2 } from './SecoesV2';

const FONTES = 'https://fonts.googleapis.com/css2?family=Geist:wght@300..600&family=Instrument+Serif:ital@0;1&display=swap';

/** Fontes da V2 só nesta página (a V1 não paga por elas). */
function useFontesV2() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTES}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONTES;
    document.head.appendChild(link);
  }, []);
}

/** Prévia fora do Google: a V2 não pode competir com a home oficial. */
function useSemIndexacao() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    const anterior = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (meta && anterior !== null) meta.setAttribute('content', anterior);
    };
  }, []);
}

interface PaginaV2Props {
  onRota: (rota: string) => void;
}

const CabecalhoV2: React.FC<{ onOrcamento: () => void; onRota: (r: string) => void }> = ({ onOrcamento, onRota }) => {
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const f = () => setRolou(window.scrollY > 40);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  const ir = (id: string) => scrollToTarget(id, 0);
  return (
    <header className={`v2-escuro !bg-transparent fixed top-0 inset-x-0 z-50 px-16 sm:px-32 lg:px-64 h-[64px] flex items-center justify-between transition-colors duration-500 ${rolou ? '!bg-[var(--v2-noite)]/90 backdrop-blur-[2px]' : ''}`}>
      <button type="button" onClick={() => window.scrollTo({ top: 0 })} className="flex items-baseline gap-8 cursor-pointer" aria-label="Império Móveis Planejados, voltar ao início">
        <span className="v2-serif text-[1.6rem] leading-none">Império</span>
        <span className="v2-cota hidden sm:inline">móveis planejados</span>
      </button>
      <nav aria-label="Principal" className="hidden lg:flex items-center gap-32">
        <button type="button" onClick={() => ir('#v2-obras')} className="v2-cota hover:text-[var(--v2-texto)] cursor-pointer">Obras</button>
        <button type="button" onClick={() => ir('#v2-processo')} className="v2-cota hover:text-[var(--v2-texto)] cursor-pointer">Como trabalhamos</button>
        <button type="button" onClick={() => onRota('/projetar')} className="v2-cota hover:text-[var(--v2-texto)] cursor-pointer">Projetar em 3D</button>
        <button type="button" onClick={() => ir('#v2-historia')} className="v2-cota hover:text-[var(--v2-texto)] cursor-pointer">Nossa história</button>
      </nav>
      <button type="button" onClick={onOrcamento} className="v2-botao v2-botao-linha h-[40px] px-16 text-[0.875rem]">
        Orçamento
      </button>
    </header>
  );
};

/** Versão 2 do site (prévia). Mesma proposta de rolagem imersiva, outro desenho. */
const PaginaV2: React.FC<PaginaV2Props> = ({ onRota }) => {
  useFontesV2();
  useSemIndexacao();
  const [painel, setPainel] = useState(false);
  const abrirOrcamento = () => setPainel(true);

  return (
    <div className="v2 min-h-screen">
      <div className="v2-grao" aria-hidden="true" />
      <FiltroLapis />
      <CabecalhoV2 onOrcamento={abrirOrcamento} onRota={onRota} />
      <main>
        <HeroV2 onOrcamento={abrirOrcamento} />
        <ManifestoV2 />
        <ObrasV2 />
        <NumerosV2 />
        <ProcessoV2 />
        <Projeto3DV2 onAbrir={() => onRota('/projetar')} />
        <AvaliacoesV2 />
        <HistoriaV2 />
        <FechamentoV2 />
      </main>
      <RodapeV2 onRota={onRota} />

      {painel && (
        <div
          className="fixed inset-0 z-[70] bg-[var(--v2-noite)]/80 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Pedir orçamento"
          onClick={(e) => e.target === e.currentTarget && setPainel(false)}
        >
          <div className="w-full max-w-[560px] h-full overflow-y-auto bg-[var(--v2-marfim)] text-[#1B1915] p-24 sm:p-48 flex flex-col gap-24">
            <div className="flex items-start justify-between gap-16">
              <h2 className="v2-serif text-[2.4rem] leading-none">
                Vamos começar <em className="v2-italico">pelo seu sonho.</em>
              </h2>
              <button type="button" onClick={() => setPainel(false)} aria-label="Fechar" className="w-[40px] h-[40px] shrink-0 flex items-center justify-center rounded-full border border-[#1B1915]/30 cursor-pointer">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
            <BriefingOrcamento modo="inline" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaV2;
