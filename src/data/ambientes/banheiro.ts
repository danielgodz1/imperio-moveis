import type { DefinicaoAmbiente } from '../cenarios';

/** Banheiro social ou suíte: gabinete suspenso, espelheira e nichos. Fotos de referência: [CONFIRMAR] obra real. */
export const BANHEIRO: DefinicaoAmbiente = {
  id: 'banheiro',
  rotulo: 'Banheiro',
  descricaoReferencia: 'Banheiro com gabinete suspenso, tampo em pedra, espelheira com LED e nichos iluminados.',
  fotoReferencia: 'dormitorio-led-2',
  fotosInspiracao: ['dormitorio-led-2'],
  dimensoesPadrao: { largura_m: 2.4, profundidade_m: 2.2, pe_direito_m: 2.6 },
  limites: {
    largura: { min: 1.5, max: 4.0 },
    profundidade: { min: 1.5, max: 4.0 },
    pe_direito: { min: 2.4, max: 3.2 },
  },
  aberturasPadrao: [
    { tipo: 'porta', parede: 'S', largura_m: 0.7, posicaoOffset_m: 0.6, peitoril_m: 0, altura_m: 2.1 },
    { tipo: 'janela', parede: 'L', largura_m: 0.6, posicaoOffset_m: 0.3, peitoril_m: 1.6, altura_m: 0.5 },
  ],
  modulosPermitidos: ['gabinete-banheiro', 'espelheira-led', 'nichos-led'],
  modulosIniciais: ['gabinete-banheiro', 'espelheira-led'],
  piso: 'porcelanato-claro',
  paredeDestaque: 'N',
  posicaoCamera: [3.0, 2.8, 3.4],
};
