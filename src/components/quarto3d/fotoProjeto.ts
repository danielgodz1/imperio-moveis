/**
 * Imagem do projeto com marca d'água discreta da Império no canto inferior direito.
 * Lê o canvas do 3D (preserveDrawingBuffer ligado) e devolve um PNG.
 */
export const TEXTO_MARCA = 'Império Móveis Planejados';

export function imagemComMarca(origem: HTMLCanvasElement): Promise<Blob | null> {
  const c = document.createElement('canvas');
  c.width = origem.width;
  c.height = origem.height;
  const ctx = c.getContext('2d');
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(origem, 0, 0);
  const tamanho = Math.max(12, Math.round(c.width * 0.016));
  const margem = Math.round(tamanho * 1.2);
  ctx.font = `600 ${tamanho}px Archivo, system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(10, 10, 10, 0.35)';
  ctx.fillText(TEXTO_MARCA, c.width - margem + 1, c.height - margem + 1);
  ctx.fillStyle = 'rgba(239, 238, 234, 0.78)';
  ctx.fillText(TEXTO_MARCA, c.width - margem, c.height - margem);
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
  URL.revokeObjectURL(url);
}
