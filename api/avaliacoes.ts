import { criarLimitador, ipDoVisitante } from './_seguranca.js';

/**
 * Avaliações reais do Perfil da Empresa no Google, pela API do Google Places (New).
 * A chave fica só na Vercel (GOOGLE_PLACES_API_KEY); GOOGLE_PLACE_ID é opcional (sem ele,
 * a função acha o lugar pelo nome e cidade). A resposta fica em cache na Vercel por 1 dia,
 * então a API do Google é chamada poucas vezes por dia.
 */

interface Requisicao {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

interface Resposta {
  status: (codigo: number) => Resposta;
  json: (corpo: unknown) => unknown;
  setHeader: (nome: string, valor: string) => unknown;
}

export interface AvaliacaoGoogle {
  autor: string;
  autorUrl?: string;
  foto?: string;
  nota: number;
  texto: string;
  quando: string;
}

export interface RespostaAvaliacoes {
  nota: number;
  total: number;
  url?: string;
  avaliacoes: AvaliacaoGoogle[];
}

const BUSCA = 'Império Móveis Planejados Jaú SP';
const LIMITE_TEXTO = 600;
const permitir = criarLimitador(30, 60_000);

interface ReviewApi {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
}

/** Converte a resposta da API do Google no formato do site (só o necessário, texto limitado). */
export function converterLugar(lugar: {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: ReviewApi[];
}): RespostaAvaliacoes {
  const avaliacoes = (lugar.reviews ?? [])
    .map((r) => ({
      autor: r.authorAttribution?.displayName?.trim() || 'Cliente no Google',
      autorUrl: r.authorAttribution?.uri,
      foto: r.authorAttribution?.photoUri,
      nota: Math.max(1, Math.min(5, Math.round(r.rating ?? 5))),
      texto: (r.text?.text ?? r.originalText?.text ?? '').trim().slice(0, LIMITE_TEXTO),
      quando: r.relativePublishTimeDescription ?? '',
    }))
    .filter((a) => a.texto.length > 0);
  return {
    nota: Math.round((lugar.rating ?? 0) * 10) / 10,
    total: lugar.userRatingCount ?? 0,
    url: lugar.googleMapsUri,
    avaliacoes,
  };
}

async function acharLugar(chave: string): Promise<string | null> {
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': chave, 'X-Goog-FieldMask': 'places.id' },
    body: JSON.stringify({ textQuery: BUSCA, languageCode: 'pt-BR', regionCode: 'BR' }),
    signal: AbortSignal.timeout(5000),
  });
  if (!r.ok) return null;
  const dados = (await r.json()) as { places?: Array<{ id: string }> };
  return dados.places?.[0]?.id ?? null;
}

export default async function handler(req: Requisicao, res: Resposta) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Use GET.' });
  if (!permitir(ipDoVisitante(req))) return res.status(429).json({ erro: 'Muitas tentativas.' });

  const chave = process.env.GOOGLE_PLACES_API_KEY;
  if (!chave) return res.status(503).json({ erro: 'Avaliações do Google ainda não configuradas.' });

  try {
    const id = process.env.GOOGLE_PLACE_ID || (await acharLugar(chave));
    if (!id || !/^[\w-]+$/.test(id)) return res.status(502).json({ erro: 'Perfil do Google não encontrado.' });
    const r = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=pt-BR`, {
      headers: { 'X-Goog-Api-Key': chave, 'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews' },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return res.status(502).json({ erro: 'O Google não respondeu agora.' });
    // Cache na borda da Vercel: 1 dia, e até 1 semana servindo a última versão enquanto atualiza.
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('Vercel-CDN-Cache-Control', 'max-age=86400, stale-while-revalidate=604800');
    return res.status(200).json(converterLugar(await r.json()));
  } catch {
    return res.status(502).json({ erro: 'O Google não respondeu agora.' });
  }
}
