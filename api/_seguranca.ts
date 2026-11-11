/**
 * Proteções comuns às rotas /api (arquivo com "_" não vira rota na Vercel).
 */

interface RequisicaoBasica {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

function cabecalho(req: RequisicaoBasica, nome: string): string {
  const valor = req.headers[nome];
  return (Array.isArray(valor) ? valor[0] : valor) ?? '';
}

/** IP do visitante: na Vercel o x-forwarded-for é reescrito pela própria plataforma. */
export function ipDoVisitante(req: RequisicaoBasica): string {
  return cabecalho(req, 'x-forwarded-for').split(',')[0].trim() || req.socket?.remoteAddress || 'desconhecido';
}

/**
 * Só aceita POST JSON vindo do próprio site. Bloqueia formulários e scripts de outros domínios
 * (CSRF) e chamadas com outro tipo de conteúdo.
 */
export function validarOrigem(req: RequisicaoBasica): { status: number; erro: string } | null {
  if (req.method !== 'POST') return { status: 405, erro: 'Método não permitido. Use POST.' };
  if (!cabecalho(req, 'content-type').toLowerCase().startsWith('application/json')) {
    return { status: 415, erro: 'Envie os dados em JSON.' };
  }
  const origem = cabecalho(req, 'origin');
  if (origem) {
    try {
      if (new URL(origem).host !== cabecalho(req, 'host')) return { status: 403, erro: 'Origem não permitida.' };
    } catch {
      return { status: 403, erro: 'Origem não permitida.' };
    }
  }
  return null;
}

/**
 * Limite de tentativas por IP numa janela de tempo. Em funções serverless o mapa vive por instância,
 * então é uma barreira contra rajadas, não um limite global.
 */
export function criarLimitador(limite: number, janelaMs: number, maxIps = 5000) {
  const registros = new Map<string, { contagem: number; expiraEm: number }>();
  return (ip: string): boolean => {
    const agora = Date.now();
    if (registros.size > maxIps) {
      for (const [chave, r] of registros) if (r.expiraEm <= agora) registros.delete(chave);
      if (registros.size > maxIps) registros.clear();
    }
    const atual = registros.get(ip);
    if (!atual || atual.expiraEm <= agora) {
      registros.set(ip, { contagem: 1, expiraEm: agora + janelaMs });
      return true;
    }
    if (atual.contagem >= limite) return false;
    atual.contagem += 1;
    return true;
  };
}
