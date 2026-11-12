import { OBRAS_REAIS } from '../data/portfolioData';
import { EMPRESA } from '../data/empresa';
import { METADADOS_ROTAS_SEO, PAGINAS_AMBIENTES_LOCAIS } from '../data/paginasLocais';
import type { ObraItem } from '../types';

/**
 * Rotas do site (V2, em produção na raiz do domínio). Os endereços são os mesmos que o Google
 * já conhece da V1 (/obras, /contato, páginas de ambiente...), mais uma página por foto de obra.
 * A versão anterior do site continua em /v1 (ver App.tsx).
 */
export type RotaAmbiente = keyof typeof PAGINAS_AMBIENTES_LOCAIS;

export type RotaV2 =
  | { pagina: 'inicio'; ancora?: string }
  | { pagina: 'obras'; ancora?: string }
  | { pagina: 'foto'; obra: ObraItem }
  | { pagina: 'ambiente'; rota: RotaAmbiente }
  | { pagina: 'projetar' }
  | { pagina: 'orcamento' }
  | { pagina: 'legal'; documento: '/privacidade' | '/termos' }
  | { pagina: 'nao-encontrada' };

export const caminhoFoto = (obra: ObraItem) => `/obras/${obra.id}`;

export const ROTAS_AMBIENTE = Object.keys(PAGINAS_AMBIENTES_LOCAIS) as RotaAmbiente[];

/** Nome curto de cada página de ambiente (trilha, links e lista de outros ambientes). */
export const NOME_AMBIENTE: Record<RotaAmbiente, string> = {
  '/cozinhas-planejadas-jau': 'Cozinhas planejadas',
  '/quartos-planejados-jau': 'Quartos planejados',
  '/closets-sob-medida-jau': 'Closets sob medida',
  '/home-office-planejado-jau': 'Home office e comércio',
};

/** Páginas de foto: o build grava um HTML em cada uma e o vercel.json aponta cada endereço para ele. */
export const ROTAS_FOTOS = OBRAS_REAIS.map(caminhoFoto);

/** Lê o endereço (com ou sem barra no fim, com ou sem âncora). */
export function lerRotaV2(pathname: string, hash = ''): RotaV2 {
  const limpo = pathname.replace(/\/+$/, '') || '/';
  const ancora = hash && hash.length > 1 ? hash : undefined;
  if (limpo === '/') return { pagina: 'inicio', ancora };
  if (limpo === '/obras') return { pagina: 'obras', ancora };
  if (limpo.startsWith('/obras/')) {
    const obra = OBRAS_REAIS.find((o) => o.id === limpo.slice('/obras/'.length));
    return obra ? { pagina: 'foto', obra } : { pagina: 'nao-encontrada' };
  }
  if (limpo === '/projetar') return { pagina: 'projetar' };
  if (limpo === '/contato' || limpo === '/orcamento') return { pagina: 'orcamento' };
  if (limpo === '/privacidade' || limpo === '/termos') return { pagina: 'legal', documento: limpo };
  if ((ROTAS_AMBIENTE as string[]).includes(limpo)) return { pagina: 'ambiente', rota: limpo as RotaAmbiente };
  return { pagina: 'nao-encontrada' };
}

const NOME = EMPRESA.nome;

/** Título, descrição e endereço canônico de cada página (os mesmos do HTML pré-renderizado). */
export function metaV2(rota: RotaV2): { titulo: string; descricao: string; canonico: string } {
  const seo = (r: keyof typeof METADADOS_ROTAS_SEO) => ({
    titulo: METADADOS_ROTAS_SEO[r].title,
    descricao: METADADOS_ROTAS_SEO[r].description,
    canonico: METADADOS_ROTAS_SEO[r].canonical,
  });
  switch (rota.pagina) {
    case 'obras':
      return seo('/obras');
    case 'foto':
      return metaFoto(rota.obra);
    case 'ambiente':
      return seo(rota.rota);
    case 'projetar':
      return seo('/projetar');
    case 'orcamento':
      return seo('/contato');
    case 'legal':
      return seo(rota.documento);
    case 'nao-encontrada':
      return { titulo: `Página não encontrada | ${NOME}`, descricao: 'Esta página não existe.', canonico: `${EMPRESA.url}/` };
    default:
      return seo('/');
  }
}

/** Meta da página de uma foto de obra (título curto, descrição com a cota da obra). */
export function metaFoto(obra: ObraItem): { titulo: string; descricao: string; canonico: string } {
  return {
    titulo: `${obra.titulo} | Império Jaú`,
    descricao: `${obra.cota}. Projeto de arquitetura e marcenaria próprios da Império Móveis Planejados, em Jaú/SP.`,
    canonico: `${EMPRESA.url}${caminhoFoto(obra)}`,
  };
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
