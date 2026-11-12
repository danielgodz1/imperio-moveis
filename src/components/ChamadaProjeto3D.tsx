import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Foto } from './Foto';

interface ChamadaProjeto3DProps {
  onAbrir: () => void;
}

const PASSOS = [
  ['Escolha o ambiente', 'Cozinha, quarto, closet, banheiro ou home office.'],
  ['Monte do seu jeito', 'Medidas, móveis, cores, puxadores e LED.'],
  ['Baixe e envie', 'A imagem do projeto vai para a gente orçar no WhatsApp.'],
] as const;

/**
 * Convite para o configurador na página inicial. Só imagem e texto: o 3D mora em /projetar
 * e só carrega quando o cliente decide abrir, para a página inicial continuar leve.
 */
export const ChamadaProjeto3D: React.FC<ChamadaProjeto3DProps> = ({ onAbrir }) => (
  <section id="quarto-3d" data-tema="noite" className="w-full py-96 md:py-144 bg-preto text-papel border-b border-papel/15">
    <div className="max-w-[1280px] mx-auto px-16 sm:px-32 grid grid-cols-1 lg:grid-cols-12 gap-48 items-center">
      <div className="lg:col-span-5 flex flex-col items-start gap-24">
        <p className="tipo-cota text-dourado">Grátis, direto no navegador</p>
        <h2 className="tipo-display text-papel">Projete seu planejado em 3D.</h2>
        <p className="tipo-corpo text-papel/80">
          Monte o seu ambiente antes de falar com a gente. Você vê como fica, baixa a imagem e manda para a nossa equipe orçar.
        </p>
        <ol className="flex flex-col gap-16 w-full">
          {PASSOS.map(([titulo, texto], i) => (
            <li key={titulo} className="flex gap-16 pb-16 border-b border-papel/15">
              <span className="tipo-cota text-dourado w-24 shrink-0">0{i + 1}</span>
              <span className="flex flex-col gap-4">
                <span className="tipo-cota text-papel font-semibold">{titulo}</span>
                <span className="tipo-cota text-papel/70">{texto}</span>
              </span>
            </li>
          ))}
        </ol>
        <a
          href="/projetar"
          onClick={(e) => {
            e.preventDefault();
            onAbrir();
          }}
          className="group inline-flex items-center gap-8 px-32 h-[60px] rounded-curto bg-dourado text-preto font-semibold text-[17px] hover:bg-papel transition-colors shadow-[0_0_0_6px_rgba(201,160,78,0.18)]"
        >
          Criar meu projeto 3D
          <ArrowUpRight className="w-[20px] h-[20px] transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" strokeWidth={2} />
        </a>
      </div>

      <a
        href="/projetar"
        onClick={(e) => {
          e.preventDefault();
          onAbrir();
        }}
        aria-label="Abrir o projeto 3D online"
        className="lg:col-span-7 relative block group overflow-hidden border border-papel/15"
      >
        <Foto
          srcBase="/projetar/cozinha-render"
          alt="Projeto 3D de cozinha planejada com ilha verde, tampo de pedra clara, armários brancos e fita de LED"
          proporcao="16 / 9"
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="w-full transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <span className="absolute left-16 bottom-16 px-16 py-8 bg-preto/80 tipo-cota text-papel">Exemplo de projeto 3D</span>
      </a>
    </div>
  </section>
);
