import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Box, Menu, MessageCircle, X } from 'lucide-react';
import { BriefingOrcamento } from '../components/BriefingOrcamento';
import { EMPRESA } from '../data/empresa';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { LinkV2, LogoImperio, useNavV2 } from './NavegacaoV2';
import { ComItalico } from './Serif';

export const MARGEM = 'px-16 sm:px-32 lg:px-64';

const NAV = [
  { rotulo: 'Obras', para: '/v2/obras' },
  { rotulo: 'Projeto incluso', para: '/v2#v2-projeto-incluso' },
  { rotulo: 'Como trabalhamos', para: '/v2#v2-processo' },
  { rotulo: 'Avaliações', para: '/v2#v2-avaliacoes' },
  { rotulo: 'Nossa história', para: '/v2#v2-historia' },
  { rotulo: 'Onde estamos', para: '/v2#v2-onde-estamos' },
];

/**
 * Cabeçalho: transparente só sobre a abertura escura da home; nas outras páginas e depois de
 * rolar fica sólido (noite). Logo, menu, botão do 3D e botão de orçamento sempre à mão.
 */
export const CabecalhoV2: React.FC<{ transparenteNoTopo: boolean }> = ({ transparenteNoTopo }) => {
  const { abrirOrcamento } = useNavV2();
  const [rolou, setRolou] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const f = () => setRolou(window.scrollY > 40);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [menu]);
  const solido = !transparenteNoTopo || rolou || menu;

  return (
    <header
      className={`v2-escuro fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${solido ? '!bg-[var(--v2-noite)]/95 backdrop-blur-[2px] border-b v2-linha-fina' : '!bg-transparent'}`}
    >
      <div className={`${MARGEM} h-[68px] flex items-center justify-between gap-16`}>
        <LinkV2 para="/v2" className="flex items-center gap-[12px] shrink-0" aria-label="Império Móveis Planejados, página inicial">
          <LogoImperio className="h-[40px]" />
          <span className="flex flex-col leading-none">
            <span className="v2-serif text-[1.45rem]">Império</span>
            <span className="v2-cota text-[0.6875rem] tracking-[0.08em] uppercase">Móveis planejados</span>
          </span>
        </LinkV2>

        <nav aria-label="Principal" className="hidden xl:flex items-center gap-24">
          {NAV.map((n) => (
            <LinkV2 key={n.para} para={n.para} className="v2-cota hover:text-[var(--v2-texto)]">
              {n.rotulo}
            </LinkV2>
          ))}
        </nav>

        <div className="flex items-center gap-8">
          <LinkV2 para="/v2/projetar" className="v2-botao v2-botao-linha h-[40px] px-16 text-[0.875rem] hidden md:inline-flex">
            <Box className="w-[16px] h-[16px]" strokeWidth={1.5} /> Projetar em 3D
          </LinkV2>
          <button type="button" onClick={() => abrirOrcamento()} className="v2-botao v2-botao-claro h-[40px] px-16 text-[0.875rem]">
            Orçamento
          </button>
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-controls="v2-menu"
            aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
            className="xl:hidden w-[40px] h-[40px] flex items-center justify-center rounded-full border border-[var(--v2-linha)] cursor-pointer"
          >
            {menu ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>

      {menu && (
        <nav id="v2-menu" aria-label="Menu" className={`xl:hidden ${MARGEM} pb-32 pt-8 flex flex-col border-t v2-linha-fina`}>
          {[...NAV, { rotulo: 'Projetar em 3D', para: '/v2/projetar' }, { rotulo: 'Pedir orçamento', para: '/v2/orcamento' }].map((n) => (
            <LinkV2 key={n.para} para={n.para} onClick={() => setMenu(false)} className="v2-serif text-[1.75rem] py-[12px] border-b v2-linha-fina">
              {n.rotulo}
            </LinkV2>
          ))}
        </nav>
      )}
    </header>
  );
};

/** Convite curto de orçamento que aparece entre as seções (mesmo tema da seção onde está). */
export const ChamadaOrcamentoV2: React.FC<{ texto: string; ambiente?: string; className?: string }> = ({ texto, ambiente, className = '' }) => {
  const { abrirOrcamento } = useNavV2();
  return (
    <div data-sem-barra className={`flex flex-col md:flex-row md:items-center md:justify-between gap-24 py-32 border-y v2-linha-fina ${className}`}>
      <p className="v2-serif v2-h3 max-w-[24ch]">
        <ComItalico texto={texto} />
      </p>
      <div className="flex flex-wrap gap-[12px]">
        <button type="button" onClick={() => abrirOrcamento(ambiente)} className="v2-botao v2-botao-claro">
          Pedir orçamento <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('v2_chamada')}
          className="v2-botao v2-botao-linha"
        >
          <MessageCircle className="w-[18px] h-[18px]" strokeWidth={1.5} /> WhatsApp
        </a>
      </div>
    </div>
  );
};

/** Barra fixa no celular (e pílula no computador): orçamento e 3D sempre a um toque. */
export const BarraAcoesV2: React.FC<{ visivel: boolean }> = ({ visivel }) => {
  const { abrirOrcamento } = useNavV2();
  return (
    <div
      className={`v2-escuro !bg-transparent fixed z-40 inset-x-0 bottom-0 md:inset-x-auto md:right-24 md:bottom-24 transition-[opacity,transform] duration-500 ${
        visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[120%] pointer-events-none'
      }`}
      aria-hidden={!visivel}
    >
      <div className="flex gap-8 p-[12px] pb-[max(12px,env(safe-area-inset-bottom))] bg-[var(--v2-noite)]/95 md:bg-transparent md:p-0 border-t v2-linha-fina md:border-0">
        <LinkV2 para="/v2/projetar" tabIndex={visivel ? 0 : -1} className="v2-botao v2-botao-linha flex-1 justify-center md:flex-none md:bg-[var(--v2-noite)]">
          <Box className="w-[16px] h-[16px]" strokeWidth={1.5} /> Projetar em 3D
        </LinkV2>
        <button type="button" tabIndex={visivel ? 0 : -1} onClick={() => abrirOrcamento()} className="v2-botao v2-botao-claro flex-1 justify-center md:flex-none md:shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          Pedir orçamento
        </button>
      </div>
    </div>
  );
};

/** Painel lateral com o formulário de orçamento (o mesmo da V1, que manda para o WhatsApp). */
export const PainelOrcamentoV2: React.FC<{ aberto: boolean; ambiente?: string; onFechar: () => void }> = ({ aberto, ambiente, onFechar }) => {
  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', esc);
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = antes;
    };
  }, [aberto, onFechar]);
  if (!aberto) return null;
  return (
    <div
      className="fixed inset-0 z-[70] bg-[var(--v2-noite)]/80 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Pedir orçamento"
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div className="w-full max-w-[560px] h-full overflow-y-auto bg-[var(--v2-marfim)] text-[#1B1915] p-24 sm:p-48 flex flex-col gap-24">
        <div className="flex items-start justify-between gap-16">
          <h2 className="v2-serif text-[2.4rem] leading-none">
            Vamos começar <em className="v2-italico">pelo seu sonho.</em>
          </h2>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="w-[40px] h-[40px] shrink-0 flex items-center justify-center rounded-full border border-[#1B1915]/30 cursor-pointer">
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>
        <BriefingOrcamento modo="inline" ambienteInicial={ambiente} />
      </div>
    </div>
  );
};

const AMBIENTES = [
  { rotulo: 'Cozinhas', para: '/v2/obras#cozinhas' },
  { rotulo: 'Quartos e suítes', para: '/v2/obras#quartos' },
  { rotulo: 'Lojas e comércio', para: '/v2/obras#lojas' },
  { rotulo: 'Todas as obras', para: '/v2/obras' },
];

const SITE = [
  { rotulo: 'Projeto de arquitetura incluso', para: '/v2#v2-projeto-incluso' },
  { rotulo: 'Como trabalhamos', para: '/v2#v2-processo' },
  { rotulo: 'Projetar em 3D', para: '/v2/projetar' },
  { rotulo: 'Avaliações', para: '/v2#v2-avaliacoes' },
  { rotulo: 'Nossa história', para: '/v2#v2-historia' },
  { rotulo: 'Onde estamos', para: '/v2#v2-onde-estamos' },
];

const LEGAL = [
  { rotulo: 'Política de privacidade (LGPD)', para: '/v2/privacidade' },
  { rotulo: 'Termos de uso', para: '/v2/termos' },
  { rotulo: 'Pedir orçamento', para: '/v2/orcamento' },
];

const LINK = 'inline-block py-4 v2-cota text-[0.9375rem] hover:text-[var(--v2-texto)] transition-colors';

/** Rodapé completo: chamada final, logo, ambientes, páginas, legal e todos os contatos. */
export const RodapeV2: React.FC = () => {
  const { abrirOrcamento } = useNavV2();
  const coluna = (titulo: string, itens: { rotulo: string; para: string }[]) => (
    <nav aria-label={titulo} className="flex flex-col gap-16">
      <h2 className="v2-cota uppercase tracking-[0.08em] text-[0.6875rem] text-[var(--v2-acento)]">{titulo}</h2>
      <ul className="flex flex-col gap-4">
        {itens.map((i) => (
          <li key={i.para}>
            <LinkV2 para={i.para} className={LINK}>
              {i.rotulo}
            </LinkV2>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <footer data-sem-barra className="v2-escuro">
      <div className={`${MARGEM} py-[12vh] border-t v2-linha-fina grid grid-cols-1 lg:grid-cols-12 gap-32 items-end`}>
        <p className="lg:col-span-7 v2-serif v2-display">
          <ComItalico texto="Do primeiro traço *à montagem na sua casa.*" />
        </p>
        <div className="lg:col-span-5 flex flex-col gap-24 lg:items-end">
          <p className="v2-corpo max-w-[36ch] lg:text-right">
            Marcenaria e arquitetura de interiores em Jaú e região, desde {EMPRESA.anoInicio}. O projeto de arquitetura vem junto com os móveis.
          </p>
          <div className="flex flex-wrap gap-[12px]">
            <button type="button" onClick={() => abrirOrcamento()} className="v2-botao v2-botao-claro">
              Pedir orçamento <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
            <LinkV2 para="/v2/projetar" className="v2-botao v2-botao-linha">
              <Box className="w-[16px] h-[16px]" strokeWidth={1.5} /> Projetar em 3D
            </LinkV2>
          </div>
        </div>
      </div>

      <div className={`${MARGEM} py-64 border-t v2-linha-fina grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr] gap-x-24 gap-y-48`}>
        <div className="col-span-2 lg:col-span-1 flex flex-col items-start gap-24">
          <LinkV2 para="/v2" className="flex flex-col items-start gap-16" aria-label="Império Móveis Planejados, página inicial">
            <LogoImperio className="h-[96px]" />
          </LinkV2>
          <p className="v2-cota max-w-[32ch]">Arquitetura de interiores e marcenaria própria, do primeiro traço à montagem.</p>
        </div>
        {coluna('Ambientes', AMBIENTES)}
        {coluna('No site', SITE)}
        {coluna('Legal e contato', LEGAL)}
        <div className="col-span-2 lg:col-span-1 flex flex-col gap-16">
          <h2 className="v2-cota uppercase tracking-[0.08em] text-[0.6875rem] text-[var(--v2-acento)]">Fale com a gente</h2>
          <address className="not-italic flex flex-col gap-16 v2-cota text-[0.9375rem]">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('v2_rodape')}
              className="v2-serif text-[1.75rem] leading-none text-[var(--v2-texto)] hover:text-[var(--v2-acento)]"
            >
              {EMPRESA.telefone}
            </a>
            <a href={EMPRESA.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--v2-texto)] self-start">
              {EMPRESA.instagram}
            </a>
            <span className="flex flex-col gap-4">
              <span>{EMPRESA.endereco.logradouro}</span>
              <span>
                {EMPRESA.endereco.bairro}, {EMPRESA.endereco.cidade}/{EMPRESA.endereco.uf}
              </span>
              <a href={EMPRESA.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--v2-texto)] self-start">
                Ver no mapa
              </a>
            </span>
            <span className="flex flex-col gap-4">
              <span>{EMPRESA.horarios.semana}</span>
              <span>{EMPRESA.horarios.observacao}</span>
            </span>
            <span className="flex flex-col gap-4">
              <span>{EMPRESA.sobre.servicos.join(', ')}</span>
              <span>Cartão de crédito, débito e aproximação</span>
              <span>Acessível para cadeira de rodas</span>
            </span>
          </address>
        </div>
      </div>

      <div className={`${MARGEM} py-24 border-t v2-linha-fina flex flex-col sm:flex-row sm:items-center justify-between gap-8 v2-cota`}>
        <p>
          © {new Date().getFullYear()} {EMPRESA.nome}
        </p>
        <p>Versão 2 em prévia</p>
      </div>
    </footer>
  );
};
