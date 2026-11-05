import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { playWoodChimeSound, getWhatsAppUrl } from '../utils/helpers';

interface VisitBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisitBookingModal: React.FC<VisitBookingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Jaú');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [visitType, setVisitType] = useState<'oficina' | 'residencia'>('oficina');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playWoodChimeSound();

    const typeText = visitType === 'oficina'
      ? 'Visita Guiada ao Atelier & Oficina em Jaú'
      : `Medição Técnica na Minha Residência em ${city}`;

    const message = `*AGENDAMENTO DE VISITA TÉCNICA — IMPÉRIO MÓVEIS PLANEJADOS*
---------------------------------------------
*Nome:* ${name}
*Telefone:* ${phone}
*Cidade:* ${city}
*Tipo de Atendimento:* ${typeText}
*Data Pretendida:* ${date || 'A combinar'} às ${time}
*Observações/Projeto:* ${notes || 'Sem observações'}
---------------------------------------------
Gostaria de confirmar a disponibilidade da equipe técnica!`;

    window.open(getWhatsAppUrl(message), '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#fef8f4] border border-[#ddd7cd] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-wood-lg relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => {
            playWoodChimeSound();
            onClose();
          }}
          className="absolute top-4 right-4 text-[#81756b] hover:text-[#1d1b19] p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efece6] border border-[#ddd7cd] text-xs font-semibold uppercase tracking-wider text-[#6c4e31]">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Atendimento VIP</span>
            </div>
            <h2 className="font-serif-atelier text-2xl font-bold text-[#1d1b19]">
              Agendar Visita Técnica em Jaú
            </h2>
            <p className="text-xs text-[#4f453c]">
              Escolha se prefere visitar nosso ateliê com mostruários de madeiras nobres em Jaú ou receber nosso especialista em sua obra.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Visit Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playWoodChimeSound();
                  setVisitType('oficina');
                }}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  visitType === 'oficina'
                    ? 'bg-[#6c4e31] text-white border-[#6c4e31]'
                    : 'bg-white text-[#4f453c] border-[#ddd7cd]'
                }`}
              >
                🏭 Visita à Oficina em Jaú
              </button>

              <button
                type="button"
                onClick={() => {
                  playWoodChimeSound();
                  setVisitType('residencia');
                }}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  visitType === 'residencia'
                    ? 'bg-[#6c4e31] text-white border-[#6c4e31]'
                    : 'bg-white text-[#4f453c] border-[#ddd7cd]'
                }`}
              >
                📐 Medição em Minha Obra
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] uppercase font-semibold text-[#6c4e31] block mb-1">Seu Nome Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Eng. Marcelo Souza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#ddd7cd] rounded-lg px-3 py-2 text-xs text-[#242220] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] uppercase font-semibold text-[#6c4e31] block mb-1">WhatsApp / Telefone:</label>
                  <input
                    type="tel"
                    required
                    placeholder="(14) 99999-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-[#ddd7cd] rounded-lg px-3 py-2 text-xs text-[#242220] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-semibold text-[#6c4e31] block mb-1">Cidade da Obra:</label>
                  <input
                    type="text"
                    required
                    placeholder="Jaú, SP"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-[#ddd7cd] rounded-lg px-3 py-2 text-xs text-[#242220] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] uppercase font-semibold text-[#6c4e31] block mb-1">Data Pretendida:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-[#ddd7cd] rounded-lg px-3 py-2 text-xs text-[#242220] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-semibold text-[#6c4e31] block mb-1">Horário:</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-[#ddd7cd] rounded-lg px-3 py-2 text-xs text-[#242220] focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="09:00">09:00 Manhã</option>
                    <option value="11:00">11:00 Manhã</option>
                    <option value="14:00">14:00 Tarde</option>
                    <option value="16:00">16:00 Tarde</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase font-semibold text-[#6c4e31] block mb-1">Detalhes do Projeto / Ambientes:</label>
                <textarea
                  rows={2}
                  placeholder="ex: Marcenaria de cozinha gourmet e closet master para casa nova..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-[#ddd7cd] rounded-lg p-2.5 text-xs text-[#242220] focus:outline-none focus:border-[#c5a059] resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-semibold py-3.5 rounded-xl shadow-wood-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Confirmar Agendamento no WhatsApp
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
