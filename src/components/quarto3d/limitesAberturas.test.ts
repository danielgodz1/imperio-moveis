import { describe, expect, it } from 'vitest';
import { LIMITE_ABERTURAS, contarAberturas, podeAdicionarAbertura } from './limitesAberturas';
import type { Abertura } from './motorGeometrico';

const porta: Abertura = { tipo: 'porta', parede: 'S', largura_m: 0.8, posicaoOffset_m: 0, peitoril_m: 0, altura_m: 2.1 };
const janela: Abertura = { tipo: 'janela', parede: 'L', largura_m: 1, posicaoOffset_m: 0, peitoril_m: 1, altura_m: 1.1 };

describe('limite de portas e janelas', () => {
  it('conta cada tipo separado', () => {
    expect(contarAberturas([porta, janela, janela], 'janela')).toBe(2);
    expect(contarAberturas([porta, janela, janela], 'porta')).toBe(1);
  });

  it('para de adicionar no limite e volta a aceitar depois de remover', () => {
    const portas = Array.from({ length: LIMITE_ABERTURAS.porta }, () => porta);
    expect(podeAdicionarAbertura(portas, 'porta')).toBe(false);
    expect(podeAdicionarAbertura(portas.slice(1), 'porta')).toBe(true);
    // Portas no limite não travam as janelas.
    expect(podeAdicionarAbertura(portas, 'janela')).toBe(true);
  });

  it('limites razoáveis para um cômodo', () => {
    expect(LIMITE_ABERTURAS.porta).toBeGreaterThanOrEqual(1);
    expect(LIMITE_ABERTURAS.janela).toBeLessThanOrEqual(4);
  });
});
