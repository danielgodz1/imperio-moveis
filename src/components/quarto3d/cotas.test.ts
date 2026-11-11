import { describe, expect, it } from 'vitest';
import { Instancia } from './motorGeometrico';
import { LAYOUTS_INICIAIS } from './schema';
import { corrente, cotasElevacao, cotasPlanta, medida } from './cotas';

const quarto = LAYOUTS_INICIAIS.quarto;
const modulos = quarto.modulos as Instancia[];
const dim = quarto.dimensoes;

describe('corrente de cotas', () => {
  it('soma exatamente o comprimento da parede, com folgas e peças', () => {
    const trechos = corrente([[-1.2, -0.4], [0.1, 0.9]], -1.9, 1.9);
    expect(trechos.reduce((s, [a, b]) => s + (b - a), 0)).toBeCloseTo(3.8);
    expect(trechos).toHaveLength(5);
  });

  it('não cria trecho menor que 5 cm', () => {
    const trechos = corrente([[-1.9, 0.02]], -1.9, 1.9);
    trechos.forEach(([a, b]) => expect(b - a).toBeGreaterThanOrEqual(0.05 - 1e-9));
  });
});

describe('planta', () => {
  const cotas = cotasPlanta(modulos, quarto.aberturas, dim);

  it('traz a largura e a profundidade totais do ambiente', () => {
    const textos = cotas.map((c) => c.texto);
    expect(textos).toContain('380');
    expect(textos).toContain('350');
  });

  it('cada cota mostra a própria medida em cm', () => {
    cotas.forEach((c) => expect(Number(c.texto)).toBe(Math.round(medida(c) * 100)));
  });

  it('peça solta (ilha) ganha largura e profundidade', () => {
    const c = LAYOUTS_INICIAIS.cozinha;
    const ilha = (c.modulos as Instancia[]).find((m) => m.id === 'ilha')!;
    const textos = cotasPlanta(c.modulos as Instancia[], c.aberturas, c.dimensoes).map((x) => x.texto);
    expect(textos).toContain(String(Math.round(ilha.largura_m * 100)));
    expect(textos).toContain(String(Math.round(ilha.profundidade_m * 100)));
  });
});

describe('elevação', () => {
  it('parede do fundo: corrente soma a largura, pé-direito ao lado', () => {
    const cotas = cotasElevacao(modulos, quarto.aberturas, dim, 'N');
    const embaixo = cotas.filter((c) => c.de[1] === -0.3 && c.ate[1] === -0.3);
    expect(embaixo.reduce((s, c) => s + medida(c), 0)).toBeCloseTo(dim.largura_m);
    expect(cotas.map((c) => c.texto)).toContain(String(Math.round(dim.pe_direito_m * 100)));
  });

  it('janela mostra peitoril e altura', () => {
    const cotas = cotasElevacao(modulos, quarto.aberturas, dim, 'L');
    const textos = cotas.map((c) => c.texto);
    expect(textos).toContain('100');
    expect(textos).toContain('110');
  });

  it('as cotas ficam na face interna da parede pedida', () => {
    cotasElevacao(modulos, quarto.aberturas, dim, 'O').forEach((c) => {
      expect(c.de[0]).toBeCloseTo(-dim.largura_m / 2 + 0.02);
      expect(c.ate[0]).toBeCloseTo(-dim.largura_m / 2 + 0.02);
    });
  });
});

describe('peças sobrepostas', () => {
  it('mesa de cabeceira sobre o painel não quebra a corrente: fica a medida da cabeceira', () => {
    const cotas = cotasElevacao(modulos, quarto.aberturas, dim, 'N');
    const cabeceira = modulos.find((m) => m.id === 'cabeceira-ripada-led')!;
    const embaixo = cotas.filter((c) => c.de[1] === -0.3).map((c) => c.texto);
    expect(embaixo).toContain(String(Math.round(cabeceira.largura_m * 100)));
    expect(embaixo).toHaveLength(3);
  });
});
