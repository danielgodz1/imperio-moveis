import React, { useEffect, useState } from 'react';
import { FolderOpen, Save, Trash2 } from 'lucide-react';
import { trackProjeto3D } from '../../utils/helpers';
import { CENARIOS_AMBIENTES } from '../../data/cenarios';
import { MAX_NOME_PROJETO, ProjetoSalvo, listarProjetos, removerProjeto, salvarProjeto } from './projetosSalvos';
import type { QuartoLayout } from './schema';

interface MeusProjetosProps {
  layout: QuartoLayout;
  onAbrir: (layout: QuartoLayout) => void;
  /** "salvar": campo de nome + lista (etapa Enviar). "retomar": só a lista, se houver (etapa Ambiente). */
  modo: 'salvar' | 'retomar';
}

const quando = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

/** Projetos salvos neste aparelho (sem dados pessoais), para retomar depois. */
export const MeusProjetos: React.FC<MeusProjetosProps> = ({ layout, onAbrir, modo }) => {
  const [lista, setLista] = useState<ProjetoSalvo[]>([]);
  const [nome, setNome] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => setLista(listarProjetos()), []);

  if (modo === 'retomar' && lista.length === 0) return null;

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    const nova = salvarProjeto(nome, layout);
    if (!nova) {
      setAviso('Este navegador não deixou salvar (modo privado?). Use o link do projeto.');
      return;
    }
    setLista(nova);
    setAviso(`Salvo neste aparelho como "${nova[0].nome}".`);
    setNome('');
    trackProjeto3D('salvar', { ambiente: layout.comodo, total_salvos: nova.length });
  };

  return (
    <section aria-label="Meus projetos" className="flex flex-col gap-8">
      <span className="tipo-cota text-papel/85">{modo === 'retomar' ? 'Retomar um projeto salvo' : 'Salvar para continuar depois'}</span>
      {modo === 'salvar' && (
        <form onSubmit={salvar} className="flex gap-8">
          <label className="sr-only" htmlFor="nome-projeto">
            Nome do projeto
          </label>
          <input
            id="nome-projeto"
            type="text"
            maxLength={MAX_NOME_PROJETO}
            placeholder="Nome (ex.: Cozinha da casa nova)"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="flex-1 min-w-0 py-8 bg-transparent text-papel border-b-[1.5px] border-papel/40 focus:border-dourado focus:outline-none tipo-cota"
          />
          <button type="submit" className="h-[40px] px-16 shrink-0 flex items-center gap-8 rounded-curto border border-papel/40 text-papel tipo-cota font-semibold hover:border-dourado hover:text-dourado cursor-pointer">
            <Save className="w-[16px] h-[16px]" strokeWidth={1.5} /> Salvar
          </button>
        </form>
      )}
      {aviso && (
        <p className="tipo-cota text-dourado" role="status">
          {aviso}
        </p>
      )}
      {lista.length > 0 && (
        <ul className="flex flex-col">
          {lista.map((p) => (
            <li key={p.id} className="py-8 border-b border-papel/15 flex items-center gap-8">
              <button
                type="button"
                onClick={() => {
                  onAbrir(p.layout);
                  trackProjeto3D('abrir_salvo', { ambiente: p.layout.comodo });
                }}
                className="flex-1 min-w-0 flex items-center gap-8 text-left cursor-pointer group"
              >
                <FolderOpen className="w-[16px] h-[16px] shrink-0 text-dourado" strokeWidth={1.5} aria-hidden="true" />
                <span className="flex flex-col min-w-0">
                  <span className="tipo-cota text-papel font-semibold truncate group-hover:text-dourado">{p.nome}</span>
                  <span className="tipo-cota text-papel/60">
                    {CENARIOS_AMBIENTES[p.layout.comodo].rotulo}, salvo em {quando(p.salvoEm)}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setLista(removerProjeto(p.id))}
                aria-label={`Excluir o projeto ${p.nome}`}
                className="w-[36px] h-[36px] shrink-0 flex items-center justify-center text-papel/60 hover:text-dourado cursor-pointer"
              >
                <Trash2 className="w-[16px] h-[16px]" strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="tipo-cota text-papel/60">Fica só neste navegador. Nenhum dado pessoal é guardado.</p>
    </section>
  );
};
