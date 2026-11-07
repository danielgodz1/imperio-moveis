import { WoodFinish } from '../types';

export const WOOD_FINISHES: WoodFinish[] = [
  {
    id: 'freijo-ripado',
    name: 'Madeira Ripada Clara',
    description: 'Acabamento amadeirado quente usado em ilhas, forros ripados e cabeceiras.',
    colorHex: '#B6864C',
    grainPattern: 'linear',
    idealForRooms: ['Cozinhas', 'Quartos', 'Painéis'],
  },
  {
    id: 'areia-acetinado',
    name: 'Areia Acetinado',
    description: 'MDF claro acolhedor para portas de armários do piso ao teto e quartos infantis.',
    colorHex: '#DDD6CA',
    grainPattern: 'homogeneo',
    idealForRooms: ['Cozinhas', 'Quartos', 'Closets'],
  },
  {
    id: 'verde-salvia',
    name: 'Verde-Sálvia',
    description: 'Tom suave presente nas ilhas e frentes contemporâneas da Império.',
    colorHex: '#7B8C83',
    grainPattern: 'homogeneo',
    idealForRooms: ['Cozinhas', 'Quartos'],
  },
  {
    id: 'cinza-urbano',
    name: 'Cinza Urbano',
    description: 'Acabamento neutro equilibrado com granito preto e iluminação quente em nichos.',
    colorHex: '#7A7874',
    grainPattern: 'homogeneo',
    idealForRooms: ['Cozinhas', 'Home Office', 'Lojas'],
  },
  {
    id: 'preto-fosco',
    name: 'Preto Grafite',
    description: 'Acabamento estrutural para serralheria, expositores comerciais e balcões.',
    colorHex: '#262624',
    grainPattern: 'homogeneo',
    idealForRooms: ['Lojas', 'Cozinhas', 'Home Office'],
  },
];
