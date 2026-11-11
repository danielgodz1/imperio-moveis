import { describe, expect, it } from 'vitest';
import dados from './catalogo.json';
import { CatalogoSchema } from './catalogoSchema';
import { CATALOGO, RUGOSIDADE, deslocamentoVeio, materialPorId, materiaisPorUso, sementeDe } from './catalogo';
import { ACABAMENTOS_3D } from '../acabamentos';
import { LAYOUTS_INICIAIS } from '../../components/quarto3d/schema';

describe('catálogo de materiais', () => {
  it('o JSON passa na validação e não repete ids', () => {
    const r = CatalogoSchema.safeParse(dados);
    expect(r.success ? '' : JSON.stringify(r.error.issues)).toBe('');
    expect(new Set(CATALOGO.map((m) => m.id)).size).toBe(CATALOGO.length);
  });

  it('recusa mapa fora de /materiais/ e cor inválida', () => {
    const ruim = structuredClone(dados);
    ruim.acabamentos[0].mapas.baseColor = 'https://outro-site.com/x.jpg';
    expect(CatalogoSchema.safeParse(ruim).success).toBe(false);
    const cor = structuredClone(dados);
    cor.acabamentos[0].cor = 'marrom';
    expect(CatalogoSchema.safeParse(cor).success).toBe(false);
  });

  it('cobre todos os usos do configurador', () => {
    for (const uso of ['frente', 'caixaria', 'tampo', 'puxador', 'vitrine'] as const) {
      expect(materiaisPorUso(uso).length).toBeGreaterThan(0);
    }
    expect(materialPorId('branco-neve')?.uso).toContain('caixaria');
  });

  it('nada inventado: tudo começa como exemplo, sem fabricante', () => {
    CATALOGO.forEach((m) => {
      expect(m.confirmado).toBe(false);
      expect(m.fabricante).toBe('');
    });
  });

  it('mantém os ids usados por projetos salvos, pelo hero e pela API', () => {
    const usados = ['freijo-ripado', 'verde-salvia', 'branco-neve', 'preto-fosco', 'cinza-urbano', 'areia-acetinado'];
    usados.forEach((id) => expect(ACABAMENTOS_3D.some((a) => a.id === id)).toBe(true));
    Object.values(LAYOUTS_INICIAIS).forEach((l) =>
      l.modulos.forEach((m) => {
        expect(materialPorId(m.acabamento)).toBeDefined();
        if (m.tampo) expect(materialPorId(m.tampo)?.uso).toContain('tampo');
      })
    );
  });

  it('fosco, acetinado e brilho têm rugosidades bem distintas', () => {
    expect(RUGOSIDADE.fosco - RUGOSIDADE.acetinado).toBeGreaterThan(0.25);
    expect(RUGOSIDADE.acetinado - RUGOSIDADE.brilho).toBeGreaterThan(0.25);
  });

  it('madeira repete a cada 1,2 m: sem repetição visível numa porta vista a 1 m', () => {
    materiaisPorUso('frente')
      .filter((m) => m.tipo === 'madeirado')
      .forEach((m) => expect(m.escalaCm).toBeGreaterThanOrEqual(100));
  });
});

describe('deslocamento do veio por peça', () => {
  it('é estável para a mesma peça e muda entre peças vizinhas', () => {
    const porta1 = sementeDe(2, 0, -0.3, 1.2, 0.59);
    const porta2 = sementeDe(2, 1, 0.3, 1.2, 0.59);
    expect(sementeDe(2, 0, -0.3, 1.2, 0.59)).toBe(porta1);
    expect(porta1).not.toBe(porta2);
    expect(deslocamentoVeio(porta1)).toEqual(deslocamentoVeio(porta1));
    expect(deslocamentoVeio(porta1)).not.toEqual(deslocamentoVeio(porta2));
  });
});
