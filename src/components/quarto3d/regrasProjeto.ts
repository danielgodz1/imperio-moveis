import { CATALOGO_MODULOS_CENARIO, ModuloId, ParedeCardeal } from '../../data/cenarios';
import {
  Abertura,
  ALTURA_BANCADA,
  CENTRO_TELA_TV,
  Caixa2D,
  Dimensoes,
  Instancia,
  PASSO_MOVER,
  TOLERANCIA,
  caixasModulo,
  comprimentoParede,
  elevacao,
  limitesModulo,
  pontoNoMundo,
  posCooktopIlha,
  posPia,
  prenderAoAmbiente,
  sobrepoe,
  validarLayout,
  zonasDeUso,
} from './motorGeometrico';

/**
 * Regras de projeto de marcenaria, acima da geometria pura: circulação, giro de portas,
 * cama x TV e cozinha. Tudo deriva das mesmas caixas usadas para desenhar.
 */

export interface Sugestao {
  rotulo: string;
  alteracao: Partial<Instancia>;
}

export interface Problema {
  regra: string;
  mensagem: string;
}

export interface Projeto {
  modulos: Instancia[];
  aberturas: Abertura[];
  dimensoes: Dimensoes;
}

export type Problemas = Map<string, Problema[]>;

/** Abaixo desta altura o móvel ocupa a circulação; acima (aéreos), passa-se por baixo. */
const ALTURA_LIVRE = 1.4;
export const DISTANCIA_MIN_TV = 2.0;
export const CENTRO_TELA_MIN = 1.0;
export const CENTRO_TELA_MAX = 1.2;
/** Lados do triângulo de trabalho (m), referência usual de projeto de cozinha. */
export const LADO_TRIANGULO = { min: 1.2, max: 2.7 };
export const SOMA_TRIANGULO_MAX = 7.9;
/** Distância mínima do cooktop até a geladeira (m). */
export const AFASTAMENTO_COOKTOP_GELADEIRA = 0.6;

const PAREDES: Array<Exclude<ParedeCardeal, 'centro'>> = ['N', 'O', 'L', 'S'];
const OPOSTA: Record<Exclude<ParedeCardeal, 'centro'>, Exclude<ParedeCardeal, 'centro'>> = { N: 'S', S: 'N', O: 'L', L: 'O' };
const NOME_COM_ARTIGO: Record<ParedeCardeal, string> = {
  N: 'do fundo',
  S: 'da frente',
  O: 'da esquerda',
  L: 'da direita',
  centro: 'solta',
};

/** Peças grandes que servem de referência: quem invade a área delas é que deve sair. */
const ANCORAS: ModuloId[] = ['bancada-l', 'cabeceira-ripada-led'];

const rotulo = (id: ModuloId) => CATALOGO_MODULOS_CENARIO[id]?.rotulo ?? id;
const primeiraMaiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function anotar(mapa: Problemas, uid: string, p: Problema) {
  const lista = mapa.get(uid) ?? [];
  if (!lista.some((q) => q.regra === p.regra)) lista.push(p);
  mapa.set(uid, lista);
}

/** Pode ficar dentro da área de uso do outro (ex.: mesa de cabeceira ao lado da cama). */
function permitidoNaZona(dono: Instancia, intruso: Instancia): boolean {
  if (dono.id === 'cabeceira-ripada-led' && intruso.id === 'criado-mudo') return true;
  if (dono.id === 'bancada-l' && intruso.id === 'bancada-l') return true;
  return false;
}

function mensagemZona(dono: Instancia): { regra: string; mensagem: string } {
  switch (dono.id) {
    case 'guarda-roupa':
      return (dono.portas ?? 'abrir') !== 'abrir'
        ? { regra: 'circulacao-guarda-roupa', mensagem: 'Falta passagem de 40 cm na frente do guarda-roupa.' }
        : { regra: 'circulacao-guarda-roupa', mensagem: 'Sem 60 cm livres para abrir as portas do guarda-roupa.' };
    case 'cabeceira-ripada-led':
      return { regra: 'circulacao-cama', mensagem: 'Falta 60 cm livres ao lado da cama.' };
    default:
      return { regra: 'circulacao-cozinha', mensagem: 'Falta 90 cm de passagem na cozinha.' };
  }
}

function foraDoAmbiente(c: Caixa2D, dim: Dimensoes): boolean {
  const W = dim.largura_m / 2;
  const D = dim.profundidade_m / 2;
  return c.minX < -W - TOLERANCIA || c.maxX > W + TOLERANCIA || c.minZ < -D - TOLERANCIA || c.maxZ > D + TOLERANCIA;
}

function regraCirculacao(p: Projeto, mapa: Problemas) {
  const caixas = p.modulos.map((m) => caixasModulo(m, p.dimensoes).filter((c) => c.minY < ALTURA_LIVRE));
  p.modulos.forEach((dono) => {
    const zonas = zonasDeUso(dono, p.dimensoes);
    if (zonas.length === 0) return;
    const base = mensagemZona(dono);
    if (zonas.some((z) => foraDoAmbiente(z, p.dimensoes))) anotar(mapa, dono.uid, base);
    p.modulos.forEach((intruso, j) => {
      if (intruso.uid === dono.uid || permitidoNaZona(dono, intruso)) return;
      if (!zonas.some((z) => caixas[j].some((c) => sobrepoe(z, c)))) return;
      if (ANCORAS.includes(intruso.id) && !ANCORAS.includes(dono.id)) {
        anotar(mapa, dono.uid, base);
      } else {
        anotar(mapa, intruso.uid, {
          regra: base.regra,
          mensagem: `Ocupa a área livre de ${rotulo(dono.id).toLowerCase()}.`,
        });
      }
    });
  });
}

function janelaNaFaixa(parede: ParedeCardeal, centro: number, meia: number, aberturas: Abertura[]): boolean {
  return aberturas.some(
    (ab) => ab.tipo === 'janela' && ab.parede === parede && Math.abs(ab.posicaoOffset_m - centro) < meia + ab.largura_m / 2 - TOLERANCIA
  );
}

function regraCamaTv(p: Projeto, mapa: Problemas) {
  const cama = p.modulos.find((m) => m.id === 'cabeceira-ripada-led');
  if (!cama || cama.parede === 'centro') return;
  if (janelaNaFaixa(cama.parede, cama.offset_m, cama.largura_m / 2, p.aberturas)) {
    anotar(mapa, cama.uid, { regra: 'cabeceira-janela', mensagem: 'Cabeceira encostada na janela. Ela pede parede cheia.' });
  }
  const oposta = OPOSTA[cama.parede];
  const [cx, cz] = pontoNoMundo(cama, p.dimensoes, 0, cama.profundidade_m);
  p.modulos
    .filter((m) => m.id === 'painel-tv-ripado')
    .forEach((tv) => {
      if (tv.parede !== oposta) {
        anotar(mapa, tv.uid, { regra: 'tv-oposta', mensagem: 'TV fora da frente da cama.' });
        return;
      }
      const [tx, tz] = pontoNoMundo(tv, p.dimensoes, 0, 0.068);
      if (Math.hypot(tx - cx, tz - cz) < DISTANCIA_MIN_TV - TOLERANCIA) {
        anotar(mapa, tv.uid, { regra: 'tv-distancia', mensagem: 'TV a menos de 2 m da cabeceira.' });
      }
      const centro = elevacao(tv.id, p.dimensoes.pe_direito_m, tv.altura_m) + CENTRO_TELA_TV;
      if (centro < CENTRO_TELA_MIN - TOLERANCIA || centro > CENTRO_TELA_MAX + TOLERANCIA) {
        anotar(mapa, tv.uid, { regra: 'tv-altura', mensagem: 'Centro da tela fora de 100 a 120 cm do piso.' });
      }
    });
}

export interface PontosCozinha {
  pia?: { x: number; z: number; modulo: Instancia };
  cooktop?: { x: number; z: number; modulo: Instancia };
  geladeira?: { x: number; z: number; modulo: Instancia };
}

/** Pia, cooktop e geladeira no mundo, a partir das mesmas posições usadas no desenho. */
export function pontosCozinha(p: Projeto): PontosCozinha {
  const r: PontosCozinha = {};
  const bancada = p.modulos.find((m) => m.id === 'bancada-l');
  const ilha = p.modulos.find((m) => m.id === 'ilha');
  const geladeira = p.modulos.find((m) => m.id === 'nicho-geladeira');
  if (bancada) {
    const [x, z] = pontoNoMundo(bancada, p.dimensoes, ...posPia(bancada.largura_m, bancada.profundidade_m));
    r.pia = { x, z, modulo: bancada };
  }
  if (ilha) {
    const [x, z] = pontoNoMundo(ilha, p.dimensoes, ...posCooktopIlha(ilha.largura_m, ilha.profundidade_m));
    r.cooktop = { x, z, modulo: ilha };
  }
  if (geladeira) {
    const [x, z] = pontoNoMundo(geladeira, p.dimensoes, 0, geladeira.profundidade_m);
    r.geladeira = { x, z, modulo: geladeira };
  }
  return r;
}

/** Lados do triângulo de trabalho e se estão dentro da referência. */
export function avaliarTriangulo(a: { x: number; z: number }, b: { x: number; z: number }, c: { x: number; z: number }) {
  const lados = [Math.hypot(a.x - b.x, a.z - b.z), Math.hypot(b.x - c.x, b.z - c.z), Math.hypot(c.x - a.x, c.z - a.z)];
  const soma = lados.reduce((s, l) => s + l, 0);
  const ok = lados.every((l) => l >= LADO_TRIANGULO.min - TOLERANCIA && l <= LADO_TRIANGULO.max + TOLERANCIA) && soma <= SOMA_TRIANGULO_MAX;
  return { lados, soma, ok };
}

/** Cooktop em móvel de parede não pode ficar sob janela (vento apaga a chama e mancha o vidro). */
export function cooktopSobJanela(modulo: Instancia, coordenadaNaParede: number, aberturas: Abertura[]): boolean {
  return modulo.parede !== 'centro' && janelaNaFaixa(modulo.parede, coordenadaNaParede, 0.33, aberturas);
}

function distanciaPontoCaixa(x: number, z: number, c: Caixa2D): number {
  const dx = Math.max(c.minX - x, 0, x - c.maxX);
  const dz = Math.max(c.minZ - z, 0, z - c.maxZ);
  return Math.hypot(dx, dz);
}

function regraCozinha(p: Projeto, mapa: Problemas) {
  const bancadas = p.modulos.filter((m) => m.id === 'bancada-l');
  bancadas.forEach((b) => {
    if (Math.abs(b.altura_m - ALTURA_BANCADA) > 0.025) {
      anotar(mapa, b.uid, { regra: 'bancada-altura', mensagem: 'Bancada fora dos 90 cm de altura.' });
    }
  });
  p.modulos
    .filter((m) => m.id === 'armarios-altos')
    .forEach((aereo) => {
      const base = elevacao(aereo.id, p.dimensoes.pe_direito_m, aereo.altura_m);
      bancadas
        .filter((b) => b.parede === aereo.parede && Math.abs(b.offset_m - aereo.offset_m) < (b.largura_m + aereo.largura_m) / 2)
        .forEach((b) => {
          const vao = base - b.altura_m;
          if (vao < 0.6 - TOLERANCIA || vao > 0.7 + TOLERANCIA) {
            anotar(mapa, aereo.uid, { regra: 'aereo-vao', mensagem: 'Aéreo fora de 60 a 70 cm acima da bancada.' });
          }
        });
    });

  const { pia, cooktop, geladeira } = pontosCozinha(p);
  if (cooktop) {
    const eixo = cooktop.modulo.parede === 'N' || cooktop.modulo.parede === 'S' ? cooktop.x : cooktop.z;
    if (cooktopSobJanela(cooktop.modulo, eixo, p.aberturas)) {
      anotar(mapa, cooktop.modulo.uid, { regra: 'cooktop-janela', mensagem: 'Cooktop embaixo da janela.' });
    }
  }
  if (cooktop && geladeira) {
    const perto = caixasModulo(geladeira.modulo, p.dimensoes).some(
      (c) => distanciaPontoCaixa(cooktop.x, cooktop.z, c) < AFASTAMENTO_COOKTOP_GELADEIRA - TOLERANCIA
    );
    if (perto) anotar(mapa, geladeira.modulo.uid, { regra: 'cooktop-geladeira', mensagem: 'Geladeira colada no cooktop.' });
  }
  if (pia && cooktop && geladeira && !avaliarTriangulo(pia, cooktop, geladeira).ok) {
    anotar(mapa, geladeira.modulo.uid, {
      regra: 'triangulo',
      mensagem: 'Pia, cooktop e geladeira fora do triângulo de trabalho (lados de 1,2 a 2,7 m).',
    });
  }
}

/** Todas as regras. Mapa vazio = projeto plausível. */
export function validarProjeto(p: Projeto): Problemas {
  const mapa: Problemas = new Map();
  validarLayout(p.modulos, p.aberturas, p.dimensoes, rotulo).forEach((msg, uid) => {
    anotar(mapa, uid, { regra: 'geometria', mensagem: `${primeiraMaiuscula(msg)}.` });
  });
  regraCirculacao(p, mapa);
  regraCamaTv(p, mapa);
  regraCozinha(p, mapa);
  return mapa;
}

function comPeca(p: Projeto, peca: Instancia): Projeto {
  return { ...p, modulos: p.modulos.map((m) => (m.uid === peca.uid ? peca : m)) };
}

/** A troca resolve a peça sem criar problema em peças que estavam corretas. */
function resolve(p: Projeto, antes: Problemas, peca: Instancia): boolean {
  const depois = validarProjeto(comPeca(p, peca));
  if (depois.has(peca.uid)) return false;
  for (const uid of depois.keys()) if (!antes.has(uid)) return false;
  return true;
}

function paredesCandidatas(peca: Instancia, problemas: Problema[], p: Projeto): ParedeCardeal[] {
  const regras = new Set(problemas.map((q) => q.regra));
  const cama = p.modulos.find((m) => m.id === 'cabeceira-ripada-led');
  if (regras.has('tv-oposta') && cama && cama.parede !== 'centro') return [OPOSTA[cama.parede]];
  if (peca.parede === 'centro') return ['centro'];
  const ordem = [peca.parede, ...PAREDES.filter((w) => w !== peca.parede)];
  if (regras.has('cabeceira-janela')) {
    return ordem.filter((w) => !p.aberturas.some((a) => a.tipo === 'janela' && a.parede === w));
  }
  return ordem;
}

/** Posições a testar, da mais próxima da atual para a mais distante, em passos de 5 cm. */
function posicoes(peca: Instancia, parede: ParedeCardeal, dim: Dimensoes): Array<[number, number]> {
  if (parede === 'centro') {
    const r: Array<[number, number]> = [];
    for (let x = -dim.largura_m / 2; x <= dim.largura_m / 2; x += PASSO_MOVER * 2)
      for (let z = -dim.profundidade_m / 2; z <= dim.profundidade_m / 2; z += PASSO_MOVER * 2) r.push([x, z]);
    return r.sort((a, b) => Math.hypot(a[0] - peca.offset_m, a[1] - peca.z_m) - Math.hypot(b[0] - peca.offset_m, b[1] - peca.z_m));
  }
  const meia = comprimentoParede(parede, dim) / 2;
  const ref = parede === peca.parede ? peca.offset_m : 0;
  const r: Array<[number, number]> = [];
  for (let o = -meia; o <= meia + 1e-9; o += PASSO_MOVER) r.push([Math.round(o / PASSO_MOVER) * PASSO_MOVER, 0]);
  return r.sort((a, b) => Math.abs(a[0] - ref) - Math.abs(b[0] - ref));
}

/** Correção de um clique para a peça com problema, ou nada se não houver uma segura. */
export function sugerirCorrecao(p: Projeto, uid: string, problemas: Problemas = validarProjeto(p)): Sugestao | null {
  const peca = p.modulos.find((m) => m.uid === uid);
  const lista = problemas.get(uid);
  if (!peca || !lista) return null;
  const regras = new Set(lista.map((q) => q.regra));

  if (regras.has('bancada-altura')) {
    const alteracao = { altura_m: ALTURA_BANCADA };
    if (resolve(p, problemas, { ...peca, ...alteracao })) return { rotulo: 'Voltar para 90 cm', alteracao };
  }
  if (regras.has('circulacao-guarda-roupa') && peca.id === 'guarda-roupa' && (peca.portas ?? 'abrir') === 'abrir') {
    const alteracao = { portas: 'correr' as const };
    if (resolve(p, problemas, { ...peca, ...alteracao })) return { rotulo: 'Usar portas de correr', alteracao };
  }

  for (const parede of paredesCandidatas(peca, lista, p)) {
    const lim = limitesModulo({ id: peca.id, parede }, p.dimensoes);
    const base: Instancia = { ...peca, parede, largura_m: Math.min(peca.largura_m, lim.largura.max), rotacao: parede === 'centro' ? peca.rotacao : 0 };
    for (const [o, z] of posicoes(peca, parede, p.dimensoes)) {
      const cand = prenderAoAmbiente({ ...base, offset_m: o, z_m: parede === 'centro' ? z : 0 }, p.dimensoes);
      if (cand.parede === peca.parede && Math.abs(cand.offset_m - peca.offset_m) < 1e-6 && Math.abs(cand.z_m - peca.z_m) < 1e-6) continue;
      if (!resolve(p, problemas, cand)) continue;
      const alteracao: Partial<Instancia> = { parede: cand.parede, offset_m: cand.offset_m, z_m: cand.z_m, largura_m: cand.largura_m, rotacao: cand.rotacao };
      if (parede === peca.parede) return { rotulo: parede === 'centro' ? 'Mover para um ponto livre' : 'Ajustar a posição na mesma parede', alteracao };
      const temPorta = p.aberturas.some((a) => a.tipo === 'porta' && a.parede === parede);
      return { rotulo: `Mover para a parede ${temPorta ? 'da porta' : NOME_COM_ARTIGO[parede]}`, alteracao };
    }
  }
  return null;
}

const ENCAIXE = 0.08;

/**
 * Encaixe ao arrastar: a lateral da peça cola na lateral da vizinha da mesma parede (ou na ponta da parede)
 * quando chega a menos de 8 cm. Vizinha igual também alinha a altura (topo e base juntos).
 */
export function encaixar(peca: Instancia, outros: Instancia[], dim: Dimensoes): Instancia {
  if (peca.parede === 'centro') return peca;
  const meia = peca.largura_m / 2;
  const fim = comprimentoParede(peca.parede, dim) / 2;
  let melhor: { offset: number; dist: number; vizinha?: Instancia } | null = null;
  const tentar = (offset: number, vizinha?: Instancia) => {
    const dist = Math.abs(offset - peca.offset_m);
    if (dist <= ENCAIXE && (!melhor || dist < melhor.dist)) melhor = { offset, dist, vizinha };
  };
  tentar(-fim + meia);
  tentar(fim - meia);
  outros
    .filter((o) => o.uid !== peca.uid && o.parede === peca.parede)
    .forEach((o) => {
      tentar(o.offset_m - o.largura_m / 2 - meia, o);
      tentar(o.offset_m + o.largura_m / 2 + meia, o);
    });
  const achado = melhor as { offset: number; dist: number; vizinha?: Instancia } | null;
  if (!achado) return peca;
  const altura_m = achado.vizinha && achado.vizinha.id === peca.id ? achado.vizinha.altura_m : peca.altura_m;
  return prenderAoAmbiente({ ...peca, offset_m: achado.offset, altura_m }, dim);
}
