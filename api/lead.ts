import { z } from 'zod';
import { criarLimitador, ipDoVisitante, validarOrigem } from './_seguranca.js';

/**
 * Rota opcional /api/lead para persistência ou encaminhamento a webhook/planilha.
 * Desligada por padrão no cliente (VITE_SALVAR_LEADS=false).
 */

export const SchemaLeadOrcamento = z.object({
  nome: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().regex(/^[\d\s()+-]{10,20}$/, 'WhatsApp inválido.'),
  cidade: z.string().trim().min(2).max(120).default('Jaú'),
  ambientes: z.array(z.string().trim().min(1).max(60)).min(1).max(10),
  /** Quando quer começar (substitui a antiga "fase"). */
  prazo: z.string().trim().max(60).optional().default(''),
  /** Estilo desejado para a cotação, se o cliente tiver um. */
  estilo: z.string().trim().max(60).optional().default(''),
  fase: z.string().trim().max(60).optional().default(''),
  medidas: z.string().trim().max(300).optional().default(''),
  temFotosOuPlanta: z.boolean().optional().default(false),
  observacoes: z.string().trim().max(600).optional().default(''),
  resumo3D: z.string().trim().max(600).optional().default(''),
  consentimentoLgpd: z.literal(true),
  website: z.string().max(0).optional().default(''),
});

const permitirLead = criarLimitador(6, 60_000);
const TEMPO_WEBHOOK_MS = 5_000;

export async function processarLeadOrcamento(
  body: unknown,
  ip: string
): Promise<{ status: number; json: Record<string, unknown> }> {
  if (!permitirLead(ip)) {
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
        signal: AbortSignal.timeout(TEMPO_WEBHOOK_MS),
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
  const bloqueio = validarOrigem(req);
  if (bloqueio) {
    res.status(bloqueio.status).json({ erro: bloqueio.erro });
    return;
  }

  const resultado = await processarLeadOrcamento(req.body, ipDoVisitante(req));
  res.status(resultado.status).json(resultado.json);
}
