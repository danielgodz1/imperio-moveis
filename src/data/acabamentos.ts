export interface Acabamento3D {
  id: string;
  nome: string;
  hex: string;
  textura?: string;
  confirmado: boolean;
}

/**
 * Catálogo de acabamentos do configurador 3D.
 * Enquanto `confirmado` for `false`, a interface exibe uma etiqueta discreta "exemplo"
 * e utiliza apenas a cor hexadecimal aproximada. Quando os donos confirmarem os nomes
 * comerciais dos MDFs/pedras utilizados na oficina, basta atualizar este arquivo.
 */
export const ACABAMENTOS_3D: Acabamento3D[] = [
  {
    id: 'freijo-ripado',
    nome: 'Madeira Ripada Clara',
    hex: '#B6864C',
    confirmado: false,
  },
  {
    id: 'areia-acetinado',
    nome: 'Areia Acetinado',
    hex: '#DDD6CA',
    confirmado: false,
  },
  {
    id: 'verde-salvia',
    nome: 'Verde-Sálvia',
    hex: '#7B8C83',
    confirmado: false,
  },
  {
    id: 'cinza-urbano',
    nome: 'Cinza Urbano',
    hex: '#7A7874',
    confirmado: false,
  },
  {
    id: 'preto-fosco',
    nome: 'Preto Grafite',
    hex: '#262624',
    confirmado: false,
  },
  {
    id: 'branco-neve',
    nome: 'Branco Acetinado',
    hex: '#EFEEEA',
    confirmado: false,
  },
];
