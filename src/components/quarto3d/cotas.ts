import { Abertura, Dimensoes, Instancia, caixasModulo, faixaAbertura } from './motorGeometrico';

/**
 * Cotas de projeto (em cm) calculadas das mesmas caixas do motor: o que a planta e a
 * elevação mostram é exatamente o que a validação usa.
 */

export type V3 = [number, number, number];
export type Parede = 'N' | 'S' | 'O' | 'L';

export interface Cota {
  de: V3;
  ate: V3;
  /** Texto em centímetros. */
  texto: string;
  /** Direção das linhas de chamada (perpendicular à cota). */
  chamada: V3;
}

export const cm = (m: number) => `${Math.round(m * 100)}`;

/** Distância das linhas de cota até a parede, por fileira. */
const FILEIRA = [0.35, 0.7, 1.05];
const MIN_TRECHO = 0.05;

const ehHorizontal = (p: Parede) => p === 'N' || p === 'S';

export function comprimento(p: Parede, dim: Dimensoes) {
  return ehHorizontal(p) ? dim.largura_m : dim.profundidade_m;
}

/** Intervalo ocupado no eixo da parede por uma peça encostada nela. */
function extensaoNaParede(m: Instancia, p: Parede, dim: Dimensoes): [number, number] {
  const c = caixasModulo(m, dim)[0];
  return ehHorizontal(p) ? [c.minX, c.maxX] : [c.minZ, c.maxZ];
}

/**
 * Peças sobrepostas na mesma parede (ex.: mesa de cabeceira fixada no painel) confundem a corrente:
 * fica a maior, e as menores que se sobrepõem a ela saem da corrente (continuam com a cota de altura).
 */
export function semSobrepostos(intervalos: Array<[number, number]>): Array<[number, number]> {
  const aceitos: Array<[number, number]> = [];
  [...intervalos]
    .sort((x, y) => y[1] - y[0] - (x[1] - x[0]))
    .forEach((i) => {
      if (!aceitos.some((a) => i[0] < a[1] - 0.01 && i[1] > a[0] + 0.01)) aceitos.push(i);
    });
  return aceitos;
}

/** Corrente de cotas: início da parede, cada início/fim de peça e fim da parede. Soma = comprimento. */
export function corrente(intervalos: Array<[number, number]>, inicio: number, fim: number): Array<[number, number]> {
  const marcas = new Set<number>([inicio, fim]);
  intervalos.forEach(([a, b]) => {
    marcas.add(Math.min(fim, Math.max(inicio, Math.round(a * 1000) / 1000)));
    marcas.add(Math.min(fim, Math.max(inicio, Math.round(b * 1000) / 1000)));
  });
  const ordem = [...marcas].sort((x, y) => x - y);
  const trechos: Array<[number, number]> = [];
  for (let i = 0; i < ordem.length - 1; i++) {
    if (ordem[i + 1] - ordem[i] >= MIN_TRECHO) trechos.push([ordem[i], ordem[i + 1]]);
    else if (trechos.length) trechos[trechos.length - 1][1] = ordem[i + 1];
  }
  return trechos;
}

/** Ponto no piso (planta), a `d` metros para fora da parede, na posição `u` do eixo dela. */
function pontoPlanta(p: Parede, u: number, d: number, dim: Dimensoes, y: number): V3 {
  const W = dim.largura_m / 2;
  const D = dim.profundidade_m / 2;
  switch (p) {
    case 'N':
      return [u, y, -D - d];
    case 'S':
      return [u, y, D + d];
    case 'O':
      return [-W - d, y, u];
    default:
      return [W + d, y, u];
  }
}

const FORA: Record<Parede, V3> = { N: [0, 0, -1], S: [0, 0, 1], O: [-1, 0, 0], L: [1, 0, 0] };

/** Planta: por parede, corrente das peças, corrente de portas/janelas e comprimento total; peças soltas com largura e profundidade. */
export function cotasPlanta(modulos: Instancia[], aberturas: Abertura[], dim: Dimensoes): Cota[] {
  const y = dim.pe_direito_m + 0.02;
  const cotas: Cota[] = [];
  (['N', 'S', 'O', 'L'] as Parede[]).forEach((p) => {
    const meia = comprimento(p, dim) / 2;
    const fileiras: Array<Array<[number, number]>> = [];
    const pecas = modulos.filter((m) => m.parede === p).map((m) => extensaoNaParede(m, p, dim));
    if (pecas.length) fileiras.push(corrente(semSobrepostos(pecas), -meia, meia));
    const vaos = aberturas
      .filter((a) => a.parede === p)
      .map((a): [number, number] => [a.posicaoOffset_m - a.largura_m / 2, a.posicaoOffset_m + a.largura_m / 2]);
    if (vaos.length) fileiras.push(corrente(vaos, -meia, meia));
    fileiras.push([[-meia, meia]]);
    fileiras.forEach((trechos, i) =>
      trechos.forEach(([a, b]) =>
        cotas.push({ de: pontoPlanta(p, a, FILEIRA[i], dim, y), ate: pontoPlanta(p, b, FILEIRA[i], dim, y), texto: cm(b - a), chamada: FORA[p] })
      )
    );
  });
  modulos
    .filter((m) => m.parede === 'centro')
    .forEach((m) => {
      caixasModulo(m, dim).slice(0, 1).forEach((c) => {
        const z = c.minZ - 0.15;
        const x = c.minX - 0.15;
        cotas.push({ de: [c.minX, y, z], ate: [c.maxX, y, z], texto: cm(c.maxX - c.minX), chamada: [0, 0, -1] });
        cotas.push({ de: [x, y, c.minZ], ate: [x, y, c.maxZ], texto: cm(c.maxZ - c.minZ), chamada: [-1, 0, 0] });
      });
    });
  return cotas;
}

/** Ponto na face interna da parede (elevação): `u` no eixo da parede, `y` na altura. */
function pontoParede(p: Parede, u: number, y: number, dim: Dimensoes): V3 {
  const W = dim.largura_m / 2;
  const D = dim.profundidade_m / 2;
  const e = 0.02;
  switch (p) {
    case 'N':
      return [u, y, -D + e];
    case 'S':
      return [u, y, D - e];
    case 'O':
      return [-W + e, y, u];
    default:
      return [W - e, y, u];
  }
}

/** Eixo da parede que corre na horizontal da tela da elevação (para as linhas de chamada). */
const EIXO: Record<Parede, V3> = { N: [1, 0, 0], S: [1, 0, 0], O: [0, 0, 1], L: [0, 0, 1] };

/** Elevação de uma parede: corrente das peças e total embaixo, pé-direito ao lado, alturas das peças e das janelas. */
export function cotasElevacao(modulos: Instancia[], aberturas: Abertura[], dim: Dimensoes, p: Parede): Cota[] {
  const meia = comprimento(p, dim) / 2;
  const H = dim.pe_direito_m;
  const baixo: V3 = [0, -1, 0];
  const lado: V3 = EIXO[p].map((v) => -v) as V3;
  const naParede = modulos.filter((m) => m.parede === p);
  const cotas: Cota[] = [];
  const pecas = naParede.map((m) => extensaoNaParede(m, p, dim));
  if (pecas.length) {
    corrente(semSobrepostos(pecas), -meia, meia).forEach(([a, b]) =>
      cotas.push({ de: pontoParede(p, a, -0.3, dim), ate: pontoParede(p, b, -0.3, dim), texto: cm(b - a), chamada: baixo })
    );
  }
  cotas.push({ de: pontoParede(p, -meia, -0.6, dim), ate: pontoParede(p, meia, -0.6, dim), texto: cm(meia * 2), chamada: baixo });
  cotas.push({ de: pontoParede(p, -meia - 0.35, 0, dim), ate: pontoParede(p, -meia - 0.35, H, dim), texto: cm(H), chamada: lado });
  naParede.forEach((m) => {
    const c = caixasModulo(m, dim)[0];
    const [a, b] = extensaoNaParede(m, p, dim);
    const u = (a + b) / 2;
    cotas.push({ de: pontoParede(p, u, c.minY, dim), ate: pontoParede(p, u, c.maxY, dim), texto: cm(c.maxY - c.minY), chamada: EIXO[p] });
  });
  aberturas
    .filter((ab) => ab.parede === p)
    .forEach((ab) => {
      const { y0, y1 } = faixaAbertura(ab);
      const u = ab.posicaoOffset_m + ab.largura_m / 2 + 0.12;
      if (y0 > MIN_TRECHO) cotas.push({ de: pontoParede(p, u, 0, dim), ate: pontoParede(p, u, y0, dim), texto: cm(y0), chamada: EIXO[p] });
      cotas.push({ de: pontoParede(p, u, y0, dim), ate: pontoParede(p, u, y1, dim), texto: cm(y1 - y0), chamada: EIXO[p] });
    });
  return cotas;
}

/** Medida da cota (m), útil nos testes. */
export const medida = (c: Cota) => Math.hypot(c.ate[0] - c.de[0], c.ate[1] - c.de[1], c.ate[2] - c.de[2]);
