/**
 * Ritmo da narrativa do hero: o andamento exibido persegue a rolagem com velocidade máxima,
 * para a montagem dos móveis nunca ser pulada por uma rolagem rápida.
 * Funções puras (testadas); o laço de animação fica em HeroScrollytelling.
 */

/** Tempo mínimo para ir do traço (0) à obra real (1), em segundos. */
export const TEMPO_MINIMO_S = 4.2;

/** Velocidade de aproximação quando a rolagem é lenta (quanto maior, mais colado na rolagem). */
const SUAVIDADE = 6;

/** Diferença abaixo da qual o andamento encosta no alvo. */
const ENCOSTE = 0.0005;

/**
 * Um passo do andamento exibido em direção ao alvo (a rolagem).
 * Perto do alvo, aproxima suave (como o scrub); longe, anda no máximo 1/TEMPO_MINIMO_S por segundo.
 */
export function avancarAndamento(atual: number, alvo: number, dt: number, tempoMinimo = TEMPO_MINIMO_S): number {
  const dif = alvo - atual;
  if (Math.abs(dif) < ENCOSTE) return alvo;
  const passoMax = dt / tempoMinimo;
  let passo = dif * Math.min(1, dt * SUAVIDADE);
  if (Math.abs(passo) > passoMax) passo = Math.sign(dif) * passoMax;
  return Math.min(1, Math.max(0, atual + passo));
}

/** A narrativa conta como vista quando chega à foto da obra. */
export const ANDAMENTO_CONCLUIDO = 0.995;

/**
 * Onde a página deve ficar enquanto a montagem não termina: no máximo no fim do hero
 * (último ponto em que ele ainda está fixo na tela). Devolve null quando não precisa segurar.
 */
export function posicaoSegura(scrollY: number, fimDoHero: number, andamento: number, liberado: boolean): number | null {
  if (liberado || andamento >= ANDAMENTO_CONCLUIDO) return null;
  return scrollY > fimDoHero + 1 ? fimDoHero : null;
}
