import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PROJETOS_3D, linkProjeto3D } from '../data/projetos3d';
import { OBRAS_REAIS } from '../data/portfolioData';
import { ROTAS_AMBIENTE, caminhoFoto, lerRotaV2, metaFoto, metaV2 } from './rotasV2';

describe('rotas do site (V2 na raiz)', () => {
  it('lê a home com e sem barra e guarda a âncora', () => {
    expect(lerRotaV2('/')).toEqual({ pagina: 'inicio', ancora: undefined });
    expect(lerRotaV2('/', '#v2-processo')).toEqual({ pagina: 'inicio', ancora: '#v2-processo' });
  });

  it('abre a página de cada foto pelo id da obra', () => {
    for (const obra of OBRAS_REAIS) expect(lerRotaV2(caminhoFoto(obra))).toEqual({ pagina: 'foto', obra });
  });

  it('mantém os endereços que o Google já conhece', () => {
    expect(lerRotaV2('/obras', '#cozinhas')).toEqual({ pagina: 'obras', ancora: '#cozinhas' });
    expect(lerRotaV2('/projetar').pagina).toBe('projetar');
    expect(lerRotaV2('/projetos-3d').pagina).toBe('projetos3d');
    expect(lerRotaV2('/projetos-3d/').pagina).toBe('projetos3d');
    expect(lerRotaV2('/contato').pagina).toBe('orcamento');
    expect(lerRotaV2('/termos')).toEqual({ pagina: 'legal', documento: '/termos' });
    for (const r of ROTAS_AMBIENTE) expect(lerRotaV2(r)).toEqual({ pagina: 'ambiente', rota: r });
    expect(lerRotaV2('/obras/nao-existe').pagina).toBe('nao-encontrada');
    expect(lerRotaV2('/qualquer').pagina).toBe('nao-encontrada');
  });

  it('título de cada foto é único e curto, canônico na raiz', () => {
    const titulos = OBRAS_REAIS.map((o) => metaFoto(o).titulo);
    expect(new Set(titulos).size).toBe(titulos.length);
    for (const t of titulos) expect(t.length).toBeLessThanOrEqual(70);
    expect(metaV2({ pagina: 'orcamento' }).canonico).toBe('https://www.imperiomoveisplanejadosjau.com.br/contato');
  });

  it('projetos 3D: cada imagem tem as 5 variantes e cada link abre o projeto no editor', () => {
    const ids = PROJETOS_3D.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PROJETOS_3D) {
      for (const sufixo of ['.jpg', '-800.avif', '-800.webp', '-1600.avif', '-1600.webp']) expect(existsSync(`public${p.arquivo}${sufixo}`)).toBe(true);
      if (p.projeto) expect(linkProjeto3D(p)).toMatch(/^\/projetar#projeto=z\./);
    }
    expect(metaV2({ pagina: 'projetos3d' }).canonico).toBe('https://www.imperiomoveisplanejadosjau.com.br/projetos-3d');
  });
});
