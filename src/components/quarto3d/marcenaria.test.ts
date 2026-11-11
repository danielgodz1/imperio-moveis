import { describe, expect, it } from 'vitest';
import {
  ESPESSURA,
  LARGURA_MAX_PORTA,
  Marcenaria,
  envoltoriaDasPecas,
  gerarAereo,
  gerarBalcao,
  gerarGuardaRoupa,
  quantidadeVaos,
  resolverVaos,
} from './marcenaria';

const portasDeAbrir = (m: Marcenaria) => m.frentes.filter((f) => f.movimento.tipo === 'giro');
const semPuxador = (m: Marcenaria): Marcenaria => ({
  fixas: m.fixas.filter((p) => p.material !== 'metal' || p.tamanho[0] > 0.3),
  frentes: m.frentes.map((f) => ({ ...f, pecas: f.pecas.filter((p) => p.material !== 'metal' && p.material !== 'sombra') })),
});

describe('guarda-roupa paramétrico', () => {
  it.each([1.2, 1.6, 2.2, 2.75, 3.6, 4.2])('largura %s m: portas de até 60 cm com folga de 3 mm cobrindo a frente', (w) => {
    const m = gerarGuardaRoupa({ w, h: 2.65, d: 0.6, maleiro: false });
    const portas = portasDeAbrir(m);
    expect(portas.length).toBeGreaterThanOrEqual(2);
    portas.forEach((p) => expect(p.largura).toBeLessThanOrEqual(LARGURA_MAX_PORTA));
    const soma = portas.reduce((s, p) => s + p.largura + ESPESSURA.folga, 0);
    expect(soma).toBeCloseTo(w, 6);
  });

  it('espessuras reais: frente 18 mm, caixaria 18 mm, fundo 6 mm', () => {
    const m = gerarGuardaRoupa({ w: 2.2, h: 2.65, d: 0.6 });
    const frente = m.frentes[m.frentes.length - 1].pecas.find((p) => p.material === 'frente')!;
    expect(frente.tamanho[2]).toBeCloseTo(0.018);
    const fundo = m.fixas.find((p) => p.material === 'fundo')!;
    expect(fundo.tamanho[2]).toBeCloseTo(0.006);
    const lateral = m.fixas.find((p) => p.material === 'corpo')!;
    expect(lateral.tamanho[0]).toBeCloseTo(0.018);
  });

  it.each(['abrir', 'correr', 'sem'] as const)('portas %s: nada passa da envoltória (fora puxadores)', (portas) => {
    const w = 2.4;
    const h = 2.65;
    const d = 0.6;
    const { min, max } = envoltoriaDasPecas(semPuxador(gerarGuardaRoupa({ w, h, d, portas })));
    expect(min[0]).toBeGreaterThanOrEqual(-w / 2 - 1e-9);
    expect(max[0]).toBeLessThanOrEqual(w / 2 + 1e-9);
    expect(min[1]).toBeGreaterThanOrEqual(-1e-9);
    expect(max[1]).toBeLessThanOrEqual(h + 1e-9);
    expect(min[2]).toBeGreaterThanOrEqual(-1e-9);
    expect(max[2]).toBeLessThanOrEqual(d + 1e-9);
  });

  it('divide em vãos e respeita o interno escolhido', () => {
    expect(quantidadeVaos(2.7)).toBe(3);
    const vaos = resolverVaos(2.7, [{ interno: 'gavetas', gavetas: 4 }]);
    expect(vaos).toHaveLength(3);
    expect(vaos[0]).toEqual({ interno: 'gavetas', gavetas: 4 });
    const m = gerarGuardaRoupa({ w: 2.7, h: 2.65, d: 0.6, vaos });
    expect(m.frentes.filter((f) => f.id.startsWith('gaveta-0-'))).toHaveLength(4);
    expect(resolverVaos(1.8, [{ interno: 'gavetas', gavetas: 9 }])[0].gavetas).toBe(4);
  });

  it('maleiro ganha portas próprias; sem porta não tem frentes de porta', () => {
    const com = gerarGuardaRoupa({ w: 1.8, h: 2.65, d: 0.6, maleiro: true });
    expect(com.frentes.some((f) => f.id.startsWith('maleiro-'))).toBe(true);
    const sem = gerarGuardaRoupa({ w: 1.8, h: 2.65, d: 0.6, portas: 'sem' });
    expect(sem.frentes.filter((f) => f.tipo === 'porta')).toHaveLength(0);
  });

  it('porta de correr usa trilho duplo e desliza', () => {
    const m = gerarGuardaRoupa({ w: 2.4, h: 2.65, d: 0.6, portas: 'correr' });
    const folhas = m.frentes.filter((f) => f.movimento.tipo === 'correr');
    expect(folhas.length).toBeGreaterThanOrEqual(2);
    const zs = new Set(folhas.map((f) => f.pecas[0].posicao[2].toFixed(3)));
    expect(zs.size).toBe(2);
  });

  it('puxador: toque não tem peça; perfil e alça são metal', () => {
    const toque = gerarGuardaRoupa({ w: 1.2, h: 2.65, d: 0.6, puxador: 'toque', maleiro: false, vaos: [{ interno: 'cabideiro' }] });
    expect(portasDeAbrir(toque).every((f) => f.pecas.length === 1)).toBe(true);
    const perfil = gerarGuardaRoupa({ w: 1.2, h: 2.65, d: 0.6, puxador: 'perfil', maleiro: false, vaos: [{ interno: 'cabideiro' }] });
    expect(portasDeAbrir(perfil).every((f) => f.pecas.some((p) => p.material === 'metal'))).toBe(true);
  });

  it('dobradiças em pares abrem para fora (lados opostos)', () => {
    const portas = portasDeAbrir(gerarGuardaRoupa({ w: 1.0, h: 2.65, d: 0.6, maleiro: false }));
    expect(portas).toHaveLength(2);
    const sentidos = portas.map((p) => (p.movimento.tipo === 'giro' ? p.movimento.sentido : 0));
    expect(new Set(sentidos).size).toBe(2);
  });

  it('veio segue a maior dimensão: vertical na porta, horizontal na gaveta', () => {
    const m = gerarGuardaRoupa({ w: 1.8, h: 2.65, d: 0.6, vaos: [{ interno: 'gavetas', gavetas: 3 }, { interno: 'cabideiro' }] });
    expect(portasDeAbrir(m).find((f) => f.id.startsWith('porta-'))!.pecas[0].veio).toBe('y');
    expect(m.frentes.find((f) => f.tipo === 'gaveta')!.pecas[0].veio).toBe('x');
  });
});

describe('cozinha paramétrica', () => {
  it('balcão: módulos de até 60 cm, gaveteiro de 3, canto cego e pia com portas', () => {
    const m = gerarBalcao({ w: 3.4, h: 0.86, d: 0.62, xPia: 0.27, cantoCego: 0.62 });
    portasDeAbrir(m).forEach((p) => expect(p.largura).toBeLessThanOrEqual(LARGURA_MAX_PORTA));
    expect(m.frentes.filter((f) => f.tipo === 'gaveta')).toHaveLength(3);
    expect(m.frentes.every((f) => f.pecas[0].posicao[0] > -3.4 / 2 + 0.62 - 0.01)).toBe(true);
    const { max } = envoltoriaDasPecas(semPuxador(m));
    expect(max[1]).toBeLessThanOrEqual(0.86 + 1e-9);
  });

  it('aéreo: portas de até 60 cm', () => {
    const m = gerarAereo({ w: 3.4, h: 1.12, d: 0.38 });
    expect(portasDeAbrir(m).length).toBeGreaterThanOrEqual(6);
    portasDeAbrir(m).forEach((p) => expect(p.largura).toBeLessThanOrEqual(LARGURA_MAX_PORTA));
  });
});
