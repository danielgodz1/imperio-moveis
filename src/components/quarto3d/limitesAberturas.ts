import type { Abertura } from './motorGeometrico';

/**
 * Quantas portas e janelas um ambiente aceita no configurador.
 * Um cômodo real raramente passa disso, e sem limite o cliente empilhava aberturas sem fim.
 */
export const LIMITE_ABERTURAS: Record<Abertura['tipo'], number> = { porta: 2, janela: 3 };

export function contarAberturas(aberturas: readonly Abertura[], tipo: Abertura['tipo']): number {
  return aberturas.filter((a) => a.tipo === tipo).length;
}

export function podeAdicionarAbertura(aberturas: readonly Abertura[], tipo: Abertura['tipo']): boolean {
  return contarAberturas(aberturas, tipo) < LIMITE_ABERTURAS[tipo];
}
