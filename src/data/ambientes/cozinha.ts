import type { DefinicaoAmbiente } from '../cenarios';

export const COZINHA: DefinicaoAmbiente = {
  id: 'cozinha',
  rotulo: 'Cozinha',
  descricaoReferencia:
    'Cozinha gourmet com bancada em L, ilha ripada com banquetas, armários até o teto, torre quente, adega iluminada e forro ripado.',
  fotoReferencia: 'cozinha-ilha-ripado',
  fotosInspiracao: ['cozinha-ilha-ripado', 'cozinha-forro-ripado', 'cozinha-ilha-verde'],
  dimensoesPadrao: { largura_m: 4.2, profundidade_m: 3.6, pe_direito_m: 2.7 },
  limites: {
    largura: { min: 2.8, max: 6.5 },
    profundidade: { min: 2.6, max: 6.0 },
    pe_direito: { min: 2.4, max: 3.5 },
  },
  aberturasPadrao: [
    { tipo: 'janela', parede: 'O', largura_m: 1.4, posicaoOffset_m: -0.3, peitoril_m: 1.1, altura_m: 1.0 },
  ],
  modulosPermitidos: ['bancada-l', 'ilha', 'armarios-altos', 'torre-forno', 'nicho-geladeira', 'cristaleira-led', 'forro-ripado-teto'],
  modulosIniciais: ['bancada-l', 'ilha', 'armarios-altos', 'torre-forno', 'nicho-geladeira', 'forro-ripado-teto'],
  piso: 'porcelanato-claro',
  paredeDestaque: 'N',
  posicaoCamera: [4.5, 3.3, 5.0],
};
