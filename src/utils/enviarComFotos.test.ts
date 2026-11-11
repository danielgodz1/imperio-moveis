import { describe, expect, it } from 'vitest';
import { MAX_FOTOS, filtrarFotos, podeCompartilharArquivos } from './enviarComFotos';

const arquivo = (nome: string, tipo: string, mb = 1) => new File([new Uint8Array(Math.round(mb * 1024 * 1024))], nome, { type: tipo });

describe('fotos do pedido de orçamento', () => {
  it('aceita fotos e PDF; recusa outros tipos e arquivos grandes', () => {
    const r = filtrarFotos([], [arquivo('a.jpg', 'image/jpeg'), arquivo('p.pdf', 'application/pdf'), arquivo('v.mp4', 'video/mp4'), arquivo('g.png', 'image/png', 16)]);
    expect(r.aceitas.map((f) => f.name)).toEqual(['a.jpg', 'p.pdf']);
    expect(r.recusadas).toHaveLength(2);
  });

  it(`para em ${MAX_FOTOS} arquivos e não repete o mesmo arquivo`, () => {
    const varias = Array.from({ length: MAX_FOTOS + 2 }, (_, i) => arquivo(`f${i}.jpg`, 'image/jpeg', 0.01));
    const r = filtrarFotos([], [...varias, varias[0]]);
    expect(r.aceitas).toHaveLength(MAX_FOTOS);
    expect(filtrarFotos(r.aceitas.slice(0, 1), [r.aceitas[0]]).aceitas).toHaveLength(1);
  });

  it('sem arquivos, não tenta compartilhar', () => {
    expect(podeCompartilharArquivos([])).toBe(false);
  });
});
