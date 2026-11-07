import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  QuartoLayout,
  QuartoLayoutSchema,
  construirLayoutDoCenario,
  Ambiente,
  ModuloId,
} from './schema';
import { CENARIOS_AMBIENTES, CATALOGO_MODULOS_CENARIO } from '../../data/cenarios';
import { ACABAMENTOS_3D } from '../../data/acabamentos';
import { CenaQuarto3D } from './CenaQuarto3D';
import { getWhatsAppUrl, salvarResumo3DAtivo, trackWhatsAppClick } from '../../utils/helpers';

export interface Quarto3DExperienciaProps {
  onOpenBriefingOutro?: () => void;
}

export const Quarto3DExperiencia: React.FC<Quarto3DExperienciaProps> = ({
  onOpenBriefingOutro,
}) => {
  const [layout, setLayout] = useState<QuartoLayout>(() =>
    construirLayoutDoCenario('quarto', 'freijo-ripado')
  );
  const [acabamentoGlobal, setAcabamentoGlobal] = useState<string>('freijo-ripado');
  const [descricaoIa, setDescricaoIa] = useState('');
  const [carregandoIa, setCarregandoIa] = useState(false);
  const [avisoIa, setAvisoIa] = useState<string | null>(null);
  const [contornoConcluido, setContornoConcluido] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contornoSvgPathRef = useRef<SVGPathElement>(null);

  const cenarioAtual = CENARIOS_AMBIENTES[layout.comodo];
  const acabamentoAtualObj =
    ACABAMENTOS_3D.find((w) => w.id === acabamentoGlobal) || ACABAMENTOS_3D[0];

  // Sincroniza o resumo do 3D para que o BriefingOrcamento possa anexar caso exista
  useEffect(() => {
    const nomesModulos = layout.modulos
      .map((m) => CATALOGO_MODULOS_CENARIO[m.id]?.rotulo || m.id)
      .join(', ');

    const resumo = `${cenarioAtual.rotulo} (${layout.dimensoes.largura_m.toFixed(
      2
    )}m × ${layout.dimensoes.profundidade_m.toFixed(
      2
    )}m, pé-direito ${layout.dimensoes.pe_direito_m.toFixed(
      2
    )}m) | Módulos: ${nomesModulos} | Acabamento: ${acabamentoAtualObj.nome} | LED: ${
      layout.led ? 'Sim' : 'Não'
    }`;
    salvarResumo3DAtivo(resumo);
  }, [layout, acabamentoAtualObj, cenarioAtual]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !contornoSvgPathRef.current) {
      setContornoConcluido(true);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contornoSvgPathRef.current,
        { strokeDashoffset: 600 },
        {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: 'power3.out',
          onComplete: () => setContornoConcluido(true),
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // REGRA: Mudar de ambiente RECONSTRÓI a cena (limpa módulos, aplica dimensoesPadrao, aberturasPadrao e modulosIniciais)
  const trocarAmbiente = (novoAmbiente: Ambiente) => {
    const novoLayout = construirLayoutDoCenario(novoAmbiente, acabamentoGlobal);
    setLayout(novoLayout);
    setAvisoIa(null);
  };

  const atualizarMedida = (
    chave: keyof QuartoLayout['dimensoes'],
    valorBruto: string
  ) => {
    const num = Number(valorBruto.replace(',', '.'));
    if (Number.isNaN(num)) return;

    const limites =
      chave === 'largura_m'
        ? cenarioAtual.limites.largura
        : chave === 'profundidade_m'
        ? cenarioAtual.limites.profundidade
        : cenarioAtual.limites.pe_direito;

    const limitado = Math.max(limites.min, Math.min(limites.max, num));

    setLayout((prev) => ({
      ...prev,
      dimensoes: {
        ...prev.dimensoes,
        [chave]: limitado,
      },
    }));
  };

  const alternarModulo = (id: ModuloId) => {
    // Bloqueia qualquer módulo que não pertença ao modulosPermitidos do ambiente atual
    if (!cenarioAtual.modulosPermitidos.includes(id)) return;

    setLayout((prev) => {
      const existe = prev.modulos.some((m) => m.id === id);
      if (existe) {
        if (prev.modulos.length <= 1) return prev;
        return {
          ...prev,
          modulos: prev.modulos.filter((m) => m.id !== id),
        };
      }
      const regra = CATALOGO_MODULOS_CENARIO[id];
      if (!regra) return prev;
      return {
        ...prev,
        modulos: [
          ...prev.modulos,
          {
            id,
            parede: regra.regraEncaixe.parede,
            largura_m: regra.regraEncaixe.larguraPadrao,
            altura_m: regra.regraEncaixe.alturaPadrao,
            acabamento: acabamentoGlobal,
          },
        ],
      };
    });
  };

  const trocarAcabamento = (novoId: string) => {
    setAcabamentoGlobal(novoId);
    setLayout((prev) => ({
      ...prev,
      modulos: prev.modulos.map((m) => ({ ...m, acabamento: novoId })),
    }));
  };

  const gerarResumoTexto = (): string => {
    const nomesModulos = layout.modulos
      .map((m) => CATALOGO_MODULOS_CENARIO[m.id]?.rotulo || m.id)
      .join(', ');

    return `Oi! Montei uma visualização 3D no site da Império e quero orçar meu projeto:
- Ambiente: ${cenarioAtual.rotulo}
- Medidas: ${layout.dimensoes.largura_m.toFixed(2)} m x ${layout.dimensoes.profundidade_m.toFixed(
      2
    )} m (pé-direito ${layout.dimensoes.pe_direito_m.toFixed(2)} m)
- Módulos escolhidos: ${nomesModulos}
- Acabamento: ${acabamentoAtualObj.nome}${!acabamentoAtualObj.confirmado ? ' (exemplo)' : ''}
- Fita de LED: ${layout.led ? 'Sim' : 'Não'}`;
  };

  const enviarMeuQuarto = async () => {
    trackWhatsAppClick('quarto_3d_enviar');
    const resumo = gerarResumoTexto();
    const canvas = canvasRef.current;

    if (canvas) {
      try {
        const blob: Blob | null = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png')
        );

        if (blob) {
          const arquivo = new File([blob], `imperio-3d-${layout.comodo}.png`, {
            type: 'image/png',
          });

          if (
            typeof navigator.share === 'function' &&
            typeof navigator.canShare === 'function' &&
            navigator.canShare({ files: [arquivo] })
          ) {
            await navigator.share({
              title: `Meu ${cenarioAtual.rotulo} 3D — Império Móveis Planejados`,
              text: resumo,
              files: [arquivo],
            });
            return;
          }

          const urlPrint = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = urlPrint;
          link.download = `imperio-3d-${layout.comodo}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(urlPrint);
        }
      } catch {
        // Segue para abrir o WhatsApp com o resumo em texto
      }
    }

    const textoComInstrucao = `${resumo}\n(Salvei o print 3D no meu aparelho para anexar aqui na conversa.)`;
    window.open(getWhatsAppUrl(textoComInstrucao), '_blank');
  };

  const gerarLayoutPorDescricao = async (e: React.FormEvent) => {
    e.preventDefault();
    const textoLimpo = descricaoIa.trim().slice(0, 400);
    if (!textoLimpo) return;

    setCarregandoIa(true);
    setAvisoIa(null);

    try {
      const resp = await fetch('/api/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: textoLimpo }),
      });

      if (!resp.ok) {
        throw new Error('Falha ao sugerir layout automático');
      }

      const json = await resp.json();
      const validado = QuartoLayoutSchema.safeParse(json);
      if (!validado.success) {
        throw new Error('Layout fora do formato esperado');
      }

      setLayout(validado.data);
      setAvisoIa('Cenário 3D reconstruído a partir da sua descrição.');
    } catch {
      setAvisoIa(
        'Sugestão automática indisponível no momento. Use os controles de medida e módulos abaixo.'
      );
    } finally {
      setCarregandoIa(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 items-start">
      {/* Coluna Esquerda (5 colunas): Controles de cenário, medidas, módulos, acabamento em 2 colunas e LED */}
      <div className="lg:col-span-5 flex flex-col gap-24">
        {/* 1. Escolha do Cenário (Reconstrói a cena ao trocar) */}
        <div className="flex flex-col gap-8">
          <span className="tipo-cota text-papel/75">Escolha o ambiente</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {(Object.keys(CENARIOS_AMBIENTES) as Ambiente[]).map((ambId) => {
              const cenario = CENARIOS_AMBIENTES[ambId];
              const ativo = layout.comodo === ambId;
              return (
                <button
                  key={ambId}
                  type="button"
                  onClick={() => trocarAmbiente(ambId)}
                  aria-pressed={ativo}
                  className={`px-12 py-8 rounded-curto border tipo-cota cursor-pointer transition-colors text-center ${
                    ativo
                      ? 'bg-dourado text-preto border-dourado font-semibold'
                      : 'border-papel/25 text-papel/80 hover:border-papel/60'
                  }`}
                >
                  {cenario.rotulo}
                </button>
              );
            })}
          </div>
          <p className="tipo-cota text-papel/65 pt-4">
            {cenarioAtual.descricaoReferencia} (Ref.:{' '}
            <code>{cenarioAtual.fotoReferencia}</code>)
          </p>
        </div>

        {/* 2. Medidas do ambiente (respeitando limites do cenário ativo) */}
        <div className="grid grid-cols-3 gap-16 pt-4">
          <div className="flex flex-col gap-4">
            <label htmlFor="medida-largura" className="tipo-cota text-papel/80">
              Largura (m)
            </label>
            <input
              id="medida-largura"
              type="number"
              step="0.1"
              min={cenarioAtual.limites.largura.min}
              max={cenarioAtual.limites.largura.max}
              value={layout.dimensoes.largura_m}
              onChange={(e) => atualizarMedida('largura_m', e.target.value)}
              className="w-full py-8 bg-transparent text-papel border-b-[1.5px] border-papel/60 focus:border-dourado focus:outline-none tipo-cota"
            />
          </div>

          <div className="flex flex-col gap-4">
            <label htmlFor="medida-profundidade" className="tipo-cota text-papel/80">
              Profundidade (m)
            </label>
            <input
              id="medida-profundidade"
              type="number"
              step="0.1"
              min={cenarioAtual.limites.profundidade.min}
              max={cenarioAtual.limites.profundidade.max}
              value={layout.dimensoes.profundidade_m}
              onChange={(e) => atualizarMedida('profundidade_m', e.target.value)}
              className="w-full py-8 bg-transparent text-papel border-b-[1.5px] border-papel/60 focus:border-dourado focus:outline-none tipo-cota"
            />
          </div>

          <div className="flex flex-col gap-4">
            <label htmlFor="medida-pe-direito" className="tipo-cota text-papel/80">
              Pé-direito (m)
            </label>
            <input
              id="medida-pe-direito"
              type="number"
              step="0.05"
              min={cenarioAtual.limites.pe_direito.min}
              max={cenarioAtual.limites.pe_direito.max}
              value={layout.dimensoes.pe_direito_m}
              onChange={(e) => atualizarMedida('pe_direito_m', e.target.value)}
              className="w-full py-8 bg-transparent text-papel border-b-[1.5px] border-papel/60 focus:border-dourado focus:outline-none tipo-cota"
            />
          </div>
        </div>

        {/* 3. Módulos permitidos EXCLUSIVAMENTE para o ambiente atual */}
        <fieldset className="flex flex-col gap-8 pt-4">
          <legend className="tipo-cota text-papel/80 pb-4">
            Módulos de {cenarioAtual.rotulo}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {cenarioAtual.modulosPermitidos.map((modId) => {
              const info = CATALOGO_MODULOS_CENARIO[modId];
              const selecionado = layout.modulos.some((m) => m.id === modId);
              return (
                <button
                  key={modId}
                  type="button"
                  onClick={() => alternarModulo(modId)}
                  aria-pressed={selecionado}
                  className={`text-left px-12 py-8 rounded-curto border tipo-cota cursor-pointer transition-colors ${
                    selecionado
                      ? 'border-papel text-dourado bg-papel/5'
                      : 'border-papel/25 text-papel/75 hover:border-papel/60'
                  }`}
                >
                  {selecionado ? '✓ ' : '+ '}
                  {info.rotulo}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* 4. Acabamentos em grade de 2 colunas com botões do mesmo tamanho + etiqueta "exemplo" */}
        <div className="flex flex-col gap-8 pt-4">
          <div className="flex items-center justify-between gap-8">
            <span className="tipo-cota text-papel/80">
              Acabamento: <strong>{acabamentoAtualObj.nome}</strong>
            </span>
            {!acabamentoAtualObj.confirmado && (
              <span className="px-8 py-2 rounded-curto bg-papel/10 text-papel/70 tipo-cota text-[11px]">
                exemplo
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8">
            {ACABAMENTOS_3D.map((finish) => {
              const ativo = acabamentoGlobal === finish.id;
              return (
                <button
                  key={finish.id}
                  type="button"
                  onClick={() => trocarAcabamento(finish.id)}
                  aria-label={`Escolher acabamento ${finish.nome}`}
                  aria-pressed={ativo}
                  className={`w-full h-[44px] flex items-center justify-between gap-8 px-12 rounded-curto border cursor-pointer tipo-cota transition-colors ${
                    ativo
                      ? 'border-papel text-dourado bg-papel/5'
                      : 'border-papel/25 text-papel/75 hover:border-papel/60'
                  }`}
                >
                  <span className="flex items-center gap-8 truncate">
                    <span
                      className="w-3.5 h-3.5 shrink-0 inline-block border border-papel/40"
                      style={{ backgroundColor: finish.hex }}
                    />
                    <span className="truncate">{finish.nome}</span>
                  </span>
                  {!finish.confirmado && (
                    <span className="text-[10px] text-papel/50 shrink-0">ex.</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Acender o LED + Enviar meu ambiente */}
        <div className="flex flex-wrap items-center gap-16 pt-8">
          <button
            type="button"
            onClick={() => setLayout((prev) => ({ ...prev, led: !prev.led }))}
            aria-pressed={layout.led}
            className={`px-24 h-[52px] rounded-curto border-[1.5px] tipo-cota cursor-pointer transition-colors ${
              layout.led
                ? 'border-papel text-dourado halo-luz'
                : 'border-papel/50 text-papel hover:border-papel'
            }`}
          >
            {layout.led ? 'Luz de LED acesa (Noturno)' : 'Acender o LED'}
          </button>

          <button
            type="button"
            onClick={enviarMeuQuarto}
            className="px-24 h-[52px] rounded-curto bg-dourado text-preto hover:bg-papel hover:text-preto transition-colors tipo-cota font-semibold cursor-pointer"
          >
            Enviar meu {cenarioAtual.rotulo.toLowerCase()}
          </button>
        </div>

        {/* 6. Botão para ambientes não listados (quarto infantil, lavanderia, sala, loja) */}
        {onOpenBriefingOutro && (
          <div className="pt-8">
            <button
              type="button"
              onClick={onOpenBriefingOutro}
              className="tipo-cota text-dourado link-traco cursor-pointer text-left"
            >
              Não achou o seu ambiente? Cote com a gente
            </button>
          </div>
        )}

        {/* 7. Campo experimental opcional: Descreva seu ambiente -> POST /api/layout */}
        <form
          onSubmit={gerarLayoutPorDescricao}
          className="pt-16 border-t border-papel/15 flex flex-col gap-8"
        >
          <label htmlFor="campo-ia-quarto" className="tipo-cota text-papel/70">
            Descreva seu ambiente (experimental — máx. 400 caracteres)
          </label>
          <div className="flex items-end gap-12">
            <input
              id="campo-ia-quarto"
              type="text"
              maxLength={400}
              placeholder="Ex.: Cozinha de 4,2x3,6m com ilha verde-sálvia e torre quente..."
              value={descricaoIa}
              onChange={(e) => setDescricaoIa(e.target.value)}
              className="flex-1 py-8 bg-transparent text-papel border-b-[1.5px] border-papel/40 focus:border-dourado focus:outline-none tipo-cota"
            />
            <button
              type="submit"
              disabled={carregandoIa}
              className="px-16 h-[40px] rounded-curto border border-papel/40 text-papel hover:border-papel hover:text-dourado tipo-cota cursor-pointer disabled:opacity-50"
            >
              {carregandoIa ? 'Gerando...' : 'Gerar'}
            </button>
          </div>
          {avisoIa && <p className="tipo-cota text-dourado">{avisoIa}</p>}
        </form>
      </div>

      {/* Coluna Direita (7 colunas): Palco 3D + Resumo acessível em texto */}
      <div className="lg:col-span-7 flex flex-col gap-16 w-full">
        <div
          className={`relative w-full h-[420px] sm:h-[520px] border border-papel/20 bg-preto ${
            layout.led ? 'halo-luz' : ''
          }`}
        >
          {!contornoConcluido && (
            <svg
              aria-hidden="true"
              viewBox="0 0 400 300"
              className="absolute inset-0 w-full h-full pointer-events-none z-20 p-32"
            >
              <path
                ref={contornoSvgPathRef}
                d="M 60 220 L 200 150 L 340 220 L 200 280 Z M 60 220 L 60 80 L 200 20 L 340 80 L 340 220"
                pathLength={600}
                strokeDasharray={600}
                strokeDashoffset={600}
                fill="none"
                stroke="var(--dourado)"
                strokeWidth="1.5"
                strokeLinecap="round"
                filter="url(#traco-lapis)"
              />
            </svg>
          )}

          <CenaQuarto3D
            layout={layout}
            acabamentoAtivoHex={acabamentoAtualObj.hex}
            onCanvasReady={(c) => {
              canvasRef.current = c;
            }}
          />

          <div className="absolute bottom-12 left-12 right-12 pointer-events-none flex items-center justify-between gap-12">
            <span className="tipo-cota text-papel/85 bg-preto/80 px-8 py-4">
              {cenarioAtual.rotulo} 3D • Arraste para girar •{' '}
              {layout.dimensoes.largura_m.toFixed(1)}m ×{' '}
              {layout.dimensoes.profundidade_m.toFixed(1)}m
            </span>
          </div>
        </div>

        {/* Rótulo obrigatório e resumo textual acessível */}
        <div className="flex flex-col gap-8">
          <p className="tipo-cota text-dourado">
            Visualização aproximada. O projeto final é detalhado após a medição.
          </p>
          <div
            aria-live="polite"
            className="tipo-cota text-papel/75 border-l-[1.5px] border-dourado pl-12"
          >
            Resumo configurado: {cenarioAtual.rotulo} com{' '}
            {layout.dimensoes.largura_m.toFixed(2)} m de largura,{' '}
            {layout.dimensoes.profundidade_m.toFixed(2)} m de profundidade e{' '}
            {layout.dimensoes.pe_direito_m.toFixed(2)} m de pé-direito. Módulos ativos:{' '}
            {layout.modulos
              .map((m) => CATALOGO_MODULOS_CENARIO[m.id]?.rotulo || m.id)
              .join(', ')}
            . Acabamento selecionado: {acabamentoAtualObj.nome} (exemplo). Iluminação em
            fita de LED: {layout.led ? 'acesa' : 'apagada'}.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quarto3DExperiencia;
