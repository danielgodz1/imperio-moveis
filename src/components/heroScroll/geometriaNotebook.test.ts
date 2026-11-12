import { describe, expect, it } from 'vitest';
import { FAIXAS_NOTEBOOK, TEMPO_ABERTO_S, calcularLayout, tempoNotebook } from './geometriaNotebook';

describe('palco do notebook', () => {
  it('a tampa abre no começo e o vídeo para aberto', () => {
    expect(tempoNotebook(0)).toBe(0);
    expect(tempoNotebook(FAIXAS_NOTEBOOK.abrir.fim)).toBeCloseTo(TEMPO_ABERTO_S);
    expect(tempoNotebook(0.9)).toBeCloseTo(TEMPO_ABERTO_S);
  });

  for (const [nome, W, H] of [
    ['computador', 1440, 900],
    ['celular', 390, 844],
  ] as const) {
    it(`${nome}: sem zoom, a tela fica inteira dentro do palco`, () => {
      const l = calcularLayout({ largura: W, altura: H, zoom: 0 });
      expect(l.tela.x).toBeGreaterThanOrEqual(0);
      expect(l.tela.y).toBeGreaterThanOrEqual(0);
      expect(l.tela.x + l.tela.w).toBeLessThanOrEqual(W);
      expect(l.tela.y + l.tela.h).toBeLessThanOrEqual(H);
    });

    it(`${nome}: com zoom total, a tela cobre o palco e a câmera enquadra o palco inteiro`, () => {
      const l = calcularLayout({ largura: W, altura: H, zoom: 1 });
      expect(l.tela.x).toBeLessThanOrEqual(0);
      expect(l.tela.y).toBeLessThanOrEqual(0);
      expect(l.tela.x + l.tela.w).toBeGreaterThanOrEqual(W);
      expect(l.tela.y + l.tela.h).toBeGreaterThanOrEqual(H);
      for (const [k, v] of Object.entries({ u0: 0, u1: 1, v0: 0, v1: 1 })) expect(l.telaCamera[k as keyof typeof l.telaCamera]).toBeCloseTo(v, 6);
      expect(l.recorte).toEqual({ topo: 0, direita: 0, base: 0, esquerda: 0 });
    });
  }

  it('a tela cresce sem pular conforme o zoom avança', () => {
    let anterior = 0;
    for (let z = 0; z <= 1.0001; z += 0.05) {
      const w = calcularLayout({ largura: 1440, altura: 900, zoom: z }).tela.w;
      expect(w).toBeGreaterThanOrEqual(anterior);
      anterior = w;
    }
  });

  it('o deslocamento lateral some quando a tela chega ao centro', () => {
    const l0 = calcularLayout({ largura: 1440, altura: 900, zoom: 0, deslocX: 280 });
    const l1 = calcularLayout({ largura: 1440, altura: 900, zoom: 1, deslocX: 280 });
    expect(l0.tela.x + l0.tela.w / 2).toBeCloseTo(720 + 280, 0);
    expect(l1.tela.x + l1.tela.w / 2).toBeCloseTo(720, 0);
  });
});
