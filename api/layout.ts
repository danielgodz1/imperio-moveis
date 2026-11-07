import { QuartoLayoutSchema, LAYOUTS_INICIAIS } from '../src/components/quarto3d/schema';

// Rate limit em memória por IP (máx 8 requisições a cada 10 minutos)
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

  const estadoIp = REGISTRO_IP.get(ip);
  if (estadoIp && agora < estadoIp.expiraEm) {
    if (estadoIp.contagem >= 8) {
      return res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos.' });
    }
    estadoIp.contagem += 1;
  } else {
    REGISTRO_IP.set(ip, { contagem: 1, expiraEm: agora + janelaMs });
  }

  const descricaoBruta =
    typeof req.body?.descricao === 'string' ? req.body.descricao.trim() : '';

  if (!descricaoBruta || descricaoBruta.length > 400) {
    return res.status(400).json({ erro: 'Descrição inválida (máximo de 400 caracteres).' });
  }

  const descricaoSegura = removerDadosPessoais(descricaoBruta);
  const apiKey = process.env.GEMINI_API_KEY;

  // Se a chave GEMINI_API_KEY estiver configurada no servidor, consulta o Gemini com schema restrito
  if (apiKey) {
    try {
      const promptSistema = `Você gera apenas um JSON estrito para um configurador 3D de marcenaria.
Formato exigido:
{
  "comodo": "quarto" | "cozinha" | "closet" | "home-office",
  "dimensoes": { "largura_m": number (2.2 a 7.5), "profundidade_m": number (2.2 a 7.5), "pe_direito_m": number (2.4 a 3.5) },
  "aberturas": [{ "tipo": "porta"|"janela", "parede": "N"|"S"|"L"|"O", "pos_m": number, "largura_m": number }],
  "modulos": [{ "id": "guarda-roupa"|"cabeceira-led"|"painel-tv"|"bancada-ilha", "parede": "N"|"S"|"L"|"O", "largura_m": number, "altura_m": number, "acabamento": "freijo-ripado"|"areia-acetinado"|"verde-salvia"|"cinza-urbano"|"preto-fosco" }],
  "led": boolean
}
Pedido do usuário: ${descricaoSegura}`;

      const respostaGemini = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptSistema }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (respostaGemini.ok) {
        const dados = await respostaGemini.json();
        const textoJson = dados?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof textoJson === 'string') {
          const obj = JSON.parse(textoJson);
          const validado = QuartoLayoutSchema.safeParse(obj);
          if (validado.success) {
            return res.status(200).json(validado.data);
          }
        }
      }
    } catch {
      // Cai no interpretador determinístico local abaixo
    }
  }

  // Interpretador determinístico seguro caso a chave de IA não esteja definida
  const txt = descricaoSegura.toLowerCase();
  const comodo: 'quarto' | 'cozinha' | 'closet' | 'home-office' = txt.includes('cozinha')
    ? 'cozinha'
    : txt.includes('closet')
    ? 'closet'
    : txt.includes('office') || txt.includes('escrit')
    ? 'home-office'
    : 'quarto';

  const base = structuredClone(LAYOUTS_INICIAIS[comodo]);
  const matchMedidas = txt.match(/(\d+(?:[.,]\d+)?)\s*[x×por]\s*(\d+(?:[.,]\d+)?)/);
  if (matchMedidas) {
    const l = Math.min(7.5, Math.max(2.2, Number(matchMedidas[1].replace(',', '.'))));
    const p = Math.min(7.5, Math.max(2.2, Number(matchMedidas[2].replace(',', '.'))));
    base.dimensoes.largura_m = l;
    base.dimensoes.profundidade_m = p;
  }

  const validadoFinal = QuartoLayoutSchema.safeParse(base);
  if (!validadoFinal.success) {
    return res.status(422).json({ erro: 'Não foi possível validar o layout.' });
  }

  return res.status(200).json(validadoFinal.data);
}

