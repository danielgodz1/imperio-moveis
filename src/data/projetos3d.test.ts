import { describe, expect, it } from 'vitest';
import { PROJETOS_3D } from './projetos3d';
import { decodificarProjeto } from '../components/quarto3d/resumoProjeto';

describe('projetos 3D da galeria', () => {
  it('cada link "Abrir no 3D" abre um projeto válido no editor', async () => {
    for (const p of PROJETOS_3D.filter((x) => x.projeto)) {
      const layout = await decodificarProjeto(p.projeto!);
      expect(layout, p.id).toBeTruthy();
      expect((layout as { modulos?: unknown[] }).modulos?.length ?? 0, p.id).toBeGreaterThan(0);
    }
  });
});
