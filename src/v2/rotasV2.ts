import { OBRAS_REAIS } from '../data/portfolioData';
import { EMPRESA } from '../data/empresa';
import type { ObraItem } from '../types';

/** Rotas da V2. Tudo mora debaixo de /v2 para a prévia não sair do site novo. */
export type RotaV2 =
  | { pagina: 'inicio'; ancora?: string }
  | { pagina: 'obras'; ancora?: string }
  | { pagina: 'foto'; obra: ObraItem }
  | { pagina: 'projetar' }
  | { pagina: 'orcamento' }
  | { pagina: 'legal'; documento: '/privacidade' | '/termos' }
  | { pagina: 'nao-encontrada' };

export const BASE_V2 = '/v2';

export const caminhoFoto = (obra: ObraItem) => `${BASE_V2}/obras/${obra.id}`;

/** Lê o endereço (com ou sem barra no fim, com ou sem âncora). */
export function lerRotaV2(pathname: string, hash = ''): RotaV2 {
  const limpo = pathname.replace(/\/+$/, '') || '/';
  const ancora = hash && hash.length > 1 ? hash : undefined;
  if (limpo === BASE_V2) return { pagina: 'inicio', ancora };
  const resto = limpo.startsWith(`${BASE_V2}/`) ? limpo.slice(BASE_V2.length + 1) : null;
  if (resto === null) return { pagina: 'nao-encontrada' };
  if (resto === 'obras') return { pagina: 'obras', ancora };
  if (resto.startsWith('obras/')) {
    const obra = OBRAS_REAIS.find((o) => o.id === resto.slice('obras/'.length));
    return obra ? { pagina: 'foto', obra } : { pagina: 'nao-encontrada' };
  }
  if (resto === 'projetar') return { pagina: 'projetar' };
  if (resto === 'orcamento') return { pagina: 'orcamento' };
  if (resto === 'privacidade' || resto === 'termos') return { pagina: 'legal', documento: `/${resto}` };
  return { pagina: 'nao-encontrada' };
}

const NOME = EMPRESA.nome;

/** Título e descrição de cada página (aparecem na aba e, quando a V2 for ao ar, no Google). */
export function metaV2(rota: RotaV2): { titulo: string; descricao: string } {
  switch (rota.pagina) {
    case 'obras':
      return {
        titulo: `Obras de móveis planejados em Jaú | ${NOME}`,
        descricao: `Fotos reais de ${OBRAS_REAIS.length} obras da Império em Jaú: cozinhas, quartos e lojas, com o acabamento de cada peça.`,
      };
    case 'foto':
      return {
        titulo: `${rota.obra.titulo} | Império Jaú`,
        descricao: `${rota.obra.cota}. Projeto de arquitetura e marcenaria próprios da Império Móveis Planejados.`,
      };
    case 'projetar':
      return {
        titulo: `Projete seu móvel planejado em 3D | ${NOME}`,
        descricao: 'Monte a sua cozinha ou quarto em 3D, de graça, ajuste medidas e acabamentos e mande a imagem para orçar.',
      };
    case 'orcamento':
      return {
        titulo: `Pedir orçamento de móveis planejados | ${NOME}`,
        descricao: 'Conte o que você quer planejar e receba a resposta pelo WhatsApp. Projeto de arquitetura incluso.',
      };
    case 'legal':
      return rota.documento === '/privacidade'
        ? { titulo: `Política de Privacidade | ${NOME}`, descricao: 'Como tratamos os dados de quem visita o site e pede orçamento (LGPD).' }
        : { titulo: `Termos de Uso | ${NOME}`, descricao: 'Regras de uso do site, do projeto 3D online e do pedido de orçamento.' };
    case 'nao-encontrada':
      return { titulo: `Página não encontrada | ${NOME}`, descricao: 'Esta página não existe.' };
    default:
      return {
        titulo: 'Império Móveis Planejados | Construímos o cenário dos seus melhores dias',
        descricao: 'Arquitetura e marcenaria sob medida em Jaú e região. Projeto de arquitetura incluso.',
      };
  }
}

/** Opção do formulário de orçamento que corresponde ao ambiente da obra. */
export function ambienteDoBriefing(obra: ObraItem): string {
  if (obra.ambiente === 'cozinhas') return 'Cozinha';
  if (obra.ambiente === 'quartos') return 'Quarto';
  if (obra.ambiente === 'lojas') return 'Comercial';
  return 'Outro';
}

export const ROTULO_AMBIENTE: Record<string, string> = {
  cozinhas: 'Cozinhas',
  quartos: 'Quartos',
  lojas: 'Lojas e comércio',
};
