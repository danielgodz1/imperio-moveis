import type { DefinicaoAmbiente } from '../cenarios';

export const CLOSET: DefinicaoAmbiente = {
  id: 'closet',
  rotulo: 'Closet',
  descricaoReferencia:
    'Closet arquitetônico com armários piso-teto, colmeia iluminada, ilha vitrine, penteadeira camarim e sapateira espelhada.',
  fotoReferencia: 'quarto-bebe-nichos',
  fotosInspiracao: ['quarto-bebe-nichos', 'dormitorio-led-1'],
  dimensoesPadrao: { largura_m: 3.4, profundidade_m: 3.2, pe_direito_m: 2.7 },
  limites: {
    largura: { min: 2.2, max: 5.0 },
    profundidade: { min: 2.2, max: 5.0 },
    pe_direito: { min: 2.4, max: 3.4 },
  },
  aberturasPadrao: [{ tipo: 'porta', parede: 'S', largura_m: 0.8, posicaoOffset_m: 0, peitoril_m: 0, altura_m: 2.1 }],
  modulosPermitidos: [
    'guarda-roupa',
    'prateleiras-closet',
    'nichos-led',
    'ilha-closet',
    'penteadeira-camarim',
    'sapateira-espelhada',
  ],
  modulosIniciais: ['guarda-roupa', 'prateleiras-closet', 'nichos-led', 'ilha-closet', 'sapateira-espelhada'],
  piso: 'madeira-clara',
  paredeDestaque: 'O',
  posicaoCamera: [3.9, 3.0, 4.4],
};
