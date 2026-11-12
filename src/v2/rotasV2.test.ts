import { describe, expect, it } from 'vitest';
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
});
