/**
 * Gerador de marcenaria planejada: caixaria + frentes + interno + ferragem, em código puro.
 * Recebe as mesmas medidas do motor (largura, altura e profundidade da envoltória) e devolve
 * peças no referencial do móvel: X centrado na largura, Y a partir da base, Z saindo da parede.
 * Nenhuma peça passa da envoltória com as frentes fechadas.
 */

export const ESPESSURA = {
  /** Caixaria (laterais, base, tampo, divisórias, prateleiras). */
  caixaria: 0.018,
  /** Frentes (portas e gavetas). */
  frente: 0.018,
  /** Fundo. */
  fundo: 0.006,
  /** Folga entre frentes. */
  folga: 0.003,
} as const;

/** Porta de abrir mais larga que isso é dividida em duas. */
export const LARGURA_MAX_PORTA = 0.6;
/** Largura alvo de cada vão do guarda-roupa. */
const VAO_ALVO = 0.9;
const RODAPE = { altura: 0.08, recuo: 0.05 };
const ALTURA_MALEIRO = 0.42;
const ALTURA_GAVETA = 0.18;

export type Interno = 'cabideiro' | 'prateleiras' | 'gavetas' | 'sapateira';
export type TipoPorta = 'abrir' | 'correr' | 'sem';
export type Puxador = 'cava' | 'perfil' | 'alca' | 'toque';

export interface Vao {
  interno: Interno;
  /** Só para `gavetas`: 2 a 4. */
  gavetas?: number;
}

export type MaterialPeca = 'corpo' | 'frente' | 'fundo' | 'metal' | 'sombra';
type V3 = [number, number, number];

export interface Peca {
  tamanho: V3;
  posicao: V3;
  material: MaterialPeca;
  /** Sentido do veio: segue a maior dimensão da face. */
  veio: 'x' | 'y';
}

export type Movimento =
  | { tipo: 'giro'; pivo: [number, number]; sentido: 1 | -1 }
  | { tipo: 'gaveta'; curso: number }
  | { tipo: 'correr'; deslocamento: number };

/** Conjunto que se move junto: porta + puxador, ou frente + caixa da gaveta. */
export interface Frente {
  id: string;
  tipo: 'porta' | 'gaveta';
  largura: number;
  altura: number;
  movimento: Movimento;
  pecas: Peca[];
}

export interface Marcenaria {
  fixas: Peca[];
  frentes: Frente[];
}

const veioDe = (w: number, h: number): 'x' | 'y' => (w > h ? 'x' : 'y');
const peca = (tamanho: V3, posicao: V3, material: MaterialPeca): Peca => ({
  tamanho,
  posicao,
  material,
  veio: veioDe(tamanho[0], tamanho[1]),
});

/** Quantas portas de abrir cabem num vão sem passar de 60 cm cada. */
export const portasNoVao = (largura: number) => Math.max(1, Math.ceil(largura / LARGURA_MAX_PORTA - 1e-9));

export function quantidadeVaos(largura: number): number {
  return Math.max(1, Math.round(largura / VAO_ALVO));
}

const PADRAO_VAOS: Interno[] = ['cabideiro', 'gavetas', 'prateleiras', 'cabideiro', 'sapateira', 'prateleiras'];

/** Vãos efetivos: os escolhidos pelo cliente, completados pelo padrão quando a largura muda. */
export function resolverVaos(largura: number, escolhidos?: Vao[]): Vao[] {
  const n = quantidadeVaos(largura);
  return Array.from({ length: n }, (_, i) => {
    const v = escolhidos?.[i] ?? { interno: PADRAO_VAOS[i % PADRAO_VAOS.length] };
    return v.interno === 'gavetas' ? { interno: 'gavetas', gavetas: Math.min(4, Math.max(2, v.gavetas ?? 3)) } : { interno: v.interno };
  });
}

/** Puxador na frente, no referencial da frente (centro da frente em x=0, y=0; face em z=0). */
function puxadorPecas(
  tipo: Puxador,
  w: number,
  h: number,
  ladoAbertura: 1 | -1 | 0,
  orientacao: 'vertical' | 'horizontal'
): Peca[] {
  const borda = ladoAbertura === 0 ? 0 : ladoAbertura * (w / 2);
  switch (tipo) {
    case 'toque':
      return [];
    case 'perfil':
      return orientacao === 'vertical' && ladoAbertura !== 0
        ? [peca([0.016, h, 0.014], [borda - ladoAbertura * 0.008, 0, 0.007], 'metal')]
        : [peca([w, 0.016, 0.014], [0, h / 2 - 0.008, 0.007], 'metal')];
    case 'cava':
      return orientacao === 'vertical' && ladoAbertura !== 0
        ? [peca([0.03, h, 0.004], [borda - ladoAbertura * 0.015, 0, 0.002], 'sombra')]
        : [peca([w, 0.03, 0.004], [0, h / 2 - 0.015, 0.002], 'sombra')];
    case 'alca':
    default:
      return orientacao === 'vertical' && ladoAbertura !== 0
        ? [peca([0.012, Math.min(0.42, h * 0.28), 0.022], [borda - ladoAbertura * 0.045, 0, 0.011], 'metal')]
        : [peca([Math.min(0.36, w * 0.5), 0.012, 0.022], [0, h / 2 - 0.05, 0.011], 'metal')];
  }
}

/** Desloca peças de uma frente (referencial da frente) para o referencial do móvel. */
const mover = (pecas: Peca[], [x, y, z]: V3): Peca[] =>
  pecas.map((p) => ({ ...p, posicao: [p.posicao[0] + x, p.posicao[1] + y, p.posicao[2] + z] }));

interface FaixaPortas {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** Portas de abrir sobrepostas cobrindo a faixa, cada uma com até 60 cm e 3 mm de folga. */
function portasDeAbrir(
  faixa: FaixaPortas,
  zFace: number,
  puxador: Puxador,
  orientacao: 'vertical' | 'horizontal',
  prefixo: string
): Frente[] {
  const largura = faixa.x1 - faixa.x0;
  const n = portasNoVao(largura);
  const passo = largura / n;
  const w = passo - ESPESSURA.folga;
  const h = faixa.y1 - faixa.y0 - ESPESSURA.folga;
  const yc = (faixa.y0 + faixa.y1) / 2;
  return Array.from({ length: n }, (_, i) => {
    const xc = faixa.x0 + passo * (i + 0.5);
    // Em pares, as dobradiças ficam nas pontas; porta sozinha abre para o lado de fora do conjunto.
    const dobradicaEsquerda = n === 1 ? xc < 0 : i % 2 === 0;
    const ladoAbertura: 1 | -1 = dobradicaEsquerda ? 1 : -1;
    const z = zFace - ESPESSURA.frente / 2;
    const pecas = mover(
      [peca([w, h, ESPESSURA.frente], [0, 0, 0], 'frente'), ...mover(puxadorPecas(puxador, w, h, ladoAbertura, orientacao), [0, 0, ESPESSURA.frente / 2])],
      [xc, yc, z]
    );
    const pivoX = dobradicaEsquerda ? xc - w / 2 : xc + w / 2;
    return {
      id: `${prefixo}-${i}`,
      tipo: 'porta' as const,
      largura: w,
      altura: h,
      movimento: { tipo: 'giro' as const, pivo: [pivoX, zFace] as [number, number], sentido: (dobradicaEsquerda ? -1 : 1) as 1 | -1 },
      pecas,
    };
  });
}

/** Gaveta: frente + caixa interna (laterais, fundo e base), corre para fora. */
function gaveta(
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  zFace: number,
  profundidade: number,
  puxador: Puxador,
  id: string,
  materialFrente: MaterialPeca = 'frente'
): Frente {
  const w = x1 - x0 - ESPESSURA.folga;
  const h = y1 - y0 - ESPESSURA.folga;
  const xc = (x0 + x1) / 2;
  const yc = (y0 + y1) / 2;
  const zf = zFace - ESPESSURA.frente / 2;
  const caixaW = w - 0.03;
  const caixaH = Math.max(0.06, h - 0.05);
  const caixaD = Math.max(0.2, profundidade - 0.05);
  const zCaixa = zFace - ESPESSURA.frente - caixaD / 2;
  const fundoCaixa = yc - h / 2 + 0.02;
  const e = 0.012;
  const pecas: Peca[] = [
    peca([w, h, ESPESSURA.frente], [xc, yc, zf], materialFrente),
    ...mover(puxadorPecas(puxador, w, h, 0, 'horizontal'), [xc, yc, zFace]),
    peca([e, caixaH, caixaD], [xc - caixaW / 2 + e / 2, fundoCaixa + caixaH / 2, zCaixa], 'corpo'),
    peca([e, caixaH, caixaD], [xc + caixaW / 2 - e / 2, fundoCaixa + caixaH / 2, zCaixa], 'corpo'),
    peca([caixaW, caixaH, e], [xc, fundoCaixa + caixaH / 2, zCaixa - caixaD / 2 + e / 2], 'corpo'),
    peca([caixaW, ESPESSURA.fundo, caixaD], [xc, fundoCaixa, zCaixa], 'fundo'),
  ];
  return { id, tipo: 'gaveta', largura: w, altura: h, movimento: { tipo: 'gaveta', curso: caixaD * 0.7 }, pecas };
}

export interface ParamsGuardaRoupa {
  w: number;
  h: number;
  d: number;
  portas?: TipoPorta;
  puxador?: Puxador;
  maleiro?: boolean;
  vaos?: Vao[];
}

/** Caixa com laterais, base, tampo e fundo. Devolve as peças e o vão livre interno. */
function caixaria(w: number, h: number, dc: number, yBase: number) {
  const C = ESPESSURA.caixaria;
  const alturaCaixa = h - yBase;
  const fixas: Peca[] = [
    peca([C, alturaCaixa, dc], [-w / 2 + C / 2, yBase + alturaCaixa / 2, dc / 2], 'corpo'),
    peca([C, alturaCaixa, dc], [w / 2 - C / 2, yBase + alturaCaixa / 2, dc / 2], 'corpo'),
    peca([w - 2 * C, C, dc], [0, yBase + C / 2, dc / 2], 'corpo'),
    peca([w - 2 * C, C, dc], [0, h - C / 2, dc / 2], 'corpo'),
    peca([w - 2 * C, alturaCaixa - 2 * C, ESPESSURA.fundo], [0, yBase + alturaCaixa / 2, 0.01 + ESPESSURA.fundo / 2], 'fundo'),
  ];
  return { fixas, yInterno0: yBase + C, yInterno1: h - C };
}

/** Limites X de cada vão (livre, entre chapas) e das faixas de porta (até o meio das divisórias). */
function dividir(w: number, n: number) {
  const C = ESPESSURA.caixaria;
  const livre = (w - 2 * C - (n - 1) * C) / n;
  return Array.from({ length: n }, (_, i) => {
    const x0 = -w / 2 + C + i * (livre + C);
    return {
      x0,
      x1: x0 + livre,
      faixa0: i === 0 ? -w / 2 : x0 - C / 2,
      faixa1: i === n - 1 ? w / 2 : x0 + livre + C / 2,
    };
  });
}

export function gerarGuardaRoupa(p: ParamsGuardaRoupa): Marcenaria {
  const { w, h, d } = p;
  const C = ESPESSURA.caixaria;
  const portas = p.portas ?? 'abrir';
  const puxador = p.puxador ?? 'alca';
  // Correr pede 5,5 cm para o trilho duplo; abrir, a espessura da frente.
  const dc = portas === 'correr' ? d - 0.055 : portas === 'abrir' ? d - ESPESSURA.frente - 0.002 : d;
  const fixas: Peca[] = [peca([w - 0.04, RODAPE.altura, dc - RODAPE.recuo], [0, RODAPE.altura / 2, (dc - RODAPE.recuo) / 2], 'sombra')];
  const cx = caixaria(w, h, dc, RODAPE.altura);
  fixas.push(...cx.fixas);
  const vaos = resolverVaos(w, p.vaos);
  const partes = dividir(w, vaos.length);
  const comMaleiro = (p.maleiro ?? true) && h > 1.9;
  const yMaleiro = comMaleiro ? h - ALTURA_MALEIRO : cx.yInterno1;
  const frentes: Frente[] = [];
  const zInterno = dc - 0.02;

  partes.forEach((parte, i) => {
    if (i > 0) fixas.push(peca([C, cx.yInterno1 - cx.yInterno0, dc - 0.01], [parte.x0 - C / 2, (cx.yInterno0 + cx.yInterno1) / 2, (dc - 0.01) / 2 + 0.01], 'corpo'));
    const lv = parte.x1 - parte.x0;
    const xc = (parte.x0 + parte.x1) / 2;
    if (comMaleiro) fixas.push(peca([lv, C, dc - 0.02], [xc, yMaleiro - C / 2, (dc - 0.02) / 2 + 0.01], 'corpo'));
    const topo = comMaleiro ? yMaleiro - C : cx.yInterno1;
    const prateleira = (y: number) => fixas.push(peca([lv, C, dc - 0.03], [xc, y, (dc - 0.03) / 2 + 0.01], 'corpo'));
    const cabideiro = (y: number) => fixas.push(peca([lv - 0.004, 0.025, 0.025], [xc, y, dc / 2], 'metal'));
    const vao = vaos[i];
    switch (vao.interno) {
      case 'cabideiro':
        prateleira(topo - 0.06);
        cabideiro(topo - 0.12);
        break;
      case 'prateleiras': {
        const n = Math.max(2, Math.floor((topo - cx.yInterno0) / 0.36));
        for (let k = 1; k <= n; k++) prateleira(cx.yInterno0 + ((topo - cx.yInterno0) * k) / (n + 1));
        break;
      }
      case 'sapateira': {
        const n = Math.max(3, Math.floor((topo - cx.yInterno0) / 0.2));
        for (let k = 1; k <= n; k++) prateleira(cx.yInterno0 + ((topo - cx.yInterno0) * k) / (n + 1));
        break;
      }
      case 'gavetas': {
        const g = vao.gavetas ?? 3;
        const yG = cx.yInterno0 + g * ALTURA_GAVETA;
        // Gavetas internas: frentes recuadas dentro da caixa, atrás das portas.
        for (let k = 0; k < g; k++) {
          frentes.push(
            gaveta(parte.x0 + 0.005, parte.x1 - 0.005, cx.yInterno0 + k * ALTURA_GAVETA, cx.yInterno0 + (k + 1) * ALTURA_GAVETA, zInterno, zInterno - 0.02, puxador === 'toque' ? 'toque' : 'cava', `gaveta-${i}-${k}`, 'corpo')
          );
        }
        prateleira(yG + C / 2);
        cabideiro(topo - 0.1);
        break;
      }
    }
  });

  if (portas === 'abrir') {
    partes.forEach((parte, i) => {
      frentes.push(...portasDeAbrir({ x0: parte.faixa0, x1: parte.faixa1, y0: RODAPE.altura, y1: yMaleiro }, d, puxador, 'vertical', `porta-${i}`));
      if (comMaleiro) frentes.push(...portasDeAbrir({ x0: parte.faixa0, x1: parte.faixa1, y0: yMaleiro, y1: h }, d, puxador, 'horizontal', `maleiro-${i}`));
    });
  } else if (portas === 'correr') {
    const n = Math.max(2, Math.round(w / 1.1));
    const folha = w / n + 0.03;
    const hp = h - RODAPE.altura - 0.04;
    fixas.push(peca([w, 0.04, 0.05], [0, h - 0.02, dc + 0.025], 'metal'));
    for (let i = 0; i < n; i++) {
      // Duas linhas de trilho; as folhas sobrepõem 3 cm.
      const trilho = i % 2 === 0 ? 0 : 0.026;
      const xc = Math.min(w / 2 - folha / 2, Math.max(-w / 2 + folha / 2, -w / 2 + (w / n) * (i + 0.5)));
      const z = dc + 0.004 + ESPESSURA.frente / 2 + trilho;
      const lado: 1 | -1 = i % 2 === 0 ? 1 : -1;
      frentes.push({
        id: `correr-${i}`,
        tipo: 'porta',
        largura: folha,
        altura: hp,
        movimento: { tipo: 'correr', deslocamento: (i === n - 1 ? -1 : 1) * (w / n) * 0.9 },
        pecas: mover(
          [peca([folha, hp, ESPESSURA.frente], [0, 0, 0], 'frente'), ...mover(puxadorPecas(puxador === 'alca' ? 'perfil' : puxador, folha, hp, lado, 'vertical'), [0, 0, ESPESSURA.frente / 2])],
          [xc, RODAPE.altura + hp / 2, z]
        ),
      });
    }
  }
  return { fixas, frentes };
}

export interface ParamsBalcao {
  w: number;
  /** Altura da caixa, sem o tampo. */
  h: number;
  /** Profundidade da caixa (o tampo avança por cima). */
  d: number;
  puxador?: Puxador;
  /** X local da pia: o módulo dela fica com portas (sifão). */
  xPia?: number;
  /** Largura no início (x = -w/2) coberta pelo retorno da bancada em L: canto sem porta. */
  cantoCego?: number;
}

/** Balcão inferior: módulos de até 60 cm, gaveteiro de 3 na ponta oposta à pia, canto cego e rodapé recuado. */
export function gerarBalcao(p: ParamsBalcao): Marcenaria {
  const { w, h, d } = p;
  const puxador = p.puxador ?? 'alca';
  const rodape = 0.1;
  const dc = d - ESPESSURA.frente - 0.002;
  const fixas: Peca[] = [peca([w - 0.02, rodape, dc - RODAPE.recuo], [0, rodape / 2, (dc - RODAPE.recuo) / 2], 'sombra')];
  const cx = caixaria(w, h, dc, rodape);
  fixas.push(...cx.fixas);
  const frentes: Frente[] = [];
  const canto = Math.max(0, p.cantoCego ?? 0);
  if (canto > 0) fixas.push(peca([canto - ESPESSURA.folga, h - rodape - ESPESSURA.folga, ESPESSURA.frente], [-w / 2 + canto / 2, (rodape + h) / 2, d - ESPESSURA.frente / 2], 'frente'));
  const x0 = -w / 2 + canto;
  const util = w - canto;
  const n = Math.max(1, Math.ceil(util / LARGURA_MAX_PORTA - 1e-9));
  const passo = util / n;
  const indicePia = p.xPia === undefined ? -1 : Math.min(n - 1, Math.max(0, Math.floor((p.xPia - x0) / passo)));
  const indiceGavetas = indicePia === n - 1 ? 0 : n - 1;
  for (let i = 0; i < n; i++) {
    const a = x0 + passo * i;
    const b = a + passo;
    if (i > 0) fixas.push(peca([ESPESSURA.caixaria, h - rodape - 2 * ESPESSURA.caixaria, dc - 0.01], [a, (rodape + h) / 2, (dc - 0.01) / 2 + 0.01], 'corpo'));
    if (i === indiceGavetas && n > 1) {
      const alt = (h - rodape) / 3;
      for (let k = 0; k < 3; k++) frentes.push(gaveta(a, b, rodape + k * alt, rodape + (k + 1) * alt, d, dc - 0.02, puxador, `gaveta-${i}-${k}`));
    } else {
      if (i !== indicePia) fixas.push(peca([passo - ESPESSURA.caixaria, ESPESSURA.caixaria, dc - 0.03], [(a + b) / 2, (rodape + h) / 2, (dc - 0.03) / 2 + 0.01], 'corpo'));
      frentes.push(...portasDeAbrir({ x0: a, x1: b, y0: rodape, y1: h }, d, puxador, 'horizontal', `porta-${i}`));
    }
  }
  return { fixas, frentes };
}

export interface ParamsAereo {
  w: number;
  h: number;
  d: number;
  puxador?: Puxador;
}

/** Aéreo: caixa, prateleira a meia altura e portas de até 60 cm. */
export function gerarAereo(p: ParamsAereo): Marcenaria {
  const { w, h, d } = p;
  const dc = d - ESPESSURA.frente - 0.002;
  const cx = caixaria(w, h, dc, 0);
  const fixas = [...cx.fixas, peca([w - 2 * ESPESSURA.caixaria, ESPESSURA.caixaria, dc - 0.03], [0, h / 2, (dc - 0.03) / 2 + 0.01], 'corpo')];
  const n = Math.max(1, Math.round(w / 1.0));
  const partes = dividir(w, n);
  partes.forEach((parte, i) => {
    if (i > 0) fixas.push(peca([ESPESSURA.caixaria, h - 2 * ESPESSURA.caixaria, dc - 0.01], [parte.x0 - ESPESSURA.caixaria / 2, h / 2, (dc - 0.01) / 2 + 0.01], 'corpo'));
  });
  const frentes = partes.flatMap((parte, i) =>
    portasDeAbrir({ x0: parte.faixa0, x1: parte.faixa1, y0: 0, y1: h }, d, p.puxador ?? 'toque', 'horizontal', `porta-${i}`)
  );
  return { fixas, frentes };
}

/** Caixa que envolve todas as peças com as frentes fechadas (para testes e conferência). */
export function envoltoriaDasPecas(m: Marcenaria) {
  const todas = [...m.fixas, ...m.frentes.flatMap((f) => f.pecas)];
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  todas.forEach((p) => {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], p.posicao[k] - p.tamanho[k] / 2);
      max[k] = Math.max(max[k], p.posicao[k] + p.tamanho[k] / 2);
    }
  });
  return { min, max };
}
