import { afterEach, describe, expect, it } from 'vitest';
import handler, { converterLugar } from '../api/avaliacoes';

const resposta = () => {
  const r = { codigo: 0, corpo: null as unknown, headers: {} as Record<string, string> };
  const res = {
    status(c: number) {
      r.codigo = c;
      return res;
    },
    json(b: unknown) {
      r.corpo = b;
      return res;
    },
    setHeader(n: string, v: string) {
      r.headers[n] = v;
      return res;
    },
  };
  return { r, res };
};

describe('avaliações do Google', () => {
  const chaveOriginal = process.env.GOOGLE_PLACES_API_KEY;
  afterEach(() => {
    process.env.GOOGLE_PLACES_API_KEY = chaveOriginal;
  });

  it('converte a resposta do Places: autor, nota, texto limitado e crédito', () => {
    const d = converterLugar({
      rating: 4.86,
      userRatingCount: 8,
      googleMapsUri: 'https://maps.google.com/?cid=1',
      reviews: [
        {
          rating: 5,
          text: { text: '  Ótimo trabalho!  ' },
          relativePublishTimeDescription: 'há 2 meses',
          authorAttribution: { displayName: 'Maria', uri: 'https://maps.google.com/contrib/1', photoUri: 'https://lh3.googleusercontent.com/a' },
        },
        { rating: 4, text: { text: '' }, authorAttribution: { displayName: 'Sem texto' } },
        { rating: 5, originalText: { text: 'x'.repeat(900) } },
      ],
    });
    expect(d.nota).toBe(4.9);
    expect(d.total).toBe(8);
    expect(d.avaliacoes).toHaveLength(2);
    expect(d.avaliacoes[0]).toMatchObject({ autor: 'Maria', texto: 'Ótimo trabalho!', quando: 'há 2 meses', nota: 5 });
    expect(d.avaliacoes[1].autor).toBe('Cliente no Google');
    expect(d.avaliacoes[1].texto.length).toBe(600);
  });

  it('sem a chave na Vercel responde 503 (o site mostra só o resumo)', async () => {
    delete process.env.GOOGLE_PLACES_API_KEY;
    const { r, res } = resposta();
    await handler({ method: 'GET', headers: {} }, res);
    expect(r.codigo).toBe(503);
  });

  it('só aceita GET', async () => {
    const { r, res } = resposta();
    await handler({ method: 'POST', headers: {} }, res);
    expect(r.codigo).toBe(405);
  });
});
