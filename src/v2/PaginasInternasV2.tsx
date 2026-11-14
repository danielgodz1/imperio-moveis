import React, { Suspense, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Box, MessageCircle } from 'lucide-react';
import { Foto } from '../components/Foto';
import { AnotacoesObra } from '../components/AnotacoesObra';
import { BriefingOrcamento } from '../components/BriefingOrcamento';
import { OBRAS_REAIS } from '../data/portfolioData';
import { DOCUMENTOS_LEGAIS, dataPorExtenso } from '../data/legal';
import { EMPRESA } from '../data/empresa';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import type { ObraItem } from '../types';
import { ChamadaOrcamentoV2, MARGEM } from './CromoV2';
import { LinkV2, useNavV2 } from './NavegacaoV2';
import { CartaoObraV2, Titulo } from './SecoesV2';
import { ComItalico } from './Serif';
import { CAMINHO_PROJETOS_3D, NOME_AMBIENTE, ROTAS_AMBIENTE, ROTULO_AMBIENTE, RotaAmbiente, ambienteDoBriefing, caminhoFoto } from './rotasV2';
import { PAGINAS_AMBIENTES_LOCAIS } from '../data/paginasLocais';
import { PASSOS_3D_V2, PROJETOS_3D_V2 } from './textosV2';
import { PROJETOS_3D, TEMAS_PROJETO_3D, linkProjeto3D, type TemaProjeto3D } from '../data/projetos3d';
import { TAMANHO_FOTO_DEITADA, TAMANHO_FOTO_EM_PE } from './prerenderV2';
import { useAtivarNaInteracao } from '../hooks/useAtivarNaInteracao';
import { temProjetoSalvo } from '../components/quarto3d/projetosSalvos';

const Quarto3DExperiencia = React.lazy(() => import('../components/quarto3d/Quarto3DExperiencia'));

const Trilha: React.FC<{ itens: { rotulo: string; para?: string }[] }> = ({ itens }) => (
  <nav aria-label="Você está em" className="v2-cota">
    <ol className="flex flex-wrap items-center gap-8">
      {itens.map((i, n) => (
        <li key={i.rotulo} className="flex items-center gap-8">
          {i.para ? (
            <LinkV2 para={i.para} className="hover:text-[var(--v2-texto)] underline underline-offset-4">
              {i.rotulo}
            </LinkV2>
          ) : (
            <span aria-current="page" className="text-[var(--v2-texto)]">
              {i.rotulo}
            </span>
          )}
          {n < itens.length - 1 && <span aria-hidden="true">/</span>}
        </li>
      ))}
    </ol>
  </nav>
);


const GRUPOS: ObraItem['ambiente'][] = ['cozinhas', 'quartos', 'lojas'];

/** /obras: todas as obras, separadas por ambiente, cada uma levando à própria página. */
export const ObrasPaginaV2: React.FC = () => (
  <>
    <section className={`v2-claro ${MARGEM} pt-[160px] pb-64 flex flex-col gap-32`}>
      <Trilha itens={[{ rotulo: 'Início', para: '/' }, { rotulo: 'Obras' }]} />
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24">
        <Titulo as="h1" olho="Móveis planejados em Jaú e região" texto="Todas as obras, *uma por uma.*" className="max-w-[14ch]" />
        <p className="v2-corpo max-w-[44ch]">
          {OBRAS_REAIS.length} fotos reais de cozinhas, quartos e lojas que a Império projetou e fabricou em Jaú e região. Toque numa foto para ver os acabamentos de cada peça.
        </p>
      </div>
      <nav aria-label="Ambientes" className="flex flex-wrap gap-8">
        {GRUPOS.map((g) => (
          <LinkV2 key={g} para={`/obras#${g}`} className="v2-botao v2-botao-linha h-[40px] px-16 text-[0.875rem]">
            {ROTULO_AMBIENTE[g]} ({OBRAS_REAIS.filter((o) => o.ambiente === g).length})
          </LinkV2>
        ))}
      </nav>
    </section>
    {GRUPOS.map((g, i) => (
      <section key={g} id={g} className={`${i % 2 ? 'v2-areia' : 'v2-claro'} ${MARGEM} py-96 scroll-mt-[80px]`}>
        <h2 className="v2-serif v2-titulo mb-48">{ROTULO_AMBIENTE[g]}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-32 gap-y-64 items-start">
          {OBRAS_REAIS.filter((o) => o.ambiente === g).map((o) => (
            <CartaoObraV2 key={o.id} obra={o} />
          ))}
        </div>
      </section>
    ))}
    <section className={`v2-claro ${MARGEM} py-96`}>
      <ChamadaOrcamentoV2 texto="Viu algo parecido *com o que você quer?*" />
    </section>
  </>
);

/** /obras/:id: uma página para cada foto, com acabamentos, obras vizinhas e convite. */
export const FotoPaginaV2: React.FC<{ obra: ObraItem }> = ({ obra }) => {
  const { abrirOrcamento } = useNavV2();
  const indice = OBRAS_REAIS.indexOf(obra);
  const anterior = OBRAS_REAIS[(indice - 1 + OBRAS_REAIS.length) % OBRAS_REAIS.length];
  const proxima = OBRAS_REAIS[(indice + 1) % OBRAS_REAIS.length];
  const parecidas = OBRAS_REAIS.filter((o) => o.ambiente === obra.ambiente && o !== obra).slice(0, 3);
  const deitada = (() => {
    const [w, h] = obra.proporcao.split('/').map((n) => parseFloat(n));
    return w > h;
  })();

  return (
    <>
      <article className={`v2-claro ${MARGEM} pt-[136px] pb-96`}>
        <div className="flex flex-col gap-24 mb-48">
          <Trilha itens={[{ rotulo: 'Início', para: '/' }, { rotulo: 'Obras', para: '/obras' }, { rotulo: ROTULO_AMBIENTE[obra.ambiente], para: `/obras#${obra.ambiente}` }, { rotulo: obra.titulo }]} />
        </div>
        <div className={`grid grid-cols-1 ${deitada ? '' : 'lg:grid-cols-12'} gap-48 items-start`}>
          <figure className={`relative ${deitada ? '' : 'lg:col-span-7'}`} style={{ aspectRatio: obra.proporcao }}>
            <Foto srcBase={obra.arquivo} alt={obra.alt} proporcao={obra.proporcao} prioridade sizes={deitada ? TAMANHO_FOTO_DEITADA : TAMANHO_FOTO_EM_PE} className="w-full h-full" imgStyle={{ objectFit: 'cover' }} />
            <AnotacoesObra anotacoes={obra.anotacoes} />
          </figure>
          <div className={`flex flex-col gap-24 ${deitada ? 'lg:grid lg:grid-cols-12 lg:gap-48' : 'lg:col-span-5 lg:sticky lg:top-[100px]'}`}>
            <div className={`flex flex-col gap-16 ${deitada ? 'lg:col-span-6' : ''}`}>
              <p className="v2-cota uppercase tracking-[0.08em] v2-acento">{ROTULO_AMBIENTE[obra.ambiente]}</p>
              <h1 className="v2-serif v2-h3 text-[clamp(2rem,3.4vw,3.25rem)]">{obra.titulo}</h1>
              <p className="v2-corpo">{obra.alt}.</p>
              <p className="v2-cota">{obra.cota}</p>
            </div>
            <div className={`flex flex-col gap-24 ${deitada ? 'lg:col-span-6' : ''}`}>
              {obra.anotacoes.length > 0 && (
                <div className="flex flex-col gap-8">
                  <h2 className="v2-cota uppercase tracking-[0.08em]">Acabamentos desta obra</h2>
                  <ul className="flex flex-col">
                    {obra.anotacoes.map((a) => (
                      <li key={a.texto} className="py-[12px] border-t v2-linha-fina v2-serif text-[1.35rem] leading-tight first-letter:uppercase">
                        {a.texto}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-[12px]">
                <button type="button" onClick={() => abrirOrcamento(ambienteDoBriefing(obra))} className="v2-botao v2-botao-claro">
                  Quero um parecido <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </button>
                <LinkV2 para="/projetar" className="v2-botao v2-botao-linha">
                  <Box className="w-[16px] h-[16px]" strokeWidth={1.5} /> Montar em 3D
                </LinkV2>
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="Outras obras" className="mt-96 grid grid-cols-2 border-t v2-linha-fina">
          <LinkV2 para={caminhoFoto(anterior)} className="py-24 pr-16 flex flex-col gap-8 group">
            <span className="v2-cota flex items-center gap-8">
              <ArrowLeft className="w-[16px] h-[16px]" strokeWidth={1.5} /> Obra anterior
            </span>
            <span className="v2-serif text-[1.25rem] leading-tight group-hover:underline underline-offset-4">{anterior.titulo}</span>
          </LinkV2>
          <LinkV2 para={caminhoFoto(proxima)} className="py-24 pl-16 flex flex-col items-end text-right gap-8 border-l v2-linha-fina group">
            <span className="v2-cota flex items-center gap-8">
              Próxima obra <ArrowRight className="w-[16px] h-[16px]" strokeWidth={1.5} />
            </span>
            <span className="v2-serif text-[1.25rem] leading-tight group-hover:underline underline-offset-4">{proxima.titulo}</span>
          </LinkV2>
        </nav>
      </article>

      {parecidas.length > 0 && (
        <section className={`v2-areia ${MARGEM} py-96 flex flex-col gap-48`}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-16">
            <h2 className="v2-serif v2-titulo">
              <ComItalico texto={`Mais ${ROTULO_AMBIENTE[obra.ambiente].toLowerCase()} *da Império.*`} />
            </h2>
            <LinkV2 para="/obras" className="v2-botao v2-botao-linha self-start">
              Ver todas as obras
            </LinkV2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-32 gap-y-64 items-start">
            {parecidas.map((o) => (
              <CartaoObraV2 key={o.id} obra={o} />
            ))}
          </div>
        </section>
      )}

    </>
  );
};

function temWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

const Carregando = () => (
  <div className="w-full h-[70svh] min-h-[420px] border v2-linha-fina flex flex-col items-center justify-center gap-16 p-32">
    <span className="w-32 h-32 rounded-full border-2 border-[var(--v2-linha)] border-t-[var(--v2-acento)] animate-spin" aria-hidden="true" />
    <span className="v2-cota v2-acento">Preparando o ambiente 3D...</span>
  </div>
);

/** /projetar: o mesmo editor 3D da V1, dentro da moldura da V2. */
export const ProjetarV2: React.FC = () => {
  const { abrirOrcamento } = useNavV2();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [interagiu, abrirEditor] = useAtivarNaInteracao(typeof window !== 'undefined' && (window.location.hash.startsWith('#projeto=') || temProjetoSalvo()));
  // WebGL testado só quando o editor vai abrir (o teste custa segundos sem aceleração).
  useEffect(() => {
    if (interagiu) setWebgl(temWebGL());
  }, [interagiu]);
  return (
    <section className={`v2-escuro ${MARGEM} pt-[136px] pb-96 flex flex-col gap-48`}>
      <Trilha itens={[{ rotulo: 'Início', para: '/' }, { rotulo: 'Projetar em 3D' }]} />
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24">
        <Titulo as="h1" olho="Móveis planejados em 3D, grátis" texto="Projete o seu *em 3D.*" />
        <p className="v2-corpo max-w-[44ch]">De graça e sem instalar nada. Visualização aproximada: o projeto final é detalhado pela arquiteta depois da medição no local.</p>
      </div>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-x-32">
        {PASSOS_3D_V2.map((p, i) => (
          <li key={p.titulo} className="py-24 border-t v2-linha-fina flex gap-16">
            <span className="v2-serif v2-italico v2-acento text-[1.75rem] leading-none">{String(i + 1).padStart(2, '0')}</span>
            <span className="flex flex-col gap-4">
              <span className="v2-serif text-[1.35rem] leading-tight">{p.titulo}</span>
              <span className="v2-cota">{p.texto}</span>
            </span>
          </li>
        ))}
      </ol>

      {!interagiu ? (
        <div className="relative w-full h-[70svh] min-h-[420px] border v2-linha-fina overflow-hidden">
          <Foto srcBase="/projetar/cozinha-render" alt="Exemplo de projeto 3D de cozinha planejada feito no editor" proporcao="16 / 9" prioridade sizes="100vw" className="w-full h-full" imgStyle={{ objectFit: 'cover' }} />
          <div className="absolute inset-0 bg-[var(--v2-noite)]/40 flex items-center justify-center p-24">
            <button type="button" onClick={abrirEditor} className="v2-botao v2-botao-claro">
              Abrir o editor 3D
            </button>
          </div>
        </div>
      ) : webgl === null ? (
        <Carregando />
      ) : webgl ? (
        <Suspense fallback={<Carregando />}>
          <Quarto3DExperiencia onOpenBriefingOutro={() => abrirOrcamento('Outro')} />
        </Suspense>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 items-center border v2-linha-fina p-24 sm:p-32">
          <div className="lg:col-span-5 flex flex-col items-start gap-16">
            <h2 className="v2-serif v2-h3">O 3D está desligado neste navegador</h2>
            <p className="v2-corpo">Tente pelo Chrome ou Safari atualizados, ou mande as medidas que a nossa arquiteta monta o projeto para você.</p>
            <button type="button" onClick={() => abrirOrcamento()} className="v2-botao v2-botao-claro">
              Pedir orçamento
            </button>
          </div>
          <div className="lg:col-span-7">
            <Foto srcBase="/projetar/cozinha-render" alt="Exemplo de projeto 3D de cozinha planejada" proporcao="16 / 9" sizes="(min-width: 1024px) 58vw, 100vw" className="w-full" />
          </div>
        </div>
      )}

      <ChamadaOrcamentoV2 texto="Prefere que *a arquiteta desenhe* para você?" />
    </section>
  );
};

/** Opção do formulário de orçamento para cada tema de projeto 3D. */
const BRIEFING_DO_TEMA: Record<TemaProjeto3D, string> = {
  cozinhas: 'Cozinha',
  quartos: 'Quarto',
  closets: 'Closet',
  'home-office': 'Home office',
  banheiros: 'Outro',
};

/** /projetos-3d: projetos 3D (renders) separados por tema; cada um abre no editor ou vira orçamento. */
export const Projetos3DPaginaV2: React.FC = () => {
  const { abrirOrcamento } = useNavV2();
  const temas = TEMAS_PROJETO_3D.filter((t) => PROJETOS_3D.some((p) => p.tema === t.id));
  return (
    <>
      <section className={`v2-escuro ${MARGEM} pt-[136px] pb-64 flex flex-col gap-32`}>
        <Trilha itens={[{ rotulo: 'Início', para: '/' }, { rotulo: 'Projetos 3D' }]} />
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24">
          <Titulo as="h1" olho={PROJETOS_3D_V2.olho} texto={PROJETOS_3D_V2.titulo} className="max-w-[14ch]" />
          <div className="flex flex-col gap-16 max-w-[44ch]">
            <p className="v2-corpo">{PROJETOS_3D_V2.apoio}</p>
            <p className="v2-cota">{PROJETOS_3D_V2.aviso}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-16">
          <nav aria-label="Temas" className="flex flex-wrap gap-8">
            {temas.map((t) => (
              <LinkV2 key={t.id} para={`${CAMINHO_PROJETOS_3D}#${t.id}`} className="v2-botao v2-botao-linha h-[40px] px-16 text-[0.875rem]">
                {t.rotulo} ({PROJETOS_3D.filter((p) => p.tema === t.id).length})
              </LinkV2>
            ))}
          </nav>
          <LinkV2 para="/projetar" className="v2-botao v2-botao-claro self-start">
            <Box className="w-[16px] h-[16px]" strokeWidth={1.5} /> Criar o meu do zero
          </LinkV2>
        </div>
      </section>
      {temas.map((t) => (
        <section key={t.id} id={t.id} className={`v2-escuro ${MARGEM} py-96 border-t v2-linha-fina scroll-mt-[80px]`}>
          <h2 className="v2-serif v2-titulo mb-48">{t.rotulo}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-32 gap-y-64 items-start">
            {PROJETOS_3D.filter((p) => p.tema === t.id).map((p) => (
              <article key={p.id} className="flex flex-col gap-16">
                <LinkV2 para={linkProjeto3D(p)} className="group block overflow-hidden" aria-label={`Abrir no editor 3D: ${p.nome}`}>
                  <Foto
                    srcBase={p.arquivo}
                    alt={`Projeto 3D: ${p.nome}. ${p.descricao}`}
                    proporcao={p.proporcao}
                    sizes="(max-width: 639px) 60vw, (min-width: 1024px) 30vw, 50vw"
                    className="w-full transition-transform duration-[1.2s] group-hover:scale-[1.03]"
                  />
                </LinkV2>
                <div className="flex flex-col gap-4">
                  <h3 className="v2-serif text-[1.5rem] leading-tight">{p.nome}</h3>
                  <p className="v2-cota">{p.descricao}</p>
                </div>
                <div className="flex flex-wrap gap-8">
                  <LinkV2 para={linkProjeto3D(p)} className="v2-botao v2-botao-linha h-[40px] px-16 text-[0.875rem]">
                    <Box className="w-[16px] h-[16px]" strokeWidth={1.5} /> Abrir no 3D
                  </LinkV2>
                  <button type="button" onClick={() => abrirOrcamento(BRIEFING_DO_TEMA[p.tema])} className="v2-botao v2-botao-claro h-[40px] px-16 text-[0.875rem]">
                    Quero orçar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
      <section className={`v2-escuro ${MARGEM} py-96 border-t v2-linha-fina`}>
        <ChamadaOrcamentoV2 texto="Quer um projeto *só seu?*" />
      </section>
    </>
  );
};

/** /contato: o formulário em página própria, com todos os contatos ao lado. */
export const OrcamentoV2: React.FC = () => (
  <section className={`v2-claro ${MARGEM} pt-[136px] pb-96 grid grid-cols-1 lg:grid-cols-12 gap-48`}>
    <div className="lg:col-span-5 flex flex-col gap-32">
      <Trilha itens={[{ rotulo: 'Início', para: '/' }, { rotulo: 'Pedir orçamento' }]} />
      <Titulo as="h1" olho="Orçamento de móveis planejados em Jaú" texto="Vamos começar *pelo seu sonho.*" />
      <p className="v2-corpo max-w-[40ch]">Conte o ambiente, quando quer começar e o estilo. A gente responde pelo WhatsApp. O projeto de arquitetura vem junto com os móveis.</p>
      <div className="flex flex-col gap-16 v2-cota text-[0.9375rem]">
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('v2_orcamento')}
          className="v2-botao v2-botao-linha self-start"
        >
          <MessageCircle className="w-[18px] h-[18px]" strokeWidth={1.5} /> WhatsApp {EMPRESA.telefone}
        </a>
        <span>
          Fábrica e Sede: {EMPRESA.endereco.logradouro} - {EMPRESA.endereco.bairro}, {EMPRESA.endereco.cidade}/{EMPRESA.endereco.uf}, CEP {EMPRESA.endereco.cep}.{' '}
          <a href={EMPRESA.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--v2-texto)]">
            Ver no mapa
          </a>
        </span>
        <span>
          Razão Social: {EMPRESA.razaoSocial} · CNPJ: {EMPRESA.cnpj}
        </span>
        <span>
          {EMPRESA.horarios.semana}. {EMPRESA.horarios.observacao}.
        </span>
        <span>
          Canal oficial para agendamento de visita técnica, orçamentos de marcenaria sob medida e solicitações de licença ou autorização de uso de fotografias do portfólio (<LinkV2 para="/termos" className="underline underline-offset-4 hover:text-[var(--v2-texto)]">ver Termos de Uso e Direitos Autorais</LinkV2>).
        </span>
        <LinkV2 para="/projetar" className="underline underline-offset-4 hover:text-[var(--v2-texto)] self-start">
          Quer montar antes em 3D? Abra o projeto online.
        </LinkV2>
      </div>
    </div>
    <div className="lg:col-span-7 bg-[var(--v2-marfim)] text-[#1B1915] p-24 sm:p-48 border v2-linha-fina">
      <BriefingOrcamento modo="inline" />
    </div>
  </section>
);

/** /privacidade e /termos com a tipografia da V2 (texto vindo de data/legal.ts). */
export const LegalV2: React.FC<{ documento: '/privacidade' | '/termos' }> = ({ documento }) => {
  const doc = DOCUMENTOS_LEGAIS[documento];
  const outro = documento === '/privacidade' ? { para: '/termos', rotulo: 'Termos de Uso' } : { para: '/privacidade', rotulo: 'Política de Privacidade' };
  return (
    <article className={`v2-claro ${MARGEM} pt-[136px] pb-96`}>
      <div className="max-w-[760px] mx-auto flex flex-col gap-48">
        <header className="flex flex-col gap-16 pb-32 border-b v2-linha-forte">
          <Trilha itens={[{ rotulo: 'Início', para: '/' }, { rotulo: doc.titulo }]} />
          <h1 className="v2-serif v2-titulo">{doc.titulo}</h1>
          <p className="v2-corpo">{doc.resumo}</p>
          <p className="v2-cota">
            Última atualização: <time dateTime={doc.atualizadoEm}>{dataPorExtenso(doc.atualizadoEm)}</time>
          </p>
        </header>
        {doc.secoes.map((s) => (
          <section key={s.titulo} className="flex flex-col gap-16 v2-texto-longo">
            <h2 className="v2-serif v2-h3">{s.titulo}</h2>
            {s.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.itens && (
              <ul className="flex flex-col gap-8 pl-24 list-disc marker:text-[var(--v2-acento)]">
                {s.itens.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <footer className="pt-32 border-t v2-linha-fina flex flex-wrap gap-[12px]">
          <LinkV2 para={outro.para} className="v2-botao v2-botao-linha">
            {outro.rotulo}
          </LinkV2>
          <LinkV2 para="/contato" className="v2-botao v2-botao-claro">
            Contato e orçamento
          </LinkV2>
        </footer>
      </div>
    </article>
  );
};

/**
 * Páginas de ambiente (cozinhas, quartos, closets, home office): os mesmos textos e fotos reais
 * que o Google já conhece (data/paginasLocais.ts), no visual do site.
 */
export const AmbienteV2: React.FC<{ rota: RotaAmbiente }> = ({ rota }) => {
  const { abrirOrcamento } = useNavV2();
  const cfg = PAGINAS_AMBIENTES_LOCAIS[rota];
  const [principal, ...outras] = cfg.fotos;
  return (
    <>
      <section className={`v2-claro ${MARGEM} pt-[136px] pb-64 flex flex-col gap-32`}>
        <Trilha itens={[{ rotulo: 'Início', para: '/' }, { rotulo: NOME_AMBIENTE[rota] }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 lg:gap-64 items-end">
          <div className="lg:col-span-7 flex flex-col gap-24">
            <p className="v2-cota uppercase tracking-[0.08em] v2-acento">Jaú e região</p>
            <h1 className="v2-serif text-[clamp(2.25rem,4.4vw,4rem)] leading-[1.02] max-w-[20ch]">{cfg.h1}</h1>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-24">
            <p className="v2-corpo max-w-[44ch]">{cfg.subtitulo}</p>
            <div className="flex flex-wrap gap-[12px]">
              <button type="button" onClick={() => abrirOrcamento(cfg.ambienteBriefing)} className="v2-botao v2-botao-claro">
                Pedir orçamento <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
              <LinkV2 para="/projetar" className="v2-botao v2-botao-linha">
                <Box className="w-[16px] h-[16px]" strokeWidth={1.5} /> Montar em 3D
              </LinkV2>
            </div>
          </div>
        </div>
        {principal && (
          <figure className="flex flex-col gap-8">
            <Foto srcBase={principal.srcBase} alt={principal.alt} proporcao={principal.razao} prioridade sizes={TAMANHO_FOTO_DEITADA} className="w-full max-h-[78vh]" imgStyle={{ objectFit: 'cover' }} />
            <figcaption className="v2-cota">{principal.legenda}</figcaption>
          </figure>
        )}
      </section>

      <section className={`v2-areia ${MARGEM} py-96 grid grid-cols-1 lg:grid-cols-12 gap-48`}>
        <div className="lg:col-span-7 flex flex-col gap-24 v2-texto-longo">
          <h2 className="v2-serif v2-h3">
            <ComItalico texto="Como fazemos, *obra por obra.*" />
          </h2>
          {cfg.paragrafosReais.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <dl className="lg:col-span-5 flex flex-col">
          {cfg.especificacoesReais.map((e) => (
            <div key={e.titulo} className="py-24 border-t v2-linha-fina flex flex-col gap-8">
              <dt className="v2-serif text-[1.4rem] leading-tight">{e.titulo}</dt>
              <dd className="v2-corpo">{e.detalhe}</dd>
            </div>
          ))}
        </dl>
      </section>

      {outras.length > 0 && (
        <section className={`v2-claro ${MARGEM} py-96 flex flex-col gap-48`}>
          <h2 className="v2-serif v2-titulo">
            <ComItalico texto="Mais fotos *de obras reais.*" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-32 gap-y-48 items-start">
            {outras.map((f) => (
              <figure key={f.srcBase} className="flex flex-col gap-8">
                <Foto srcBase={f.srcBase} alt={f.alt} proporcao={f.razao} sizes="(max-width: 639px) 60vw, (min-width: 1024px) 30vw, 50vw" className="w-full" />
                <figcaption className="v2-cota">{f.legenda}</figcaption>
              </figure>
            ))}
          </div>
          <ChamadaOrcamentoV2 texto="Quer um projeto assim *na sua casa?*" ambiente={cfg.ambienteBriefing} />
        </section>
      )}

      <section className={`v2-areia ${MARGEM} py-64 flex flex-col gap-24`}>
        <h2 className="v2-cota uppercase tracking-[0.08em]">Outros ambientes</h2>
        <nav aria-label="Outros ambientes" className="flex flex-wrap gap-[12px]">
          {ROTAS_AMBIENTE.filter((r) => r !== rota).map((r) => (
            <LinkV2 key={r} para={r} className="v2-botao v2-botao-linha h-[44px]">
              {NOME_AMBIENTE[r]}
            </LinkV2>
          ))}
          <LinkV2 para="/obras" className="v2-botao v2-botao-linha h-[44px]">
            Todas as obras
          </LinkV2>
        </nav>
      </section>
    </>
  );
};

export const NaoEncontradaV2: React.FC = () => (
  <section className={`v2-escuro ${MARGEM} min-h-[80svh] pt-[160px] pb-96 flex flex-col gap-24`}>
    <p className="v2-cota v2-acento">Erro 404</p>
    <h1 className="v2-serif v2-display">
      <ComItalico texto="Esta página *não existe.*" />
    </h1>
    <p className="v2-corpo">O endereço pode ter mudado ou foi digitado errado.</p>
    <div className="flex flex-wrap gap-[12px]">
      <LinkV2 para="/" className="v2-botao v2-botao-claro">
        Página inicial
      </LinkV2>
      <LinkV2 para="/obras" className="v2-botao v2-botao-linha">
        Ver as obras
      </LinkV2>
      <LinkV2 para="/projetar" className="v2-botao v2-botao-linha">
        Projetar em 3D
      </LinkV2>
    </div>
  </section>
);
