import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { DocumentoLegal, dataPorExtenso } from '../data/legal';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { EMPRESA } from '../data/empresa';

interface PaginaLegalProps {
  documento: DocumentoLegal;
  onNavegar: (rota: string) => void;
}

/** Página de texto legal (privacidade e termos): leitura confortável, sem distrações. */
export const PaginaLegal: React.FC<PaginaLegalProps> = ({ documento, onNavegar }) => {
  const outro = documento.rota === '/privacidade' ? { rota: '/termos', rotulo: 'Termos de Uso' } : { rota: '/privacidade', rotulo: 'Política de Privacidade' };
  const link = (rota: string) => ({
    href: rota,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      onNavegar(rota);
    },
  });

  return (
    <article className="w-full bg-papel text-grafite pt-144 pb-96">
      <div className="max-w-[760px] mx-auto px-16 sm:px-32 flex flex-col gap-48">
        <header className="flex flex-col gap-16 pb-32 border-b-[1.5px] border-grafite">
          <a {...link('/')} className="inline-flex items-center gap-8 tipo-cota text-grafite-suave hover:text-grafite self-start">
            <ArrowLeft className="w-[16px] h-[16px]" strokeWidth={1.5} />
            Voltar ao site
          </a>
          <p className="tipo-cota text-grafite-suave">Legal e transparência</p>
          <h1 className="tipo-h1 text-grafite">{documento.titulo}</h1>
          <p className="tipo-corpo text-grafite-suave">{documento.resumo}</p>
          <p className="tipo-cota text-grafite-suave">
            Última atualização: <time dateTime={documento.atualizadoEm}>{dataPorExtenso(documento.atualizadoEm)}</time>
          </p>
        </header>

        {documento.secoes.map((s) => (
          <section key={s.titulo} className="flex flex-col gap-16">
            <h2 className="tipo-h3 text-grafite">{s.titulo}</h2>
            {s.paragrafos.map((p) => (
              <p key={p} className="tipo-corpo text-grafite-suave">
                {p}
              </p>
            ))}
            {s.itens && (
              <ul className="flex flex-col gap-8 pl-24 list-disc marker:text-dourado">
                {s.itens.map((i) => (
                  <li key={i} className="tipo-corpo text-grafite-suave">
                    {i}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {documento.fontes && (
          <section className="flex flex-col gap-16">
            <h2 className="tipo-h3 text-grafite">Fontes oficiais</h2>
            <ul className="flex flex-col gap-8 pl-24 list-disc marker:text-dourado">
              {documento.fontes.map((f) => (
                <li key={f.url} className="tipo-corpo">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-grafite link-traco">
                    {f.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="flex flex-col gap-16 pt-32 border-t border-grafite/20">
          <h2 className="tipo-h3 text-grafite">Contato e suporte</h2>
          <p className="tipo-corpo text-grafite-suave">
            Dúvida sobre seus dados, o site ou um orçamento? Fale direto com a {EMPRESA.nome}.
          </p>
          <div className="flex flex-wrap items-center gap-16">
            <a
              href={getWhatsAppUrl('Olá! Tenho uma dúvida sobre o site da Império.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('pagina_legal')}
              className="px-24 h-[48px] inline-flex items-center rounded-curto bg-preto text-papel hover:bg-dourado hover:text-preto transition-colors tipo-cota font-semibold"
            >
              WhatsApp {EMPRESA.telefone}
            </a>
            <a {...link('/contato')} className="tipo-cota text-grafite link-traco">
              Pedir orçamento
            </a>
            <a {...link(outro.rota)} className="tipo-cota text-grafite link-traco">
              {outro.rotulo}
            </a>
          </div>
        </footer>
      </div>
    </article>
  );
};
