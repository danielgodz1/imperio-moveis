export type RoomType = 'cozinha' | 'closet' | 'hometheater' | 'suite' | 'adega' | 'escritorio' | 'banheiro';

export interface WoodFinish {
  id: string;
  name: string;
  nativeName: string;
  origin: string;
  description: string;
  colorHex: string;
  bgGradient: string;
  grainPattern: 'linear' | 'catedral' | 'ondulado' | 'homogeneo';
  sheenOptions: Array<'Fosco (10%)' | 'Acetinado (30%)' | 'Semi-Brilho (60%)'>;
  durabilityScore: number; // 1-10
  moistureResistance: 'Alta (Naval)' | 'Média' | 'Excelente';
  idealForRooms: string[];
  priceTier: 'Standard Alto Padrão' | 'Nobre Executivo' | 'Coleção Especial';
  imageUrl: string;
  textureUrl: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: RoomType;
  location: string;
  completionYear: string;
  description: string;
  woodSpecies: string;
  hardwareBrand: string;
  lightingSpec: string;
  heroImage: string;
  detailImages: string[];
  architectName?: string;
  highlights: string[];
}

export interface Review {
  id: string;
  authorName: string;
  role: string;
  location: string;
  text: string;
  starRating: number;
  date: string;
  verified: boolean;
  projectType: string;
  avatarUrl: string;
}

export interface SpecQuote {
  roomType: RoomType;
  roomTitle: string;
  widthMeters: number;
  heightMeters: number;
  depthMeters: number;
  woodFinishId: string;
  hardwareGrade: 'Premium Blum (Áustria)' | 'Grass Tiomos (Alemanha)' | 'Salice Italian';
  lightingPackage: 'LED Embutido 2700K Quente' | 'LED Sensores de Presença' | 'Sem Iluminação';
  glassFronts: boolean;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  deliveryDays: number;
  warrantyYears: number;
  clientName: string;
  clientPhone: string;
  clientCity: string;
}
