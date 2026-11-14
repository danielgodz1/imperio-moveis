import { EMPRESA } from './empresa';

export interface SecaoLegal {
  titulo: string;
  paragrafos: string[];
  /** Lista opcional depois dos parágrafos. */
  itens?: string[];
}

export interface DocumentoLegal {
  rota: '/privacidade' | '/termos';
  titulo: string;
  resumo: string;
  /** Data da última revisão do texto (AAAA-MM-DD). Atualizar sempre que o conteúdo mudar. */
  atualizadoEm: string;
  secoes: SecaoLegal[];
  /** Fontes oficiais citadas no texto (links externos para a lei e a autoridade). */
  fontes?: { rotulo: string; url: string }[];
}

const CIDADE = `${EMPRESA.endereco.cidade}/${EMPRESA.endereco.uf}`;
const CONTATO = `WhatsApp ${EMPRESA.telefone}`;

/**
 * Textos legais do site. Descrevem o que o site realmente faz hoje (formulário, 3D, medição de
 * audiência). Se o site passar a coletar algo novo, este arquivo precisa ser atualizado junto.
 * Dados da empresa ainda não informados pelos donos (razão social, CNPJ, e-mail) entram em
 * `EMPRESA` quando existirem; até lá o texto usa o nome fantasia e o WhatsApp.
 */
export const POLITICA_PRIVACIDADE: DocumentoLegal = {
  rota: '/privacidade',
  titulo: 'Política de Privacidade',
  resumo:
    'Como a Império Móveis Planejados trata os dados de quem visita o site e pede orçamento, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).',
  atualizadoEm: '2026-11-12',
  fontes: [
    { rotulo: 'Lei Geral de Proteção de Dados (Lei 13.709/2018), no site do Planalto', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm' },
    { rotulo: 'Autoridade Nacional de Proteção de Dados (ANPD)', url: 'https://www.gov.br/anpd/pt-br' },
  ],
  secoes: [
    {
      titulo: '1. Quem cuida dos seus dados',
      paragrafos: [
        `A ${EMPRESA.nome}, marcenaria e arquitetura de interiores em ${CIDADE}, é a controladora dos dados tratados neste site. Para qualquer assunto sobre privacidade, fale com a gente pelo ${CONTATO}.`,
      ],
    },
    {
      titulo: '2. Quais dados o site coleta',
      paragrafos: ['Só coletamos o que é preciso para responder você e melhorar o site.'],
      itens: [
        'Pedido de orçamento: nome, WhatsApp, cidade ou bairro, ambientes que quer planejar, quando quer começar, estilo desejado e observações que você escrever.',
        'Fotos ou planta: se você escolher enviar, elas seguem direto do seu aparelho para a conversa no WhatsApp. O site não guarda esses arquivos.',
        'Projeto 3D: o ambiente que você monta fica salvo apenas no seu navegador, para você continuar depois. Ao enviar, o resumo e a imagem vão para a conversa no WhatsApp.',
        'Navegação: páginas visitadas, cliques em botões, tipo de aparelho e cidade aproximada, medidos de forma agregada pelo Google Tag Manager e Google Analytics.',
      ],
    },
    {
      titulo: '3. Para que usamos',
      paragrafos: ['Usamos seus dados para:'],
      itens: [
        'responder seu pedido e preparar o orçamento (execução de procedimentos preliminares a contrato, a seu pedido);',
        'entrar em contato pelo WhatsApp, com o seu consentimento, marcado no formulário;',
        'entender como o site é usado e melhorar as páginas (legítimo interesse, com dados agregados);',
        'cumprir obrigações legais, quando houver.',
      ],
    },
    {
      titulo: '4. Com quem compartilhamos',
      paragrafos: [
        'Não vendemos nem alugamos seus dados. Eles passam apenas pelos serviços que fazem o site funcionar:',
      ],
      itens: [
        'WhatsApp (Meta), onde a conversa de orçamento acontece;',
        'Google (Tag Manager, Analytics, Maps, Fonts e avaliações do Perfil da Empresa), para medição de audiência, mapa, fontes e avaliações exibidas;',
        'Vercel, que hospeda o site.',
      ],
    },
    {
      titulo: '5. Cookies e armazenamento no navegador',
      paragrafos: [
        'O site usa cookies de medição do Google Analytics e guarda no seu navegador o projeto 3D em andamento e a informação de que você já viu o aviso do 3D. Você pode apagar ou bloquear cookies e dados do site nas configurações do navegador; o site continua funcionando, e o projeto 3D salvo é perdido.',
      ],
    },
    {
      titulo: '6. Por quanto tempo guardamos',
      paragrafos: [
        'As conversas de orçamento ficam no WhatsApp enquanto durar o atendimento e, depois, pelo prazo necessário para garantia e obrigações legais. Os dados de navegação seguem o prazo de retenção do Google Analytics. Você pode pedir a exclusão a qualquer momento.',
      ],
    },
    {
      titulo: '7. Seus direitos',
      paragrafos: ['A LGPD garante a você, entre outros, o direito de:'],
      itens: [
        'confirmar se tratamos seus dados e acessar esses dados;',
        'corrigir dados incompletos ou desatualizados;',
        'pedir a exclusão dos dados ou revogar o consentimento;',
        'saber com quem os dados foram compartilhados;',
        'reclamar à Autoridade Nacional de Proteção de Dados (ANPD).',
      ],
    },
    {
      titulo: '8. Como exercer seus direitos',
      paragrafos: [
        `Envie o pedido pelo ${CONTATO}. Respondemos em até 15 dias. Podemos pedir uma confirmação de identidade para proteger seus dados.`,
      ],
    },
    {
      titulo: '9. Segurança',
      paragrafos: [
        'O site funciona só por conexão segura (HTTPS), não tem área de login e não armazena documentos nem dados de pagamento. O acesso às conversas de orçamento é restrito aos responsáveis pela empresa.',
      ],
    },
    {
      titulo: '10. Crianças e adolescentes',
      paragrafos: ['O site é voltado a maiores de 18 anos. Não coletamos dados de crianças de forma intencional.'],
    },
    {
      titulo: '11. Mudanças nesta política',
      paragrafos: ['Se o site passar a tratar dados de outra forma, esta página é atualizada e a data no topo muda.'],
    },
  ],
};

export const TERMOS_DE_USO: DocumentoLegal = {
  rota: '/termos',
  titulo: 'Termos de Uso',
  resumo: 'Regras de uso do site da Império Móveis Planejados, do projeto 3D online e do pedido de orçamento.',
  atualizadoEm: '2026-11-12',
  secoes: [
    {
      titulo: '1. Sobre o site',
      paragrafos: [
        `Este site apresenta o trabalho da ${EMPRESA.nome}, de ${CIDADE}, e permite pedir orçamento e montar um projeto 3D. Ao usar o site, você concorda com estes termos.`,
      ],
    },
    {
      titulo: '2. Projeto 3D online',
      paragrafos: [
        'O 3D é uma visualização aproximada, gratuita, para você mostrar o que imagina. Medidas, cores e acabamentos na tela são referência: podem variar conforme o aparelho e não substituem a medição no local nem o projeto executivo.',
        'A imagem gerada é sua para guardar e compartilhar. Ela leva a marca da Império e não pode ser usada como se fosse projeto de outra empresa.',
      ],
    },
    {
      titulo: '3. Orçamentos',
      paragrafos: [
        'O pedido feito pelo site inicia uma conversa, sem compromisso de compra. Valores, prazos e condições só valem depois de confirmados por escrito pela Império, após a medição e a definição do projeto.',
      ],
    },
    {
      titulo: '4. Direitos Autorais e Licenciamento de Fotografias de Obras Reais',
      paragrafos: [
        'Todas as fotografias de obras reais executadas (cozinhas planejadas, dormitórios, closets, ambientes gourmet e marcenaria comercial), projetos 3D, vídeos, textos e marcas publicados neste site são de titularidade exclusiva da Império Móveis Planejados Jaú (Razão Social: Wellington Ribeiro Cabral | CNPJ 48.945.152/0001-93 — © 2026 Império Móveis Planejados Jaú. Todos os direitos reservados).',
        'Esta página (/termos) constitui a referência oficial de direitos autorais e termos de licença de uso das imagens do portfólio da Império Móveis Planejados. É vedada a reprodução, cópia, redistribuição ou utilização comercial das fotografias de obras reais sem autorização prévia e expressa por escrito. Pedidos de autorização ou licenciamento de uso de imagem devem ser formalizados diretamente pelos canais oficiais na página /contato.',
        'As avaliações exibidas vêm do Perfil da Empresa no Google e pertencem a quem as escreveu.',
      ],
    },
    {
      titulo: '5. Uso adequado',
      paragrafos: ['Ao usar o site, você se compromete a:'],
      itens: [
        'informar dados verdadeiros no pedido de orçamento;',
        'não tentar invadir, sobrecarregar ou alterar o funcionamento do site;',
        'não usar o site para enviar conteúdo ilegal ou ofensivo.',
      ],
    },
    {
      titulo: '6. Disponibilidade',
      paragrafos: [
        'Buscamos manter o site sempre no ar e atualizado, mas ele pode ficar indisponível por manutenção ou falha de terceiros. O 3D depende do navegador e do aparelho e pode não funcionar em aparelhos antigos.',
      ],
    },
    {
      titulo: '7. Links para outros serviços',
      paragrafos: [
        'O site leva ao WhatsApp, Instagram e Google Maps. Esses serviços têm termos e políticas próprios, que não são controlados pela Império.',
      ],
    },
    {
      titulo: '8. Privacidade',
      paragrafos: ['O tratamento dos seus dados segue a Política de Privacidade do site, disponível em /privacidade.'],
    },
    {
      titulo: '9. Contato, suporte e foro',
      paragrafos: [
        `Dúvidas ou problemas com o site: ${CONTATO}. Estes termos seguem as leis brasileiras, e fica eleito o foro da comarca de ${CIDADE} para resolver questões que não se resolvam por conversa.`,
      ],
    },
  ],
};

export const DOCUMENTOS_LEGAIS: Record<DocumentoLegal['rota'], DocumentoLegal> = {
  '/privacidade': POLITICA_PRIVACIDADE,
  '/termos': TERMOS_DE_USO,
};

/** Data por extenso em português (ex.: 12 de novembro de 2026). */
export function dataPorExtenso(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${dia} de ${meses[mes - 1]} de ${ano}`;
}
