import React, { useState } from 'react';
import { ProjectItem } from '../types';
import { X, MapPin, Calendar, Award, Cpu, Lightbulb, CheckCircle2, MessageSquare } from 'lucide-react';
import { playWoodChimeSound, getWhatsAppUrl } from '../utils/helpers';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const allImages = [project.heroImage, ...(project.detailImages || [])];

  return (
    <div className="fixed inset-[#000] bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#fef8f4] border border-[#ddd7cd] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-wood-lg relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => {
            playWoodChimeSound();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 bg-[#242220] text-white p-2.5 rounded-full hover:bg-[#6c4e31] transition-colors shadow-wood-md"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Gallery Header */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-[#242220] overflow-hidden">
          <img
            src={allImages[activeImageIndex]}
            alt={project.title}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1d1b19] via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <span className="bg-[#c5a059] text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded">
              {project.category.toUpperCase()} • {project.location}
            </span>
            <h2 className="font-serif-atelier text-2xl sm:text-3xl font-semibold">
              {project.title}
            </h2>
            <p className="text-xs text-white/80 font-mono">{project.subtitle}</p>
          </div>
        </div>

        {/* Thumbnail Selector */}
        {allImages.length > 1 && (
          <div className="flex items-center gap-2 p-4 bg-[#efece6] border-b border-[#ddd7cd] overflow-x-auto">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playWoodChimeSound();
                  setActiveImageIndex(idx);
                }}
                className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  activeImageIndex === idx ? 'border-[#c5a059] scale-105 shadow-wood-sm' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Architectural Notes & Specs */}
          <div className="space-y-4">
            <h3 className="font-serif-atelier text-xl font-bold text-[#1d1b19]">
              Memorial Descritivo do Projeto
            </h3>
            <p className="text-[#4f453c] text-sm sm:text-base leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-[#efece6] p-4 rounded-xl border border-[#ddd7cd] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[#6c4e31] tracking-wider block flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#c5a059]" />
                Madeira / Matéria-Prima:
              </span>
              <p className="text-xs font-semibold text-[#1d1b19]">{project.woodSpecies}</p>
            </div>

            <div className="bg-[#efece6] p-4 rounded-xl border border-[#ddd7cd] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[#6c4e31] tracking-wider block flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-[#c5a059]" />
                Ferragens & Sistemas:
              </span>
              <p className="text-xs font-semibold text-[#1d1b19]">{project.hardwareBrand}</p>
            </div>

            <div className="bg-[#efece6] p-4 rounded-xl border border-[#ddd7cd] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[#6c4e31] tracking-wider block flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-[#c5a059]" />
                Projeto Luminotécnico:
              </span>
              <p className="text-xs font-semibold text-[#1d1b19]">{project.lightingSpec}</p>
            </div>

          </div>

          {/* Highlights List */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.08em] font-semibold text-[#242220]">
              Destaques Construtivos & Detalhes Técnicos:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {project.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#4f453c]">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Architectural Partner Credit & WhatsApp Action */}
          <div className="pt-6 border-t border-[#ddd7cd] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#efece6]/50 p-4 rounded-xl border border-[#ddd7cd]">
            <div className="text-xs text-[#4f453c]">
              {project.architectName && (
                <p><strong>Autoria Arquitetônica:</strong> {project.architectName}</p>
              )}
              <p className="text-[11px] text-[#81756b]">Execução 100% Marcenaria Império Móveis Planejados (Jaú, SP)</p>
            </div>

            <a
              href={getWhatsAppUrl(`Olá, Império Móveis Planejados! Gostaria de um orçamento para um projeto parecido com "${project.title}" em Jaú.`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playWoodChimeSound}
              className="w-full sm:w-auto bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-semibold px-6 py-3 rounded-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              Solicitar Projeto Semelhante
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
