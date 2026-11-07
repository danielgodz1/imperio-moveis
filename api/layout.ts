import {
  QuartoLayoutSchema,
  construirLayoutDoCenario,
} from '../src/components/quarto3d/schema';

const REGISTRO_IP = new Map<string, { contagem: number; expiraEm: number }>();

function removerDadosPessoais(texto: string): string {
  return texto
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REMOVIDO]')
    .replace(/\b\d{2,3}[\s.-]?\d{4,5}[\s.-]?\d{4}\b/g, '[REMOVIDO]')
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[REMOVIDO]');
}

interface VercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: { descricao?: unknown };
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const ipRaw = req.headers['x-forwarded-for'] || 'local';
  const ip = Array.isArray(ipRaw) ? ipRaw[0] : String(ipRaw).split(',')[0].trim();
  const agora = Date.now();
  const janelaMs = 10 * 60 * 1000;
  const atual = REGISTRO_IP.get(ip);

  if (atual && agora < atual.expiraEm) {
    if (atual.contagem >= 8) {
      return res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos.' });
    }
    atual.contagem += 1;
  } else {
    REGISTRO_IP.set(ip, { contagem: 1, expiraEm: agora + janelaMs });
  }

  const descricaoBruta =
    typeof req.body?.descricao === 'string' ? req.body.descricao.slice(0, 400) : '';
  const descricaoLimpa = removerDadosPessoais(descricaoBruta).toLowerCase();

  if (!descricaoLimpa) {
    return res.status(400).json({ erro: 'Descrição vazia' });
  }

  const comodoDetectado = descricaoLimpa.includes('cozinha')
    ? 'cozinha'
    : descricaoLimpa.includes('closet')
    ? 'closet'
    : descricaoLimpa.includes('office') || descricaoLimpa.includes('escrit')
    ? 'home-office'
    : 'quarto';

  const base = construirLayoutDoCenario(comodoDetectado, 'freijo-ripado');
  const matchMedidas = descricaoLimpa.match(/(\d+[.,]?\d*)\s*[x×por]+\s*(\d+[.,]?\d*)/);

  const largura = matchMedidas
    ? Math.min(6.5, Math.max(2.2, parseFloat(matchMedidas[1].replace(',', '.'))))
    : base.dimensoes.largura_m;
  const profundidade = matchMedidas
    ? Math.min(6.0, Math.max(2.2, parseFloat(matchMedidas[2].replace(',', '.'))))
    : base.dimensoes.profundidade_m;

  const acabamentoSugerido = descricaoLimpa.includes('verde')
    ? 'verde-salvia'
    : descricaoLimpa.includes('cinza')
    ? 'cinza-urbano'
    : descricaoLimpa.includes('preto')
    ? 'preto-fosco'
    : descricaoLimpa.includes('areia') || descricaoLimpa.includes('branco')
    ? 'areia-acetinado'
    : 'freijo-ripado';

  const layoutHeuristico = {
    ...base,
    dimensoes: {
      largura_m: largura,
      profundidade_m: profundidade,
      pe_direito_m: base.dimensoes.pe_direito_m,
    },
    modulos: base.modulos.map((m) => ({
      ...m,
      acabamento: acabamentoSugerido,
    })),
    led: !descricaoLimpa.includes('sem led'),
  };

  const validado = QuartoLayoutSchema.safeParse(layoutHeuristico);
  if (!validado.success) {
    return res.status(200).json(base);
  }

  return res.status(200).json(validado.data);
}
