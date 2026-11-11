import { EMPRESA } from './empresa';

/**
 * Resumo do Perfil da Empresa no Google, usado enquanto a API do Google Places não estiver
 * configurada na Vercel (GOOGLE_PLACES_API_KEY). Com a chave, a seção mostra nota, total e
 * avaliações ao vivo (`/api/avaliacoes`) e este resumo deixa de aparecer.
 * Atualize os números e a data se a chave demorar para ser configurada.
 */
export const RESUMO_GOOGLE = {
  nota: 4.9,
  total: 8,
  conferidoEm: '11/11/2026',
};

export interface AvaliacaoPublicada {
  /** Nome como aparece no Google (pode ser só o primeiro nome e a inicial). */
  autor: string;
  /** 1 a 5. */
  nota: number;
  texto: string;
  /** Como aparece no Google, por exemplo "há 2 meses". */
  quando: string;
}

/**
 * Avaliações com texto do Perfil da Empresa no Google, transcritas pela Império enquanto a
 * API não estiver ativa. Só avaliações reais, com o texto igual ao do Google; o ideal é avisar
 * o cliente (ou pedir autorização) antes de publicar o nome dele no site.
 * Com a API ativa, a seção usa as avaliações ao vivo e ignora esta lista.
 */
export const AVALIACOES_PUBLICADAS: AvaliacaoPublicada[] = [
  {
    autor: 'Lucilena Aparecida',
    nota: 5,
    quando: '3 anos atrás',
    texto: 'Maravilhosa experiência,excelente atendimento,trabalho super indico, muito bom mesmo, no tempo combinado,tudo perfeito',
  },
  {
    autor: 'Camila Camargo',
    nota: 5,
    quando: '3 anos atrás',
    texto: 'Excelente .. desde ao material ao atendimento! Minha mesa ficou maravilhosa … Super indico!',
  },
  {
    autor: 'Nice Nascimento',
    nota: 5,
    quando: '3 anos atrás',
    texto: 'Excelente qualidade , excelente material , atendimento nota 10 ! Eu recomendo! ❤️',
  },
  {
    autor: 'Devolução Sephora',
    nota: 4,
    quando: '3 anos atrás',
    texto: 'Super indico!\n\nMaravilhoso atendimento ! gostei muito do preço, excelente qualidade',
  },
];

/** Ficha da Império no Google Maps: ver todas as avaliações e escrever uma. */
export const LINK_PERFIL_GOOGLE = EMPRESA.googleProfileUrl ?? EMPRESA.mapsUrl;
