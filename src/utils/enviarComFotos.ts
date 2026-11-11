/**
 * Fotos do pedido de orçamento até o WhatsApp.
 *
 * O WhatsApp não aceita anexar arquivos por link (wa.me só leva texto). Então:
 * - no celular, o compartilhamento do sistema manda fotos e mensagem juntos para o WhatsApp
 *   (o cliente escolhe a conversa da Império; a mensagem também vai para a área de transferência);
 * - no computador, abre a conversa da Império com o texto e o cliente anexa as fotos lá.
 */

export const MAX_FOTOS = 6;
export const MAX_MB_POR_FOTO = 15;

export interface ResultadoFotos {
  aceitas: File[];
  recusadas: string[];
}

/** Filtra o que o cliente escolheu: só imagens ou PDF, até o limite de quantidade e tamanho. */
export function filtrarFotos(atuais: File[], novas: File[]): ResultadoFotos {
  const aceitas = [...atuais];
  const recusadas: string[] = [];
  for (const f of novas) {
    const tipoOk = f.type.startsWith('image/') || f.type === 'application/pdf';
    if (!tipoOk) recusadas.push(`${f.name}: só fotos ou PDF`);
    else if (f.size > MAX_MB_POR_FOTO * 1024 * 1024) recusadas.push(`${f.name}: maior que ${MAX_MB_POR_FOTO} MB`);
    else if (aceitas.length >= MAX_FOTOS) recusadas.push(`${f.name}: limite de ${MAX_FOTOS} arquivos`);
    else if (!aceitas.some((a) => a.name === f.name && a.size === f.size)) aceitas.push(f);
  }
  return { aceitas, recusadas };
}

/** O aparelho consegue mandar estes arquivos pelo compartilhamento do sistema? */
export function podeCompartilharArquivos(arquivos: File[]): boolean {
  return (
    arquivos.length > 0 &&
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: arquivos })
  );
}

export type ResultadoEnvio = 'compartilhado' | 'cancelado' | 'sem-suporte';

/** Abre o compartilhamento com fotos + texto. Chamar direto no clique (o navegador exige o gesto). */
export async function compartilharComFotos(arquivos: File[], texto: string): Promise<ResultadoEnvio> {
  if (!podeCompartilharArquivos(arquivos)) return 'sem-suporte';
  // Se o WhatsApp descartar a legenda (acontece no iPhone), a mensagem está na área de transferência.
  navigator.clipboard?.writeText(texto).catch(() => undefined);
  try {
    await navigator.share({ files: arquivos, text: texto, title: 'Pedido de orçamento' });
    return 'compartilhado';
  } catch (e) {
    return (e as DOMException)?.name === 'AbortError' ? 'cancelado' : 'sem-suporte';
  }
}
