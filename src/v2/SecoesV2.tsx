import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Box, Check, ExternalLink, MapPin, Minus, Star } from 'lucide-react';
import { Foto } from '../components/Foto';
import { AnotacoesObra } from '../components/AnotacoesObra';
import { BriefingOrcamento } from '../components/BriefingOrcamento';
import { OBRAS_REAIS } from '../data/portfolioData';
import { AVALIACOES_PUBLICADAS, LINK_PERFIL_GOOGLE, RESUMO_GOOGLE } from '../data/avaliacoesGoogle';
import { EMPRESA } from '../data/empresa';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { ComItalico } from './Serif';
import { ChamadaOrcamentoV2, MARGEM } from './CromoV2';
import { LinkV2, useNavV2 } from './NavegacaoV2';
import { caminhoFoto } from './rotasV2';
import { MANIFESTO_V2, NUMEROS_V2, PROJETO_INCLUSO_V2, PASSOS_3D_V2 } from './textosV2';
import { perguntasConfirmadas } from '../data/perguntas';

gsap.registerPlugin(ScrollTrigger);

const reduzido = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Título de seção. `olho`: linha pequena dentro do título com as palavras que o Google procura. */
export const Titulo: React.FC<{ texto: string; className?: string; as?: 'h1' | 'h2' | 'h3'; olho?: string }> = ({ texto, className = '', as = 'h2', olho }) => {
  const Tag = as;
  return (
    <Tag className={`v2-serif v2-titulo ${className}`}>
      {olho && <span className="v2-olho block mb-16">{olho}</span>}
      <ComItalico texto={texto} />
    </Tag>
  );
};

/** Capítulo 2: o manifesto acende palavra por palavra com a rolagem. */
export const ManifestoV2: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!ref.current || reduzido()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-palavra]',
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.06, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 72%', end: 'bottom 55%', scrub: 0.6 } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className={`v2-claro ${MARGEM} py-[18vh] lg:py-[24vh]`}>
      <p className="v2-cota mb-32">O que a gente acredita</p>
      <p className="v2-serif text-[clamp(2rem,4.6vw,4.25rem)] leading-[1.08] max-w-[22ch]">
        {MANIFESTO_V2.split(' ').map((palavra, i) => (
          <span key={i} data-palavra className="inline-block mr-[0.22em]">
            {palavra}
          </span>
        ))}
      </p>
    </section>
  );
};

/** Cartão de obra da galeria: foto, título e cota; abre a página da foto. */
export const CartaoObraV2: React.FC<{ obra: (typeof OBRAS_REAIS)[number]; sizes?: string }> = ({ obra, sizes = '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw' }) => (
  <LinkV2 para={caminhoFoto(obra)} className="group flex flex-col gap-16" aria-label={`Ver a obra: ${obra.titulo}`}>
    <span className="block overflow-hidden" style={{ aspectRatio: obra.proporcao }}>
      <Foto
        srcBase={obra.arquivo}
        alt={obra.alt}
        proporcao={obra.proporcao}
        sizes={sizes}
        className="w-full h-full transition-transform duration-[1.2s] group-hover:scale-[1.03]"
        imgStyle={{ objectFit: 'cover' }}
      />
    </span>
    <span className="flex items-start justify-between gap-16">
      <span className="flex flex-col gap-4">
        <span className="v2-serif text-[1.5rem] leading-tight">{obra.titulo}</span>
        <span className="v2-cota">{obra.cota}</span>
      </span>
      <ArrowUpRight className="w-[20px] h-[20px] shrink-0 mt-4 v2-acento transition-transform group-hover:-translate-y-[2px] group-hover:translate-x-[2px]" strokeWidth={1.5} />
    </span>
  </LinkV2>
);

/**
 * Capítulo 3: caderno de obra. As cinco primeiras entram grandes, com os fios dourados do
 * acabamento; as outras vêm logo depois numa galeria. Todas abrem a página da própria foto.
 */
export const ObrasV2: React.FC = () => {
  const destaque = OBRAS_REAIS.filter((o) => o.anotacoes && o.anotacoes.length > 0).slice(0, 5);
  const resto = OBRAS_REAIS.filter((o) => !destaque.includes(o));
  return (
    <section id="v2-obras" className={`v2-claro ${MARGEM} py-[14vh]`}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24 mb-[10vh]">
        <Titulo texto="Obras que *já moram* em Jaú." className="max-w-[12ch]" />
        <div className="flex flex-col gap-16 lg:items-end">
          <p className="v2-corpo max-w-[40ch] lg:text-right">Fotos reais de casas e lojas reais. Os fios dourados mostram o acabamento de cada peça.</p>
          <LinkV2 para="/obras" className="v2-botao v2-botao-linha">
            Ver as {OBRAS_REAIS.length} obras <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </LinkV2>
        </div>
      </div>
      <div className="flex flex-col gap-[14vh]">
        {destaque.map((o, i) => (
          <article key={o.id} className="grid grid-cols-1 lg:grid-cols-12 gap-32 lg:gap-64 items-center">
            <figure className={`lg:col-span-7 relative ${i % 2 ? 'lg:order-2' : ''}`} style={{ aspectRatio: o.proporcao }}>
              <LinkV2 para={caminhoFoto(o)} className="block w-full h-full" aria-label={`Ver a obra: ${o.titulo}`}>
                <Foto srcBase={o.arquivo} alt={o.alt} proporcao={o.proporcao} sizes="(min-width: 1024px) 56vw, 100vw" className="w-full h-full" imgStyle={{ objectFit: 'cover' }} />
              </LinkV2>
              <AnotacoesObra anotacoes={o.anotacoes ?? []} />
            </figure>
            <div className={`lg:col-span-5 flex flex-col items-start gap-16 ${i % 2 ? 'lg:order-1' : ''}`}>
              <span className="v2-serif v2-italico v2-acento text-[2.5rem] leading-none">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="v2-serif v2-h3">{o.titulo}</h3>
              <p className="v2-corpo max-w-[40ch]">{o.cota}</p>
              <LinkV2 para={caminhoFoto(o)} className="v2-cota underline underline-offset-4 hover:text-[var(--v2-texto)]">
                Ver esta obra em detalhe
              </LinkV2>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-[14vh] flex flex-col gap-48">
        <h3 className="v2-serif v2-h3">
          <ComItalico texto="E tem *mais obra* para ver." />
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-32 gap-y-64 items-start">
          {resto.map((o) => (
            <CartaoObraV2 key={o.id} obra={o} />
          ))}
        </div>
      </div>

      <ChamadaOrcamentoV2 texto="Gostou de alguma? *A gente faz a sua.*" className="mt-[10vh]" />
    </section>
  );
};

/**
 * O diferencial dito com todas as letras: o projeto de arquitetura vem junto. Primeiro a
 * comparação com o jeito comum; depois, item por item, o que o projeto inclui.
 */
export const ProjetoInclusoV2: React.FC = () => {
  const { abrirOrcamento } = useNavV2();
  return (
    <section id="v2-projeto-incluso" className={`v2-areia ${MARGEM} py-[14vh]`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-48">
        <div className="lg:col-span-5 flex flex-col items-start gap-24">
          <p className="v2-cota uppercase tracking-[0.08em] v2-acento">Sem custo à parte</p>
          <Titulo texto="O projeto de arquitetura *já vem junto.*" />
          <p className="v2-corpo max-w-[38ch]">
            Na maioria dos lugares você paga um profissional para projetar e outro para fabricar. Aqui é uma coisa só: a arquiteta desenha e a nossa oficina fabrica, na mesma conversa.
          </p>
          <div className="flex flex-wrap items-center gap-x-24 gap-y-16">
            <button type="button" onClick={() => abrirOrcamento()} className="v2-botao v2-botao-claro">
              Pedir orçamento com projeto <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
            <LinkV2 para="/#v2-processo" className="v2-cota underline underline-offset-4 hover:text-[var(--v2-texto)]">
              Ver como funciona, passo a passo
            </LinkV2>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="hidden sm:grid grid-cols-2 gap-32 pb-16 border-b v2-linha-forte">
            <span className="v2-cota">Do jeito comum</span>
            <span className="v2-cota text-[var(--v2-texto)]">Na Império</span>
          </div>
          <ul className="flex flex-col">
            {PROJETO_INCLUSO_V2.comparacao.map((l) => (
              <li key={l.imperio} className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-32 py-24 border-b v2-linha-fina">
                <p className="flex items-start gap-8 v2-corpo">
                  <Minus className="w-[18px] h-[18px] mt-[4px] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <span>
                    <span className="sr-only">Do jeito comum: </span>
                    {l.comum}
                  </span>
                </p>
                <p className="flex items-start gap-8 text-[1rem] leading-[1.6] text-[var(--v2-texto)] font-[450]">
                  <Check className="w-[18px] h-[18px] mt-[4px] shrink-0 v2-acento" strokeWidth={2} aria-hidden="true" />
                  <span>
                    <span className="sr-only">Na Império: </span>
                    {l.imperio}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </section>
  );
};

/** O diferencial em números. Quieto: só tipografia e linhas. */
export const NumerosV2: React.FC = () => (
  <section className={`v2-salvia ${MARGEM} py-[16vh]`}>
    <Titulo texto="Arquitetura e marcenaria *na mesma mesa.*" className="max-w-[14ch]" />
    <dl className="mt-64 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t v2-linha-fina">
      {NUMEROS_V2.map((n) => (
        <div key={n.valor} className="py-32 lg:pr-32 border-b lg:border-b-0 v2-linha-fina flex flex-col gap-16">
          <dt className="v2-serif text-[clamp(3.5rem,6vw,5.5rem)] leading-none">{n.valor}</dt>
          <dd className="v2-cota max-w-[26ch]">{n.rotulo}</dd>
        </div>
      ))}
    </dl>
  </section>
);

/**
 * Como trabalhamos: os seis passos, uma lista só (antes havia duas parecidas na página).
 * Título fixo à esquerda; à direita, numerais grandes e um fio de latão que desce com a rolagem.
 */
export const ProcessoV2: React.FC = () => {
  const listaRef = useRef<HTMLOListElement>(null);
  const fioRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!listaRef.current || !fioRef.current || reduzido()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fioRef.current,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: listaRef.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 } }
      );
    });
    return () => ctx.revert();
  }, []);
  return (
    <section id="v2-processo" className={`v2-claro ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48`}>
      <div className="lg:col-span-5 lg:sticky lg:top-[18vh] self-start flex flex-col gap-24">
        <p className="v2-cota uppercase tracking-[0.08em] v2-acento">Como trabalhamos</p>
        <Titulo texto="Da primeira conversa *à montagem na sua casa.*" />
        <p className="v2-corpo max-w-[38ch]">
          Uma equipe só cuida de tudo. A gente mede a sua casa como ela está hoje, e o projeto se encaixa nela. Você não precisa coordenar arquiteto, marceneiro e montador.
        </p>
      </div>
      <ol ref={listaRef} className="lg:col-span-7 relative flex flex-col pl-24 sm:pl-32">
        <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-px bg-[var(--v2-linha)]" />
        <span ref={fioRef} aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[2px] -ml-[0.5px] bg-[var(--v2-acento)] origin-top" />
        {PROJETO_INCLUSO_V2.itens.map((p, i) => (
          <li key={p.titulo} className={`grid grid-cols-[64px_1fr] sm:grid-cols-[112px_1fr] gap-16 py-[40px] ${i ? 'border-t v2-linha-fina' : ''}`}>
            <span className="v2-serif v2-italico v2-acento text-[clamp(2.5rem,5vw,4rem)] leading-none">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex flex-col gap-8">
              <h3 className="v2-serif v2-h3">{p.titulo}</h3>
              <p className="v2-corpo max-w-[42ch]">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

/** Convite forte para o 3D online: imagem grande, três passos e dois caminhos. */
export const Projeto3DV2: React.FC = () => {
  const { abrirOrcamento } = useNavV2();
  return (
    <section id="v2-3d" className={`v2-escuro ${MARGEM} py-[14vh] flex flex-col gap-64`}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24">
        <div className="flex flex-col gap-24">
          <p className="v2-cota uppercase tracking-[0.08em] v2-acento flex items-center gap-8">
            <Box className="w-[14px] h-[14px]" strokeWidth={1.5} /> Grátis, aqui no site
          </p>
          <Titulo texto="Veja a sua cozinha *antes de ela existir.*" className="max-w-[16ch]" />
        </div>
        <p className="v2-corpo max-w-[40ch]">Monte o ambiente em 3D no navegador, sem instalar nada. Mude medidas, móveis, cores e a luz. Depois mande a imagem para a gente orçar.</p>
      </div>

      <LinkV2 para="/projetar" className="block overflow-hidden group relative" aria-label="Abrir o projeto 3D online">
        <Foto
          srcBase="/projetar/cozinha-render"
          alt="Projeto 3D de cozinha planejada com ilha verde e armários brancos"
          proporcao="16 / 9"
          sizes="100vw"
          className="w-full transition-transform duration-[1.2s] group-hover:scale-[1.02]"
        />
        <span className="absolute left-16 bottom-16 sm:left-32 sm:bottom-32 v2-botao v2-botao-claro">
          Começar meu projeto 3D <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </span>
      </LinkV2>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-x-32">
        {PASSOS_3D_V2.map((p, i) => (
          <li key={p.titulo} className="py-32 border-t v2-linha-fina flex flex-col gap-8">
            <span className="v2-serif v2-italico v2-acento text-[2rem] leading-none">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="v2-serif text-[1.5rem] leading-tight">{p.titulo}</h3>
            <p className="v2-corpo">{p.texto}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-[12px]">
        <LinkV2 para="/projetar" className="v2-botao v2-botao-claro">
          <Box className="w-[16px] h-[16px]" strokeWidth={1.5} /> Projetar em 3D agora
        </LinkV2>
        <button type="button" onClick={() => abrirOrcamento()} className="v2-botao v2-botao-linha">
          Prefiro que a arquiteta desenhe
        </button>
      </div>
    </section>
  );
};

interface AvaliacaoV2 {
  autor: string;
  autorUrl?: string;
  foto?: string;
  nota: number;
  texto: string;
  quando: string;
}

const decimal = (n: number) => n.toFixed(1).replace('.', ',');

const Estrelas: React.FC<{ nota: number; tamanho?: number }> = ({ nota, tamanho = 16 }) => (
  <span role="img" className="flex items-center gap-[2px]" aria-label={`${decimal(nota)} de 5 estrelas`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        aria-hidden="true"
        style={{ width: tamanho, height: tamanho }}
        className={i <= Math.round(nota) ? 'fill-[#d4a548] text-[#d4a548]' : 'text-[var(--v2-linha)]'}
        strokeWidth={1.5}
      />
    ))}
  </span>
);

/**
 * Avaliações reais do Google em cartões lado a lado, com estrelas (ao vivo pela API quando a
 * chave está configurada; senão, as transcritas). No celular, os cartões deslizam de lado.
 */
export const AvaliacoesV2: React.FC = () => {
  const [ao, setAo] = useState<{ nota: number; total: number; url?: string; avaliacoes: AvaliacaoV2[] } | null>(null);
  useEffect(() => {
    let ativo = true;
    fetch('/api/avaliacoes')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (ativo && d && d.total > 0) setAo(d);
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, []);
  const nota = ao?.nota ?? RESUMO_GOOGLE.nota;
  const total = ao?.total ?? RESUMO_GOOGLE.total;
  const link = ao?.url ?? LINK_PERFIL_GOOGLE;
  const lista: AvaliacaoV2[] = ao?.avaliacoes.length ? ao.avaliacoes : AVALIACOES_PUBLICADAS;

  return (
    <section id="v2-avaliacoes" className={`v2-areia ${MARGEM} py-[14vh] flex flex-col gap-48`}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-32">
        <Titulo texto="Quem já mora *numa Império.*" className="max-w-[12ch]" />
        <div className="flex flex-col gap-16 lg:items-end">
          <div className="flex items-center gap-16">
            <span className="v2-serif text-[4.5rem] leading-none">{decimal(nota)}</span>
            <span className="flex flex-col gap-4">
              <Estrelas nota={nota} tamanho={20} />
              <span className="v2-cota">
                {total} avaliações no Google{!ao && ` (em ${RESUMO_GOOGLE.conferidoEm})`}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-[12px]">
            <a href={link} target="_blank" rel="noopener noreferrer" className="v2-botao v2-botao-linha h-[44px]">
              Ver no Google <ExternalLink className="w-[16px] h-[16px]" strokeWidth={1.5} />
            </a>
            <a href={link} target="_blank" rel="noopener noreferrer" className="v2-botao h-[44px] underline underline-offset-4">
              Avaliar a Império
            </a>
          </div>
        </div>
      </div>

      <div
        className={`flex gap-16 overflow-x-auto snap-x snap-mandatory -mx-16 px-16 sm:-mx-32 sm:px-32 pb-8 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 md:gap-24 md:overflow-visible ${
          lista.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'
        }`}
      >
        {lista.slice(0, 6).map((a, i) => (
          <article key={i} className="min-w-[85%] snap-start md:min-w-0 p-24 rounded-[20px] bg-[var(--v2-cartao)] border v2-linha-fina flex flex-col justify-between gap-24">
            <div className="flex flex-col gap-16">
              <div className="flex items-center justify-between gap-8">
                <Estrelas nota={a.nota} />
                <span className="v2-cota">{a.quando}</span>
              </div>
              <p className="text-[1rem] leading-[1.65] font-[350] text-[var(--v2-texto)] line-clamp-[8] whitespace-pre-line">“{a.texto.trim()}”</p>
            </div>
            <div className="pt-16 border-t v2-linha-fina flex items-center gap-[12px]">
              {a.foto ? (
                <img src={a.foto} alt="" width={36} height={36} loading="lazy" referrerPolicy="no-referrer" className="w-[36px] h-[36px] rounded-full" />
              ) : (
                <span aria-hidden="true" className="w-[36px] h-[36px] rounded-full bg-[var(--v2-salvia)] text-[#f3efe6] flex items-center justify-center v2-serif text-[1.1rem]">
                  {a.autor.trim().charAt(0)}
                </span>
              )}
              <span className="flex flex-col">
                <a href={a.autorUrl ?? link} target="_blank" rel="noopener noreferrer" className="text-[0.9375rem] font-[500] text-[var(--v2-texto)] hover:underline underline-offset-4">
                  {a.autor}
                </a>
                <span className="v2-cota">Avaliação publicada no Google</span>
              </span>
            </div>
          </article>
        ))}
      </div>

      <ChamadaOrcamentoV2 texto="Quer ser *a próxima casa* desta lista?" />
    </section>
  );
};

/** Nossa história: aqui (e só aqui) os nomes dos donos. */
export const HistoriaV2: React.FC = () => (
  <section id="v2-historia" className={`v2-salvia ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48 items-center`}>
    <div className="lg:col-span-5">
      <Foto srcBase="/obras/fundadores" alt="Wellington e Tatiane Cabral, fundadores da Império Móveis Planejados" proporcao="666 / 1178" sizes="(min-width: 1024px) 36vw, 100vw" className="w-full max-h-[78vh] grayscale" imgStyle={{ objectFit: 'cover' }} />
    </div>
    <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-32">
      <Titulo texto="Feito por mãos que *medem duas vezes.*" />
      <p className="v2-corpo">
        A Império nasceu em Jaú, em 2015, quando o <span className="text-[var(--v2-texto)]">Wellington Cabral</span>, marceneiro desde cedo, decidiu que não queria só seguir o padrão. A <span className="text-[var(--v2-texto)]">Tatiane Cabral</span>, arquiteta e designer de interiores, trouxe o projeto para dentro da oficina.
      </p>
      <p className="v2-corpo">Hoje, quem desenha e quem fabrica trabalham lado a lado. É por isso que o projeto de arquitetura vem junto, sem custo à parte.</p>
      <p className="v2-serif v2-italico text-[1.6rem] leading-tight">“Cada detalhe com a cara de quem vai morar ali.”</p>
    </div>
  </section>
);

/**
 * Onde estamos: endereço, horário, as mesmas informações do Perfil da Empresa no Google e o
 * mapa incorporado (o mesmo da V1).
 */
export const OndeEstamosV2: React.FC<{ id?: string }> = ({ id = 'v2-onde-estamos' }) => (
  <section id={id} className={`v2-claro ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48 items-start`}>
    <div className="lg:col-span-5 flex flex-col items-start gap-32">
      <Titulo texto="Onde estamos *em Jaú.*" />
      <p className="v2-corpo max-w-[42ch]">
        Atendemos residências e comércios em {EMPRESA.cidadesAtendidas.join(', ')} e região. Venha conhecer a oficina com hora marcada, ou a gente vai até a sua obra.
      </p>
      <div className="w-full flex flex-col gap-24 border-t v2-linha-fina pt-24">
        <div className="flex items-start gap-16">
          <MapPin className="w-[20px] h-[20px] shrink-0 mt-4 v2-acento" strokeWidth={1.5} aria-hidden="true" />
          <div className="flex flex-col gap-4">
            <span className="v2-serif text-[1.5rem] leading-tight">Oficina e atendimento</span>
            <span className="v2-corpo">
              {EMPRESA.endereco.logradouro}, {EMPRESA.endereco.bairro}, {EMPRESA.endereco.cidade}/{EMPRESA.endereco.uf}
            </span>
            <span className="v2-cota">
              {EMPRESA.horarios.resumo}. {EMPRESA.horarios.observacao}.
            </span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-24 gap-y-24 pl-[36px]">
          {(
            [
              ['Atendimento', EMPRESA.sobre.atendimento],
              ['Serviços', EMPRESA.sobre.servicos],
              ['Pagamento', EMPRESA.sobre.pagamentos],
              ['Acessibilidade', EMPRESA.sobre.acessibilidade],
            ] as const
          ).map(([titulo, itens]) => (
            <div key={titulo} className="flex flex-col gap-4">
              <dt className="v2-cota uppercase tracking-[0.08em] text-[0.6875rem] v2-acento">{titulo}</dt>
              {itens.map((item) => (
                <dd key={item} className="v2-cota text-[0.9375rem]">
                  {item}
                </dd>
              ))}
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-wrap gap-[12px]">
        <a href={EMPRESA.mapsUrl} target="_blank" rel="noopener noreferrer" className="v2-botao v2-botao-claro">
          Ver no Google Maps <ExternalLink className="w-[16px] h-[16px]" strokeWidth={1.5} />
        </a>
        <a
          href={getWhatsAppUrl('Olá! Quero agendar uma visita técnica da Império.')}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('v2_visita_tecnica')}
          className="v2-botao v2-botao-linha"
        >
          Agendar visita técnica
        </a>
      </div>
    </div>
    <div className="lg:col-span-7 w-full border v2-linha-fina bg-[var(--v2-linho-2)]">
      <iframe
        className="w-full h-[360px] lg:h-[520px] border-0 block"
        src={EMPRESA.mapsEmbedUrl}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Mapa da ${EMPRESA.nome} em Jaú`}
      />
    </div>
  </section>
);

/**
 * Perguntas frequentes (só as respostas confirmadas pelos donos). São as mesmas do FAQPage nos
 * dados estruturados da home: o Google exige que o texto esteja visível na página.
 */
export const PerguntasV2: React.FC = () => (
  <section id="v2-perguntas" className={`v2-areia ${MARGEM} py-[12vh] grid grid-cols-1 lg:grid-cols-12 gap-48`}>
    <div className="lg:col-span-4 flex flex-col gap-16">
      <Titulo texto="Perguntas *frequentes.*" />
      <p className="v2-corpo max-w-[34ch]">O que mais perguntam antes de começar. Ficou outra dúvida? Chame no WhatsApp.</p>
    </div>
    <div className="lg:col-span-8 flex flex-col">
      {perguntasConfirmadas().map((p) => (
        <details key={p.pergunta} className="group py-24 border-t v2-linha-fina">
          <summary className="flex items-start justify-between gap-16 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <h3 className="v2-serif text-[1.5rem] leading-tight">{p.pergunta}</h3>
            <span aria-hidden="true" className="v2-serif v2-acento text-[1.75rem] leading-none transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="v2-corpo mt-16 max-w-[62ch]">{p.resposta}</p>
        </details>
      ))}
    </div>
  </section>
);

/** Fechamento: frase grande, formulário num cartão marfim e o contato direto. */
export const FechamentoV2: React.FC = () => (
  <section id="v2-orcamento" data-sem-barra className={`v2-escuro ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48`}>
    <div className="lg:col-span-5 flex flex-col gap-24">
      <h2 className="v2-serif v2-display">
        <ComItalico texto="Vamos construir *o seu?*" />
      </h2>
      <p className="v2-corpo max-w-[38ch]">Conte o que você quer planejar. A gente responde pelo WhatsApp com os próximos passos.</p>
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick('v2_fechamento')}
        className="v2-cota hover:text-[var(--v2-texto)] self-start underline underline-offset-4"
      >
        Prefere falar direto? WhatsApp {EMPRESA.telefone}
      </a>
    </div>
    <div className="lg:col-span-7 bg-[var(--v2-marfim)] text-[#1B1915] p-24 sm:p-48">
      <BriefingOrcamento modo="inline" />
    </div>
  </section>
);
