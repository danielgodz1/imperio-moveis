import { describe, expect, it } from 'vitest';
import { Abertura, Instancia, caixasModulo } from './motorGeometrico';
import { LAYOUTS_INICIAIS, QuartoLayoutSchema } from './schema';
import {
  ALTURA_OLHOS,
  COR_TEMPERATURA,
  TEMPERATURAS_LED,
  cameraFoto,
  luzDaJanela,
  manchasDeContato,
} from './iluminacao';

const DIM = { largura_m: 4, profundidade_m: 3.4, pe_direito_m: 2.7 };

describe('LED', () => {
  it('quanto menor a temperatura, mais quente (menos azul) a cor', () => {
    const azul = (hex: string) => parseInt(hex.slice(5, 7), 16);
    const [a, b, c] = TEMPERATURAS_LED.map((t) => azul(COR_TEMPERATURA[t]));
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
  });

  it('o projeto guarda a temperatura e recusa valores fora da lista', () => {
    expect(QuartoLayoutSchema.safeParse({ ...LAYOUTS_INICIAIS.quarto, temperaturaLed: 2700 }).success).toBe(true);
    expect(QuartoLayoutSchema.safeParse({ ...LAYOUTS_INICIAIS.quarto, temperaturaLed: 6500 }).success).toBe(false);
  });
});

describe('luz da janela', () => {
  it.each(['N', 'S', 'O', 'L'] as const)('janela na parede %s: sol vem de fora e mira dentro do ambiente', (parede) => {
    const janela: Abertura = { tipo: 'janela', parede, largura_m: 1.2, posicaoOffset_m: 0.3, peitoril_m: 1, altura_m: 1.1 };
    const luz = luzDaJanela([janela], DIM)!;
    const dentro = (x: number, z: number) => Math.abs(x) < DIM.largura_m / 2 && Math.abs(z) < DIM.profundidade_m / 2;
    expect(dentro(luz.posicao[0], luz.posicao[2])).toBe(false);
    expect(dentro(luz.alvo[0], luz.alvo[2])).toBe(true);
    expect(luz.posicao[1]).toBeGreaterThan(2.1);
  });

  it('sem janela, não há sol direcional', () => {
    expect(luzDaJanela([{ tipo: 'porta', parede: 'S', largura_m: 0.8, posicaoOffset_m: 0 }], DIM)).toBeNull();
  });
});

describe('sombra de contato', () => {
  it('uma mancha por caixa da peça, um pouco maior que a pegada', () => {
    const l = LAYOUTS_INICIAIS.cozinha;
    const modulos = l.modulos as Instancia[];
    const manchas = manchasDeContato(modulos, l.dimensoes);
    const caixasBaixas = modulos.flatMap((m) => caixasModulo(m, l.dimensoes)).filter((c) => c.minY < 1.2);
    expect(manchas).toHaveLength(caixasBaixas.length);
    manchas.forEach((s, i) => expect(s.largura).toBeGreaterThan(caixasBaixas[i].maxX - caixasBaixas[i].minX));
  });

  it('aéreo e forro (acima de 1,20 m) não fazem mancha no piso', () => {
    const l = LAYOUTS_INICIAIS.cozinha;
    const aereo = (l.modulos as Instancia[]).filter((m) => m.id === 'armarios-altos' || m.id === 'forro-ripado-teto');
    expect(manchasDeContato(aereo, l.dimensoes)).toHaveLength(0);
  });
});

describe('modo foto', () => {
  it('câmera dentro do ambiente, na altura dos olhos, olhando para o fundo', () => {
    const f = cameraFoto(DIM);
    expect(f.posicao[1]).toBe(ALTURA_OLHOS);
    expect(Math.abs(f.posicao[2])).toBeLessThan(DIM.profundidade_m / 2);
    expect(f.alvo[2]).toBeLessThan(f.posicao[2]);
  });
});
