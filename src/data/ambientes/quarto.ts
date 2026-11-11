import type { DefinicaoAmbiente } from '../cenarios';

export const QUARTO: DefinicaoAmbiente = {
  id: 'quarto',
  rotulo: 'Quarto',
  descricaoReferencia:
    'Suíte planejada com sanca iluminada, cabeceira ripada em LED, guarda-roupa até o teto, penteadeira camarim e painel de TV.',
  fotoReferencia: 'dormitorio-led-1',
  fotosInspiracao: ['dormitorio-led-1', 'quarto-bebe-nichos'],
  dimensoesPadrao: { largura_m: 3.8, profundidade_m: 3.5, pe_direito_m: 2.7 },
  limites: {
    largura: { min: 2.6, max: 5.5 },
    profundidade: { min: 2.6, max: 5.5 },
    pe_direito: { min: 2.4, max: 3.4 },
  },
  aberturasPadrao: [
    { tipo: 'janela', parede: 'L', largura_m: 1.2, posicaoOffset_m: 0, peitoril_m: 1.0, altura_m: 1.1 },
    { tipo: 'porta', parede: 'S', largura_m: 0.8, posicaoOffset_m: -1.1, peitoril_m: 0, altura_m: 2.1 },
  ],
  modulosPermitidos: [
    'cabeceira-ripada-led',
    'criado-mudo',
    'guarda-roupa',
    'painel-tv-ripado',
    'penteadeira-camarim',
    'bancada-estudo-quarto',
  ],
  modulosIniciais: ['cabeceira-ripada-led', 'criado-mudo', 'guarda-roupa', 'painel-tv-ripado'],
  piso: 'madeira-clara',
  paredeDestaque: 'N',
  posicaoCamera: [4.2, 3.1, 4.8],
};
