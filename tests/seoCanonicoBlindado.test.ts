import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DOMINIO_CANONICO, EMPRESA } from '../src/data/empresa';
import {
  METADADOS_ROTAS_SEO,
  PAGINAS_AMBIENTES_LOCAIS,
  gerarEntidadeOrganizacaoSchema,
  gerarImageObjectSchema,
  gerarSuperGrafoJsonLd,
} from '../src/data/paginasLocais';
import { perguntasConfirmadas } from '../src/data/perguntas';

const TERMOS_PROIBIDOS =
  /Reclame Aqui|Mogi das Cruzes|desconto no PIX|Arauco|Duratex|Guararapes|100% no prazo|100% de entregas no prazo|zero processos|financiamento pr[oó]prio sem banco/i;

describe('Conformidade Google Search Essentials e Domínio Canônico Único', () => {
  it('usa exclusivamente https://www.imperiomoveisplanejadosjau.com.br em EMPRESA e todas as rotas SEO', () => {
    expect(DOMINIO_CANONICO).toBe('https://www.imperiomoveisplanejadosjau.com.br');
    expect(EMPRESA.url).toBe(DOMINIO_CANONICO);
    for (const meta of Object.values(METADADOS_ROTAS_SEO)) {
      expect(meta.canonical.startsWith(DOMINIO_CANONICO)).toBe(true);
      expect(meta.ogImage.startsWith(DOMINIO_CANONICO)).toBe(true);
    }
  });

  it('não inclui aggregateRating nem review self-serving no JSON-LD de LocalBusiness/FurnitureStore', () => {
    const org = gerarEntidadeOrganizacaoSchema();
    const superGrafo = gerarSuperGrafoJsonLd();
    expect(org).not.toHaveProperty('aggregateRating');
    expect(org).not.toHaveProperty('review');
    expect(JSON.stringify(superGrafo)).not.toContain('"aggregateRating"');
    expect(JSON.stringify(superGrafo)).not.toContain('"review"');
  });

  it('gera ImageObject com os 5 metadados obrigatórios, creator Organization e sem âncora #', () => {
    const img = gerarImageObjectSchema({
      url: '/obras/cozinha-gringa-4k.jpg',
      name: 'Cozinha planejada sob medida em Jaú',
      caption: 'Cozinha planejada 100% MDF em Jaú/SP',
    });
    expect(img['@type']).toBe('ImageObject');
    expect(img.url).toBe(`${DOMINIO_CANONICO}/obras/cozinha-gringa-4k.jpg`);
    expect(img.contentUrl).toBe(`${DOMINIO_CANONICO}/obras/cozinha-gringa-4k.jpg`);
    expect(img.license).toBe(`${DOMINIO_CANONICO}/termos`);
    expect(img.acquireLicensePage).toBe(`${DOMINIO_CANONICO}/contato`);
    expect(String(img.license)).not.toContain('#');
    expect(String(img.acquireLicensePage)).not.toContain('#');
    expect(img.creditText).toBe('Projeto executado por Império Móveis Planejados Jaú');
    expect(img.copyrightNotice).toContain('48.945.152/0001-93');
    expect(img.creator).toEqual({
      '@type': 'Organization',
      '@id': `${DOMINIO_CANONICO}/#organization`,
      name: 'Império Móveis Planejados Jaú',
      url: `${DOMINIO_CANONICO}/`,
    });
  });

  it('não contém marcas de MDF nem promessas ou acusações proibidas nos dados, FAQ e llms.txt', () => {
    const llms = readFileSync('public/llms.txt', 'utf-8');
    const llmsFull = readFileSync('public/llms-full.txt', 'utf-8');
    const corpus = JSON.stringify({
      EMPRESA,
      METADADOS_ROTAS_SEO,
      PAGINAS_AMBIENTES_LOCAIS,
      faq: perguntasConfirmadas(),
      llms,
      llmsFull,
    });
    expect(corpus).not.toMatch(TERMOS_PROIBIDOS);
    expect(perguntasConfirmadas()[0].pergunta).toBe(
      'Qual é o endereço e o CNPJ oficial da Império Móveis Planejados em Jaú?'
    );
  });

  it('possui os silos especialistas anti-doorway com conteúdo 100% distinto', () => {
    expect(PAGINAS_AMBIENTES_LOCAIS).toHaveProperty('/marcenaria-em-jau');
    expect(PAGINAS_AMBIENTES_LOCAIS).toHaveProperty('/cozinhas-planejadas-jau');
    expect(PAGINAS_AMBIENTES_LOCAIS).toHaveProperty('/quartos-e-closets-planejados-jau');
    const h1s = Object.values(PAGINAS_AMBIENTES_LOCAIS).map((p) => p.h1);
    expect(new Set(h1s).size).toBe(h1s.length);
  });
});
