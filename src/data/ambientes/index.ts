import type { Ambiente, DefinicaoAmbiente } from '../cenarios';
import { QUARTO } from './quarto';
import { COZINHA } from './cozinha';
import { CLOSET } from './closet';
import { HOME_OFFICE } from './homeOffice';
import { BANHEIRO } from './banheiro';

/** Um arquivo por ambiente: planta padrão, aberturas, módulos permitidos e iniciais. */
export const CENARIOS_AMBIENTES: Record<Ambiente, DefinicaoAmbiente> = {
  quarto: QUARTO,
  cozinha: COZINHA,
  closet: CLOSET,
  'home-office': HOME_OFFICE,
  banheiro: BANHEIRO,
};
