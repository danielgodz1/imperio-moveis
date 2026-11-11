import { Abertura, Caixa2D, Dimensoes, Instancia, caixasModulo, faixaAbertura } from './motorGeometrico';

/**
 * Luz e câmera derivadas do projeto, em funções puras: a janela define de onde vem o sol,
 * as caixas do motor definem a sombra de contato e o modo foto fica na altura dos olhos.
 */

export type TemperaturaLed = 2700 | 3000 | 4000;
export const TEMPERATURAS_LED: TemperaturaLed[] = [2700, 3000, 4000];
export const TEMPERATURA_PADRAO: TemperaturaLed = 3000;

/** Cor de corpo negro aproximada de cada temperatura (tabela de Mitchell Charity). */
export const COR_TEMPERATURA: Record<TemperaturaLed, string> = {
  2700: '#FFA957',
  3000: '#FFB46B',
  4000: '#FFD1A3',
};

export const NOME_TEMPERATURA: Record<TemperaturaLed, string> = {
  2700: '2700 K quente',
  3000: '3000 K neutro quente',
  4000: '4000 K neutro',
};

export interface LuzJanela {
  posicao: [number, number, number];
  alvo: [number, number, number];
}

/** Normal que aponta para fora do ambiente em cada parede. */
const FORA: Record<Abertura['parede'], [number, number]> = { N: [0, -1], S: [0, 1], O: [-1, 0], L: [1, 0] };

/** Sol entrando pela primeira janela: de fora, um pouco acima, mirando o piso dentro do ambiente. */
export function luzDaJanela(aberturas: Abertura[], dim: Dimensoes): LuzJanela | null {
  const janela = aberturas.find((a) => a.tipo === 'janela');
  if (!janela) return null;
  const { y0, y1 } = faixaAbertura(janela);
  const [nx, nz] = FORA[janela.parede];
  const W = dim.largura_m / 2;
  const D = dim.profundidade_m / 2;
  const ao = janela.posicaoOffset_m;
  const [cx, cz] = janela.parede === 'N' || janela.parede === 'S' ? [ao, nz * D] : [nx * W, ao];
  const yc = (y0 + y1) / 2;
  return {
    posicao: [cx + nx * 3, yc + 1.8, cz + nz * 3],
    alvo: [cx - nx * 1.6, 0, cz - nz * 1.6],
  };
}

export interface ManchaContato {
  x: number;
  z: number;
  largura: number;
  profundidade: number;
  /** Peça no piso escurece mais; suspensa, só um sombreado leve. */
  forte: boolean;
}

/** Sombra de contato sob cada peça, a partir das mesmas caixas usadas na colisão. */
export function manchasDeContato(modulos: Instancia[], dim: Dimensoes): ManchaContato[] {
  const folga = 0.12;
  return modulos.flatMap((m) =>
    caixasModulo(m, dim)
      .filter((c: Caixa2D) => c.minY < 1.2)
      .map((c) => ({
        x: (c.minX + c.maxX) / 2,
        z: (c.minZ + c.maxZ) / 2,
        largura: c.maxX - c.minX + folga,
        profundidade: c.maxZ - c.minZ + folga,
        forte: c.minY < 0.05,
      }))
  );
}

export const ALTURA_OLHOS = 1.6;
export const LENTE_FOTO_MM = 26;

/** Câmera do modo foto: em pé junto à parede da frente, na altura dos olhos, olhando para o fundo. */
export function cameraFoto(dim: Dimensoes): { posicao: [number, number, number]; alvo: [number, number, number] } {
  const D = dim.profundidade_m / 2;
  return {
    posicao: [0, ALTURA_OLHOS, D - 0.4],
    alvo: [0, ALTURA_OLHOS - 0.35, -D],
  };
}
