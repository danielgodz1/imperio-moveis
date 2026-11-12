/**
 * Imagem do projeto com marca d'água discreta da Império no canto inferior direito e, quando há
 * link, um QR code no canto inferior esquerdo que abre o mesmo projeto no site.
 * Lê o canvas do 3D (preserveDrawingBuffer ligado) e devolve um PNG.
 */
export const TEXTO_MARCA = 'Império Móveis Planejados';

/** Acima disso o QR fica denso demais para a câmera ler numa foto ou impressão. */
export const MAX_LINK_NO_QR = 1200;

/** Matriz do QR (true = módulo escuro), ou null se o link for longo demais. */
export async function matrizQr(texto: string): Promise<boolean[][] | null> {
  if (!texto || texto.length > MAX_LINK_NO_QR) return null;
  const { default: qrcode } = await import('qrcode-generator');
  const qr = qrcode(0, 'L');
  qr.addData(texto, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, l) => Array.from({ length: n }, (_, c) => qr.isDark(l, c)));
}

/** Desenha o QR com margem branca (zona de silêncio) e uma legenda curta embaixo. */
export function desenharQr(ctx: CanvasRenderingContext2D, matriz: boolean[][], x: number, y: number, lado: number, legenda?: string) {
  const n = matriz.length;
  const margem = 4;
  const passo = lado / (n + margem * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, lado, lado + (legenda ? passo * 7 : 0));
  ctx.fillStyle = '#0a0a0a';
  for (let l = 0; l < n; l++) {
    for (let c = 0; c < n; c++) {
      if (matriz[l][c]) ctx.fillRect(x + (c + margem) * passo, y + (l + margem) * passo, Math.ceil(passo), Math.ceil(passo));
    }
  }
  if (legenda) {
    ctx.font = `600 ${Math.round(passo * 3.4)}px Archivo, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(legenda, x + lado / 2, y + lado + passo * 2.6);
  }
}

/** Pixels por módulo do QR na imagem: com 5 px a câmera lê na tela e no papel. */
export const PX_POR_MODULO_QR = 5;

/** Lado do QR (com a zona de silêncio de 4 módulos de cada lado) para a imagem baixada. */
export const ladoQr = (modulos: number) => (modulos + 8) * PX_POR_MODULO_QR;

export async function imagemComMarca(origem: HTMLCanvasElement, link?: string): Promise<Blob | null> {
  let matriz: boolean[][] | null = null;
  if (link) {
    try {
      matriz = await matrizQr(link);
    } catch {
      matriz = null;
    }
  }
  // Com link: faixa branca embaixo da imagem com o QR e a explicação (o QR não cobre o projeto).
  const lado = matriz ? ladoQr(matriz.length) : 0;
  const faixa = matriz ? lado + Math.round(lado * 0.16) : 0;
  const c = document.createElement('canvas');
  c.width = origem.width;
  c.height = origem.height + faixa;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(origem, 0, 0);
  const tamanho = Math.max(12, Math.round(c.width * 0.016));
  const margem = Math.round(tamanho * 1.2);
  ctx.font = `600 ${tamanho}px Archivo, system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(10, 10, 10, 0.35)';
  ctx.fillText(TEXTO_MARCA, c.width - margem + 1, origem.height - margem + 1);
  ctx.fillStyle = 'rgba(239, 238, 234, 0.78)';
  ctx.fillText(TEXTO_MARCA, c.width - margem, origem.height - margem);

  if (matriz) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, origem.height, c.width, faixa);
    const y = origem.height + Math.round((faixa - lado) / 2);
    desenharQr(ctx, matriz, margem, y, lado);
    const x = margem + lado + margem;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#0a0a0a';
    ctx.font = `600 ${Math.round(tamanho * 1.5)}px Archivo, system-ui, sans-serif`;
    ctx.fillText('Aponte a câmera para abrir este projeto', x, y + lado * 0.3);
    ctx.font = `400 ${tamanho}px Archivo, system-ui, sans-serif`;
    ctx.fillStyle = '#444444';
    ctx.fillText('Abre o mesmo ambiente no 3D do site.', x, y + lado * 0.3 + tamanho * 2.2);
    ctx.fillText(TEXTO_MARCA, x, y + lado * 0.3 + tamanho * 4);
  }
  return new Promise((ok) => c.toBlob((b) => ok(b), 'image/png'));
}

export function baixarArquivo(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Alguns navegadores ainda leem o arquivo depois do clique.
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
