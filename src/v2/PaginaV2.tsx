import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './v2.css';
import { globalLenis, scrollToTarget } from '../hooks/useScrollytelling';
import { FiltroLapis } from '../components/LinhaLapis';
import { EMPRESA } from '../data/empresa';
import { HeroV2 } from './HeroV2';
import { AvaliacoesV2, FechamentoV2, HistoriaV2, ManifestoV2, OndeEstamosV2, NumerosV2, ObrasV2, ProcessoV2, Projeto3DV2, ProjetoInclusoV2 } from './SecoesV2';
import { BarraAcoesV2, CabecalhoV2, PainelOrcamentoV2, RodapeV2 } from './CromoV2';
import { FotoPaginaV2, LegalV2, NaoEncontradaV2, ObrasPaginaV2, OrcamentoV2, ProjetarV2 } from './PaginasInternasV2';
import { ContextoNavV2, NavegacaoV2 } from './NavegacaoV2';
import { RotaV2, lerRotaV2, metaV2 } from './rotasV2';

const FONTES = 'https://fonts.googleapis.com/css2?family=Geist:wght@300..600&family=Instrument+Serif:ital@0;1&display=swap';

/** Fontes da V2 só nestas páginas (a V1 não paga por elas). */
function useFontesV2() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTES}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONTES;
    document.head.appendChild(link);
  }, []);
}

/** Prévia fora do Google: a V2 não pode competir com o site oficial. */
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

const chaveDaRota = (r: RotaV2) => (r.pagina === 'foto' ? `foto:${r.obra.id}` : r.pagina === 'legal' ? `legal:${r.documento}` : r.pagina);

/** Versão 2 do site (prévia em /v2 e páginas internas em /v2/...). */
const PaginaV2: React.FC = () => {
  useFontesV2();
  useSemIndexacao();
  const [rota, setRota] = useState<RotaV2>(() => lerRotaV2(window.location.pathname, window.location.hash));
  const [painel, setPainel] = useState<{ aberto: boolean; ambiente?: string }>({ aberto: false });
  const [barra, setBarra] = useState(false);
  const fecharPainel = useCallback(() => setPainel({ aberto: false }), []);

  const ir = useCallback((destino: string) => {
    const [caminho, ancora] = destino.split('#');
    const hash = ancora ? `#${ancora}` : '';
    const atual = window.location.pathname.replace(/\/+$/, '');
    if (caminho.replace(/\/+$/, '') === atual) {
      window.history.replaceState({}, '', `${caminho}${hash}`);
      if (hash) scrollToTarget(hash, -72);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState({}, '', `${caminho}${hash}`);
    setRota(lerRotaV2(caminho, hash));
  }, []);

  const nav: NavegacaoV2 = useMemo(
    () => ({ ir, abrirOrcamento: (ambiente?: string) => setPainel({ aberto: true, ambiente }) }),
    [ir]
  );

  useEffect(() => {
    const voltar = () => setRota(lerRotaV2(window.location.pathname, window.location.hash));
    window.addEventListener('popstate', voltar);
    return () => window.removeEventListener('popstate', voltar);
  }, []);

  // Cada página nova começa no topo (ou na âncora pedida) e com título e descrição próprios.
  const chave = chaveDaRota(rota);
  const ancora = 'ancora' in rota ? rota.ancora : undefined;
  useEffect(() => {
    const meta = metaV2(rota);
    document.title = meta.titulo;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.descricao);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${EMPRESA.url}${window.location.pathname}`);
    if (ancora) {
      const t = window.setTimeout(() => {
        // O Lenis guarda a altura da página anterior; sem recalcular, a rolagem para no meio.
        globalLenis?.resize();
        ScrollTrigger.refresh();
        scrollToTarget(ancora, -72);
      }, 160);
      return () => window.clearTimeout(t);
    }
    globalLenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    const t = window.setTimeout(() => {
      globalLenis?.resize();
      ScrollTrigger.refresh();
    }, 160);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, ancora]);

  // Barra de orçamento e 3D: na home, só depois da abertura; no editor 3D, escondida.
  useEffect(() => {
    if (rota.pagina === 'projetar') {
      setBarra(false);
      return;
    }
    const medir = () => {
      const hero = rota.pagina === 'inicio' ? document.getElementById('hero') : null;
      const depoisDoHero = !hero || hero.getBoundingClientRect().bottom < window.innerHeight * 0.5;
      // Some quando já há botões de orçamento na parte de baixo da tela (chamadas, fechamento, rodapé).
      const faixa = window.innerHeight - 160;
      const temBotaoPerto = Array.from(document.querySelectorAll('[data-sem-barra]')).some((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > faixa && r.top < window.innerHeight;
      });
      setBarra(depoisDoHero && !temBotaoPerto);
    };
    medir();
    window.addEventListener('scroll', medir, { passive: true });
    window.addEventListener('resize', medir);
    return () => {
      window.removeEventListener('scroll', medir);
      window.removeEventListener('resize', medir);
    };
  }, [rota.pagina]);

  let conteudo: React.ReactNode;
  switch (rota.pagina) {
    case 'inicio':
      conteudo = (
        <>
          <HeroV2 />
          <ManifestoV2 />
          <ObrasV2 />
          <ProjetoInclusoV2 />
          <NumerosV2 />
          <ProcessoV2 />
          <Projeto3DV2 />
          <AvaliacoesV2 />
          <HistoriaV2 />
          <OndeEstamosV2 />
          <FechamentoV2 />
        </>
      );
      break;
    case 'obras':
      conteudo = <ObrasPaginaV2 />;
      break;
    case 'foto':
      conteudo = <FotoPaginaV2 obra={rota.obra} />;
      break;
    case 'projetar':
      conteudo = <ProjetarV2 />;
      break;
    case 'orcamento':
      conteudo = (
        <>
          <OrcamentoV2 />
          <OndeEstamosV2 />
        </>
      );
      break;
    case 'legal':
      conteudo = <LegalV2 documento={rota.documento} />;
      break;
    default:
      conteudo = <NaoEncontradaV2 />;
  }

  return (
    <ContextoNavV2.Provider value={nav}>
      <div className="v2 min-h-screen">
        <div className="v2-grao" aria-hidden="true" />
        <FiltroLapis />
        <CabecalhoV2 transparenteNoTopo={rota.pagina === 'inicio'} />
        <main key={chave}>{conteudo}</main>
        <RodapeV2 />
        <BarraAcoesV2 visivel={barra && !painel.aberto} />
        <PainelOrcamentoV2 aberto={painel.aberto} ambiente={painel.ambiente} onFechar={fecharPainel} />
      </div>
    </ContextoNavV2.Provider>
  );
};

export default PaginaV2;
