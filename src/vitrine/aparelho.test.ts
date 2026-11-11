import { describe, expect, it } from 'vitest';
import { perfilQualidade } from './aparelho';

const aparelho = (faixa: 0 | 1 | 2 | 3, movel: boolean) => ({ faixa, movel, gpu: '', motivo: 'teste' });

describe('perfil de qualidade por aparelho', () => {
  it('todo aparelho tem anti-serrilhado (era o que dava aspecto de jogo no celular)', () => {
    for (const faixa of [0, 1, 2, 3] as const) for (const movel of [false, true]) expect(perfilQualidade(aparelho(faixa, movel)).antialias).toBe(true);
  });

  it('computador forte liga tudo: sombra de 2048 px e quinas com chanfro suave', () => {
    const p = perfilQualidade(aparelho(3, false));
    expect(p).toMatchObject({ leve: false, sombras: true, mapaSombra: 2048, bisel: 2 });
    expect(p.dpr).toEqual([1, 2]);
  });

  it('celular bom tem sombra suave menor, textura leve e resolução até 2x', () => {
    const p = perfilQualidade(aparelho(2, true));
    expect(p).toMatchObject({ leve: true, sombras: true, mapaSombra: 1024, bisel: 1 });
    expect(p.dpr).toEqual([1, 2]);
  });

  it('aparelho de entrada não gasta com sombra real, mas mantém bordas limpas', () => {
    const p = perfilQualidade(aparelho(1, true));
    expect(p).toMatchObject({ leve: true, sombras: false, mapaSombra: 0, antialias: true });
    expect(p.dpr[1]).toBeLessThanOrEqual(1.5);
  });

  it('quanto mais fraco o aparelho, menor o custo (sombra e resolução)', () => {
    const forte = perfilQualidade(aparelho(3, false));
    const medio = perfilQualidade(aparelho(2, true));
    const fraco = perfilQualidade(aparelho(1, true));
    expect(forte.mapaSombra).toBeGreaterThan(medio.mapaSombra);
    expect(medio.mapaSombra).toBeGreaterThan(fraco.mapaSombra);
    expect(fraco.dpr[1]).toBeLessThanOrEqual(medio.dpr[1]);
  });
});
