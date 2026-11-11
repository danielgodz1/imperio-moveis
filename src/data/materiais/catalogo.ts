import dados from './catalogo.json';

/**
 * Tipos do catálogo. O JSON é validado nos testes (`catalogoSchema.ts`) e não em tempo de
 * execução, para o zod não entrar no pacote do hero.
 */
export type TipoMaterial = 'madeirado' | 'unicolor' | 'laca' | 'pedra' | 'metal' | 'vidro';
export type Superficie = 'fosco' | 'acetinado' | 'brilho';
export type Uso = 'frente' | 'caixaria' | 'tampo' | 'puxador' | 'vitrine';

export interface MaterialCatalogo {
  id: string;
  nome: string;
  fabricante: string;
  tipo: TipoMaterial;
  acabamento: Superficie;
  cor: string;
  escalaCm: number;
  veio: 'comprimento' | 'nenhum';
  uso: Uso[];
  mapas: { baseColor: string; normal: string; roughness: string };
  confirmado: boolean;
}

export const CATALOGO = dados.acabamentos as MaterialCatalogo[];

const POR_ID = new Map(CATALOGO.map((m) => [m.id, m]));

export function materialPorId(id: string): MaterialCatalogo | undefined {
  return POR_ID.get(id);
}

export function materiaisPorUso(uso: Uso): MaterialCatalogo[] {
  return CATALOGO.filter((m) => m.uso.includes(uso));
}

/**
 * Rugosidade base de cada superfície (0 = espelho, 1 = totalmente fosco).
 * Fosco espalha a luz; acetinado tem reflexo suave; brilho reflete o ambiente e ganha verniz.
 */
export const RUGOSIDADE: Record<Superficie, number> = {
  fosco: 0.78,
  acetinado: 0.42,
  brilho: 0.1,
};

/**
 * Deslocamento do veio por peça, em metros, para duas portas vizinhas não repetirem o mesmo desenho.
 * Determinístico: a mesma peça sempre recebe o mesmo deslocamento.
 */
export function deslocamentoVeio(semente: number): [number, number] {
  const a = Math.abs(Math.sin(semente * 12.9898 + 78.233) * 43758.5453) % 1;
  const b = Math.abs(Math.sin(semente * 39.3468 + 11.135) * 24634.6345) % 1;
  return [a * 2.4, b * 1.2];
}

/** Semente estável a partir de números (posição e medidas da peça). */
export function sementeDe(...valores: number[]): number {
  let h = 2166136261;
  for (const v of valores) {
    h ^= Math.round(v * 1000);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}
