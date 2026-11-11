import { describe, expect, it } from 'vitest';
import { CATALOGO_MODULOS_CENARIO, CENARIOS_AMBIENTES, ModuloId } from '../../data/cenarios';
import {
  caixasModulo,
  instanciaPadrao,
  moverPara,
  normalizarInstancia,
  poseModulo,
  validarLayout,
} from './motorGeometrico';
import { LAYOUTS_INICIAIS, QuartoLayoutSchema } from './schema';

const rotulo = (id: ModuloId) => CATALOGO_MODULOS_CENARIO[id].rotulo;
const QUARTO = CENARIOS_AMBIENTES.quarto.dimensoesPadrao;

describe('motor geométrico (comportamento atual)', () => {
  it('layouts iniciais passam no schema', () => {
    for (const layout of Object.values(LAYOUTS_INICIAIS)) {
      expect(QuartoLayoutSchema.safeParse(layout).success).toBe(true);
    }
  });

  it('nenhum móvel inicial passa do limite do ambiente', () => {
    for (const layout of Object.values(LAYOUTS_INICIAIS)) {
      const problemas = validarLayout(layout.modulos as never, layout.aberturas, layout.dimensoes, rotulo);
      for (const msg of problemas.values()) expect(msg).not.toBe('passa do limite do ambiente');
    }
  });

  it('o schema recusa módulo de outro ambiente', () => {
    const layout = structuredClone(LAYOUTS_INICIAIS.quarto);
    layout.modulos.push({ ...layout.modulos[0], id: 'ilha' });
    expect(QuartoLayoutSchema.safeParse(layout).success).toBe(false);
  });

  it('detecta dois móveis no mesmo lugar', () => {
    const a = instanciaPadrao('guarda-roupa', QUARTO, 'freijo-ripado');
    const b = { ...a, uid: 'outro' };
    const problemas = validarLayout([a, b], [], QUARTO, rotulo);
    expect(problemas.get(a.uid)).toMatch(/encosta em/);
    expect(problemas.get('outro')).toMatch(/encosta em/);
  });

  it('gaveteiro pode ficar sob a bancada de trabalho', () => {
    const dim = CENARIOS_AMBIENTES['home-office'].dimensoesPadrao;
    const bancada = instanciaPadrao('bancada-trabalho', dim, 'freijo-ripado');
    const gaveteiro = { ...instanciaPadrao('gaveteiro', dim, 'freijo-ripado'), offset_m: bancada.offset_m };
    const problemas = validarLayout([bancada, gaveteiro], [], dim, rotulo);
    expect(problemas.size).toBe(0);
  });

  it('guarda-roupa na frente da janela é marcado', () => {
    const gr = normalizarInstancia(
      { ...instanciaPadrao('guarda-roupa', QUARTO, 'freijo-ripado'), parede: 'N', offset_m: 0.9 },
      QUARTO
    );
    const janela = { tipo: 'janela' as const, parede: 'N' as const, largura_m: 1.2, posicaoOffset_m: 1.0 };
    expect(validarLayout([gr], [janela], QUARTO, rotulo).get(gr.uid)).toBe('cobre a janela');
  });

  it('mover arredonda em 5 cm e prende na parede', () => {
    const gr = instanciaPadrao('guarda-roupa', QUARTO, 'freijo-ripado');
    const movido = moverPara(gr, 0, 0.123, QUARTO);
    expect(Math.round(movido.offset_m * 100) % 5).toBe(0);
    const longe = moverPara(gr, 0, 99, QUARTO);
    expect(longe.offset_m + longe.largura_m / 2).toBeLessThanOrEqual(QUARTO.profundidade_m / 2 + 1e-9);
  });

  it('caixa de colisão e desenho partem da mesma pose', () => {
    const gr = instanciaPadrao('guarda-roupa', QUARTO, 'freijo-ripado');
    const pose = poseModulo(gr, QUARTO);
    const [caixa] = caixasModulo(gr, QUARTO);
    expect(caixa.minX).toBeCloseTo(pose.posicao[0]);
    expect(caixa.maxY - caixa.minY).toBeCloseTo(gr.altura_m);
  });
});
