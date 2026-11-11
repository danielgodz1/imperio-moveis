import type { Ambiente, DefinicaoAmbiente } from '../cenarios';
import { QUARTO } from './quarto.js';
import { COZINHA } from './cozinha.js';
import { CLOSET } from './closet.js';
import { HOME_OFFICE } from './homeOffice.js';
import { BANHEIRO } from './banheiro.js';

/** Um arquivo por ambiente: planta padrão, aberturas, módulos permitidos e iniciais. */
export const CENARIOS_AMBIENTES: Record<Ambiente, DefinicaoAmbiente> = {
  quarto: QUARTO,
  cozinha: COZINHA,
  closet: CLOSET,
  'home-office': HOME_OFFICE,
  banheiro: BANHEIRO,
};
