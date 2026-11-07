import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';

interface VisitBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisitBookingModal: React.FC<VisitBookingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Jaú');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [visitType, setVisitType] = useState<'oficina' | 'residencia'>('residencia');
  const [notes, setNotes] = useState('');
  const fecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    fecharRef.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tipoTexto =
      visitType === 'oficina'
        ? 'Visita à oficina em Jaú'
        : `Medição no imóvel em ${city}`;

    const message = `Oi! Vi o site da Império e quero agendar uma visita.
Nome: ${name}
Telefone: ${phone}
Atendimento: ${tipoTexto}
Data sugerida: ${date || 'A combinar'} às ${time}
Observações: ${notes || 'Sem observações'}`;

    window.open(getWhatsAppUrl(message), '_blank');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Agendar visita técnica"
      onClick={onClose}
      className="fixed inset-0 bg-preto/85 z-50 flex items-center justify-center p-16 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-papel text-grafite border border-grafite max-w-lg w-full p-24 sm:p-32 relative flex flex-col gap-24"
      >
        <div className="flex items-start justify-between gap-16 border-b border-grafite/20 pb-16">
          <div className="flex flex-col gap-4">
            <h2 className="tipo-h2 text-grafite">Agendar visita em Jaú</h2>
            <p className="tipo-cota text-grafite-suave">
              Escolha entre receber nossa medição na obra ou visitar a oficina.
            </p>
          </div>
          <button
            ref={fecharRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-8 text-grafite hover:text-preto cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-24">
          <div className="grid grid-cols-2 gap-12">
            <button
              type="button"
              onClick={() => setVisitType('residencia')}
              className={`p-12 border rounded-curto tipo-cota cursor-pointer transition-colors ${
                visitType === 'residencia'
                  ? 'bg-preto text-papel border-preto'
                  : 'bg-papel-2 text-grafite border-grafite/30'
              }`}
            >
              Medição na obra
            </button>

            <button
              type="button"
              onClick={() => setVisitType('oficina')}
              className={`p-12 border rounded-curto tipo-cota cursor-pointer transition-colors ${
                visitType === 'oficina'
                  ? 'bg-preto text-papel border-preto'
                  : 'bg-papel-2 text-grafite border-grafite/30'
              }`}
            >
              Visita à oficina
            </button>
          </div>

          <div className="flex flex-col gap-8">
            <label htmlFor="modal-nome" className="tipo-cota text-grafite">
              Seu nome *
            </label>
            <input
              id="modal-nome"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-8 bg-transparent border-b-[1.5px] border-grafite rounded-none focus:outline-none focus:border-preto tipo-corpo"
            />
          </div>

          <div className="grid grid-cols-2 gap-16">
            <div className="flex flex-col gap-8">
              <label htmlFor="modal-fone" className="tipo-cota text-grafite">
                WhatsApp *
              </label>
              <input
                id="modal-fone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full py-8 bg-transparent border-b-[1.5px] border-grafite rounded-none focus:outline-none focus:border-preto tipo-corpo"
              />
            </div>

            <div className="flex flex-col gap-8">
              <label htmlFor="modal-cidade" className="tipo-cota text-grafite">
                Cidade *
              </label>
              <input
                id="modal-cidade"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full py-8 bg-transparent border-b-[1.5px] border-grafite rounded-none focus:outline-none focus:border-preto tipo-corpo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16">
            <div className="flex flex-col gap-8">
              <label htmlFor="modal-data" className="tipo-cota text-grafite">
                Data sugerida
              </label>
              <input
                id="modal-data"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-8 bg-transparent border-b-[1.5px] border-grafite rounded-none focus:outline-none focus:border-preto tipo-cota"
              />
            </div>

            <div className="flex flex-col gap-8">
              <label htmlFor="modal-hora" className="tipo-cota text-grafite">
                Período
              </label>
              <select
                id="modal-hora"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full py-8 bg-papel-2 px-8 border-b-[1.5px] border-grafite rounded-curto focus:outline-none focus:border-preto tipo-cota"
              >
                <option value="09:00">09:00 (Manhã)</option>
                <option value="11:00">11:00 (Manhã)</option>
                <option value="14:00">14:00 (Tarde)</option>
                <option value="16:00">16:00 (Tarde)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <label htmlFor="modal-notas" className="tipo-cota text-grafite">
              Ambiente ou dúvida (opcional)
            </label>
            <textarea
              id="modal-notas"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full py-8 bg-transparent border-b-[1.5px] border-grafite rounded-none focus:outline-none focus:border-preto tipo-cota resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full h-[52px] rounded-curto bg-dourado text-preto hover:bg-preto hover:text-dourado border border-dourado transition-colors tipo-cota font-semibold cursor-pointer"
          >
            Chamar no WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
};
