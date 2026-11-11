import * as THREE from 'three';
import { Desenho, desenharEscovado, desenharFreijo, desenharPedra } from '../heroScroll/heroMateriais';

/**
 * Mapas PBR gerados por código quando o catálogo não traz fotos dos mapas.
 * Cor, relevo (normal) e rugosidade saem do mesmo desenho, então o poro escuro
 * da madeira também é o ponto mais fundo e mais áspero.
 */

function prng(semente: number) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tela(tam: number, desenho: Desenho, semente: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = tam;
  desenho(c.getContext('2d')!, tam, prng(semente));
  return c;
}

function luminancia(c: HTMLCanvasElement): Float32Array {
  const { width: w, height: h } = c;
  const px = c.getContext('2d')!.getImageData(0, 0, w, h).data;
  const l = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) l[i] = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;
  return l;
}

/** Normal map a partir da altura (claro = alto), com bordas que repetem sem emenda. */
function normalDeAltura(altura: Float32Array, tam: number, forca: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = tam;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(tam, tam);
  const em = (x: number, y: number) => altura[((y + tam) % tam) * tam + ((x + tam) % tam)];
  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      const dx = (em(x + 1, y) - em(x - 1, y)) * forca;
      const dy = (em(x, y + 1) - em(x, y - 1)) * forca;
      const inv = 1 / Math.hypot(dx, dy, 1);
      const i = (y * tam + x) * 4;
      img.data[i] = (-dx * inv * 0.5 + 0.5) * 255;
      img.data[i + 1] = (dy * inv * 0.5 + 0.5) * 255;
      img.data[i + 2] = (inv * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Rugosidade: valor base do acabamento, mais áspero onde a altura é baixa (poros, vales). */
function rugosidadeDeAltura(altura: Float32Array, tam: number, base: number, variacao: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = tam;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(tam, tam);
  for (let i = 0; i < tam * tam; i++) {
    const v = Math.min(1, Math.max(0.03, base + (0.5 - altura[i]) * variacao)) * 255;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Textura fosca "TX": microrrelevo de chapa texturizada. */
const desenharTx: Desenho = (ctx, tam, r) => {
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, tam, tam);
  for (let i = 0; i < tam * tam * 0.08; i++) {
    const v = 90 + Math.floor(r() * 80);
    ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
    ctx.fillRect(r() * tam, r() * tam, 1.5, 1.5);
  }
};

/** Granito: fundo da cor, grãos claros e escuros. */
const desenharGranito =
  (cor: string): Desenho =>
  (ctx, tam, r) => {
    ctx.fillStyle = cor;
    ctx.fillRect(0, 0, tam, tam);
    for (let i = 0; i < tam * tam * 0.03; i++) {
      const claro = r() > 0.7;
      ctx.fillStyle = claro ? `rgba(200,198,192,${0.15 + r() * 0.4})` : `rgba(0,0,0,${0.2 + r() * 0.4})`;
      const s = 0.6 + r() * r() * 3.5;
      ctx.fillRect(r() * tam, r() * tam, s, s);
    }
  };

export type TipoMapas = 'madeira' | 'tx' | 'granito' | 'quartzo' | 'escovado';

export interface MapasGerados {
  cor?: HTMLCanvasElement;
  normal: HTMLCanvasElement;
  rugosidade: HTMLCanvasElement;
}

/** Gera os mapas de um tipo. `tam` já vem limitado pelo aparelho (512 fraco, 1024 forte). */
export function gerarMapas(tipo: TipoMapas, cor: string, tam: number, rugosidadeBase: number, semente: number): MapasGerados {
  switch (tipo) {
    case 'madeira': {
      const c = tela(tam, desenharFreijo(cor), semente);
      const h = luminancia(c);
      return { cor: c, normal: normalDeAltura(h, tam, 2.2), rugosidade: rugosidadeDeAltura(h, tam, rugosidadeBase, 0.5) };
    }
    case 'granito': {
      const c = tela(tam, desenharGranito(cor), semente);
      const h = luminancia(c);
      return { cor: c, normal: normalDeAltura(h, tam, 0.6), rugosidade: rugosidadeDeAltura(h, tam, rugosidadeBase, 0.2) };
    }
    case 'quartzo': {
      const c = tela(tam, desenharPedra, semente);
      const h = luminancia(c);
      return { cor: c, normal: normalDeAltura(h, tam, 0.4), rugosidade: rugosidadeDeAltura(h, tam, rugosidadeBase, 0.15) };
    }
    case 'escovado': {
      const c = tela(tam / 2, desenharEscovado(true), semente);
      const h = luminancia(c);
      return { cor: c, normal: normalDeAltura(h, tam / 2, 0.8), rugosidade: rugosidadeDeAltura(h, tam / 2, rugosidadeBase, 0.6) };
    }
    case 'tx':
    default: {
      const pequeno = Math.min(256, tam);
      const c = tela(pequeno, desenharTx, semente);
      const h = luminancia(c);
      return { normal: normalDeAltura(h, pequeno, 1.4), rugosidade: rugosidadeDeAltura(h, pequeno, rugosidadeBase, 0.12) };
    }
  }
}

/** Embrulha um canvas como textura repetida em metros. */
export function texturaDeCanvas(c: HTMLCanvasElement, metrosPorRepeticao: number, aniso: number, cor: boolean): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / metrosPorRepeticao, 1 / metrosPorRepeticao);
  t.colorSpace = cor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = aniso;
  return t;
}
