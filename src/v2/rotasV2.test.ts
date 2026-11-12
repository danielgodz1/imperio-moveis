import { describe, expect, it } from 'vitest';
import { OBRAS_REAIS } from '../data/portfolioData';
import { caminhoFoto, lerRotaV2, metaV2 } from './rotasV2';

describe('rotas da V2', () => {
  it('lê a home com e sem barra e guarda a âncora', () => {
    expect(lerRotaV2('/v2')).toEqual({ pagina: 'inicio', ancora: undefined });
    expect(lerRotaV2('/v2/', '#v2-processo')).toEqual({ pagina: 'inicio', ancora: '#v2-processo' });
  });

  it('abre a página de cada foto pelo id da obra', () => {
    for (const obra of OBRAS_REAIS) {
      const rota = lerRotaV2(caminhoFoto(obra));
      expect(rota).toEqual({ pagina: 'foto', obra });
    }
  });

  it('reconhece as páginas internas e manda o resto para a 404', () => {
    expect(lerRotaV2('/v2/obras', '#cozinhas')).toEqual({ pagina: 'obras', ancora: '#cozinhas' });
    expect(lerRotaV2('/v2/projetar').pagina).toBe('projetar');
    expect(lerRotaV2('/v2/orcamento').pagina).toBe('orcamento');
    expect(lerRotaV2('/v2/termos')).toEqual({ pagina: 'legal', documento: '/termos' });
    expect(lerRotaV2('/v2/obras/nao-existe').pagina).toBe('nao-encontrada');
    expect(lerRotaV2('/v2/qualquer').pagina).toBe('nao-encontrada');
    expect(lerRotaV2('/v2x').pagina).toBe('nao-encontrada');
  });

  it('dá título único e curto para cada foto', () => {
    const titulos = OBRAS_REAIS.map((o) => metaV2({ pagina: 'foto', obra: o }).titulo);
    expect(new Set(titulos).size).toBe(titulos.length);
    for (const t of titulos) expect(t.length).toBeLessThanOrEqual(70);
  });
});
