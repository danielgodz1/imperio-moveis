import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { OBRAS_REAIS } from '../data/portfolioData';
import { caminhoFoto } from './rotasV2';

const config = JSON.parse(readFileSync('vercel.json', 'utf-8')) as { rewrites: { source: string; destination: string }[] };
// Cada endereço aponta para o próprio index.html (gerado no build); /v2 também.
const fontes = new Set(config.rewrites.filter((r) => r.destination === `${r.source}/index.html`).map((r) => r.source));

describe('vercel.json da V2', () => {
  it('abre cada página interna da V2 direto pelo endereço (sem 404 ao recarregar)', () => {
    for (const rota of ['/v2', '/v2/obras', '/v2/projetar', '/v2/orcamento', '/v2/privacidade', '/v2/termos']) {
      expect(fontes.has(rota)).toBe(true);
    }
    for (const obra of OBRAS_REAIS) expect(fontes.has(caminhoFoto(obra))).toBe(true);
  });
});
