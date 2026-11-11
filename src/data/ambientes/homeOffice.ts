import type { DefinicaoAmbiente } from '../cenarios';

export const HOME_OFFICE: DefinicaoAmbiente = {
  id: 'home-office',
  rotulo: 'Home Office',
  descricaoReferencia:
    'Escritório planejado com bancada dupla executiva, estante ripada, armário aéreo em LED, gaveteiro e sofá de apoio.',
  fotoReferencia: 'dormitorio-led-2',
  fotosInspiracao: ['dormitorio-led-2', 'comercial-expositor'],
  dimensoesPadrao: { largura_m: 3.4, profundidade_m: 3.0, pe_direito_m: 2.7 },
  limites: {
    largura: { min: 2.2, max: 5.0 },
    profundidade: { min: 2.2, max: 4.8 },
    pe_direito: { min: 2.4, max: 3.4 },
  },
  aberturasPadrao: [
    { tipo: 'janela', parede: 'L', largura_m: 1.1, posicaoOffset_m: 0, peitoril_m: 1.0, altura_m: 1.1 },
  ],
  modulosPermitidos: [
    'bancada-trabalho',
    'estante-ripada',
    'gaveteiro',
    'nichos-led',
    'armario-aereo-office',
    'sofa-recepcao',
  ],
  modulosIniciais: ['bancada-trabalho', 'estante-ripada', 'gaveteiro', 'nichos-led', 'armario-aereo-office'],
  piso: 'madeira-clara',
  paredeDestaque: 'N',
  posicaoCamera: [3.8, 3.0, 4.3],
};
