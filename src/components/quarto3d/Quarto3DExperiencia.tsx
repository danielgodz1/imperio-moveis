import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Moon, Redo2, RotateCw, Sun, Trash2, Undo2 } from 'lucide-react';
import { QuartoLayout, QuartoLayoutSchema, construirLayoutDoCenario, normalizarLayout, Ambiente, ModuloId } from './schema';
import { CENARIOS_AMBIENTES, CATALOGO_MODULOS_CENARIO, ParedeCardeal } from '../../data/cenarios';
import { ACABAMENTOS_3D } from '../../data/acabamentos';
import { CenaQuarto3D, VistaCamera } from './CenaQuarto3D';
import { OPCOES_PAREDE, OPCOES_PISO, OPCOES_TAMPO } from './materiais3D';
import {
  COM_TAMPO,
  Instancia,
  NOME_PAREDE,
  instanciaPadrao,
  limitesModulo,
  normalizarInstancia,
  novoUid,
  prenderAbertura,
  prenderAoAmbiente,
  validarLayout,
  Abertura,
} from './motorGeometrico';
import { PREFIXO_ABERTURA, indiceAbertura, useEditor } from './estadoEditor';
import { getWhatsAppUrl, salvarResumo3DAtivo, trackWhatsAppClick } from '../../utils/helpers';

export interface Quarto3DExperienciaProps {
  onOpenBriefingOutro?: () => void;
}

type Aba = 'ambiente' | 'moveis' | 'cores';

const ABAS: Array<{ id: Aba; rotulo: string }> = [
  { id: 'moveis', rotulo: 'Móveis' },
  { id: 'cores', rotulo: 'Cores e luz' },
  { id: 'ambiente', rotulo: 'Ambiente' },
];

const VISTAS: Array<{ id: VistaCamera; rotulo: string }> = [
  { id: 'perspectiva', rotulo: '3D' },
  { id: 'frente', rotulo: 'Frente' },
  { id: 'planta', rotulo: 'Planta' },
];

const PAREDES: ParedeCardeal[] = ['N', 'O', 'L', 'S', 'centro'];
const rotuloModulo = (id: ModuloId) => CATALOGO_MODULOS_CENARIO[id]?.rotulo ?? id;
/** Medidas aparecem em centímetros, em passos de 5 cm. */
const cm = (v: number) => `${Math.round(v * 100)} cm`;
const NOME_PAREDE_ABERTURA: Record<Abertura['parede'], string> = { N: 'Fundo', O: 'Esquerda', L: 'Direita', S: 'Frente' };

const CHIP_BASE = 'tipo-cota rounded-curto border cursor-pointer transition-colors';
const chip = (ativo: boolean) =>
  `${CHIP_BASE} ${ativo ? 'bg-dourado text-preto border-dourado font-semibold' : 'border-papel/25 text-papel/85 hover:border-papel/60'}`;

const Medida: React.FC<{
  rotulo: string;
  valor: number;
  min: number;
  max: number;
  passo?: number;
  onChange: (v: number) => void;
  onFim?: () => void;
}> = ({ rotulo, valor, min, max, passo = 0.05, onChange, onFim }) => (
  <label className="flex flex-col gap-4">
    <span className="flex items-center justify-between tipo-cota text-papel/85">
      <span>{rotulo}</span>
      <span className="text-papel font-semibold">{cm(valor)}</span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={passo}
      value={valor}
      onChange={(e) => onChange(Number(e.target.value))}
      onPointerUp={onFim}
      onKeyUp={onFim}
      className="w-full h-24 accent-[var(--dourado)] cursor-pointer"
    />
  </label>
);

export const Quarto3DExperiencia: React.FC<Quarto3DExperienciaProps> = ({ onOpenBriefingOutro }) => {
  const layout = useEditor((e) => e.layout);
  const selecionado = useEditor((e) => e.selecionado);
  const podeDesfazer = useEditor((e) => e.passado.length > 0);
  const podeRefazer = useEditor((e) => e.futuro.length > 0);
  const { aplicar, durante, fimGesto, desfazer, refazer, selecionar: setSelecionado } = useEditor.getState();
  const [aba, setAba] = useState<Aba>('moveis');
  const [vista, setVista] = useState<VistaCamera>('perspectiva');
  const [pedidoVista, setPedidoVista] = useState(0);
  const [descricaoIa, setDescricaoIa] = useState('');
  const [carregandoIa, setCarregandoIa] = useState(false);
  const [avisoIa, setAvisoIa] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cenarioAtual = CENARIOS_AMBIENTES[layout.comodo];
  const modulos = layout.modulos as Instancia[];
  const atual = modulos.find((m) => m.uid === selecionado) ?? null;
  const iAbertura = indiceAbertura(selecionado);
  const aberturaAtual = iAbertura !== null ? layout.aberturas[iAbertura] ?? null : null;

  const conflitos = useMemo(
    () => validarLayout(modulos, layout.aberturas, layout.dimensoes, rotuloModulo),
    [modulos, layout.aberturas, layout.dimensoes]
  );

  // Atalhos: Ctrl+Z desfaz; Ctrl+Shift+Z ou Ctrl+Y refaz (fora de campos de texto).
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLInputElement | null;
      if (alvo?.tagName === 'INPUT' && alvo.type === 'text') return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const letra = e.key.toLowerCase();
      if (letra === 'z' && !e.shiftKey) {
        e.preventDefault();
        desfazer();
      } else if (letra === 'y' || (letra === 'z' && e.shiftKey)) {
        e.preventDefault();
        refazer();
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [desfazer, refazer]);

  const resumoPecas = () =>
    modulos
      .map((m) => {
        const acab = ACABAMENTOS_3D.find((a) => a.id === m.acabamento)?.nome ?? m.acabamento;
        return `${rotuloModulo(m.id)} (${cm(m.largura_m)} x ${cm(m.altura_m)}, ${acab})`;
      })
      .join('; ');

  useEffect(() => {
    const { largura_m: W, profundidade_m: D, pe_direito_m: H } = layout.dimensoes;
    salvarResumo3DAtivo(`${cenarioAtual.rotulo} ${cm(W)} x ${cm(D)}, pé-direito ${cm(H)} | ${resumoPecas()} | LED: ${layout.led ? 'Sim' : 'Não'}`);
    // resumoPecas deriva de modulos, já presente em layout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, cenarioAtual]);

  const trocarAmbiente = (novo: Ambiente) => {
    aplicar(() => construirLayoutDoCenario(novo, 'freijo-ripado'));
    setSelecionado(null);
    setAvisoIa(null);
  };

  const atualizarMedida = (chave: keyof QuartoLayout['dimensoes'], valor: number) => {
    durante((prev) => {
      const dimensoes = { ...prev.dimensoes, [chave]: valor };
      return {
        ...prev,
        dimensoes,
        aberturas: prev.aberturas.map((a) => prenderAbertura(a, dimensoes)),
        modulos: prev.modulos.map((m) => normalizarInstancia(m, dimensoes)),
      };
    });
  };

  const alterarAbertura = (indice: number, parcial: Partial<Abertura>, gesto = false) => {
    const fn = (prev: QuartoLayout): QuartoLayout => ({
      ...prev,
      aberturas: prev.aberturas.map((a, i) => (i === indice ? prenderAbertura({ ...a, ...parcial }, prev.dimensoes) : a)),
    });
    if (gesto) durante(fn);
    else aplicar(fn);
  };

  const adicionarAbertura = (tipo: Abertura['tipo']) => {
    const nova: Abertura =
      tipo === 'janela'
        ? { tipo, parede: 'L', largura_m: 1.0, posicaoOffset_m: 0, peitoril_m: 1.0, altura_m: 1.1 }
        : { tipo, parede: 'S', largura_m: 0.8, posicaoOffset_m: 0, peitoril_m: 0, altura_m: 2.1 };
    const indice = layout.aberturas.length;
    aplicar((prev) => ({ ...prev, aberturas: [...prev.aberturas, prenderAbertura(nova, prev.dimensoes)] }));
    setSelecionado(`${PREFIXO_ABERTURA}${indice}`);
  };

  const removerAbertura = (indice: number) => {
    aplicar((prev) => ({ ...prev, aberturas: prev.aberturas.filter((_, i) => i !== indice) }));
    setSelecionado(null);
  };

  const moverAbertura = useCallback(
    (indice: number, posicao: number) => {
      durante((prev) => ({
        ...prev,
        aberturas: prev.aberturas.map((a, i) =>
          i === indice ? prenderAbertura({ ...a, posicaoOffset_m: posicao }, prev.dimensoes) : a
        ),
      }));
    },
    [durante]
  );

  const alterarPeca = (uid: string, parcial: Partial<Instancia>, gesto = false) => {
    const fn = (prev: QuartoLayout): QuartoLayout => ({
      ...prev,
      modulos: prev.modulos.map((m) =>
        m.uid === uid ? prenderAoAmbiente({ ...(m as Instancia), ...parcial }, prev.dimensoes) : m
      ),
    });
    if (gesto) durante(fn);
    else aplicar(fn);
  };

  const adicionarModulo = (id: ModuloId) => {
    if (!cenarioAtual.modulosPermitidos.includes(id)) return;
    const nova = instanciaPadrao(id, layout.dimensoes, modulos[0]?.acabamento ?? 'freijo-ripado');
    aplicar((prev) => ({ ...prev, modulos: [...prev.modulos, nova] }));
    setSelecionado(nova.uid);
  };

  const removerPeca = (uid: string) => {
    aplicar((prev) => ({ ...prev, modulos: prev.modulos.filter((m) => m.uid !== uid) }));
    setSelecionado(null);
  };

  const duplicarPeca = (m: Instancia) => {
    const copia = prenderAoAmbiente({ ...m, uid: novoUid(m.id), offset_m: m.offset_m + m.largura_m + 0.05 }, layout.dimensoes);
    aplicar((prev) => ({ ...prev, modulos: [...prev.modulos, copia] }));
    setSelecionado(copia.uid);
  };

  const trocarParede = (m: Instancia, parede: ParedeCardeal) => {
    const padrao = limitesModulo({ id: m.id, parede }, layout.dimensoes);
    alterarPeca(m.uid, {
      parede,
      largura_m: Math.min(m.largura_m, padrao.largura.max),
      offset_m: 0,
      z_m: 0,
      rotacao: 0,
    });
  };

  const aplicarAcabamentoGeral = (id: string) => {
    aplicar((prev) => ({ ...prev, modulos: prev.modulos.map((m) => ({ ...m, acabamento: id })) }));
  };

  const selecionar = useCallback(
    (sel: string | null) => {
      setSelecionado(sel);
      if (sel) setAba(indiceAbertura(sel) !== null ? 'ambiente' : 'moveis');
    },
    [setSelecionado]
  );

  const moverPeca = useCallback(
    (inst: Instancia) => {
      durante((prev) => ({ ...prev, modulos: prev.modulos.map((m) => (m.uid === inst.uid ? inst : m)) }));
    },
    [durante]
  );

  const gerarResumoTexto = () => {
    const { largura_m: W, profundidade_m: D, pe_direito_m: H } = layout.dimensoes;
    const linhas = modulos.map((m) => {
      const acab = ACABAMENTOS_3D.find((a) => a.id === m.acabamento)?.nome ?? m.acabamento;
      const parede = NOME_PAREDE[m.parede];
      return `- ${rotuloModulo(m.id)}: ${cm(m.largura_m)} x ${cm(m.altura_m)}, ${acab}, parede: ${parede}`;
    });
    return [
      'Oi! Montei meu projeto no 3D do site da Império e quero um orçamento:',
      `Ambiente: ${cenarioAtual.rotulo}, ${cm(W)} x ${cm(D)}, pé-direito ${cm(H)}`,
      ...linhas,
      `Fita de LED: ${layout.led ? 'Sim' : 'Não'}`,
    ].join('\n');
  };

  const enviarProjeto = async () => {
    trackWhatsAppClick('quarto_3d_enviar');
    const resumo = gerarResumoTexto();
    const canvas = canvasRef.current;

    if (canvas) {
      try {
        const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
        if (blob) {
          const arquivo = new File([blob], `imperio-3d-${layout.comodo}.png`, { type: 'image/png' });
          if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [arquivo] })) {
            await navigator.share({ title: `Meu ${cenarioAtual.rotulo} 3D`, text: resumo, files: [arquivo] });
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = arquivo.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } catch {
        // Segue para o WhatsApp com o resumo em texto
      }
    }
    window.open(getWhatsAppUrl(`${resumo}\n(Salvei a imagem do 3D para anexar aqui.)`), '_blank');
  };

  const gerarPorDescricao = async (e: React.FormEvent) => {
    e.preventDefault();
    const texto = descricaoIa.trim().slice(0, 400);
    if (!texto) return;
    setCarregandoIa(true);
    setAvisoIa(null);
    try {
      const resp = await fetch('/api/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: texto }),
      });
      if (!resp.ok) throw new Error('falha');
      const validado = QuartoLayoutSchema.safeParse(await resp.json());
      if (!validado.success) throw new Error('formato');
      aplicar(() => normalizarLayout(validado.data));
      setSelecionado(null);
      setAvisoIa('Projeto montado a partir da sua descrição.');
    } catch {
      setAvisoIa('A sugestão automática não respondeu agora. Monte pelos controles.');
    } finally {
      setCarregandoIa(false);
    }
  };

  const limites = atual ? limitesModulo(atual, layout.dimensoes) : null;
  const lim = cenarioAtual.limites;
  const eixoMax = atual
    ? atual.parede === 'N' || atual.parede === 'S' || atual.parede === 'centro'
      ? layout.dimensoes.largura_m / 2
      : layout.dimensoes.profundidade_m / 2
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
      {/* Palco */}
      <div className="lg:col-span-8 flex flex-col gap-16 lg:sticky lg:top-24">
        <div className="relative w-full h-[58svh] min-h-[340px] lg:h-[calc(100svh-180px)] lg:max-h-[720px] bg-preto border border-papel/20">
          <CenaQuarto3D
            layout={layout}
            selecionado={selecionado}
            conflitos={conflitos}
            vista={vista}
            pedidoVista={pedidoVista}
            onSelecionar={selecionar}
            onMover={moverPeca}
            onMoverAbertura={moverAbertura}
            onMoverFim={fimGesto}
            onCanvasReady={(c) => {
              canvasRef.current = c;
            }}
          />

          <div className="absolute top-8 left-8 flex items-center gap-4">
            {VISTAS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVista(v.id);
                  setPedidoVista((n) => n + 1);
                }}
                aria-pressed={vista === v.id}
                className={`px-16 h-[36px] ${chip(vista === v.id)} ${vista === v.id ? '' : 'bg-preto/85'}`}
              >
                {v.rotulo}
              </button>
            ))}
          </div>

          <div className="absolute top-8 right-8 flex items-center gap-4">
            <button
              type="button"
              onClick={() => aplicar((prev) => ({ ...prev, noite: !prev.noite }))}
              aria-label={layout.noite ? 'Ver de dia' : 'Ver à noite'}
              title={layout.noite ? 'Ver de dia' : 'Ver à noite'}
              className={`w-[36px] h-[36px] flex items-center justify-center bg-preto/85 ${CHIP_BASE} border-papel/25 text-papel`}
            >
              {layout.noite ? <Sun className="w-4 h-4" strokeWidth={1.5} /> : <Moon className="w-4 h-4" strokeWidth={1.5} />}
            </button>
            <button
              type="button"
              onClick={desfazer}
              disabled={!podeDesfazer}
              aria-label="Desfazer"
              title="Desfazer (Ctrl+Z)"
              className={`w-[36px] h-[36px] flex items-center justify-center bg-preto/85 ${CHIP_BASE} border-papel/25 text-papel disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Undo2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={refazer}
              disabled={!podeRefazer}
              aria-label="Refazer"
              title="Refazer (Ctrl+Shift+Z)"
              className={`w-[36px] h-[36px] flex items-center justify-center bg-preto/85 ${CHIP_BASE} border-papel/25 text-papel disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Redo2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          <p className="absolute bottom-8 left-8 right-8 pointer-events-none tipo-cota text-papel bg-preto/80 px-8 py-4 w-fit max-w-[calc(100%-24px)]">
            {atual || aberturaAtual
              ? 'Arraste para mover. Gire a cena fora da peça.'
              : 'Toque em um móvel, porta ou janela para editar.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-16">
          <p className={`tipo-cota ${conflitos.size > 0 ? 'text-dourado' : 'text-papel/75'}`} aria-live="polite">
            {conflitos.size > 0
              ? `${rotuloModulo(modulos.find((m) => conflitos.has(m.uid))!.id)}: ${[...conflitos.values()][0]}. Ajuste a posição em vermelho.`
              : 'Visualização aproximada. O projeto final é detalhado após a medição.'}
          </p>
          <button
            type="button"
            onClick={enviarProjeto}
            className="shrink-0 px-24 h-[52px] rounded-curto bg-dourado text-preto hover:bg-papel transition-colors font-semibold cursor-pointer"
          >
            Enviar projeto para orçamento
          </button>
        </div>
      </div>

      {/* Ferramentas */}
      <div className="lg:col-span-4 flex flex-col gap-16">
        <div role="tablist" aria-label="Ferramentas do projeto" className="grid grid-cols-3 border-b border-papel/20">
          {ABAS.map((a) => (
            <button
              key={a.id}
              role="tab"
              type="button"
              aria-selected={aba === a.id}
              onClick={() => setAba(a.id)}
              className={`h-[44px] tipo-cota cursor-pointer border-b-2 -mb-px transition-colors ${
                aba === a.id ? 'border-dourado text-papel font-semibold' : 'border-transparent text-papel/65 hover:text-papel'
              }`}
            >
              {a.rotulo}
            </button>
          ))}
        </div>

        {aba === 'moveis' && (
          <div className="flex flex-col gap-16">
            {atual && limites ? (
              <div className="flex flex-col gap-16 p-16 border border-dourado/60">
                <div className="flex items-start justify-between gap-8">
                  <h3 className="tipo-h3 text-papel">{rotuloModulo(atual.id)}</h3>
                  <div className="flex items-center gap-4 shrink-0">
                    {atual.parede === 'centro' && (
                      <button type="button" aria-label="Girar peça" title="Girar 90°" onClick={() => alterarPeca(atual.uid, { rotacao: atual.rotacao + Math.PI / 2 })} className={`w-[36px] h-[36px] flex items-center justify-center ${CHIP_BASE} border-papel/25 text-papel`}>
                        <RotateCw className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
                    <button type="button" aria-label="Duplicar peça" title="Duplicar" onClick={() => duplicarPeca(atual)} className={`w-[36px] h-[36px] flex items-center justify-center ${CHIP_BASE} border-papel/25 text-papel`}>
                      <Copy className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button type="button" aria-label="Remover peça" title="Remover" onClick={() => removerPeca(atual.uid)} className={`w-[36px] h-[36px] flex items-center justify-center ${CHIP_BASE} border-papel/25 text-papel`}>
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <Medida rotulo="Largura" valor={atual.largura_m} min={limites.largura.min} max={limites.largura.max} onChange={(v) => alterarPeca(atual.uid, { largura_m: v }, true)} onFim={fimGesto} />
                <Medida rotulo="Altura" valor={atual.altura_m} min={limites.altura.min} max={limites.altura.max} onChange={(v) => alterarPeca(atual.uid, { altura_m: v }, true)} onFim={fimGesto} />
                <Medida rotulo="Profundidade" valor={atual.profundidade_m} min={limites.profundidade.min} max={limites.profundidade.max} onChange={(v) => alterarPeca(atual.uid, { profundidade_m: v }, true)} onFim={fimGesto} />
                <Medida rotulo="Posição" valor={atual.offset_m} min={-eixoMax} max={eixoMax} onChange={(v) => alterarPeca(atual.uid, { offset_m: v }, true)} onFim={fimGesto} />
                {atual.parede === 'centro' && (
                  <Medida rotulo="Avanço" valor={atual.z_m} min={-layout.dimensoes.profundidade_m / 2} max={layout.dimensoes.profundidade_m / 2} onChange={(v) => alterarPeca(atual.uid, { z_m: v }, true)} onFim={fimGesto} />
                )}

                <div className="flex flex-col gap-8">
                  <span className="tipo-cota text-papel/85">Parede</span>
                  <div className="grid grid-cols-3 gap-4">
                    {PAREDES.map((p) => (
                      <button key={p} type="button" aria-pressed={atual.parede === p} onClick={() => trocarParede(atual, p)} className={`h-[36px] ${chip(atual.parede === p)}`}>
                        {NOME_PAREDE[p]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-8">
                  <span className="tipo-cota text-papel/85">Acabamento desta peça</span>
                  <div className="grid grid-cols-4 gap-4">
                    {ACABAMENTOS_3D.map((f) => (
                      <button key={f.id} type="button" aria-label={f.nome} title={f.nome} aria-pressed={atual.acabamento === f.id} onClick={() => alterarPeca(atual.uid, { acabamento: f.id })} className={`h-[36px] border cursor-pointer ${atual.acabamento === f.id ? 'border-dourado border-2' : 'border-papel/25'}`} style={{ backgroundColor: f.hex }} />
                    ))}
                  </div>
                </div>

                {COM_TAMPO.includes(atual.id) && (
                  <div className="flex flex-col gap-8">
                    <span className="tipo-cota text-papel/85">Tampo</span>
                    <div className="grid grid-cols-3 gap-4">
                      {OPCOES_TAMPO.map((t) => (
                        <button key={t.id} type="button" aria-pressed={(atual.tampo ?? 'pedra-clara') === t.id} onClick={() => alterarPeca(atual.uid, { tampo: t.id })} className={`min-h-[36px] px-4 ${chip((atual.tampo ?? 'pedra-clara') === t.id)}`}>
                          {t.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button type="button" onClick={() => setSelecionado(null)} className="tipo-cota text-papel/85 link-traco cursor-pointer self-start">
                  Concluir esta peça
                </button>
              </div>
            ) : (
              <p className="tipo-corpo text-papel/80">Toque em um móvel na cena para ajustar medida, posição e acabamento.</p>
            )}

            <div className="flex flex-col gap-8">
              <span className="tipo-cota text-papel/85">Adicionar móvel</span>
              <div className="flex flex-col">
                {cenarioAtual.modulosPermitidos.map((id) => {
                  const qtd = modulos.filter((m) => m.id === id).length;
                  return (
                    <div key={id} className="flex items-center justify-between gap-8 py-8 border-b border-papel/15">
                      <button
                        type="button"
                        onClick={() => {
                          const peca = modulos.find((m) => m.id === id);
                          if (peca) setSelecionado(peca.uid);
                        }}
                        disabled={qtd === 0}
                        className="text-left tipo-cota text-papel disabled:text-papel/60 cursor-pointer disabled:cursor-default"
                      >
                        {rotuloModulo(id)}
                        {qtd > 0 && <span className="text-dourado"> ({qtd})</span>}
                      </button>
                      <button type="button" onClick={() => adicionarModulo(id)} aria-label={`Adicionar ${rotuloModulo(id)}`} className={`shrink-0 w-[36px] h-[36px] ${CHIP_BASE} border-papel/25 text-papel hover:bg-papel hover:text-preto`}>
                        +
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {aba === 'cores' && (
          <div className="flex flex-col gap-24">
            <div className="flex flex-col gap-8">
              <span className="tipo-cota text-papel/85">Acabamento em todos os móveis (exemplos)</span>
              <div className="grid grid-cols-2 gap-4">
                {ACABAMENTOS_3D.map((f) => (
                  <button key={f.id} type="button" onClick={() => aplicarAcabamentoGeral(f.id)} className={`h-[44px] flex items-center gap-8 px-8 ${CHIP_BASE} border-papel/25 text-papel/90 hover:border-papel/60`}>
                    <span className="w-4 h-4 shrink-0 border border-papel/40" style={{ backgroundColor: f.hex }} />
                    <span className="truncate">{f.nome}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <span className="tipo-cota text-papel/85">Piso</span>
              <div className="grid grid-cols-3 gap-4">
                {OPCOES_PISO.map((p) => (
                  <button key={p.id} type="button" aria-pressed={layout.piso === p.id} onClick={() => aplicar((prev) => ({ ...prev, piso: p.id }))} className={`min-h-[44px] px-4 ${chip(layout.piso === p.id)}`}>
                    {p.nome}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <span className="tipo-cota text-papel/85">Parede de destaque</span>
              <div className="grid grid-cols-4 gap-4">
                {OPCOES_PAREDE.map((p) => (
                  <button key={p.id} type="button" aria-label={p.nome} title={p.nome} aria-pressed={layout.corParede === p.id} onClick={() => aplicar((prev) => ({ ...prev, corParede: p.id }))} className={`h-[44px] border cursor-pointer ${layout.corParede === p.id ? 'border-dourado border-2' : 'border-papel/25'}`} style={{ backgroundColor: p.cor }} />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => aplicar((prev) => ({ ...prev, led: !prev.led }))}
              aria-pressed={layout.led}
              className={`px-24 h-[52px] rounded-curto border-[1.5px] cursor-pointer transition-colors font-semibold ${layout.led ? 'border-dourado text-dourado halo-luz' : 'border-papel/50 text-papel hover:border-papel'}`}
            >
              {layout.led ? 'Apagar a fita de LED' : 'Acender a fita de LED'}
            </button>
          </div>
        )}

        {aba === 'ambiente' && (
          <div className="flex flex-col gap-24">
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(CENARIOS_AMBIENTES) as Ambiente[]).map((id) => (
                <button key={id} type="button" aria-pressed={layout.comodo === id} onClick={() => trocarAmbiente(id)} className={`h-[44px] ${chip(layout.comodo === id)}`}>
                  {CENARIOS_AMBIENTES[id].rotulo}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-16">
              <Medida rotulo="Largura do ambiente" valor={layout.dimensoes.largura_m} min={lim.largura.min} max={lim.largura.max} onChange={(v) => atualizarMedida('largura_m', v)} onFim={fimGesto} />
              <Medida rotulo="Profundidade do ambiente" valor={layout.dimensoes.profundidade_m} min={lim.profundidade.min} max={lim.profundidade.max} onChange={(v) => atualizarMedida('profundidade_m', v)} onFim={fimGesto} />
              <Medida rotulo="Pé-direito" valor={layout.dimensoes.pe_direito_m} min={lim.pe_direito.min} max={lim.pe_direito.max} onChange={(v) => atualizarMedida('pe_direito_m', v)} onFim={fimGesto} />
            </div>

            <div className="flex flex-col gap-8">
              <span className="tipo-cota text-papel/85">Portas e janelas</span>
              <div className="flex flex-col">
                {layout.aberturas.map((ab, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={iAbertura === i}
                    onClick={() => setSelecionado(iAbertura === i ? null : `${PREFIXO_ABERTURA}${i}`)}
                    className={`flex items-center justify-between gap-8 py-8 border-b border-papel/15 text-left tipo-cota cursor-pointer ${iAbertura === i ? 'text-papel font-semibold' : 'text-papel/85'}`}
                  >
                    <span>
                      {ab.tipo === 'janela' ? 'Janela' : 'Porta'}, parede {NOME_PAREDE_ABERTURA[ab.parede].toLowerCase()}
                    </span>
                    <span>{cm(ab.largura_m)}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => adicionarAbertura('janela')} className={`h-[36px] ${CHIP_BASE} border-papel/25 text-papel hover:border-papel/60`}>
                  + Janela
                </button>
                <button type="button" onClick={() => adicionarAbertura('porta')} className={`h-[36px] ${CHIP_BASE} border-papel/25 text-papel hover:border-papel/60`}>
                  + Porta
                </button>
              </div>
            </div>

            {aberturaAtual && iAbertura !== null && (
              <div className="flex flex-col gap-16 p-16 border border-dourado/60">
                <div className="flex items-start justify-between gap-8">
                  <h3 className="tipo-h3 text-papel">{aberturaAtual.tipo === 'janela' ? 'Janela' : 'Porta'}</h3>
                  <button type="button" aria-label="Remover abertura" title="Remover" onClick={() => removerAbertura(iAbertura)} className={`w-[36px] h-[36px] flex items-center justify-center ${CHIP_BASE} border-papel/25 text-papel`}>
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {(['N', 'O', 'L', 'S'] as const).map((p) => (
                    <button key={p} type="button" aria-pressed={aberturaAtual.parede === p} onClick={() => alterarAbertura(iAbertura, { parede: p, posicaoOffset_m: 0 })} className={`h-[36px] ${chip(aberturaAtual.parede === p)}`}>
                      {NOME_PAREDE_ABERTURA[p]}
                    </button>
                  ))}
                </div>
                {(() => {
                  const parede = aberturaAtual.parede === 'N' || aberturaAtual.parede === 'S' ? layout.dimensoes.largura_m : layout.dimensoes.profundidade_m;
                  const folga = Math.max(0, parede / 2 - aberturaAtual.largura_m / 2 - 0.05);
                  const janela = aberturaAtual.tipo === 'janela';
                  const peitoril = aberturaAtual.peitoril_m ?? (janela ? 1 : 0);
                  return (
                    <>
                      <Medida rotulo="Largura" valor={aberturaAtual.largura_m} min={0.4} max={Math.min(2.6, parede - 0.1)} onChange={(v) => alterarAbertura(iAbertura, { largura_m: v }, true)} onFim={fimGesto} />
                      <Medida rotulo="Posição na parede" valor={aberturaAtual.posicaoOffset_m} min={-folga} max={folga} onChange={(v) => alterarAbertura(iAbertura, { posicaoOffset_m: v }, true)} onFim={fimGesto} />
                      {janela && (
                        <Medida rotulo="Altura do peitoril" valor={peitoril} min={0.1} max={layout.dimensoes.pe_direito_m - 0.4} onChange={(v) => alterarAbertura(iAbertura, { peitoril_m: v }, true)} onFim={fimGesto} />
                      )}
                      <Medida rotulo="Altura" valor={aberturaAtual.altura_m ?? (janela ? 1.1 : 2.1)} min={0.3} max={layout.dimensoes.pe_direito_m - peitoril - 0.05} onChange={(v) => alterarAbertura(iAbertura, { altura_m: v }, true)} onFim={fimGesto} />
                    </>
                  );
                })()}
              </div>
            )}

            {onOpenBriefingOutro && (
              <button type="button" onClick={onOpenBriefingOutro} className="tipo-cota text-dourado link-traco cursor-pointer text-left">
                Não achou o seu ambiente? Fale com a gente
              </button>
            )}

            <details className="border-t border-papel/15 pt-16">
              <summary className="tipo-cota text-papel/75 cursor-pointer">Descrever em texto (experimental)</summary>
              <form onSubmit={gerarPorDescricao} className="flex items-end gap-8 pt-16">
                <input
                  aria-label="Descreva seu ambiente"
                  type="text"
                  maxLength={400}
                  placeholder="Ex.: cozinha de 4,2 x 3,6 m com ilha"
                  value={descricaoIa}
                  onChange={(e) => setDescricaoIa(e.target.value)}
                  className="flex-1 min-w-0 py-8 bg-transparent text-papel border-b-[1.5px] border-papel/40 focus:border-dourado focus:outline-none tipo-cota"
                />
                <button type="submit" disabled={carregandoIa} className={`px-16 h-[40px] ${CHIP_BASE} border-papel/40 text-papel disabled:opacity-50`}>
                  {carregandoIa ? 'Gerando' : 'Gerar'}
                </button>
              </form>
              {avisoIa && <p className="tipo-cota text-dourado pt-8">{avisoIa}</p>}
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quarto3DExperiencia;
