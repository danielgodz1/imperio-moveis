import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  QuartoLayout,
  QuartoLayoutSchema,
  LAYOUTS_INICIAIS,
  CATALOGO_MODULOS,
  ModuloId,
} from './schema';
import { WOOD_FINISHES } from '../../data/woodData';
import { CenaQuarto3D } from './CenaQuarto3D';
import { getWhatsAppUrl } from '../../utils/helpers';

export const Quarto3DExperiencia: React.FC = () => {
  const [layout, setLayout] = useState<QuartoLayout>(LAYOUTS_INICIAIS.quarto);
  const [acabamentoGlobal, setAcabamentoGlobal] = useState<string>('freijo-ripado');
  const [descricaoIa, setDescricaoIa] = useState('');
  const [carregandoIa, setCarregandoIa] = useState(false);
  const [avisoIa, setAvisoIa] = useState<string | null>(null);
  const [contornoConcluido, setContornoConcluido] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contornoSvgPathRef = useRef<SVGPathElement>(null);

  const acabamentoAtualObj =
    WOOD_FINISHES.find((w) => w.id === acabamentoGlobal) || WOOD_FINISHES[0];

  // Desenha o contorno do ambiente com a linha de lápis antes de os módulos 3D subirem
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

  const trocarComodo = (novoComodo: QuartoLayout['comodo']) => {
    const base = LAYOUTS_INICIAIS[novoComodo];
    setLayout({
      ...base,
      modulos: base.modulos.map((m) => ({ ...m, acabamento: acabamentoGlobal })),
    });
  };

  const atualizarMedida = (
    chave: keyof QuartoLayout['dimensoes'],
    valorBruto: string
  ) => {
    const num = Number(valorBruto.replace(',', '.'));
    if (Number.isNaN(num)) return;
    const min = chave === 'pe_direito_m' ? 2.4 : 2.2;
    const max = chave === 'pe_direito_m' ? 3.5 : 7.5;
    const limitado = Math.max(min, Math.min(max, num));

    setLayout((prev) => ({
      ...prev,
      dimensoes: {
        ...prev.dimensoes,
        [chave]: limitado,
      },
    }));
  };

  const alternarModulo = (id: ModuloId) => {
    setLayout((prev) => {
      const existe = prev.modulos.some((m) => m.id === id);
      if (existe) {
        if (prev.modulos.length <= 1) return prev;
        return {
          ...prev,
          modulos: prev.modulos.filter((m) => m.id !== id),
        };
      }
      const info = CATALOGO_MODULOS.find((c) => c.id === id);
      if (!info) return prev;
      return {
        ...prev,
        modulos: [
          ...prev.modulos,
          {
            id,
            parede: info.paredePadrao,
            largura_m: info.larguraPadrao,
            altura_m: info.alturaPadrao,
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
      .map((m) => CATALOGO_MODULOS.find((c) => c.id === m.id)?.rotulo || m.id)
      .join(', ');

    return `Oi! Montei uma visualização 3D no site da Império e quero orçar meu projeto:
- Ambiente: ${layout.comodo}
- Medidas: ${layout.dimensoes.largura_m.toFixed(2)} m x ${layout.dimensoes.profundidade_m.toFixed(
      2
    )} m (pé-direito ${layout.dimensoes.pe_direito_m.toFixed(2)} m)
- Módulos escolhidos: ${nomesModulos}
- Acabamento: ${acabamentoAtualObj.name}
- Fita de LED: ${layout.led ? 'Sim' : 'Não'}`;
  };

  const enviarMeuQuarto = async () => {
    const resumo = gerarResumoTexto();
    const canvas = canvasRef.current;

    if (canvas) {
      try {
        const blob: Blob | null = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png')
        );

        if (blob) {
          const arquivo = new File([blob], 'meu-ambiente-3d-imperio.png', {
            type: 'image/png',
          });

          // No celular, usa navigator.share({ files, text }) quando suportado
          if (
            typeof navigator.share === 'function' &&
            typeof navigator.canShare === 'function' &&
            navigator.canShare({ files: [arquivo] })
          ) {
            await navigator.share({
              title: 'Meu ambiente 3D — Império Móveis Planejados',
              text: resumo,
              files: [arquivo],
            });
            return;
          }

          // Caso contrário, faz download do print e abre o WhatsApp orientando a anexar
          const urlPrint = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = urlPrint;
          link.download = 'meu-ambiente-3d-imperio.png';
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
      setAvisoIa('Layout 3D atualizado a partir da sua descrição.');
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
      {/* Coluna Esquerda (5 colunas): Controles de medida, módulos, acabamento e LED */}
      <div className="lg:col-span-5 flex flex-col gap-24">
        {/* Escolha de cômodo */}
        <div className="flex flex-col gap-8">
          <span className="tipo-cota text-papel/75">Ambiente</span>
          <div className="flex flex-wrap gap-16">
            {(
              [
                { id: 'quarto', nome: 'Quarto' },
                { id: 'cozinha', nome: 'Cozinha' },
                { id: 'closet', nome: 'Closet' },
                { id: 'home-office', nome: 'Home Office' },
              ] as const
            ).map((item) => {
              const ativo = layout.comodo === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => trocarComodo(item.id)}
                  className={`tipo-cota cursor-pointer transition-colors ${
                    ativo
                      ? 'text-dourado link-traco font-semibold'
                      : 'text-papel/70 hover:text-papel'
                  }`}
                >
                  {item.nome}
                </button>
              );
            })}
          </div>
        </div>

        {/* Medidas do ambiente (campos com linha inferior de 1.5px) */}
        <div className="grid grid-cols-3 gap-16 pt-8">
          <div className="flex flex-col gap-4">
            <label htmlFor="medida-largura" className="tipo-cota text-papel/80">
              Largura (m)
            </label>
            <input
              id="medida-largura"
              type="number"
              step="0.1"
              min="2.2"
              max="7.5"
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
              min="2.2"
              max="7.5"
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
              min="2.4"
              max="3.5"
              value={layout.dimensoes.pe_direito_m}
              onChange={(e) => atualizarMedida('pe_direito_m', e.target.value)}
              className="w-full py-8 bg-transparent text-papel border-b-[1.5px] border-papel/60 focus:border-dourado focus:outline-none tipo-cota"
            />
          </div>
        </div>

        {/* Seleção dos 4 módulos paramétricos */}
        <fieldset className="flex flex-col gap-8 pt-8">
          <legend className="tipo-cota text-papel/80 pb-4">
            Módulos no ambiente
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {CATALOGO_MODULOS.map((mod) => {
              const selecionado = layout.modulos.some((m) => m.id === mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => alternarModulo(mod.id)}
                  aria-pressed={selecionado}
                  className={`text-left px-12 py-8 rounded-curto border tipo-cota cursor-pointer transition-colors ${
                    selecionado
                      ? 'border-papel text-dourado bg-papel/5'
                      : 'border-papel/25 text-papel/75 hover:border-papel/60'
                  }`}
                >
                  {selecionado ? '✓ ' : '+ '}
                  {mod.rotulo}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Escolha de acabamento (amostras de cor de woodData.ts) */}
        <div className="flex flex-col gap-8 pt-8">
          <span className="tipo-cota text-papel/80">
            Acabamento: <strong>{acabamentoAtualObj.name}</strong>
          </span>
          <div className="flex flex-wrap items-center gap-12">
            {WOOD_FINISHES.map((finish) => {
              const ativo = acabamentoGlobal === finish.id;
              return (
                <button
                  key={finish.id}
                  type="button"
                  onClick={() => trocarAcabamento(finish.id)}
                  aria-label={`Escolher acabamento ${finish.name}`}
                  aria-pressed={ativo}
                  className={`flex items-center gap-8 px-12 py-8 rounded-curto border cursor-pointer tipo-cota transition-colors ${
                    ativo
                      ? 'border-papel text-dourado'
                      : 'border-papel/25 text-papel/75 hover:border-papel/60'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 inline-block border border-papel/40"
                    style={{ backgroundColor: finish.colorHex }}
                  />
                  <span>{finish.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Terceiro momento orquestrado: Acender o LED + Enviar meu quarto */}
        <div className="flex flex-wrap items-center gap-16 pt-16">
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
            Enviar meu quarto
          </button>
        </div>

        {/* Campo experimental opcional: Descreva seu quarto -> POST /api/layout */}
        <form
          onSubmit={gerarLayoutPorDescricao}
          className="pt-16 border-t border-papel/15 flex flex-col gap-8"
        >
          <label htmlFor="campo-ia-quarto" className="tipo-cota text-papel/70">
            Descreva seu quarto (experimental — máx. 400 caracteres)
          </label>
          <div className="flex items-end gap-12">
            <input
              id="campo-ia-quarto"
              type="text"
              maxLength={400}
              placeholder="Ex.: Quarto de 4x3,5m com cabeceira ripada, LED e guarda-roupa..."
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
          {/* Contorno inicial desenhado com a linha de lápis */}
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
            acabamentoAtivoHex={acabamentoAtualObj.colorHex}
            onCanvasReady={(c) => {
              canvasRef.current = c;
            }}
          />

          <div className="absolute bottom-12 left-12 right-12 pointer-events-none flex items-center justify-between gap-12">
            <span className="tipo-cota text-papel/85 bg-preto/80 px-8 py-4">
              Arraste para girar • {layout.dimensoes.largura_m.toFixed(1)}m ×{' '}
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
            Resumo configurado: Ambiente {layout.comodo} com{' '}
            {layout.dimensoes.largura_m.toFixed(2)} m de largura,{' '}
            {layout.dimensoes.profundidade_m.toFixed(2)} m de profundidade e{' '}
            {layout.dimensoes.pe_direito_m.toFixed(2)} m de pé-direito. Módulos ativos:{' '}
            {layout.modulos
              .map((m) => CATALOGO_MODULOS.find((c) => c.id === m.id)?.rotulo || m.id)
              .join(', ')}
            . Acabamento selecionado: {acabamentoAtualObj.name}. Iluminação em fita de LED:{' '}
            {layout.led ? 'acesa' : 'apagada'}.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quarto3DExperiencia;

