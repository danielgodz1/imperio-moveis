import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2, FileText, ArrowRight, Lock, MessageSquare } from 'lucide-react';
import { getWhatsAppUrl, playWoodChimeSound } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';

interface ContactQuotationPageProps {
  onBackToHome: () => void;
}

export const ContactQuotationPage: React.FC<ContactQuotationPageProps> = ({ onBackToHome }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('Jaú');
  const [ambientes, setAmbientes] = useState<string[]>(['Cozinha Planejada']);
  const [faseObra, setFaseObra] = useState('Apenas planejando');
  const [mensagem, setMensagem] = useState('');
  const [success, setSuccess] = useState(false);

  const ambienteOptions = [
    'Cozinha Planejada',
    'Dormitório / Quarto',
    'Closet Sob Medida',
    'Sala de Estar / Home Theater',
    'Home Office Executivo',
    'Lavanderia Inteligente',
    'Casa Inteira / Projeto Completo'
  ];

  const handleToggleAmbiente = (amb: string) => {
    playWoodChimeSound();
    if (amb === 'Casa Inteira / Projeto Completo') {
      if (ambientes.includes(amb)) {
        setAmbientes(ambientes.filter(a => a !== amb));
      } else {
        setAmbientes(['Casa Inteira / Projeto Completo']);
      }
      return;
    }

    if (ambientes.includes(amb)) {
      setAmbientes(ambientes.filter(a => a !== amb));
    } else {
      setAmbientes([...ambientes.filter(a => a !== 'Casa Inteira / Projeto Completo'), amb]);
    }
  };

  const handleMaskPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    playWoodChimeSound();
    setSuccess(true);

    const msg = `*SOLICITAÇÃO DE ORÇAMENTO — IMPÉRIO MÓVEIS PLANEJADOS (JAÚ)*
---------------------------------------------
*Nome:* ${nome}
*WhatsApp:* ${telefone}
*E-mail:* ${email}
*Cidade:* ${cidade}
*Ambientes:* ${ambientes.join(', ') || 'A definir'}
*Fase da Obra:* ${faseObra}
*Detalhes/Observações:* ${mensagem || 'Não informado'}
---------------------------------------------
Gostaria de agendar a medição técnica e receber o projeto 3D gratuito!`;

    const encoded = encodeURIComponent(msg);
    setTimeout(() => {
      window.open(`https://wa.me/5514998492834?text=${encoded}`, '_blank');
    }, 600);
  };

  return (
    <div id="contato-pagina" className="w-full bg-[#fef8f4] min-h-screen pt-4 pb-20">
      
      {/* Top Banner / Editorial Header */}
      <section className="relative bg-[#f8f2ef] px-4 sm:px-8 py-12 lg:py-16 overflow-hidden border-b border-[#ddd7cd]">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#c5a059]/15 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 rounded-full bg-[#52371c]/10 blur-2xl pointer-events-none" />
        
        <div className="max-w-[1280px] mx-auto w-full relative z-10">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#81756b] mb-6">
            <button
              onClick={() => {
                playWoodChimeSound();
                onBackToHome();
              }}
              className="hover:text-[#52371c] transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>›</span>
            <span className="text-[#52371c] font-bold">Contato & Orçamento</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded bg-[#c5a059]/15 text-[#775a19] text-xs uppercase tracking-widest font-semibold border border-[#c5a059]/30">
                <span>Marcenaria Fina Sob Medida em Jaú & Região</span>
              </div>
              <h1 className="font-serif-atelier text-3xl sm:text-4xl lg:text-5xl text-[#52371c] font-semibold tracking-tight">
                Solicite seu Orçamento de Móveis Planejados em Jaú
              </h1>
              <p className="text-base text-[#4f453c] max-w-2xl leading-relaxed">
                Transforme seu ambiente com marcenaria sob medida de alto padrão. Nossa equipe faz a medição técnica no local e desenvolve o projeto 3D fotorrealista ideal para seu espaço e investimento.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="lg:col-span-4 flex flex-col gap-3 justify-end">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#fef8f4] shadow-wood-sm border border-[#ddd7cd]">
                <div className="w-10 h-10 rounded-full bg-[#52371c]/10 flex items-center justify-center shrink-0 text-[#52371c]">
                  <CheckCircle2 className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#1d1b19] font-bold">Projeto 3D Sem Custo</span>
                  <span className="text-[11px] text-[#81756b]">Visualização completa antes da produção</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#fef8f4] shadow-wood-sm border border-[#ddd7cd]">
                <div className="w-10 h-10 rounded-full bg-[#c5a059]/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#1d1b19] font-bold">Garantia & Montagem Própria</span>
                  <span className="text-[11px] text-[#81756b]">Equipe interna especializada em Jaú</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Conversion Core: Two Columns */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12 lg:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: High-Conversion Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-2xl shadow-wood-md border border-[#ddd7cd]">
            
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#ddd7cd]">
              <div className="flex flex-col">
                <span className="text-xs text-[#c5a059] uppercase tracking-widest font-bold">Atendimento Personalizado</span>
                <h2 className="font-serif-atelier text-2xl font-bold text-[#1d1b19]">Dados do seu Projeto</h2>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ambiente Seguro</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Nome */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#4f453c] font-semibold uppercase tracking-wider">
                  Nome Completo *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex.: Carolina Silveira"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#fef8f4] text-[#1d1b19] border border-[#ddd7cd] focus:bg-white focus:outline-none focus:border-[#c5a059] transition-colors text-sm shadow-sm"
                />
              </div>

              {/* WhatsApp & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#4f453c] font-semibold uppercase tracking-wider">
                    WhatsApp com DDD *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="(14) 99849-2834"
                    value={telefone}
                    onChange={handleMaskPhone}
                    className="w-full px-4 py-3 rounded-lg bg-[#fef8f4] text-[#1d1b19] border border-[#ddd7cd] focus:bg-white focus:outline-none focus:border-[#c5a059] transition-colors text-sm shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#4f453c] font-semibold uppercase tracking-wider">
                    E-mail *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#fef8f4] text-[#1d1b19] border border-[#ddd7cd] focus:bg-white focus:outline-none focus:border-[#c5a059] transition-colors text-sm shadow-sm"
                  />
                </div>
              </div>

              {/* Cidade */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#4f453c] font-semibold uppercase tracking-wider">
                  Sua Cidade *
                </label>
                <select
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#fef8f4] text-[#1d1b19] border border-[#ddd7cd] focus:bg-white focus:outline-none focus:border-[#c5a059] transition-colors text-sm shadow-sm cursor-pointer"
                >
                  <option value="Jaú">Jaú (Atendimento Prioritário)</option>
                  <option value="Bauru">Bauru</option>
                  <option value="Barra Bonita">Barra Bonita</option>
                  <option value="Dois Córregos">Dois Córregos</option>
                  <option value="Itaju">Itaju</option>
                  <option value="Bocaina">Bocaina</option>
                  <option value="Araraquara">Araraquara</option>
                  <option value="Ribeirão Preto">Ribeirão Preto</option>
                  <option value="Outra">Outra cidade da região</option>
                </select>
              </div>

              {/* Ambientes de Interesse */}
              <div className="flex flex-col gap-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#4f453c] font-semibold uppercase tracking-wider">
                    Ambiente(s) de Interesse
                  </label>
                  <span className="text-[11px] text-[#81756b]">Selecione quantos desejar</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ambienteOptions.map((amb) => {
                    const isChecked = ambientes.includes(amb);
                    const isFullHouse = amb === 'Casa Inteira / Projeto Completo';
                    return (
                      <label
                        key={amb}
                        onClick={() => handleToggleAmbiente(amb)}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-all shadow-sm ${
                          isFullHouse ? 'col-span-2 sm:col-span-3 bg-[#ede7e3]' : ''
                        } ${
                          isChecked
                            ? 'bg-[#52371c] text-white border-[#52371c]'
                            : 'bg-[#fef8f4] text-[#1d1b19] border-[#ddd7cd] hover:border-[#c5a059]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="accent-[#c5a059] w-4 h-4"
                        />
                        <span>{amb}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Fase Atual da Obra */}
              <div className="flex flex-col gap-2 pt-2">
                <label className="text-xs text-[#4f453c] font-semibold uppercase tracking-wider">
                  Fase Atual da Obra ou Reforma
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    'Apenas planejando',
                    'Em reforma ativa',
                    'Pronto p/ medição'
                  ].map((fase) => (
                    <label
                      key={fase}
                      onClick={() => setFaseObra(fase)}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-all shadow-sm ${
                        faseObra === fase
                          ? 'bg-[#c5a059] text-white border-[#c5a059]'
                          : 'bg-[#fef8f4] text-[#1d1b19] border-[#ddd7cd]'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={faseObra === fase}
                        onChange={() => {}}
                        className="accent-white"
                      />
                      <span>{fase}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mensagem / Detalhes */}
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xs text-[#4f453c] font-semibold uppercase tracking-wider">
                  Detalhes do Projeto ou Ideias de Acabamento (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex.: Gostaria de cozinha com ilha central e torre quente, acabamento em Freijó claro com puxadores cava..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#fef8f4] text-[#1d1b19] border border-[#ddd7cd] focus:bg-white focus:outline-none focus:border-[#c5a059] transition-colors text-xs resize-none"
                />
              </div>

              {/* Botão Principal de Envio */}
              <button
                type="submit"
                className="w-full mt-2 py-4 px-6 rounded-xl bg-[#c5a059] hover:bg-[#b38f46] text-white shadow-wood-md hover:shadow-wood-lg transition-all flex items-center justify-center gap-3 font-semibold uppercase tracking-wider text-xs cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Enviar Solicitação de Orçamento Gratuito</span>
              </button>

              {success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mensagem preparada! Abrindo conexão com o projetista no WhatsApp...</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-center text-[#81756b] text-xs pt-1">
                <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                <span>Seus dados são protegidos. Retornamos contato em até 24 horas úteis.</span>
              </div>

            </form>
          </div>

          {/* Right Column: Direct Channels & Showroom Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Card: Atendimento Rápido via WhatsApp */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-wood-md border border-[#ddd7cd] flex flex-col gap-5 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-sm">
                  <MessageSquare className="w-6 h-6 fill-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#25d366] uppercase font-bold tracking-widest">Canal Expresso</span>
                  <h3 className="font-serif-atelier text-xl font-bold text-[#1d1b19]">Atendimento via WhatsApp</h3>
                </div>
              </div>

              <p className="text-xs text-[#4f453c] leading-relaxed">
                Prefere atendimento imediato? Fale diretamente com o projetista responsável para esclarecer dúvidas de plantas, materiais e agendar visitas técnicas em Jaú.
              </p>

              <div className="flex items-baseline justify-between p-3.5 rounded-xl bg-[#f8f2ef] border border-[#ddd7cd]">
                <span className="text-xs text-[#81756b] uppercase font-semibold">Contato Direto</span>
                <span className="text-base text-[#52371c] font-bold tracking-tight">(14) 99849-2834</span>
              </div>

              <a
                href={getWhatsAppUrl('Olá, Império Móveis Planejados! Gostaria de tirar uma dúvida sobre projeto de móveis sob medida em Jaú.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playWoodChimeSound}
                className="w-full py-3.5 px-6 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-white shadow-wood-sm transition-all flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Chamar no WhatsApp Agora</span>
              </a>
            </div>

            {/* Card: Venha nos Conhecer */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-wood-md border border-[#ddd7cd] flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#52371c]/10 text-[#52371c] flex items-center justify-center shadow-sm">
                  <MapPin className="w-6 h-6 text-[#c5a059]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#c5a059] uppercase font-bold tracking-widest">Sede Própria em Jaú</span>
                  <h3 className="font-serif-atelier text-xl font-bold text-[#1d1b19]">Venha nos Conhecer</h3>
                </div>
              </div>

              {/* Endereço */}
              <div className="p-3.5 rounded-xl bg-[#f8f2ef] border border-[#ddd7cd] space-y-1 text-xs">
                <span className="text-[#81756b] uppercase font-semibold text-[11px] block">Endereço Completo</span>
                <p className="text-[#1d1b19] font-bold">R. Doná Djanira Werneck de Almeida e Silva, 280</p>
                <p className="text-[#4f453c]">Jardim Itamarati — Jaú / SP — CEP: 17209-450</p>
              </div>

              {/* Fixo & Horários */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#f8f2ef] border border-[#ddd7cd]">
                  <span className="text-[10px] text-[#81756b] uppercase font-semibold block">Telefone / WhatsApp</span>
                  <p className="text-[#52371c] font-bold mt-0.5">(14) 99849-2834</p>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f2ef] border border-[#ddd7cd]">
                  <span className="text-[10px] text-[#81756b] uppercase font-semibold block">Atendimento</span>
                  <p className="text-[#1d1b19] font-bold mt-0.5">Showroom & Obra</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f8f2ef] border border-[#ddd7cd] space-y-1.5 text-xs text-[#4f453c]">
                <div className="flex items-center gap-1.5 font-bold text-[#1d1b19]">
                  <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Horário de Funcionamento</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Segunda a Sexta:</span>
                  <span className="font-semibold text-[#1d1b19]">08:00 às 18:00</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Sábado:</span>
                  <span className="font-semibold text-[#1d1b19]">08:00 às 12:00</span>
                </div>
              </div>

              <a
                href="https://share.google/aSjoGjafHAMz8qsOe"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-xl bg-[#52371c] hover:bg-[#32302e] text-white shadow-wood-sm transition-all flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider"
              >
                <MapPin className="w-4 h-4 text-[#c5a059]" />
                <span>Abrir no Google Maps (Traçar Rota)</span>
              </a>
            </div>

            {/* Card: Área de Cobertura */}
            <div className="bg-[#ede7e3] p-6 rounded-2xl border border-[#ddd7cd] space-y-2.5">
              <h4 className="font-serif-atelier text-base font-bold text-[#1d1b19]">Área de Atendimento Regional</h4>
              <p className="text-xs text-[#4f453c] leading-relaxed">
                Medição técnica e montagem sem custos adicionais de deslocamento em Jaú e cidades em raio de até 60 km:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Jaú (Sede)', 'Bauru', 'Barra Bonita', 'Bocaina', 'Dois Córregos', 'Itaju', 'Mineiros do Tietê', 'Araraquara'].map((c) => (
                  <span key={c} className="px-2.5 py-1 rounded bg-white text-xs font-semibold text-[#1d1b19] border border-[#ddd7cd]">
                    {c}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* How it works after contact: 3 steps from Stitch */}
      <section className="w-full bg-[#f3ede9] py-16 border-t border-[#ddd7cd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col gap-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs text-[#c5a059] uppercase font-bold tracking-widest">Transparência & Metodologia</span>
            <h2 className="font-serif-atelier text-2xl sm:text-3xl font-bold text-[#52371c]">
              Como funciona após enviar o contato?
            </h2>
            <p className="text-xs sm:text-sm text-[#4f453c]">
              Do primeiro contato à entrega das chaves dos seus novos móveis, garantimos pontualidade, atendimento consultivo e acompanhamento em cada detalhe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-[#ddd7cd] shadow-wood-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-[#52371c] text-white flex items-center justify-center font-bold font-serif text-lg">01</span>
                <Phone className="w-5 h-5 text-[#c5a059]" />
              </div>
              <h3 className="font-serif-atelier text-base font-bold text-[#1d1b19]">Conversa Inicial Rápida</h3>
              <p className="text-xs text-[#4f453c] leading-relaxed">
                Nossa equipe retorna pelo WhatsApp ou ligação para entender sua planta, suas preferências de cores, necessidades práticas e a expectativa de prazo da obra.
              </p>
              <div className="text-[11px] text-[#25d366] font-semibold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Retorno em até 24h úteis
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-[#ddd7cd] shadow-wood-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-[#c5a059] text-white flex items-center justify-center font-bold font-serif text-lg">02</span>
                <MapPin className="w-5 h-5 text-[#c5a059]" />
              </div>
              <h3 className="font-serif-atelier text-base font-bold text-[#1d1b19]">Medição Técnica no Imóvel</h3>
              <p className="text-xs text-[#4f453c] leading-relaxed">
                Agendamos visita com projetista no seu endereço em Jaú ou região. Fazemos conferência milimétrica de paredes, pontos elétricos, encanamento e prumo.
              </p>
              <div className="text-[11px] text-[#25d366] font-semibold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sem cobrança de visita em Jaú
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-[#ddd7cd] shadow-wood-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-[#006229] text-white flex items-center justify-center font-bold font-serif text-lg">03</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-serif-atelier text-base font-bold text-[#1d1b19]">Apresentação 3D & Proposta</h3>
              <p className="text-xs text-[#4f453c] leading-relaxed">
                Você visualiza o projeto em 3D realista, podendo ajustar divisórias, ferragens e acabamentos, com planilha de orçamento detalhada e condições facilitadas.
              </p>
              <div className="text-[11px] text-[#25d366] font-semibold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Projeto 3D 100% gratuito
              </div>
            </div>

          </div>

          {/* Micro-CTA PDF */}
          <div className="p-6 rounded-2xl bg-white border border-[#ddd7cd] shadow-wood-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="font-serif-atelier text-base font-bold text-[#1d1b19]">
                Já possui a planta baixa ou projeto de arquiteto?
              </h4>
              <p className="text-xs text-[#4f453c]">
                Envie seus arquivos em PDF para receber uma cotação preliminar mais rápida com nossa equipe.
              </p>
            </div>
            <a
              href={getWhatsAppUrl('Olá! Gostaria de enviar a planta baixa/PDF do meu projeto para cotação de marcenaria.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playWoodChimeSound}
              className="px-6 py-3 rounded-xl bg-[#52371c] hover:bg-[#c5a059] text-white text-xs font-semibold transition-all shrink-0 uppercase tracking-wider"
            >
              Enviar Planta pelo WhatsApp
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};
