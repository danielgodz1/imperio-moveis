import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { OBRAS_REAIS } from '../data/portfolioData';
import { ROTAS_AMBIENTE, caminhoFoto } from './rotasV2';

const config = JSON.parse(readFileSync('vercel.json', 'utf-8')) as {
  rewrites: { source: string; destination: string }[];
  redirects: { source: string; destination: string; permanent: boolean }[];
};
// Cada endereço aponta para o próprio index.html gerado no build (único formato que a Vercel serviu certo).
const fontes = new Set(config.rewrites.filter((r) => r.destination === `${r.source}/index.html`).map((r) => r.source));
const redirecoes = new Map(config.redirects.map((r) => [r.source, r.destination]));

describe('vercel.json', () => {
  it('cada página do site e cada foto abrem direto pelo endereço', () => {
    for (const rota of ['/obras', '/projetar', '/projetos-3d', '/contato', '/privacidade', '/termos', ...ROTAS_AMBIENTE]) expect(fontes.has(rota)).toBe(true);
    for (const obra of OBRAS_REAIS) expect(fontes.has(caminhoFoto(obra))).toBe(true);
  });

  it('a versão anterior (V1) continua em /v1', () => {
    for (const rota of ['/v1', '/v1/contato', '/v1/obras', '/v1/projetar', '/v1/cozinhas-planejadas-jau']) expect(fontes.has(rota)).toBe(true);
  });

  it('links antigos da prévia /v2 levam ao endereço novo (308)', () => {
    expect(redirecoes.get('/v2')).toBe('/');
    expect(redirecoes.get('/v2/orcamento')).toBe('/contato');
    for (const obra of OBRAS_REAIS) expect(redirecoes.get(`/v2${caminhoFoto(obra)}`)).toBe(caminhoFoto(obra));
    expect(config.redirects.every((r) => r.permanent)).toBe(true);
  });
});
