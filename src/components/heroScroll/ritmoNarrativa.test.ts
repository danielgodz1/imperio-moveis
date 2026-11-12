import { describe, expect, it } from 'vitest';
import { ANDAMENTO_CONCLUIDO, TEMPO_MINIMO_S, avancarAndamento, posicaoSegura } from './ritmoNarrativa';

/** Simula quadros de 60 fps até o andamento chegar ao alvo; devolve os segundos gastos. */
function tempoAte(alvo: number, inicio = 0) {
  let a = inicio;
  let t = 0;
  while (Math.abs(a - alvo) > 1e-6 && t < 60) {
    a = avancarAndamento(a, alvo, 1 / 60);
    t += 1 / 60;
  }
  return t;
}

describe('ritmo da narrativa do hero', () => {
  it('rolagem até o fim de uma vez leva pelo menos o tempo mínimo, mas não muito mais', () => {
    const t = tempoAte(1);
    expect(t).toBeGreaterThanOrEqual(TEMPO_MINIMO_S - 0.05);
    expect(t).toBeLessThan(TEMPO_MINIMO_S + 1.5);
  });

  it('rolagem pequena acompanha rápido, como antes', () => {
    expect(tempoAte(0.32, 0.3)).toBeLessThan(1);
  });

  it('volta para cima com o mesmo limite e nunca sai de 0 a 1', () => {
    expect(tempoAte(0, 1)).toBeGreaterThanOrEqual(TEMPO_MINIMO_S - 0.05);
    expect(avancarAndamento(0.999, 2, 1)).toBeLessThanOrEqual(1);
    expect(avancarAndamento(0.001, -1, 1)).toBeGreaterThanOrEqual(0);
  });

  it('nunca anda mais que o limite num quadro longo', () => {
    expect(avancarAndamento(0, 1, 0.5)).toBeCloseTo(0.5 / TEMPO_MINIMO_S, 5);
  });
});

describe('trava da página durante a montagem', () => {
  const fim = 2400;
  it('segura no fim do hero enquanto a montagem não termina', () => {
    expect(posicaoSegura(5000, fim, 0.4, false)).toBe(fim);
    expect(posicaoSegura(1200, fim, 0.4, false)).toBeNull();
  });

  it('solta depois de concluir ou quando o cliente navega por um link', () => {
    expect(posicaoSegura(5000, fim, ANDAMENTO_CONCLUIDO, false)).toBeNull();
    expect(posicaoSegura(5000, fim, 0.4, true)).toBeNull();
  });
});
