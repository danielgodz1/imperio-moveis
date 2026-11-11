import { describe, expect, it } from 'vitest';
import { CATALOGO_MODULOS_CENARIO, CENARIOS_AMBIENTES, ModuloId } from '../../data/cenarios';
import {
  Abertura,
  caixaAbertura,
  caixasModulo,
  faixaAbertura,
  instanciaPadrao,
  normalizarInstancia,
  prenderAbertura,
  validarLayout,
  xLocalNaParede,
} from './motorGeometrico';
import { LAYOUTS_INICIAIS, QuartoLayoutSchema, VERSAO_LAYOUT, normalizarLayout } from './schema';
import { criarEstadoEditor } from './estadoEditor';

const rotulo = (id: ModuloId) => CATALOGO_MODULOS_CENARIO[id].rotulo;
const DIM = { largura_m: 4, profundidade_m: 3, pe_direito_m: 2.7 };

describe('ambientes', () => {
  it('cada ambiente tem arquivo próprio com módulos iniciais permitidos', () => {
    for (const [id, amb] of Object.entries(CENARIOS_AMBIENTES)) {
      expect(amb.id).toBe(id);
      for (const m of amb.modulosIniciais) expect(amb.modulosPermitidos).toContain(m);
      for (const m of amb.modulosPermitidos) expect(CATALOGO_MODULOS_CENARIO[m].ambientes).toContain(id);
    }
  });

  it('banheiro abre sem conflitos e passa no schema', () => {
    const b = LAYOUTS_INICIAIS.banheiro;
    expect(QuartoLayoutSchema.safeParse(b).success).toBe(true);
    expect(validarLayout(b.modulos as never, b.aberturas, b.dimensoes, rotulo).size).toBe(0);
  });
});

describe('portas e janelas', () => {
  it('faixa vertical vem do peitoril e da altura', () => {
    expect(faixaAbertura({ tipo: 'janela', parede: 'N', largura_m: 1, posicaoOffset_m: 0, peitoril_m: 1.6, altura_m: 0.5 })).toEqual({
      y0: 1.6,
      y1: 2.1,
    });
    expect(faixaAbertura({ tipo: 'porta', parede: 'S', largura_m: 0.8, posicaoOffset_m: 0 })).toEqual({ y0: 0, y1: 2.1 });
  });

  it('prende a abertura dentro da parede, em passos de 5 cm', () => {
    const ab = prenderAbertura({ tipo: 'janela', parede: 'L', largura_m: 1.23, posicaoOffset_m: 9, peitoril_m: 1.02, altura_m: 3 }, DIM);
    expect(ab.largura_m).toBeCloseTo(1.25);
    expect(ab.posicaoOffset_m + ab.largura_m / 2).toBeLessThanOrEqual(DIM.profundidade_m / 2 - 0.05 + 1e-9);
    expect(ab.peitoril_m).toBeCloseTo(1.0);
    expect((ab.peitoril_m ?? 0) + (ab.altura_m ?? 0)).toBeLessThanOrEqual(DIM.pe_direito_m);
  });

  it('porta sempre começa no piso', () => {
    expect(prenderAbertura({ tipo: 'porta', parede: 'S', largura_m: 0.8, posicaoOffset_m: 0, peitoril_m: 0.5 }, DIM).peitoril_m).toBe(0);
  });

  // A parede L estava espelhada no desenho em relação ao motor.
  it.each(['N', 'S', 'O', 'L'] as const)('abertura e móvel na parede %s usam o mesmo eixo', (parede) => {
    const ab: Abertura = { tipo: 'janela', parede, largura_m: 0.8, posicaoOffset_m: 0.6, peitoril_m: 0.3, altura_m: 1.5 };
    const movel = normalizarInstancia({ ...instanciaPadrao('nichos-led', DIM, 'freijo-ripado'), parede, offset_m: 0.6 }, DIM);
    const cA = caixaAbertura(ab, DIM);
    const [cM] = caixasModulo(movel, DIM);
    const centro = (c: { minX: number; maxX: number; minZ: number; maxZ: number }) =>
      parede === 'N' || parede === 'S' ? (c.minX + c.maxX) / 2 : (c.minZ + c.maxZ) / 2;
    expect(centro(cA)).toBeCloseTo(centro(cM));
    expect(validarLayout([movel], [ab], DIM, rotulo).get(movel.uid)).toBe('cobre a janela');
  });

  it('X local do desenho bate com a rotação de cada parede', () => {
    const rot = { N: 0, S: Math.PI, O: Math.PI / 2, L: -Math.PI / 2 } as const;
    for (const parede of ['N', 'S', 'O', 'L'] as const) {
      const x = xLocalNaParede(parede, 0.7);
      // Rotação em Y leva (x, 0, 0) para (x·cos, 0, -x·sin) no mundo.
      const mundo = parede === 'N' || parede === 'S' ? x * Math.cos(rot[parede]) : -x * Math.sin(rot[parede]);
      expect(mundo).toBeCloseTo(0.7);
    }
  });
});

describe('migração de layout', () => {
  it('layout v1 (sem peitoril e sem versão) é completado', () => {
    const v1 = structuredClone(LAYOUTS_INICIAIS.quarto);
    delete v1.versao;
    v1.aberturas = v1.aberturas.map(({ tipo, parede, largura_m, posicaoOffset_m }) => ({ tipo, parede, largura_m, posicaoOffset_m }));
    const lido = QuartoLayoutSchema.parse(v1);
    const n = normalizarLayout(lido);
    expect(n.versao).toBe(VERSAO_LAYOUT);
    expect(n.aberturas.every((a) => a.peitoril_m !== undefined && a.altura_m !== undefined)).toBe(true);
  });
});

describe('estado do editor', () => {
  const novo = () => criarEstadoEditor(LAYOUTS_INICIAIS.quarto);

  it('desfaz e refaz uma ação pontual', () => {
    const e = novo();
    e.getState().aplicar((l) => ({ ...l, led: !l.led }));
    expect(e.getState().layout.led).toBe(false);
    e.getState().desfazer();
    expect(e.getState().layout.led).toBe(true);
    e.getState().refazer();
    expect(e.getState().layout.led).toBe(false);
  });

  it('um gesto contínuo vira um só passo de histórico', () => {
    const e = novo();
    for (let i = 1; i <= 5; i++) e.getState().durante((l) => ({ ...l, dimensoes: { ...l.dimensoes, largura_m: 3.8 + i * 0.05 } }));
    e.getState().fimGesto();
    expect(e.getState().passado).toHaveLength(1);
    e.getState().desfazer();
    expect(e.getState().layout.dimensoes.largura_m).toBeCloseTo(3.8);
  });

  it('nova ação apaga o refazer', () => {
    const e = novo();
    e.getState().aplicar((l) => ({ ...l, noite: true }));
    e.getState().desfazer();
    e.getState().aplicar((l) => ({ ...l, led: false }));
    expect(e.getState().futuro).toHaveLength(0);
  });
});
