import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Check, ArrowRight, ArrowLeft, ImagePlus, FileText } from 'lucide-react';
import {
  getWhatsAppUrl,
  trackGenerateLead,
  trackWhatsAppClick,
} from '../utils/helpers';
import { EMPRESA } from '../data/empresa';
import { MAX_FOTOS, compartilharComFotos, filtrarFotos, podeCompartilharArquivos } from '../utils/enviarComFotos';

/** Miniatura de uma foto escolhida (libera a memória ao sair). */
const Miniatura: React.FC<{ arquivo: File }> = ({ arquivo }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!arquivo.type.startsWith('image/')) return;
    const u = URL.createObjectURL(arquivo);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [arquivo]);
  return url ? (
    <img src={url} alt="" className="w-full h-full object-cover" />
  ) : (
    <FileText className="w-6 h-6 text-grafite-suave" strokeWidth={1.5} aria-hidden="true" />
  );
};

export const OPCOES_AMBIENTE_BRIEFING = [
  'Cozinha',
  'Quarto',
  'Closet',
  'Home office',
  'Sala',
  'Lavanderia',
  'Comercial',
  'Outro',
] as const;

/** Quando o cliente quer começar. */
export const OPCOES_PRAZO_BRIEFING = [
  'O quanto antes',
  'Em 1 a 3 meses',
  'Em 3 a 6 meses',
  'Só pesquisando',
] as const;

/** Estilo para a cotação (opcional). */
export const OPCOES_ESTILO_BRIEFING = [
  'Moderno',
  'Minimalista',
  'Clássico',
  'Industrial',
  'Madeira natural',
  'Ainda não sei',
] as const;

interface BriefingOrcamentoProps {
  modo?: 'painel' | 'inline';
  aberto?: boolean;
  onFechar?: () => void;
  ambienteInicial?: string;
}

export const BriefingOrcamento: React.FC<BriefingOrcamentoProps> = ({
  modo = 'inline',
  aberto = true,
  onFechar,
  ambienteInicial,
}) => {
  const [passo, setPasso] = useState<1 | 2 | 3>(1);
  const [ambientes, setAmbientes] = useState<string[]>(['Cozinha']);
  const [prazo, setPrazo] = useState<string>('');
  const [estilo, setEstilo] = useState<string>('');
  const [fotos, setFotos] = useState<File[]>([]);
  const [avisoFotos, setAvisoFotos] = useState<string | null>(null);
  const [envioFotos, setEnvioFotos] = useState<'compartilhado' | 'anexar' | null>(null);
  const temFotosOuPlanta = fotos.length > 0;
  const [observacoes, setObservacoes] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [cidadeBairro, setCidadeBairro] = useState<string>('Jaú');
  const [consentimentoLgpd, setConsentimentoLgpd] = useState<boolean>(false);
  const [honeypot, setHoneypot] = useState<string>('');
  const [mostrarPrivacidade, setMostrarPrivacidade] = useState<boolean>(false);
  const [erroPasso, setErroPasso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [concluido, setConcluido] = useState<boolean>(false);

  useEffect(() => {
    if (ambienteInicial) {
      const normalizado = OPCOES_AMBIENTE_BRIEFING.find(
        (item) => item.toLowerCase() === ambienteInicial.toLowerCase()
      );
      if (normalizado) {
        setAmbientes([normalizado]);
      } else {
        setAmbientes(['Outro']);
      }
      setPasso(1);
    }
  }, [ambienteInicial, aberto]);

  useEffect(() => {
    if (modo !== 'painel' || !aberto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onFechar) {
        onFechar();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modo, aberto, onFechar]);

  if (modo === 'painel' && !aberto) {
    return null;
  }

  const alternarAmbiente = (item: string) => {
    setErroPasso(null);
    setAmbientes((atual) =>
      atual.includes(item) ? atual.filter((x) => x !== item) : [...atual, item]
    );
  };

  const mascararWhatsapp = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErroPasso(null);
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) {
      v = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
    } else if (v.length > 6) {
      v = `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
    } else if (v.length > 2) {
      v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    }
    setWhatsapp(v);
  };

  const avancarPasso = () => {
    setErroPasso(null);
    if (passo === 1) {
      if (ambientes.length === 0) {
        setErroPasso('Escolha pelo menos um ambiente para continuar.');
        return;
      }
      if (!prazo) {
        setErroPasso('Diga quando você quer começar.');
        return;
      }
      setPasso(2);
      return;
    }
    if (passo === 2) {
      setPasso(3);
    }
  };

  const voltarPasso = () => {
    setErroPasso(null);
    if (passo === 3) setPasso(2);
    else if (passo === 2) setPasso(1);
  };

  const montarMensagemWhatsApp = () => {
    const listaAmbientes = ambientes.join(', ');
    const partes = [`Oi! Sou ${nome.trim()}.`, `Quero orçamento de: ${listaAmbientes}.`];
    if (estilo && estilo !== 'Ainda não sei') partes.push(`Estilo: ${estilo}.`);
    partes.push(`Quero começar: ${prazo.toLowerCase()}.`);
    partes.push(`Cidade: ${cidadeBairro.trim() || 'Jaú'}.`);

    if (observacoes.trim()) {
      partes.push(`Observações: ${observacoes.trim()}.`);
    }
    if (temFotosOuPlanta) {
      partes.push(`Estou enviando ${fotos.length === 1 ? '1 arquivo' : `${fotos.length} arquivos`} (fotos do local ou planta).`);
    }

    return partes.join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroPasso(null);

    if (honeypot.trim() !== '') {
      return;
    }

    if (ambientes.length === 0 || !prazo) {
      setPasso(1);
      setErroPasso('Escolha o ambiente e quando quer começar.');
      return;
    }

    const digitosFone = whatsapp.replace(/\D/g, '');
    if (!nome.trim() || digitosFone.length < 10) {
      setErroPasso('Informe seu nome e WhatsApp com DDD.');
      return;
    }

    if (!consentimentoLgpd) {
      setErroPasso('Confirme o consentimento LGPD para prosseguir.');
      return;
    }

    setEnviando(true);

    const textoMensagem = montarMensagemWhatsApp();
    trackGenerateLead(ambientes.join(', '), prazo);
    trackWhatsAppClick(modo === 'painel' ? 'briefing_painel' : 'briefing_pagina');

    // Celular com fotos: o compartilhamento do sistema leva fotos e mensagem juntas para o WhatsApp.
    let compartilhou = false;
    if (podeCompartilharArquivos(fotos)) {
      const r = await compartilharComFotos(fotos, `Para ${EMPRESA.nome} (${EMPRESA.telefone}):\n${textoMensagem}`);
      if (r === 'cancelado') {
        setEnviando(false);
        return;
      }
      compartilhou = r === 'compartilhado';
    }
    if (compartilhou) {
      setEnvioFotos('compartilhado');
    } else {
      // Computador (ou sem fotos): abre a conversa da Império com o texto; as fotos vão pelo clipe.
      window.open(getWhatsAppUrl(textoMensagem), '_blank', 'noopener,noreferrer');
      setEnvioFotos(fotos.length > 0 ? 'anexar' : null);
    }

    setEnviando(false);
    setConcluido(true);

    if (import.meta.env.VITE_SALVAR_LEADS === 'true') {
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          whatsapp: whatsapp.trim(),
          cidade: cidadeBairro.trim() || 'Jaú',
          ambientes,
          prazo,
          estilo,
          temFotosOuPlanta,
          observacoes: observacoes.trim(),
          consentimentoLgpd,
          website: honeypot,
        }),
      }).catch(() => undefined);
    }
  };

  const percentualProgresso = passo === 1 ? 33 : passo === 2 ? 66 : 100;

  const conteudoFormulario = (
    <div className="w-full flex flex-col gap-24">
      {/* Cabeçalho e Barra de Progresso */}
      <div className="flex flex-col gap-16">
        <div className="flex items-center justify-between gap-16">
          <span className="tipo-cota text-grafite-suave">
            Passo {passo} de 3 —{' '}
            {passo === 1
              ? 'O que você quer?'
              : passo === 2
              ? 'Detalhes (opcionais)'
              : 'Seu contato'}
          </span>
          <span className="tipo-cota text-grafite font-semibold">
            {percentualProgresso}%
          </span>
        </div>

        <div
          className="w-full h-1.5 bg-grafite/15 overflow-hidden rounded-curto"
          role="progressbar"
          aria-valuenow={percentualProgresso}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-dourado transition-all duration-300"
            style={{ width: `${percentualProgresso}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-24" noValidate>
        {/* Campo honeypot invisível para proteção contra bots */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="briefing-website-hp">Não preencha este campo</label>
          <input
            id="briefing-website-hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* PASSO 1: O que você quer? + Fase */}
        {passo === 1 && (
          <div className="flex flex-col gap-24">
            <fieldset className="flex flex-col gap-16">
              <legend className="tipo-h3 text-grafite pb-8">
                1. Quais ambientes você quer planejar?
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                {OPCOES_AMBIENTE_BRIEFING.map((item) => {
                  const ativo = ambientes.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => alternarAmbiente(item)}
                      aria-pressed={ativo}
                      className={`h-[46px] px-16 rounded-curto border tipo-cota flex items-center justify-between gap-8 transition-colors cursor-pointer ${
                        ativo
                          ? 'bg-preto text-papel border-preto font-semibold'
                          : 'bg-papel-2 text-grafite border-grafite/25 hover:border-grafite'
                      }`}
                    >
                      <span>{item}</span>
                      {ativo && <Check className="w-3.5 h-3.5 text-dourado shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-16">
              <legend className="tipo-cota text-grafite font-semibold pb-4">
                Quando você quer começar? *
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                {OPCOES_PRAZO_BRIEFING.map((item) => {
                  const ativo = prazo === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setErroPasso(null);
                        setPrazo(item);
                      }}
                      aria-pressed={ativo}
                      className={`h-[46px] px-16 rounded-curto border tipo-cota flex items-center justify-center text-center transition-colors cursor-pointer ${
                        ativo
                          ? 'bg-preto text-papel border-preto font-semibold'
                          : 'bg-papel-2 text-grafite border-grafite/25 hover:border-grafite'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-16">
              <legend className="tipo-cota text-grafite font-semibold pb-4">
                Tem um estilo em mente? (opcional)
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                {OPCOES_ESTILO_BRIEFING.map((item) => {
                  const ativo = estilo === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setEstilo(ativo ? '' : item)}
                      aria-pressed={ativo}
                      className={`h-[46px] px-16 rounded-curto border tipo-cota flex items-center justify-center text-center transition-colors cursor-pointer ${
                        ativo
                          ? 'bg-preto text-papel border-preto font-semibold'
                          : 'bg-papel-2 text-grafite border-grafite/25 hover:border-grafite'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        )}

        {/* PASSO 2: Detalhes opcionais */}
        {passo === 2 && (
          <div className="flex flex-col gap-24">
            <h3 className="tipo-h3 text-grafite">
              2. Detalhes (opcional)
            </h3>

            <div className="flex flex-col gap-8">
              <span className="tipo-cota text-grafite">Fotos do local ou planta (opcional, até {MAX_FOTOS})</span>
              <label className="flex items-center justify-center gap-8 min-h-[52px] px-16 bg-papel-2 border border-dashed border-grafite/45 rounded-curto cursor-pointer tipo-cota text-grafite hover:border-grafite focus-within:border-preto">
                <ImagePlus className="w-5 h-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>{fotos.length ? 'Adicionar mais' : 'Escolher fotos ou planta'}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const r = filtrarFotos(fotos, Array.from(e.target.files ?? []));
                    setFotos(r.aceitas);
                    setAvisoFotos(r.recusadas.length ? r.recusadas.join('; ') : null);
                    e.target.value = '';
                  }}
                />
              </label>
              {fotos.length > 0 && (
                <ul className="grid grid-cols-3 sm:grid-cols-6 gap-8" aria-label="Arquivos escolhidos">
                  {fotos.map((f, i) => (
                    <li key={`${f.name}-${f.size}`} className="relative aspect-square bg-papel-2 border border-grafite/25 rounded-curto overflow-hidden flex items-center justify-center">
                      <Miniatura arquivo={f} />
                      <button
                        type="button"
                        onClick={() => setFotos((atual) => atual.filter((_, j) => j !== i))}
                        aria-label={`Remover ${f.name}`}
                        className="absolute top-4 right-4 w-[28px] h-[28px] flex items-center justify-center bg-preto/80 text-papel rounded-curto cursor-pointer"
                      >
                        <X className="w-[16px] h-[16px]" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {avisoFotos && (
                <p className="tipo-cota text-erro" role="alert">
                  {avisoFotos}
                </p>
              )}
              {fotos.length > 0 && (
                <p className="tipo-cota text-grafite-suave">
                  No celular, as fotos seguem junto com a mensagem pelo WhatsApp. No computador, a conversa abre com a mensagem e você anexa as fotos pelo clipe.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-8">
              <label htmlFor="briefing-obs" className="tipo-cota text-grafite">
                Observações livres (opcional)
              </label>
              <textarea
                id="briefing-obs"
                rows={3}
                placeholder="Ex.: Quero ilha em ripado, iluminação em LED quente e bastante gaveta..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full p-16 bg-papel-2 text-grafite border border-grafite/35 rounded-curto focus:outline-none focus:border-preto tipo-corpo resize-none"
              />
            </div>
          </div>
        )}

        {/* PASSO 3: Contato + LGPD */}
        {passo === 3 && (
          <div className="flex flex-col gap-24">
            <h3 className="tipo-h3 text-grafite">
              3. Para quem preparamos o orçamento?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
              <div className="flex flex-col gap-8">
                <label htmlFor="briefing-nome" className="tipo-cota text-grafite">
                  Seu nome *
                </label>
                <input
                  id="briefing-nome"
                  type="text"
                  required
                  placeholder="Ex.: Mariana Costa"
                  value={nome}
                  onChange={(e) => {
                    setErroPasso(null);
                    setNome(e.target.value);
                  }}
                  className="w-full py-[12px] px-16 bg-papel-2 text-grafite border border-grafite/35 rounded-curto focus:outline-none focus:border-preto tipo-corpo"
                />
              </div>

              <div className="flex flex-col gap-8">
                <label htmlFor="briefing-whatsapp" className="tipo-cota text-grafite">
                  Seu WhatsApp com DDD *
                </label>
                <input
                  id="briefing-whatsapp"
                  type="tel"
                  required
                  placeholder="(14) 99849-2834"
                  value={whatsapp}
                  onChange={mascararWhatsapp}
                  className="w-full py-[12px] px-16 bg-papel-2 text-grafite border border-grafite/35 rounded-curto focus:outline-none focus:border-preto tipo-corpo"
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <label htmlFor="briefing-cidade" className="tipo-cota text-grafite">
                Cidade / bairro
              </label>
              <input
                id="briefing-cidade"
                type="text"
                placeholder="Ex.: Jaú — Jardim Maria Luiza"
                value={cidadeBairro}
                onChange={(e) => setCidadeBairro(e.target.value)}
                className="w-full py-[12px] px-16 bg-papel-2 text-grafite border border-grafite/35 rounded-curto focus:outline-none focus:border-preto tipo-corpo"
              />
            </div>

            <div className="flex flex-col gap-8">
              <label className="flex items-start gap-16 cursor-pointer tipo-cota text-grafite">
                <input
                  type="checkbox"
                  required
                  checked={consentimentoLgpd}
                  onChange={(e) => {
                    setErroPasso(null);
                    setConsentimentoLgpd(e.target.checked);
                  }}
                  className="accent-dourado w-[16px] h-[16px] mt-[2px] shrink-0"
                />
                <span>
                  Autorizo o contato da {EMPRESA.nome} pelo WhatsApp conforme a{' '}
                  <button
                    type="button"
                    onClick={() => setMostrarPrivacidade((v) => !v)}
                    className="underline text-grafite hover:text-preto cursor-pointer font-semibold"
                  >
                    Política de Privacidade (LGPD)
                  </button>
                  . *
                </span>
              </label>

              {mostrarPrivacidade && (
                <div className="p-16 bg-papel-2 border border-grafite/25 rounded-curto tipo-cota text-grafite-suave flex flex-col gap-4">
                  <strong className="text-grafite">Política de Privacidade (LGPD):</strong>
                  <p>
                    Os dados informados (nome, telefone, cidade e preferências de projeto) são utilizados exclusivamente pelo Wellington e pela Tatiane Cabral para atendimento comercial e elaboração do seu orçamento na {EMPRESA.nome}. Não compartilhamos seus dados com terceiros.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {erroPasso && (
          <p className="tipo-cota text-erro font-semibold" role="alert">
            {erroPasso}
          </p>
        )}

        {/* Rodapé de navegação entre passos */}
        <div className="flex flex-wrap items-center justify-between gap-16 pt-8 border-t border-grafite/15">
          {passo > 1 ? (
            <button
              type="button"
              onClick={voltarPasso}
              className="inline-flex items-center gap-8 px-16 h-[48px] rounded-curto border border-grafite/35 text-grafite hover:border-grafite tipo-cota cursor-pointer"
            >
              <ArrowLeft className="w-[16px] h-[16px]" />
              <span>Voltar</span>
            </button>
          ) : (
            <span className="tipo-cota text-grafite-suave">
              Leva menos de 30 segundos
            </span>
          )}

          {passo < 3 ? (
            <button
              type="button"
              onClick={avancarPasso}
              className="inline-flex items-center gap-8 px-24 h-[48px] rounded-curto bg-preto text-papel hover:bg-dourado hover:text-preto transition-colors tipo-cota font-semibold cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-[16px] h-[16px]" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center gap-8 px-24 h-[52px] rounded-curto bg-dourado text-preto hover:bg-preto hover:text-dourado border border-dourado transition-colors tipo-cota font-semibold cursor-pointer"
            >
              <MessageSquare className="w-[16px] h-[16px]" strokeWidth={1.5} />
              <span>
                {enviando ? 'Preparando...' : 'Abrir conversa no WhatsApp'}
              </span>
            </button>
          )}
        </div>

        {concluido && envioFotos === 'compartilhado' && (
          <p className="tipo-cota text-ok font-semibold">
            Pronto! Se a mensagem não foi para a conversa da Império, ela está copiada:{' '}
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="underline">
              abra a conversa da Império
            </a>{' '}
            e cole.
          </p>
        )}
        {concluido && envioFotos === 'anexar' && (
          <p className="tipo-cota text-ok font-semibold">
            A conversa abriu com a sua mensagem. Agora anexe as fotos pelo clipe do WhatsApp (ou arraste para a janela).
          </p>
        )}
        {concluido && envioFotos === null && (
          <p className="tipo-cota text-ok font-semibold">
            Resumo pronto! Se a janela do WhatsApp não abriu automaticamente,{' '}
            <a
              href={getWhatsAppUrl(montarMensagemWhatsApp())}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              clique aqui para abrir
            </a>
            .
          </p>
        )}
      </form>
    </div>
  );

  if (modo === 'inline') {
    return conteudoFormulario;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-preto/75 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Pedir orçamento rápido"
      onClick={(e) => {
        if (e.target === e.currentTarget && onFechar) {
          onFechar();
        }
      }}
    >
      <div className="w-full max-w-[540px] bg-papel text-grafite h-full overflow-y-auto p-24 sm:p-32 flex flex-col justify-between gap-24 border-l border-grafite/20">
        <div className="flex flex-col gap-24">
          <div className="flex items-start justify-between gap-16 pb-16 border-b border-grafite/20">
            <div className="flex flex-col gap-4">
              <span className="tipo-cota text-grafite-suave uppercase tracking-wider">
                Orçamento rápido
              </span>
              <h2 className="tipo-h2 text-grafite">
                Fale com o Wellington e a Tatiane
              </h2>
            </div>

            {onFechar && (
              <button
                type="button"
                onClick={onFechar}
                aria-label="Fechar painel de orçamento"
                className="p-8 border border-grafite/25 rounded-curto text-grafite hover:bg-preto hover:text-papel transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {conteudoFormulario}
        </div>

        <div className="pt-16 border-t border-grafite/15 flex items-center justify-between gap-16 tipo-cota text-grafite-suave">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('briefing_whatsapp_direto')}
            className="link-traco text-grafite"
          >
            WhatsApp direto: {EMPRESA.telefone}
          </a>
          <span>Jaú e região</span>
        </div>
      </div>
    </div>
  );
};
