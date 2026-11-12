import precos from '../../data/precos.json';
import { CATALOGO_MODULOS_CENARIO, CENARIOS_AMBIENTES, ModuloId } from '../../data/cenarios';
import { materialPorId } from '../../data/materiais/catalogo';
import { Instancia, NOME_PAREDE } from './motorGeometrico';
import { QuartoLayout, QuartoLayoutSchema, normalizarLayout } from './schema';
import { TEMPERATURA_PADRAO } from './iluminacao';
import { OPCOES_PISO } from './materiais3D';

/** Resumo, estimativa e link do projeto: funções puras, usadas no painel e nos testes. */

export const PRAZOS = ['Até 1 mês', '1 a 3 meses', '3 a 6 meses', 'Ainda pesquisando'] as const;
export type Prazo = (typeof PRAZOS)[number];

export interface DadosLead {
  nome: string;
  cidade: string;
  prazo: Prazo | '';
  temMedidas: 'sim' | 'nao' | '';
}

const cm = (v: number) => `${Math.round(v * 100)}`;
const rotulo = (id: ModuloId) => CATALOGO_MODULOS_CENARIO[id]?.rotulo ?? id;
const nomeMaterial = (id?: string) => (id ? materialPorId(id)?.nome ?? id : '');
const PORTAS = { abrir: 'portas de abrir', correr: 'portas de correr', sem: 'sem portas' } as const;

export interface LinhaResumo {
  titulo: string;
  detalhe: string;
}

export function linhasDoProjeto(layout: QuartoLayout): LinhaResumo[] {
  return (layout.modulos as Instancia[]).map((m) => {
    const partes = [
      `${cm(m.largura_m)} × ${cm(m.altura_m)} × ${cm(m.profundidade_m)} cm`,
      nomeMaterial(m.acabamento),
      m.tampo ? `tampo ${nomeMaterial(m.tampo)}` : '',
      m.id === 'guarda-roupa' ? PORTAS[m.portas ?? 'abrir'] : '',
      `parede ${NOME_PAREDE[m.parede].toLowerCase()}`,
    ].filter(Boolean);
    return { titulo: rotulo(m.id), detalhe: partes.join(', ') };
  });
}

export interface Estimativa {
  total: number;
  parcial: boolean;
  aviso: string;
}

interface TabelaPrecos {
  ativo: boolean;
  aviso: string;
  porMetroLinear: Record<string, number>;
}

/** "A partir de": soma da largura de cada módulo × preço por metro linear. Null enquanto a tabela estiver desligada. */
export function estimarPreco(layout: QuartoLayout, tabela: TabelaPrecos = precos as TabelaPrecos): Estimativa | null {
  if (!tabela.ativo) return null;
  let total = 0;
  let parcial = false;
  (layout.modulos as Instancia[]).forEach((m) => {
    const preco = tabela.porMetroLinear[m.id] ?? 0;
    if (preco > 0) total += preco * m.largura_m;
    else parcial = true;
  });
  return total > 0 ? { total: Math.round(total / 100) * 100, parcial, aviso: tabela.aviso } : null;
}

export const reais = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/** Mensagem do WhatsApp com quem é o cliente, o ambiente e cada peça. */
export function montarMensagem(layout: QuartoLayout, lead: DadosLead, link?: string): string {
  const { largura_m: W, profundidade_m: D, pe_direito_m: H } = layout.dimensoes;
  const piso = OPCOES_PISO.find((p) => p.id === layout.piso)?.nome;
  const estimativa = estimarPreco(layout);
  const linhas = [
    'Oi! Montei meu projeto no 3D do site da Império e quero um orçamento.',
    '',
    lead.nome ? `Nome: ${lead.nome}` : '',
    lead.cidade ? `Cidade: ${lead.cidade}` : '',
    lead.prazo ? `Prazo desejado: ${lead.prazo}` : '',
    lead.temMedidas ? `Já tenho medidas ou planta: ${lead.temMedidas === 'sim' ? 'sim' : 'ainda não'}` : '',
    '',
    `Ambiente: ${CENARIOS_AMBIENTES[layout.comodo].rotulo}, ${cm(W)} × ${cm(D)} cm, pé-direito ${cm(H)} cm`,
    ...linhasDoProjeto(layout).map((l) => `- ${l.titulo}: ${l.detalhe}`),
    `Fita de LED: ${layout.led ? `sim, ${layout.temperaturaLed ?? TEMPERATURA_PADRAO} K` : 'não'}`,
    piso ? `Piso: ${piso}` : '',
    estimativa ? `Referência do site: a partir de ${reais(estimativa.total)}${estimativa.parcial ? ' (parcial)' : ''}` : '',
    '',
    link ? `Projeto no 3D: ${link}` : '',
  ];
  return linhas.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/* ---------- Link compartilhável ---------- */

const PREFIXO_COMPACTO = 'z.';
const PREFIXO_TEXTO = 'j.';

const base64url = (bytes: Uint8Array) => {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const deBase64url = (t: string) => {
  const s = atob(t.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};

/** Link maior que isso não é de um projeto do site (os reais ficam em torno de 600 caracteres). */
export const MAX_LINK_PROJETO = 6000;
/** Teto do JSON descompactado: barra "bomba de compressão" (texto curto que vira megabytes). */
export const MAX_JSON_PROJETO = 64 * 1024;

async function transformar(bytes: Uint8Array, fluxo: CompressionStream | DecompressionStream, limite = Infinity): Promise<Uint8Array> {
  const leitor = new Blob([bytes as BlobPart]).stream().pipeThrough(fluxo).getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    total += value.byteLength;
    if (total > limite) {
      await leitor.cancel();
      throw new Error('projeto grande demais');
    }
    partes.push(value);
  }
  const junto = new Uint8Array(total);
  let pos = 0;
  for (const p of partes) {
    junto.set(p, pos);
    pos += p.byteLength;
  }
  return junto;
}

/** Projeto → texto curto para a URL (#projeto=...). Sem os uids, que o site recria. */
export async function codificarProjeto(layout: QuartoLayout): Promise<string> {
  const enxuto = { ...layout, modulos: layout.modulos.map(({ uid: _uid, ...resto }) => resto) };
  const bytes = new TextEncoder().encode(JSON.stringify(enxuto));
  if (typeof CompressionStream === 'function') {
    return PREFIXO_COMPACTO + base64url(await transformar(bytes, new CompressionStream('deflate-raw')));
  }
  return PREFIXO_TEXTO + base64url(bytes);
}

/** Texto da URL → projeto validado, ou null se estiver corrompido ou fora do formato. */
export async function decodificarProjeto(texto: string): Promise<QuartoLayout | null> {
  try {
    if (texto.length > MAX_LINK_PROJETO || !/^[a-z]\.[A-Za-z0-9_-]+$/.test(texto)) return null;
    let bytes: Uint8Array;
    if (texto.startsWith(PREFIXO_COMPACTO)) bytes = await transformar(deBase64url(texto.slice(2)), new DecompressionStream('deflate-raw'), MAX_JSON_PROJETO);
    else if (texto.startsWith(PREFIXO_TEXTO)) bytes = deBase64url(texto.slice(2));
    else return null;
    if (bytes.byteLength > MAX_JSON_PROJETO) return null;
    const dados = JSON.parse(new TextDecoder().decode(bytes));
    const validado = QuartoLayoutSchema.safeParse(dados);
    return validado.success ? normalizarLayout(validado.data) : null;
  } catch {
    return null;
  }
}
