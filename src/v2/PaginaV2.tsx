import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './fontesV2.css';
import './v2.css';
import { globalLenis, scrollToTarget } from '../hooks/useScrollytelling';
import { FiltroLapis } from '../components/LinhaLapis';
import { HeroV2 } from './HeroV2';
import { AvaliacoesV2, FechamentoV2, HistoriaV2, ManifestoV2, OndeEstamosV2, NumerosV2, ObrasV2, PerguntasV2, ProcessoV2, Projeto3DV2, ProjetoInclusoV2 } from './SecoesV2';
import { CabecalhoV2, PainelOrcamentoV2, RodapeV2 } from './CromoV2';
import { ConversaFlutuanteV2 } from './ConversaFlutuanteV2';
import { AmbienteV2, FotoPaginaV2, LegalV2, NaoEncontradaV2, ObrasPaginaV2, OrcamentoV2, ProjetarV2, Projetos3DPaginaV2 } from './PaginasInternasV2';
import { ContextoNavV2, NavegacaoV2 } from './NavegacaoV2';
import { RotaV2, lerRotaV2, metaV2 } from './rotasV2';

const chaveDaRota = (r: RotaV2) =>
  r.pagina === 'foto' ? `foto:${r.obra.id}` : r.pagina === 'legal' ? `legal:${r.documento}` : r.pagina === 'ambiente' ? `amb:${r.rota}` : r.pagina;

/** Site da Império (V2, em produção na raiz do domínio; a versão anterior fica em /v1). */
const PaginaV2: React.FC = () => {
  const [rota, setRota] = useState<RotaV2>(() => lerRotaV2(window.location.pathname, window.location.hash));
  const [painel, setPainel] = useState<{ aberto: boolean; ambiente?: string }>({ aberto: false });
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
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', meta.canonico);
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
          <PerguntasV2 />
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
    case 'ambiente':
      conteudo = <AmbienteV2 rota={rota.rota} />;
      break;
    case 'projetar':
      conteudo = <ProjetarV2 />;
      break;
    case 'projetos3d':
      conteudo = <Projetos3DPaginaV2 />;
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
        {/* Atalho de conversa (WhatsApp, orçamento, 3D) em todas as páginas, menos no editor 3D. */}
        <ConversaFlutuanteV2 visivel={rota.pagina !== 'projetar' && !painel.aberto} />
        <PainelOrcamentoV2 aberto={painel.aberto} ambiente={painel.ambiente} onFechar={fecharPainel} />
      </div>
    </ContextoNavV2.Provider>
  );
};

export default PaginaV2;
