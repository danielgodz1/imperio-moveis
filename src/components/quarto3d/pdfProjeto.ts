import { CENARIOS_AMBIENTES } from '../../data/cenarios';
import { EMPRESA } from '../../data/empresa';
import { TEMPERATURA_PADRAO } from './iluminacao';
import { OPCOES_PISO } from './materiais3D';
import { linhasDoProjeto } from './resumoProjeto';
import { matrizQr } from './fotoProjeto';
import type { QuartoLayout } from './schema';

export const AVISO_PDF =
  'Estimativa visual feita no site. Medidas, materiais e valores são confirmados no orçamento final, depois da medição no local.';

const cm = (v: number) => `${Math.round(v * 100)}`;

const paraDataUrl = (blob: Blob) =>
  new Promise<string>((ok, erro) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => erro(r.error);
    r.readAsDataURL(blob);
  });

/** PNG do 3D → JPEG de até 1600 px (o PDF fica com centenas de KB em vez de megabytes). */
async function imagemParaPdf(origem: Blob | string): Promise<{ dataUrl: string; w: number; h: number }> {
  const img = new Image();
  const url = typeof origem === 'string' ? origem : URL.createObjectURL(origem);
  try {
    img.src = url;
    await img.decode();
    const escala = Math.min(1, 1600 / img.naturalWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * escala);
    c.height = Math.round(img.naturalHeight * escala);
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('sem canvas');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return { dataUrl: c.toDataURL('image/jpeg', 0.85), w: c.width, h: c.height };
  } finally {
    if (typeof origem !== 'string') URL.revokeObjectURL(url);
  }
}

/**
 * PDF do projeto, gerado no navegador (jsPDF só baixa quando a pessoa pede o PDF):
 * logo, imagem, medidas, lista de peças, LED e piso, link com QR e o aviso de estimativa.
 */
export async function gerarPdfProjeto(opcoes: { layout: QuartoLayout; imagem: Blob | string | null; link?: string; nome?: string }): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const { layout, imagem, link, nome } = opcoes;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const L = 210;
  const M = 16;
  let y = M;

  try {
    const logo = await fetch('/logo-quadrado.jpg').then((r) => (r.ok ? r.blob() : null));
    if (logo) doc.addImage(await paraDataUrl(logo), 'JPEG', M, y, 14, 14);
  } catch {
    // Sem logo: segue só com o nome.
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(EMPRESA.nome, M + 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(`WhatsApp ${EMPRESA.telefone}  ·  ${EMPRESA.url.replace('https://', '')}`, M + 18, y + 11.5);
  doc.setTextColor(0);
  y += 22;

  const cenario = CENARIOS_AMBIENTES[layout.comodo];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(nome ? `${cenario.rotulo}: ${nome}` : `Meu projeto de ${cenario.rotulo.toLowerCase()}`, M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} no projeto 3D do site`, M, y);
  doc.setTextColor(0);
  y += 6;

  if (imagem) {
    const { dataUrl, w, h } = await imagemParaPdf(imagem);
    const largura = L - M * 2;
    const altura = Math.min(largura * (h / w), 110);
    const larguraFinal = altura * (w / h);
    doc.addImage(dataUrl, 'JPEG', M + (largura - larguraFinal) / 2, y, larguraFinal, altura);
    y += altura + 8;
  }

  const { largura_m: W, profundidade_m: D, pe_direito_m: H } = layout.dimensoes;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Medidas do ambiente', M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${cm(W)} × ${cm(D)} cm, pé-direito ${cm(H)} cm`, M, y);
  y += 5;
  const piso = OPCOES_PISO.find((p) => p.id === layout.piso)?.nome;
  doc.text(`Fita de LED: ${layout.led ? `sim, ${layout.temperaturaLed ?? TEMPERATURA_PADRAO} K` : 'não'}${piso ? `   ·   Piso: ${piso}` : ''}`, M, y);
  y += 9;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Peças (lista de materiais)', M, y);
  y += 6;
  doc.setFontSize(10);
  const larguraTexto = L - M * 2 - (link ? 46 : 0);
  for (const linha of linhasDoProjeto(layout)) {
    if (y > 262) {
      doc.addPage();
      y = M;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(linha.titulo, M, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    const partes = doc.splitTextToSize(linha.detalhe, larguraTexto) as string[];
    doc.text(partes, M, y);
    y += partes.length * 4.5 + 2;
  }

  // Rodapé: QR e link do projeto, aviso de estimativa.
  const base = 297 - M;
  if (link) {
    const matriz = await matrizQr(link).catch(() => null);
    if (matriz) {
      const lado = 40;
      const passo = lado / matriz.length;
      const x0 = L - M - lado;
      const y0 = base - lado - 6;
      doc.setFillColor(10, 10, 10);
      matriz.forEach((linha, l) => linha.forEach((escuro, c) => escuro && doc.rect(x0 + c * passo, y0 + l * passo, passo, passo, 'F')));
      doc.setFontSize(8);
      doc.text('Abra este projeto no site', x0 + lado / 2, y0 + lado + 4, { align: 'center' });
    }
    doc.setFontSize(9);
    doc.setTextColor(30, 60, 140);
    doc.textWithLink('Abrir este projeto no site (link)', M, base - 14, { url: link });
    doc.setTextColor(0);
  }
  doc.setFontSize(8.5);
  doc.setTextColor(90);
  doc.text(doc.splitTextToSize(AVISO_PDF, L - M * 2 - (link ? 46 : 0)) as string[], M, base - 8);
  return doc.output('blob');
}
