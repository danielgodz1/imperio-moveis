/**
 * HTML inicial das páginas do site (V2), gerado no build. Repete a estrutura e as classes da
 * parte de cima de cada página do React: o texto e a foto principal pintam antes do JavaScript
 * e a troca pelo React não muda nada na tela. O resto do conteúdo vai em seguida, completo,
 * para o Google ler tudo sem depender do JavaScript.
 *
 * Ao mudar a parte de cima de uma página em PaginasInternasV2.tsx, SecoesV2.tsx ou HeroV2.tsx,
 * mudar aqui também (o teste de navegador compara as duas versões).
 */
import { EMPRESA } from '../data/empresa';
import { OBRAS_REAIS } from '../data/portfolioData';
import { PAGINAS_AMBIENTES_LOCAIS } from '../data/paginasLocais';
import { DOCUMENTOS_LEGAIS, dataPorExtenso } from '../data/legal';
import { perguntasConfirmadas } from '../data/perguntas';
import type { ObraItem } from '../types';
import { HERO_V2, MANIFESTO_V2, PASSOS_3D_V2, PROJETO_INCLUSO_V2 } from './textosV2';
import { ROTULO_AMBIENTE, RotaAmbiente, caminhoFoto } from './rotasV2';

const MARGEM = 'px-16 sm:px-32 lg:px-64';

export function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** "texto *itálico*" → HTML com <em class="v2-italico">. */
function italico(texto: string): string {
  return texto
    .split('*')
    .map((p, i) => (i % 2 ? `<em class="v2-italico">${esc(p)}</em>` : esc(p)))
    .join('');
}

const olho = (t: string) => `<span class="v2-olho block mb-16">${esc(t)}</span>`;

/** Foto igual ao componente Foto (AVIF/WebP 800 e 1600, JPG de reserva, tamanho reservado). */
function foto(srcBase: string, alt: string, proporcao: string, o: { prioridade?: boolean; sizes?: string; classe?: string; estilo?: string } = {}): string {
  const [w, h] = proporcao.split('/').map((n) => Math.round(parseFloat(n)) || 1);
  const sizes = o.sizes ?? '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw';
  const b = esc(srcBase);
  return `<picture class="block overflow-hidden ${o.classe ?? ''}" style="aspect-ratio:${w} / ${h}"><source type="image/avif" srcset="${b}-800.avif 800w, ${b}-1600.avif 1600w" sizes="${sizes}" /><source type="image/webp" srcset="${b}-800.webp 800w, ${b}-1600.webp 1600w" sizes="${sizes}" /><img src="${b}.jpg" alt="${esc(alt)}" width="${w}" height="${h}" ${
    o.prioridade ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"'
  } class="w-full h-full object-cover block" style="aspect-ratio:${w} / ${h};${o.estilo ?? ''}" /></picture>`;
}

function trilha(itens: { rotulo: string; para?: string }[]): string {
  const li = itens
    .map(
      (i, n) =>
        `<li class="flex items-center gap-8">${
          i.para ? `<a href="${esc(i.para)}" class="underline underline-offset-4">${esc(i.rotulo)}</a>` : `<span aria-current="page" class="text-[var(--v2-texto)]">${esc(i.rotulo)}</span>`
        }${n < itens.length - 1 ? '<span aria-hidden="true">/</span>' : ''}</li>`
    )
    .join('');
  return `<nav aria-label="Você está em" class="v2-cota"><ol class="flex flex-wrap items-center gap-8">${li}</ol></nav>`;
}

/** Cabeçalho fixo (mesma marcação do CabecalhoV2, sem os botões que dependem do JavaScript). */
function cabecalho(transparente: boolean): string {
  const fundo = transparente ? '!bg-transparent' : '!bg-[var(--v2-noite)]/95 backdrop-blur-[2px] border-b v2-linha-fina';
  return `<header class="v2-escuro fixed top-0 inset-x-0 z-50 ${fundo}"><div class="${MARGEM} h-[68px] flex items-center justify-between gap-16"><a href="/" class="flex items-center gap-[12px] shrink-0" aria-label="${esc(
    EMPRESA.nome
  )}, página inicial"><span class="v2-logo inline-block h-[40px]" aria-hidden="true"></span><span class="flex flex-col leading-none"><span class="v2-serif text-[1.45rem]">Império</span><span class="v2-cota text-[0.6875rem] tracking-[0.08em] uppercase">Móveis planejados</span></span></a><nav aria-label="Principal" class="hidden xl:flex items-center gap-24"><a class="v2-cota" href="/obras">Obras</a><a class="v2-cota" href="/#v2-projeto-incluso">Projeto incluso</a><a class="v2-cota" href="/#v2-processo">Como trabalhamos</a><a class="v2-cota" href="/#v2-avaliacoes">Avaliações</a><a class="v2-cota" href="/#v2-historia">Nossa história</a><a class="v2-cota" href="/#v2-onde-estamos">Onde estamos</a></nav><div class="flex items-center gap-8"><a href="/projetar" class="v2-botao v2-botao-linha h-[40px] px-16 text-[0.875rem] hidden md:inline-flex">Projetar em 3D</a><a href="/contato" class="v2-botao v2-botao-claro h-[40px] px-16 text-[0.875rem]">Orçamento</a><span class="xl:hidden w-[40px] h-[40px]" aria-hidden="true"></span></div></div></header>`;
}

/** Rodapé com os links e o contato (para o Google e para quem está sem JavaScript). */
function rodape(): string {
  return `<footer class="v2-escuro ${MARGEM} py-64 border-t v2-linha-fina flex flex-col gap-24 v2-cota"><nav aria-label="Ambientes" class="flex flex-wrap gap-x-24 gap-y-8"><a href="/cozinhas-planejadas-jau">Cozinhas planejadas</a><a href="/quartos-planejados-jau">Quartos planejados</a><a href="/closets-sob-medida-jau">Closets sob medida</a><a href="/home-office-planejado-jau">Home office e comércio</a><a href="/obras">Todas as obras</a><a href="/projetar">Projetar em 3D</a><a href="/contato">Pedir orçamento</a><a href="/privacidade">Privacidade (LGPD)</a><a href="/termos">Termos de uso</a></nav><p>${esc(
    EMPRESA.nome
  )} · ${esc(EMPRESA.endereco.logradouro)}, ${esc(EMPRESA.endereco.bairro)}, ${esc(EMPRESA.endereco.cidade)}/${esc(EMPRESA.endereco.uf)} · WhatsApp ${esc(EMPRESA.telefone)} · ${esc(
    EMPRESA.horarios.semana
  )}</p></footer>`;
}

const pagina = (conteudo: string, transparente = false) => `<div class="v2 min-h-screen">${cabecalho(transparente)}<main>${conteudo}</main>${rodape()}</div>`;

/** Home: réplica da abertura (HeroV2 no começo da rolagem) e o texto das seções seguintes. */
export function htmlInicio(): string {
  const obras = OBRAS_REAIS.slice(0, 6)
    .map((o) => `<li><a href="${caminhoFoto(o)}">${esc(o.titulo)}</a>: ${esc(o.cota)}</li>`)
    .join('');
  const passos = PROJETO_INCLUSO_V2.itens.map((p) => `<li><strong>${esc(p.titulo)}.</strong> ${esc(p.texto)}</li>`).join('');
  const perguntas = perguntasConfirmadas()
    .map((p) => `<details class="py-24 border-t v2-linha-fina"><summary class="v2-serif text-[1.5rem]">${esc(p.pergunta)}</summary><p class="v2-corpo mt-16">${esc(p.resposta)}</p></details>`)
    .join('');
  return pagina(
    `<section id="hero" class="v2-escuro relative w-full" style="min-height:320vh">
      <div class="sticky top-0 h-screen h-[100svh] w-full overflow-hidden">
        <div class="absolute inset-0" aria-hidden="true">
          <div class="palco-estatico absolute inset-0 overflow-x-clip bg-[#050505]">
            <img class="poster-notebook-v2" src="/videos/notebook-poster.jpg" alt="" width="1280" height="720" fetchpriority="high" decoding="async" />
          </div>
        </div>
        <div class="absolute inset-x-0 top-0 pt-[12svh] lg:pt-[11vh] px-16 sm:px-32 lg:px-64 lg:text-center lg:flex lg:flex-col lg:items-center">
          <h1 class="v2-serif v2-display text-[clamp(2.5rem,4.4vw,4.75rem)] max-w-[13ch] lg:max-w-[22ch]"><span class="v2-olho block mb-16 lg:mb-24">Móveis planejados em Jaú/SP</span>${italico(HERO_V2.titulo)}</h1>
          <p class="v2-corpo mt-16 lg:mt-24 max-w-[44ch]">${esc(HERO_V2.apoio)}</p>
          <p class="v2-cota mt-16 lg:mt-24">Role a página. A cozinha vai se montar na tela.</p>
        </div>
      </div>
    </section>
    <section class="v2-claro ${MARGEM} py-96"><p class="v2-serif text-[clamp(2rem,4.6vw,4.25rem)] leading-[1.08] max-w-[22ch]">${esc(MANIFESTO_V2)}</p></section>
    <section class="v2-claro ${MARGEM} py-64"><h2 class="v2-serif v2-titulo">Obras que <em class="v2-italico">já moram</em> em Jaú.</h2><ul class="v2-corpo">${obras}</ul><a href="/obras">Ver todas as obras</a></section>
    <section class="v2-areia ${MARGEM} py-64"><h2 class="v2-serif v2-titulo">O projeto de arquitetura <em class="v2-italico">já vem junto.</em></h2><ol class="v2-corpo">${passos}</ol></section>
    <section class="v2-areia ${MARGEM} py-64"><h2 class="v2-serif v2-titulo">Perguntas <em class="v2-italico">frequentes.</em></h2>${perguntas}</section>`,
    true
  );
}

/** /obras: cabeçalho igual ao do React e todas as obras por ambiente. */
export function htmlObras(): string {
  const grupos = (['cozinhas', 'quartos', 'lojas'] as const)
    .map(
      (g, i) => `<section id="${g}" class="${i % 2 ? 'v2-areia' : 'v2-claro'} ${MARGEM} py-96 scroll-mt-[80px]"><h2 class="v2-serif v2-titulo mb-48">${esc(
        ROTULO_AMBIENTE[g]
      )}</h2><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-32 gap-y-64 items-start">${OBRAS_REAIS.filter((o) => o.ambiente === g)
        .map(
          (o) =>
            `<a href="${caminhoFoto(o)}" class="group flex flex-col gap-16">${foto(o.arquivo, o.alt, o.proporcao)}<span class="flex flex-col gap-4"><span class="v2-serif text-[1.5rem] leading-tight">${esc(
              o.titulo
            )}</span><span class="v2-cota">${esc(o.cota)}</span></span></a>`
        )
        .join('')}</div></section>`
    )
    .join('');
  const chips = (['cozinhas', 'quartos', 'lojas'] as const)
    .map((g) => `<a href="/obras#${g}" class="v2-botao v2-botao-linha h-[40px] px-16 text-[0.875rem]">${esc(ROTULO_AMBIENTE[g])} (${OBRAS_REAIS.filter((o) => o.ambiente === g).length})</a>`)
    .join('');
  return pagina(`<section class="v2-claro ${MARGEM} pt-[160px] pb-64 flex flex-col gap-32">${trilha([{ rotulo: 'Início', para: '/' }, { rotulo: 'Obras' }])}<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24"><h1 class="v2-serif v2-titulo max-w-[14ch]">${olho(
    'Móveis planejados em Jaú e região'
  )}${italico('Todas as obras, *uma por uma.*')}</h1><p class="v2-corpo max-w-[44ch]">${OBRAS_REAIS.length} fotos reais de cozinhas, quartos e lojas que a Império projetou e fabricou em Jaú e região. Toque numa foto para ver os acabamentos de cada peça.</p></div><nav aria-label="Ambientes" class="flex flex-wrap gap-8">${chips}</nav></section>${grupos}`);
}

/** /obras/:id: a foto, o título e os acabamentos (mesma grade da FotoPaginaV2). */
export function htmlFoto(obra: ObraItem): string {
  const [w, h] = obra.proporcao.split('/').map((n) => parseFloat(n));
  const deitada = w > h;
  const acabamentos = obra.anotacoes.length
    ? `<div class="flex flex-col gap-8"><h2 class="v2-cota uppercase tracking-[0.08em]">Acabamentos desta obra</h2><ul class="flex flex-col">${obra.anotacoes
        .map((a) => `<li class="py-[12px] border-t v2-linha-fina v2-serif text-[1.35rem] leading-tight first-letter:uppercase">${esc(a.texto)}</li>`)
        .join('')}</ul></div>`
    : '';
  return pagina(`<article class="v2-claro ${MARGEM} pt-[136px] pb-96"><div class="flex flex-col gap-24 mb-48">${trilha([
    { rotulo: 'Início', para: '/' },
    { rotulo: 'Obras', para: '/obras' },
    { rotulo: ROTULO_AMBIENTE[obra.ambiente], para: `/obras#${obra.ambiente}` },
    { rotulo: obra.titulo },
  ])}</div><div class="grid grid-cols-1 ${deitada ? '' : 'lg:grid-cols-12'} gap-48 items-start"><figure class="relative ${deitada ? '' : 'lg:col-span-7'}" style="aspect-ratio:${esc(obra.proporcao)}">${foto(obra.arquivo, obra.alt, obra.proporcao, {
    prioridade: true,
    sizes: deitada ? '100vw' : '(min-width: 1024px) 58vw, 100vw',
    classe: 'w-full h-full',
  })}</figure><div class="flex flex-col gap-24 ${deitada ? 'lg:grid lg:grid-cols-12 lg:gap-48' : 'lg:col-span-5 lg:sticky lg:top-[100px]'}"><div class="flex flex-col gap-16 ${deitada ? 'lg:col-span-6' : ''}"><p class="v2-cota uppercase tracking-[0.08em] v2-acento">${esc(
    ROTULO_AMBIENTE[obra.ambiente]
  )}</p><h1 class="v2-serif v2-h3 text-[clamp(2rem,3.4vw,3.25rem)]">${esc(obra.titulo)}</h1><p class="v2-corpo">${esc(obra.alt)}.</p><p class="v2-cota">${esc(obra.cota)}</p></div><div class="flex flex-col gap-24 ${
    deitada ? 'lg:col-span-6' : ''
  }">${acabamentos}<div class="flex flex-wrap gap-[12px]"><a href="/contato" class="v2-botao v2-botao-claro">Quero um parecido</a><a href="/projetar" class="v2-botao v2-botao-linha">Montar em 3D</a></div></div></div></div></article>`);
}

/** Páginas de ambiente (mesma parte de cima da AmbienteV2) com todo o texto e as fotos. */
export function htmlAmbiente(rota: RotaAmbiente, nome: string): string {
  const cfg = PAGINAS_AMBIENTES_LOCAIS[rota];
  const [principal, ...outras] = cfg.fotos;
  return pagina(`<section class="v2-claro ${MARGEM} pt-[136px] pb-64 flex flex-col gap-32">${trilha([{ rotulo: 'Início', para: '/' }, { rotulo: nome }])}<div class="grid grid-cols-1 lg:grid-cols-12 gap-32 lg:gap-64 items-end"><div class="lg:col-span-7 flex flex-col gap-24"><p class="v2-cota uppercase tracking-[0.08em] v2-acento">Jaú e região</p><h1 class="v2-serif text-[clamp(2.25rem,4.4vw,4rem)] leading-[1.02] max-w-[20ch]">${esc(
    cfg.h1
  )}</h1></div><div class="lg:col-span-5 flex flex-col gap-24"><p class="v2-corpo max-w-[44ch]">${esc(
    cfg.subtitulo
  )}</p><div class="flex flex-wrap gap-[12px]"><a href="/contato" class="v2-botao v2-botao-claro">Pedir orçamento</a><a href="/projetar" class="v2-botao v2-botao-linha">Montar em 3D</a></div></div></div>${
    principal
      ? `<figure class="flex flex-col gap-8">${foto(principal.srcBase, principal.alt, principal.razao, { prioridade: true, sizes: '100vw', classe: 'w-full max-h-[78vh]' })}<figcaption class="v2-cota">${esc(principal.legenda)}</figcaption></figure>`
      : ''
  }</section><section class="v2-areia ${MARGEM} py-96 grid grid-cols-1 lg:grid-cols-12 gap-48"><div class="lg:col-span-7 flex flex-col gap-24 v2-texto-longo"><h2 class="v2-serif v2-h3">Como fazemos, <em class="v2-italico">obra por obra.</em></h2>${cfg.paragrafosReais
    .map((p) => `<p>${esc(p)}</p>`)
    .join('')}</div><dl class="lg:col-span-5 flex flex-col">${cfg.especificacoesReais
    .map((e) => `<div class="py-24 border-t v2-linha-fina flex flex-col gap-8"><dt class="v2-serif text-[1.4rem] leading-tight">${esc(e.titulo)}</dt><dd class="v2-corpo">${esc(e.detalhe)}</dd></div>`)
    .join('')}</dl></section>${
    outras.length
      ? `<section class="v2-claro ${MARGEM} py-96 flex flex-col gap-48"><h2 class="v2-serif v2-titulo">Mais fotos <em class="v2-italico">de obras reais.</em></h2><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-32 gap-y-48 items-start">${outras
          .map((f) => `<figure class="flex flex-col gap-8">${foto(f.srcBase, f.alt, f.razao)}<figcaption class="v2-cota">${esc(f.legenda)}</figcaption></figure>`)
          .join('')}</div></section>`
      : ''
  }`);
}

/** /projetar (parte de cima da ProjetarV2, com a imagem e o botão de abrir o editor). */
export function htmlProjetar(): string {
  const passos = PASSOS_3D_V2.map(
    (p, i) =>
      `<li class="py-24 border-t v2-linha-fina flex gap-16"><span class="v2-serif v2-italico v2-acento text-[1.75rem] leading-none">${String(i + 1).padStart(2, '0')}</span><span class="flex flex-col gap-4"><span class="v2-serif text-[1.35rem] leading-tight">${esc(
        p.titulo
      )}</span><span class="v2-cota">${esc(p.texto)}</span></span></li>`
  ).join('');
  return pagina(`<section class="v2-escuro ${MARGEM} pt-[136px] pb-96 flex flex-col gap-48">${trilha([{ rotulo: 'Início', para: '/' }, { rotulo: 'Projetar em 3D' }])}<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24"><h1 class="v2-serif v2-titulo">${olho(
    'Móveis planejados em 3D, grátis'
  )}${italico('Projete o seu *em 3D.*')}</h1><p class="v2-corpo max-w-[44ch]">De graça e sem instalar nada. Visualização aproximada: o projeto final é detalhado pela arquiteta depois da medição no local.</p></div><ol class="grid grid-cols-1 md:grid-cols-3 gap-x-32">${passos}</ol><div class="relative w-full h-[70svh] min-h-[420px] border v2-linha-fina overflow-hidden">${foto(
    '/projetar/cozinha-render',
    'Exemplo de projeto 3D de cozinha planejada feito no editor',
    '16 / 9',
    { prioridade: true, sizes: '100vw', classe: 'w-full h-full' }
  )}<div class="absolute inset-0 bg-[var(--v2-noite)]/40 flex items-center justify-center p-24"><span class="v2-botao v2-botao-claro">Abrir o editor 3D</span></div></div></section>`);
}

/** /contato (coluna de texto da OrcamentoV2; o formulário chega com o JavaScript). */
export function htmlContato(): string {
  return pagina(`<section class="v2-claro ${MARGEM} pt-[136px] pb-96 grid grid-cols-1 lg:grid-cols-12 gap-48"><div class="lg:col-span-5 flex flex-col gap-32">${trilha([
    { rotulo: 'Início', para: '/' },
    { rotulo: 'Pedir orçamento' },
  ])}<h1 class="v2-serif v2-titulo">${olho('Orçamento de móveis planejados em Jaú')}${italico(
    'Vamos começar *pelo seu sonho.*'
  )}</h1><p class="v2-corpo max-w-[40ch]">Conte o ambiente, quando quer começar e o estilo. A gente responde pelo WhatsApp. O projeto de arquitetura vem junto com os móveis.</p><div class="flex flex-col gap-16 v2-cota text-[0.9375rem]"><a href="https://wa.me/${esc(
    EMPRESA.whatsapp
  )}" class="v2-botao v2-botao-linha self-start" rel="noopener noreferrer" target="_blank">WhatsApp ${esc(EMPRESA.telefone)}</a><span>${esc(EMPRESA.endereco.logradouro)}, ${esc(EMPRESA.endereco.bairro)}, ${esc(EMPRESA.endereco.cidade)}/${esc(
    EMPRESA.endereco.uf
  )}.</span><span>${esc(EMPRESA.horarios.semana)}. ${esc(EMPRESA.horarios.observacao)}.</span></div></div><div class="lg:col-span-7 bg-[var(--v2-marfim)] text-[#1B1915] p-24 sm:p-48 border v2-linha-fina min-h-[480px]"></div></section>`);
}

/** /privacidade e /termos: o texto inteiro, no visual da LegalV2. */
export function htmlLegal(documento: '/privacidade' | '/termos'): string {
  const doc = DOCUMENTOS_LEGAIS[documento];
  const secoes = doc.secoes
    .map(
      (s) =>
        `<section class="flex flex-col gap-16 v2-texto-longo"><h2 class="v2-serif v2-h3">${esc(s.titulo)}</h2>${s.paragrafos.map((p) => `<p>${esc(p)}</p>`).join('')}${
          s.itens ? `<ul class="flex flex-col gap-8 pl-24 list-disc">${s.itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''
        }</section>`
    )
    .join('');
  const fontes = doc.fontes
    ? `<section class="flex flex-col gap-16 v2-texto-longo"><h2 class="v2-serif v2-h3">Fontes oficiais</h2><ul class="flex flex-col gap-8 pl-24 list-disc">${doc.fontes
        .map((f) => `<li><a href="${esc(f.url)}" rel="noopener">${esc(f.rotulo)}</a></li>`)
        .join('')}</ul></section>`
    : '';
  return pagina(`<article class="v2-claro ${MARGEM} pt-[136px] pb-96"><div class="max-w-[760px] mx-auto flex flex-col gap-48"><header class="flex flex-col gap-16 pb-32 border-b v2-linha-forte">${trilha([
    { rotulo: 'Início', para: '/' },
    { rotulo: doc.titulo },
  ])}<h1 class="v2-serif v2-titulo">${esc(doc.titulo)}</h1><p class="v2-corpo">${esc(doc.resumo)}</p><p class="v2-cota">Última atualização: <time datetime="${doc.atualizadoEm}">${dataPorExtenso(
    doc.atualizadoEm
  )}</time></p></header>${secoes}${fontes}</div></article>`);
}

/** Página 404 no visual do site (sem JavaScript). */
export function html404(): string {
  return pagina(`<section class="v2-escuro ${MARGEM} min-h-[80svh] pt-[160px] pb-96 flex flex-col gap-24"><p class="v2-cota v2-acento">Erro 404</p><h1 class="v2-serif v2-display">Esta página <em class="v2-italico">não existe.</em></h1><p class="v2-corpo">O endereço pode ter mudado ou foi digitado errado.</p><div class="flex flex-wrap gap-[12px]"><a href="/" class="v2-botao v2-botao-claro">Página inicial</a><a href="/obras" class="v2-botao v2-botao-linha">Ver as obras</a><a href="/projetar" class="v2-botao v2-botao-linha">Projetar em 3D</a></div></section>`);
}
