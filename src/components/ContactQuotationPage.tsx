import React, { useState } from 'react';
import { MessageSquare, MapPin } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';

interface ContactQuotationPageProps {
  onBackToHome: () => void;
}

export const ContactQuotationPage: React.FC<ContactQuotationPageProps> = ({
  onBackToHome,
}) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('Jaú');
  const [ambientes, setAmbientes] = useState<string[]>(['Cozinha']);
  const [faseObra, setFaseObra] = useState('Apenas planejando');
  const [mensagem, setMensagem] = useState('');
  const [enviado, setEnviado] = useState(false);

  const opcoesAmbiente = [
    'Cozinha',
    'Quarto / Dormitório',
    'Closet',
    'Sala / Painel',
    'Home Office',
    'Loja Comercial',
    'Casa inteira (Arquitetura + Marcenaria)',
  ];

  const alternarAmbiente = (amb: string) => {
    if (amb === 'Casa inteira (Arquitetura + Marcenaria)') {
      if (ambientes.includes(amb)) {
        setAmbientes(ambientes.filter((a) => a !== amb));
      } else {
        setAmbientes([amb]);
      }
      return;
    }

    if (ambientes.includes(amb)) {
      setAmbientes(ambientes.filter((a) => a !== amb));
    } else {
      setAmbientes([
        ...ambientes.filter((a) => a !== 'Casa inteira (Arquitetura + Marcenaria)'),
        amb,
      ]);
    }
  };

  const mascararTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) {
      v = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
    } else if (v.length > 6) {
      v = `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
    } else if (v.length > 2) {
      v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    }
    setTelefone(v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);

    const texto = `Oi! Vi o site da Império e quero conversar sobre um projeto.
Nome: ${nome}
WhatsApp: ${telefone}
E-mail: ${email}
Cidade: ${cidade}
Ambientes: ${ambientes.join(', ') || 'A definir'}
Fase da obra: ${faseObra}
Observações: ${mensagem || 'Não informado'}`;

    const url = getWhatsAppUrl(texto);
    setTimeout(() => {
      window.open(url, '_blank');
    }, 300);
  };

  return (
    <div id="contato-pagina" className="w-full bg-papel text-grafite min-h-screen py-64">
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-64">
        {/* Navegação de retorno */}
        <div className="flex flex-col items-start gap-16 border-b border-grafite/20 pb-32">
          <button
            type="button"
            onClick={onBackToHome}
            className="tipo-cota text-grafite link-traco cursor-pointer"
          >
            Voltar para o início
          </button>

          <h1 className="tipo-h1 text-grafite">
            Enviar medidas ou pedir orçamento
          </h1>
          <p className="tipo-corpo text-grafite-suave">
            Preencha os dados do seu espaço. Ao confirmar, abrimos a conversa no WhatsApp com o resumo pronto para o Wellington e a Tatiane.
          </p>
        </div>

        {/* Grade de 12 colunas: 7 colunas formulário + 5 colunas contato direto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-48 items-start">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 flex flex-col gap-32"
          >
            <div className="flex flex-col gap-8">
              <label htmlFor="campo-nome" className="tipo-cota text-grafite">
                Seu nome *
              </label>
              <input
                id="campo-nome"
                required
                type="text"
                placeholder="Ex.: Carolina Silveira"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full py-12 bg-transparent text-grafite border-b-[1.5px] border-grafite rounded-none focus:outline-none focus:border-preto tipo-corpo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-32">
              <div className="flex flex-col gap-8">
                <label htmlFor="campo-whatsapp" className="tipo-cota text-grafite">
                  WhatsApp com DDD *
                </label>
                <input
                  id="campo-whatsapp"
                  required
                  type="tel"
                  placeholder="(14) 99849-2834"
                  value={telefone}
                  onChange={mascararTelefone}
                  className="w-full py-12 bg-transparent text-grafite border-b-[1.5px] border-grafite rounded-none focus:outline-none focus:border-preto tipo-corpo"
                />
              </div>

              <div className="flex flex-col gap-8">
                <label htmlFor="campo-email" className="tipo-cota text-grafite">
                  E-mail *
                </label>
                <input
                  id="campo-email"
                  required
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-12 bg-transparent text-grafite border-b-[1.5px] border-grafite rounded-none focus:outline-none focus:border-preto tipo-corpo"
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <label htmlFor="campo-cidade" className="tipo-cota text-grafite">
                Cidade da obra *
              </label>
              <select
                id="campo-cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full py-12 bg-papel-2 px-12 text-grafite border-b-[1.5px] border-grafite rounded-curto focus:outline-none focus:border-preto tipo-corpo cursor-pointer"
              >
                <option value="Jaú">Jaú</option>
                <option value="Barra Bonita">Barra Bonita</option>
                <option value="Dois Córregos">Dois Córregos</option>
                <option value="Bocaina">Bocaina</option>
                <option value="Bauru">Bauru</option>
                <option value="Outra cidade da região">Outra cidade da região</option>
              </select>
            </div>

            <fieldset className="flex flex-col gap-12">
              <legend className="tipo-cota text-grafite pb-8">
                Ambientes que deseja planejar
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                {opcoesAmbiente.map((amb) => {
                  const marcado = ambientes.includes(amb);
                  return (
                    <label
                      key={amb}
                      className={`flex items-center gap-12 p-12 border cursor-pointer rounded-curto tipo-cota transition-colors ${
                        marcado
                          ? 'bg-preto text-papel border-preto'
                          : 'bg-papel-2 text-grafite border-grafite/30 hover:border-grafite'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => alternarAmbiente(amb)}
                        className="accent-dourado w-4 h-4"
                      />
                      <span>{amb}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-12">
              <legend className="tipo-cota text-grafite pb-8">
                Momento atual da obra
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                {['Apenas planejando', 'Em reforma ou obra', 'Pronto para medir'].map(
                  (fase) => (
                    <label
                      key={fase}
                      className={`flex items-center gap-8 p-12 border cursor-pointer rounded-curto tipo-cota transition-colors ${
                        faseObra === fase
                          ? 'bg-preto text-papel border-preto'
                          : 'bg-papel-2 text-grafite border-grafite/30 hover:border-grafite'
                      }`}
                    >
                      <input
                        type="radio"
                        name="faseObra"
                        checked={faseObra === fase}
                        onChange={() => setFaseObra(fase)}
                        className="accent-dourado"
                      />
                      <span>{fase}</span>
                    </label>
                  )
                )}
              </div>
            </fieldset>

            <div className="flex flex-col gap-8">
              <label htmlFor="campo-mensagem" className="tipo-cota text-grafite">
                Medidas aproximadas ou observações (opcional)
              </label>
              <textarea
                id="campo-mensagem"
                rows={3}
                placeholder="Ex.: Cozinha de 4,10m x 3,20m com ilha em ripado e tampo de granito preto..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="w-full py-12 bg-transparent text-grafite border-b-[1.5px] border-grafite rounded-none focus:outline-none focus:border-preto tipo-corpo resize-none"
              />
            </div>

            <div className="pt-8 flex flex-col items-start gap-16">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-8 px-32 h-[52px] rounded-curto bg-dourado text-preto hover:bg-preto hover:text-dourado border border-dourado transition-colors duration-200 tipo-cota font-semibold cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                <span>Chamar no WhatsApp</span>
              </button>

              {enviado && (
                <p className="tipo-cota text-ok">
                  Resumo pronto. Abrindo conversa no WhatsApp...
                </p>
              )}
            </div>
          </form>

          {/* Coluna Direita (5 colunas): Atendimento Direto */}
          <div className="lg:col-span-5 flex flex-col gap-32 bg-papel-2 p-24 sm:p-32 border border-grafite/20">
            <div className="flex flex-col gap-8">
              <h2 className="tipo-h2 text-grafite">Prefere falar direto?</h2>
              <p className="tipo-corpo text-grafite-suave">
                Você também pode enviar fotos do ambiente ou a planta baixa direto pelo WhatsApp.
              </p>
            </div>

            <div className="flex flex-col gap-8 border-t border-grafite/20 pt-16">
              <span className="tipo-cota text-grafite-suave">WhatsApp em Jaú</span>
              <span className="tipo-h3 text-grafite">(14) 99849-2834</span>
            </div>

            <div className="flex items-start gap-12 border-t border-grafite/20 pt-16">
              <MapPin className="w-5 h-5 text-grafite shrink-0 mt-1" strokeWidth={1.5} />
              <div className="flex flex-col gap-4">
                <span className="tipo-cota text-grafite font-semibold">
                  Endereço em Jaú [CONFIRMAR]
                </span>
                <span className="tipo-cota text-grafite-suave">
                  R. Doná Djanira Werneck de Almeida e Silva, 280 — Jardim Itamarati, Jaú/SP
                </span>
              </div>
            </div>

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-24 h-[52px] rounded-curto border-[1.5px] border-grafite bg-transparent text-grafite hover:bg-grafite hover:text-papel transition-colors tipo-cota"
            >
              Abrir WhatsApp direto
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
