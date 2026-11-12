import { QuartoLayout, QuartoLayoutSchema, normalizarLayout } from './schema';

/**
 * "Meus projetos": vários projetos salvos neste navegador, com nome e data. Só o desenho do
 * ambiente; nenhum dado pessoal. O armazenamento é entrada não confiável: cada item é validado
 * ao ler, e o que estiver fora do formato é descartado.
 */
export const CHAVE_PROJETOS = 'imperio-3d-projetos-v1';
export const MAX_PROJETOS = 12;
export const MAX_NOME_PROJETO = 40;

export interface ProjetoSalvo {
  id: string;
  nome: string;
  /** ISO 8601 */
  salvoEm: string;
  layout: QuartoLayout;
}

/** Armazenamento mínimo (localStorage no site; um Map nos testes). */
export interface Armazem {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
}

/** Nome visível: sem caracteres de controle nem sinais de HTML, espaços normalizados, 40 caracteres. */
export function limparNome(nome: string): string {
  return nome
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NOME_PROJETO);
}

function armazemPadrao(): Armazem | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function listarProjetos(armazem: Armazem | null = armazemPadrao()): ProjetoSalvo[] {
  if (!armazem) return [];
  try {
    const bruto = armazem.getItem(CHAVE_PROJETOS);
    if (!bruto || bruto.length > 512 * 1024) return [];
    const dados: unknown = JSON.parse(bruto);
    if (!Array.isArray(dados)) return [];
    const validos: ProjetoSalvo[] = [];
    for (const item of dados.slice(0, MAX_PROJETOS)) {
      if (!item || typeof item !== 'object') continue;
      const { id, nome, salvoEm, layout } = item as Record<string, unknown>;
      if (typeof id !== 'string' || !/^[a-z0-9]{6,24}$/.test(id)) continue;
      if (typeof nome !== 'string' || typeof salvoEm !== 'string' || Number.isNaN(Date.parse(salvoEm))) continue;
      const l = QuartoLayoutSchema.safeParse(layout);
      if (!l.success) continue;
      validos.push({ id, nome: limparNome(nome) || 'Projeto sem nome', salvoEm, layout: normalizarLayout(l.data) });
    }
    return validos;
  } catch {
    return [];
  }
}

function gravar(lista: ProjetoSalvo[], armazem: Armazem | null): boolean {
  if (!armazem) return false;
  try {
    armazem.setItem(CHAVE_PROJETOS, JSON.stringify(lista));
    return true;
  } catch {
    return false;
  }
}

const novoId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/**
 * Salva um projeto novo no topo da lista (o mais antigo sai quando passa do limite).
 * Mesmo nome substitui o anterior. Devolve a lista nova, ou null se o navegador não deixou gravar.
 */
export function salvarProjeto(
  nome: string,
  layout: QuartoLayout,
  armazem: Armazem | null = armazemPadrao(),
  agora: Date = new Date()
): ProjetoSalvo[] | null {
  const limpo = limparNome(nome) || `Projeto de ${agora.toLocaleDateString('pt-BR')}`;
  const validado = QuartoLayoutSchema.safeParse(layout);
  if (!validado.success) return null;
  const enxuto = { ...validado.data, modulos: validado.data.modulos.map(({ uid: _uid, ...m }) => m) } as QuartoLayout;
  const atuais = listarProjetos(armazem).filter((p) => p.nome.toLowerCase() !== limpo.toLowerCase());
  const lista = [{ id: novoId(), nome: limpo, salvoEm: agora.toISOString(), layout: enxuto }, ...atuais].slice(0, MAX_PROJETOS);
  return gravar(lista, armazem) ? lista : null;
}

export function removerProjeto(id: string, armazem: Armazem | null = armazemPadrao()): ProjetoSalvo[] {
  const lista = listarProjetos(armazem).filter((p) => p.id !== id);
  gravar(lista, armazem);
  return lista;
}
