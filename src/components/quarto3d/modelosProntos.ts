import { Ambiente, ModuloId } from '../../data/cenarios';
import { Instancia, instanciaPadrao, normalizarInstancia } from './motorGeometrico';
import { QuartoLayout, construirLayoutDoCenario } from './schema';
import { sugerirCorrecao, validarProjeto } from './regrasProjeto';

/**
 * Pontos de partida por ambiente: o cliente escolhe um e ajusta. São combinações dos módulos
 * do catálogo, não fotos de obra. [CONFIRMAR] Os donos podem trocar por projetos reais da
 * Império (nome, módulos e acabamentos) editando este arquivo.
 */
export interface ModeloPronto {
  id: string;
  ambiente: Ambiente;
  nome: string;
  descricao: string;
  montar: () => QuartoLayout;
}

interface Receita {
  acabamento?: string;
  tampo?: string;
  portas?: Instancia['portas'];
  remover?: ModuloId[];
  adicionar?: ModuloId[];
}

/** Monta a partir da cena padrão; peça adicionada entra só se o motor achar lugar válido. */
function montar(ambiente: Ambiente, r: Receita): QuartoLayout {
  const base = construirLayoutDoCenario(ambiente, r.acabamento ?? 'freijo-ripado');
  const dim = base.dimensoes;
  let modulos: Instancia[] = (base.modulos as Instancia[])
    .filter((m) => !r.remover?.includes(m.id))
    .map((m) => ({
      ...m,
      tampo: m.tampo && r.tampo ? r.tampo : m.tampo,
      portas: m.id === 'guarda-roupa' && r.portas ? r.portas : m.portas,
    }));
  for (const id of r.adicionar ?? []) {
    const nova = instanciaPadrao(id, dim, r.acabamento ?? 'freijo-ripado');
    const projeto = { modulos: [...modulos, nova], aberturas: base.aberturas, dimensoes: dim };
    if (!validarProjeto(projeto).has(nova.uid)) {
      modulos = projeto.modulos;
      continue;
    }
    const s = sugerirCorrecao(projeto, nova.uid);
    if (s) modulos = [...modulos, normalizarInstancia({ ...nova, ...s.alteracao }, dim)];
  }
  return { ...base, modulos: modulos as QuartoLayout['modulos'] };
}

const m = (id: string, ambiente: Ambiente, nome: string, descricao: string, r: Receita): ModeloPronto => ({
  id,
  ambiente,
  nome,
  descricao,
  montar: () => montar(ambiente, r),
});

export const MODELOS_PRONTOS: ModeloPronto[] = [
  m('quarto-tv', 'quarto', 'Suíte com painel de TV', 'Cabeceira ripada com LED, guarda-roupa até o teto e painel de TV em frente à cama.', {}),
  m('quarto-penteadeira', 'quarto', 'Suíte com penteadeira', 'Troca o painel de TV por uma penteadeira com espelho e LED.', {
    remover: ['painel-tv-ripado'],
    adicionar: ['penteadeira-camarim'],
  }),
  m('quarto-estudo', 'quarto', 'Quarto com bancada de estudo', 'Bancada suspensa com nicho, guarda-roupa de correr e acabamento carvalho.', {
    acabamento: 'carvalho-natural',
    portas: 'correr',
    remover: ['painel-tv-ripado'],
    adicionar: ['bancada-estudo-quarto'],
  }),
  m('cozinha-ilha', 'cozinha', 'Cozinha com ilha ripada', 'Bancada em L, ilha ripada com cooktop, torre quente e nicho de geladeira.', {}),
  m('cozinha-salvia', 'cozinha', 'Cozinha verde-sálvia', 'Frentes em verde-sálvia acetinado com tampo em quartzo branco.', {
    acabamento: 'verde-salvia',
    tampo: 'pedra-clara',
  }),
  m('cozinha-grafite', 'cozinha', 'Cozinha grafite com granito', 'Frentes em grafite, tampo em granito preto polido e sem forro ripado.', {
    acabamento: 'cinza-urbano',
    tampo: 'granito-preto',
    remover: ['forro-ripado-teto'],
  }),
  m('closet-aberto', 'closet', 'Closet com ilha', 'Guarda-roupa até o teto, colmeia iluminada, ilha de gavetas e sapateira.', { acabamento: 'areia-acetinado' }),
  m('closet-correr', 'closet', 'Closet com portas de correr', 'Mesmo closet com portas de correr e acabamento Freijó.', { portas: 'correr' }),
  m('closet-nogueira', 'closet', 'Closet Nogueira', 'Frentes em Nogueira, sem a ilha central para ganhar circulação.', {
    acabamento: 'nogueira',
    remover: ['ilha-closet'],
  }),
  m('office-completo', 'home-office', 'Home office completo', 'Bancada, estante ripada, gaveteiro, nichos e armário aéreo com LED.', {}),
  m('office-sofa', 'home-office', 'Home office com sofá', 'Escritório com sofá de apoio para receber clientes.', { adicionar: ['sofa-recepcao'] }),
  m('office-grafite', 'home-office', 'Home office grafite', 'Mesma composição em grafite fosco.', { acabamento: 'cinza-urbano' }),
  m('banheiro-gabinete', 'banheiro', 'Banheiro com espelheira', 'Gabinete suspenso com cuba e espelheira com LED.', { acabamento: 'areia-acetinado' }),
  m('banheiro-nichos', 'banheiro', 'Banheiro com nichos', 'Gabinete, espelheira e coluna de nichos iluminados.', { adicionar: ['nichos-led'] }),
  m('banheiro-freijo', 'banheiro', 'Banheiro Freijó', 'Gabinete e espelheira em Freijó.', {}),
];

export const modelosDo = (ambiente: Ambiente) => MODELOS_PRONTOS.filter((x) => x.ambiente === ambiente);
