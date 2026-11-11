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

/** Motivo informado pelo Google (ex.: faturamento desativado, API não ativada), sem a chave. */
async function motivoGoogle(r: Response): Promise<string> {
  try {
    const corpo = (await r.json()) as { error?: { status?: string; message?: string } };
    const msg = (corpo.error?.message ?? '').replace(/AIza[\w-]{20,}/g, '[chave]').slice(0, 300);
    return `${r.status} ${corpo.error?.status ?? ''} ${msg}`.trim();
  } catch {
    return String(r.status);
  }
}

async function acharLugar(chave: string): Promise<{ id?: string; motivo?: string }> {
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': chave, 'X-Goog-FieldMask': 'places.id' },
    body: JSON.stringify({ textQuery: BUSCA, languageCode: 'pt-BR', regionCode: 'BR' }),
    signal: AbortSignal.timeout(5000),
  });
  if (!r.ok) return { motivo: await motivoGoogle(r) };
  const dados = (await r.json()) as { places?: Array<{ id: string }> };
  const id = dados.places?.[0]?.id;
  return id ? { id } : { motivo: 'nenhum lugar encontrado na busca' };
}

export default async function handler(req: Requisicao, res: Resposta) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Use GET.' });
  if (!permitir(ipDoVisitante(req))) return res.status(429).json({ erro: 'Muitas tentativas.' });

  const indisponivel = (motivo: string) => {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ nota: 0, total: 0, avaliacoes: [], indisponivel: motivo });
  };

  const chave = process.env.GOOGLE_PLACES_API_KEY;
  if (!chave) return indisponivel('Avaliações do Google ainda não configuradas.');

  try {
    const busca = process.env.GOOGLE_PLACE_ID ? { id: process.env.GOOGLE_PLACE_ID } : await acharLugar(chave);
    const id = busca.id;
    if (!id || !/^[\w-]+$/.test(id)) return indisponivel(`Perfil do Google não encontrado: ${busca.motivo ?? ''}`.trim());
    const r = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=pt-BR`, {
      headers: { 'X-Goog-Api-Key': chave, 'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews' },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return indisponivel(`O Google não respondeu: ${await motivoGoogle(r)}`);
    // Cache na borda da Vercel: 1 dia, e até 1 semana servindo a última versão enquanto atualiza.
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('Vercel-CDN-Cache-Control', 'max-age=86400, stale-while-revalidate=604800');
    return res.status(200).json(converterLugar(await r.json()));
  } catch {
    return indisponivel('O Google não respondeu a tempo.');
  }
}
