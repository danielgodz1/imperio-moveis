import { create } from 'zustand';
import { QuartoLayout, construirLayoutDoCenario } from './schema';

/** Seleção na cena: um móvel (uid) ou uma abertura (`abertura:<índice>`). */
export type Selecao = string | null;

const LIMITE_HISTORICO = 30;
export const PREFIXO_ABERTURA = 'abertura:';

export const indiceAbertura = (sel: Selecao): number | null =>
  sel && sel.startsWith(PREFIXO_ABERTURA) ? Number(sel.slice(PREFIXO_ABERTURA.length)) : null;

export interface EstadoEditor {
  layout: QuartoLayout;
  passado: QuartoLayout[];
  futuro: QuartoLayout[];
  /** Layout no início de um gesto contínuo (slider ou arrasto). */
  baseGesto: QuartoLayout | null;
  selecionado: Selecao;
  /** Portas e gavetas abertas para mostrar o interno (não entra no histórico nem no projeto). */
  verDentro: boolean;
  alternarVerDentro: () => void;
  /** Câmera na altura dos olhos, sem contornos, pronta para baixar a imagem. */
  modoFoto: boolean;
  alternarModoFoto: () => void;
  /** Registrada pela cena: renderiza uma cópia em alta resolução (largura mínima de 1920 px). */
  capturar: (() => HTMLCanvasElement | null) | null;
  /**
   * Registrada pela cena: imagem final (várias passadas somadas: bordas lisas e sombras suaves).
   * Copia a cena na hora da chamada; depois disso o editor pode mudar à vontade.
   */
  renderizarRealista: ((op: { largura: number; altura: number; passadas: number; mapaSombra: number; aoProgresso?: (f: number, fase: 'preparando' | 'calculando') => void; sinal?: AbortSignal }) => Promise<HTMLCanvasElement>) | null;
  /** Ação pontual: entra no histórico na hora. */
  aplicar: (fn: (prev: QuartoLayout) => QuartoLayout) => void;
  /** Gesto contínuo: vira um único passo de histórico em fimGesto. */
  durante: (fn: (prev: QuartoLayout) => QuartoLayout) => void;
  fimGesto: () => void;
  desfazer: () => void;
  refazer: () => void;
  selecionar: (sel: Selecao) => void;
}

const empilhar = (pilha: QuartoLayout[], item: QuartoLayout) => [...pilha.slice(-(LIMITE_HISTORICO - 1)), item];

export const criarEstadoEditor = (inicial: QuartoLayout) =>
  create<EstadoEditor>()((set, get) => ({
    layout: inicial,
    passado: [],
    futuro: [],
    baseGesto: null,
    selecionado: null,
    verDentro: false,
    alternarVerDentro: () => set({ verDentro: !get().verDentro }),
    modoFoto: false,
    capturar: null,
    renderizarRealista: null,
    alternarModoFoto: () => set({ modoFoto: !get().modoFoto, selecionado: null }),
    aplicar: (fn) => {
      const { layout, passado, baseGesto } = get();
      const proximo = fn(layout);
      if (proximo === layout) return;
      set({ layout: proximo, passado: empilhar(passado, baseGesto ?? layout), futuro: [], baseGesto: null });
    },
    durante: (fn) => {
      const { layout, baseGesto } = get();
      set({ layout: fn(layout), baseGesto: baseGesto ?? layout });
    },
    fimGesto: () => {
      const { baseGesto, passado, layout } = get();
      if (!baseGesto) return;
      set({
        baseGesto: null,
        passado: baseGesto === layout ? passado : empilhar(passado, baseGesto),
        futuro: baseGesto === layout ? get().futuro : [],
      });
    },
    desfazer: () => {
      const { passado, futuro, layout } = get();
      const anterior = passado[passado.length - 1];
      if (!anterior) return;
      set({ layout: anterior, passado: passado.slice(0, -1), futuro: [layout, ...futuro], selecionado: null, baseGesto: null });
    },
    refazer: () => {
      const { passado, futuro, layout } = get();
      const [proximo, ...resto] = futuro;
      if (!proximo) return;
      set({ layout: proximo, passado: empilhar(passado, layout), futuro: resto, selecionado: null, baseGesto: null });
    },
    selecionar: (selecionado) => set({ selecionado }),
  }));

/** Estado único do configurador. Sobrevive se a seção desmontar e montar de novo. */
export const useEditor = criarEstadoEditor(construirLayoutDoCenario('quarto', 'freijo-ripado'));
