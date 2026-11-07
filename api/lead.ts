import { z } from 'zod';

/**
 * Rota opcional /api/lead para persistência ou encaminhamento a webhook/planilha.
 * Desligada por padrão no cliente (VITE_SALVAR_LEADS=false).
 */

export const SchemaLeadOrcamento = z.object({
  nome: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(10).max(30),
  cidade: z.string().trim().min(2).max(120).default('Jaú'),
  ambientes: z.array(z.string().trim().min(1).max(60)).min(1).max(10),
  fase: z.enum(['Só planejando', 'Imóvel em obra', 'Pronto para medir']),
  medidas: z.string().trim().max(300).optional().default(''),
  temFotosOuPlanta: z.boolean().optional().default(false),
  observacoes: z.string().trim().max(600).optional().default(''),
  resumo3D: z.string().trim().max(600).optional().default(''),
  consentimentoLgpd: z.literal(true),
  website: z.string().max(0).optional().default(''),
});

const JANELA_MS = 60_000;
const LIMITE_POR_JANELA = 6;
const mapaRateLimitLead = new Map<string, { cont: number; inicio: number }>();

function verificarRateLimitLead(ip: string): boolean {
  const agora = Date.now();
  const atual = mapaRateLimitLead.get(ip);
  if (!atual || agora - atual.inicio > JANELA_MS) {
    mapaRateLimitLead.set(ip, { cont: 1, inicio: agora });
    return true;
  }
  if (atual.cont >= LIMITE_POR_JANELA) {
    return false;
  }
  atual.cont += 1;
  return true;
}

export async function processarLeadOrcamento(
  body: unknown,
  ip: string
): Promise<{ status: number; json: Record<string, unknown> }> {
  if (!verificarRateLimitLead(ip)) {
    return {
      status: 429,
      json: { erro: 'Muitas tentativas em sequência. Aguarde um minuto.' },
    };
  }

  // Honeypot preenchido por bot
  if (
    typeof body === 'object' &&
    body !== null &&
    'website' in body &&
    typeof (body as { website?: unknown }).website === 'string' &&
    ((body as { website: string }).website.trim().length > 0)
  ) {
    return { status: 200, json: { ok: true } };
  }

  const validado = SchemaLeadOrcamento.safeParse(body);
  if (!validado.success) {
    return {
      status: 400,
      json: {
        erro: 'Dados de orçamento inválidos.',
        detalhes: validado.error.issues.map((i) => i.message),
      },
    };
  }

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validado.data,
          recebidoEm: new Date().toISOString(),
        }),
      });
    } catch {
      // Continua sem bloquear o retorno ao visitante
    }
  }

  return {
    status: 200,
    json: { ok: true },
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ erro: 'Método não permitido. Use POST.' });
    return;
  }

  const ip =
    (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  const resultado = await processarLeadOrcamento(req.body, ip);
  res.status(resultado.status).json(resultado.json);
}
