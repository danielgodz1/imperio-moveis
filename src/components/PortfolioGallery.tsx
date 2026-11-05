import React, { useState, useEffect, useRef } from 'react';
import { PORTFOLIO_PROJECTS } from '../data/portfolioData';
import { ProjectItem } from '../types';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ArrowRight, Eye, Sparkles } from 'lucide-react';
import { playWoodChimeSound } from '../utils/helpers';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PortfolioGalleryProps {
  onNavigateContact?: () => void;
}

interface AmbienteCardData {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  projectRef: ProjectItem;
}

// Subcomponent for each Project Card with 3D Tilt interaction
interface ProjectCardProps {
  card: AmbienteCardData;
  onInspect: (project: ProjectItem) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ card, onInspect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const floatingBadgeRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    if (prefersReduced || isMobile) return;

    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const normX = x / (rect.width / 2); // -1 to 1
    const normY = y / (rect.height / 2); // -1 to 1

    // 1. Subtle 3D Card Tilt with GSAP
    gsap.to(el, {
      rotateY: normX * 8, // max 8 deg tilt on Y axis
      rotateX: -normY * 8, // max 8 deg tilt on X axis
      scale: 1.02,
      transformPerspective: 1100,
      transformOrigin: 'center center',
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    // 2. Parallax depth on the floating tag badge
    if (floatingBadgeRef.current) {
      gsap.to(floatingBadgeRef.current, {
        x: normX * 6,
        y: normY * 6,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // 3. Dynamic specular glare reflection shifting with cursor angle
    if (glareRef.current) {
      const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
      const opacity = Math.min(0.22, Math.hypot(normX, normY) * 0.18);
      gsap.to(glareRef.current, {
        opacity,
        background: `linear-gradient(${angle}deg, rgba(255,255,255,0.35) 0%, rgba(197,160,89,0.18) 40%, rgba(255,255,255,0) 80%)`,
        duration: 0.25,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    }
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;

    // Smooth elastic-like return to neutral plane
    gsap.to(el, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.65,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    if (floatingBadgeRef.current) {
      gsap.to(floatingBadgeRef.current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    if (glareRef.current) {
      gsap.to(glareRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
      className="project-card-item flex flex-col rounded-2xl overflow-hidden bg-[#f3ede9] shadow-wood-sm hover:shadow-[0_20px_40px_rgba(36,34,32,0.14)] border border-[#ddd7cd] transition-shadow duration-300 group will-change-transform cursor-pointer relative"
    >
      {/* Dynamic Specular Glare Overlay */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none z-30 opacity-0 rounded-2xl transition-opacity will-change-transform"
        aria-hidden="true"
      />

      {/* Image Frame with Masked Clip-Path Reveal */}
      <div className="project-img-mask relative h-64 overflow-hidden bg-[#e7e1de] will-change-transform">
        <img
          src={card.image}
          alt={card.title}
          className="project-img-inner w-full h-full object-cover will-change-transform group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          width={600}
          height={400}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-60" />

        {/* Floating 3D Badge */}
        <div
          ref={floatingBadgeRef}
          className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#fef8f4]/90 backdrop-blur-md text-xs text-[#1d1b19] font-bold shadow-sm border border-white/25 will-change-transform"
        >
          {card.tag}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            playWoodChimeSound();
            onInspect(card.projectRef);
          }}
          className="absolute bottom-3 right-3 bg-[#c5a059] hover:bg-[#b38f46] text-white p-2.5 rounded-full shadow-md transition-transform group-hover:scale-110 cursor-pointer z-10"
          title="Inspecionar Detalhes do Projeto"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Text Content */}
      <div className="p-6 flex flex-col flex-1 justify-between space-y-4 relative z-10 bg-[#f3ede9]">
        <div>
          <div className="overflow-hidden mb-2">
            <h3 className="project-title-line font-serif-atelier text-xl text-[#1d1b19] font-semibold group-hover:text-[#52371c] transition-colors">
              {card.title}
            </h3>
          </div>
          <p className="text-xs text-[#4f453c] leading-relaxed">
            {card.description}
          </p>
        </div>

        <div className="pt-3 border-t border-[#ddd7cd]/70 flex items-center justify-between">
          <button
            onClick={() => {
              playWoodChimeSound();
              onInspect(card.projectRef);
            }}
            className="inline-flex items-center gap-1.5 text-[#775a19] hover:text-[#52371c] text-xs font-semibold uppercase tracking-wider cursor-pointer group/link"
          >
            <span>Ver detalhes e fotos</span>
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </button>

          <span className="text-[10px] text-[#81756b] font-mono">Jaú / SP</span>
        </div>
      </div>
    </div>
  );
};

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ onNavigateContact }) => {
  const [inspectProject, setInspectProject] = useState<ProjectItem | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // 6 Core Ambientes matching Stitch design
  const ambientesCards: AmbienteCardData[] = [
    {
      id: 'cozinhas',
      tag: 'Cozinhas',
      title: 'Cozinhas Planejadas',
      description: 'Aproveitamento inteligente com ilha, torres quentes, cristaleiras iluminadas e gavetões com amortecimento suave de fechamento.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxyDSciqtstMeiYiczlrlQJP84h1m9APtvv0UvaI_z4YAnF-7SUjTDQL5kba9U_pWE5DPVhKOipCbGU-pGRMnRgSd3O-XBu6nf7kIHOq5N-bZQ6dd6qVoJefSo_HPnvNKyf52C_c6x5oos8M3ikEGg65b8bqcS5fuZEJLSkclhnjE00LX1tCQlUq5TfkXxK74XG3lXJiQk8-fdnpAzpSP0l0moPI9OTU5qBTxPia0',
      projectRef: PORTFOLIO_PROJECTS[0]
    },
    {
      id: 'dormitorios',
      tag: 'Dormitórios',
      title: 'Quartos & Suítes',
      description: 'Conforto sob medida, cabeceiras estofadas, painéis ripados contínuos e armários silenciosos que acolhem suas noites de descanso.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkGVIFaBEla3Jk2IalPuLBGbAx9ZVQsGvUU0OH4ICRN_xYlaZK8y9gtXVAJ7NEWsfeb2NqfZW-HrFRMUNhTWc3tAbS02pctU-OUe78QOU1NNTPsFae1jEEDkayJUiNykCKe4Ezd62-zjIKgKhp-1HvfYI96WSdFrLq4U3iX7qXpUL7Vy8FCcuQMMrzhAZcNYooJmqQ7hzB42nG7Y15ndAaTzjI3gnj_z0plSUTHNw',
      projectRef: PORTFOLIO_PROJECTS[4] || PORTFOLIO_PROJECTS[0]
    },
    {
      id: 'closets',
      tag: 'Closets',
      title: 'Closets Planejados',
      description: 'Divisões personalizadas milimetricamente, gavetas para acessórios com divisores aveludados, iluminação LED e portas espelhadas.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEKBjcTyq9gRmCR_rr0xT-FNvqCH6b61LddFUjXtclLzU_QG7cP9txet0WLTIR6qJOqNiM7ncubqL_8tFLW2AkWOejdxuUQ9ryIX2dNmuYT8-KW-3ttgjVfS9BtAbzN8x1qWgDxohqtsrZhcaUgXR_uzjaz0mu1sjkJIc9Y4yM3e8vOywlVHXP9REliTwGXDGOE6Xsy4f6hjhZmVghHAZTRjMvOTBeI6EH05HaLF0',
      projectRef: PORTFOLIO_PROJECTS[1]
    },
    {
      id: 'salas',
      tag: 'Estar & TV',
      title: 'Salas de Estar & Home Theater',
      description: 'Painéis para TV com fiação 100% oculta, nichos integrados, marcenaria de design e integração fluida com áreas sociais e varanda gourmet.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbEjX4kR8kVSfzTJFsLBSTDHKiJwNfQXhjODJJevmyh9dgZ3mi8xq2Ym5frcD4Pz21W8AMLxh0iZj_a__e1Xf0FbRgu3SEPZ9ecgc9hRnG0n8t6hVALgv8Zk4zoMS3BErfLBCvIFbVjZQN9_LUoayNnLqkaQURx5lOPP94xXFExvTHtqkxzjkHBEljkBTNnm2uOKKfD6Y_0LmJHyyGNRVv3G61dfaCYBjTFpsJvuI',
      projectRef: PORTFOLIO_PROJECTS[2]
    },
    {
      id: 'escritorio',
      tag: 'Escritório',
      title: 'Home Office Executivo',
      description: 'Espaços produtivos, ergonômicos e perfeitamente integrados à estética da sua casa para trabalhar com conforto, foco e sofisticação.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwKmXTwY-YzO4pu1VRqilLleD1JLmwSoJJXjmnvz3EulBNv8GTWgIxF-mOQFJh3hmpq3rF_LsgKvTDk3eTFrR3AtxmXNdRlqDb_3xKTtBrH32nYc6SFMX5mn2UIvHEOgnZPxR01JrSyrCBZgsIUVCXEp367iYlD8ws1JXM2L2N1r_uXkbTDpzJypt14A7U-8dYl2Cg23RYZotk0BXt9R4KMsr_nFRwMetw_2pcQtQ',
      projectRef: PORTFOLIO_PROJECTS[3]
    },
    {
      id: 'lavanderias',
      tag: 'Área de Serviço',
      title: 'Lavanderias & Áreas de Serviço',
      description: 'Organização impecável, armários funcionais com tulhas embutidas e materiais resistentes à umidade para facilitar o dia a dia.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbrqoYy3hU_EZzjzyrO3kGDDEZ2k-Irpge8FOKgeKqSNXPeLvWuV8yB4sojLN1EYJ3znOdZYD9EN3GvUqbKnBxZlmcuhre1TXUz6-LBjbBEYiZQS-n3vFR2wWhV4P5tJxgRNNp6LiS_Kr1QryIgL-68EI2hcm2VLxLFXqsJQf-1b1pQMeRjcT_ELUXzL61CeLjbA80QXDRSmFjYk6pXxR-QjSbI5x0UkxdBerJf_w',
      projectRef: PORTFOLIO_PROJECTS[5] || PORTFOLIO_PROJECTS[0]
    }
  ];

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // 1. Reveal Section Header
      gsap.fromTo(
        '.portfolio-header-reveal',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
        }
      );

      // 2. Animate each card with Clip-Path entrance and Image Counter-Parallax
      const cards = document.querySelectorAll('.project-card-item');
      cards.forEach((card) => {
        const mask = card.querySelector('.project-img-mask');
        const img = card.querySelector('.project-img-inner');
        const titleLine = card.querySelector('.project-title-line');

        if (prefersReduced) {
          gsap.set([mask, img, titleLine], { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, y: 0, scale: 1 });
          return;
        }

        // Clip-path reveal (inset(0% 0% 100% 0%) -> inset(0% 0% 0% 0%))
        if (mask) {
          gsap.fromTo(
            mask,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.1,
              ease: 'power3.inOut',
              scrollTrigger: {
                trigger: card,
                start: 'top 95%',
                toggleActions: 'play none none none',
              },
            }
          );
        }

        // Counter-parallax on image inside
        if (img && !isMobile) {
          gsap.fromTo(
            img,
            { scale: 1.18, yPercent: -10 },
            {
              scale: 1.02,
              yPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            }
          );
        }

        // Title line reveal
        if (titleLine) {
          gsap.fromTo(
            titleLine,
            { y: '100%', opacity: 0 },
            {
              y: '0%',
              opacity: 1,
              duration: 0.7,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 80%',
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="ambientes" className="w-full py-16 lg:py-24 bg-[#fef8f4] border-b border-[#ddd7cd]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col space-y-12">
        
        {/* Section Header */}
        <div className="portfolio-header-reveal flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#775a19] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Portfólio Exclusivo</span>
              <span className="text-[#d3c4b9]">•</span>
              <span>Móveis Sob Medida</span>
            </div>
            <h2 className="font-serif-atelier text-3xl sm:text-4xl text-[#1d1b19] font-semibold">
              Ambientes Projetados para a sua Rotina em Jaú
            </h2>
            <p className="text-sm sm:text-base text-[#4f453c] leading-relaxed">
              Explore nossas criações sob medida. Passe o cursor sobre os projetos para apreciar a profundidade e a precisão do design arquitetônico contemporâneo.
            </p>
          </div>

          <button
            onClick={() => {
              playWoodChimeSound();
              if (onNavigateContact) onNavigateContact();
            }}
            className="inline-flex items-center gap-2 text-[#52371c] hover:text-[#775a19] text-xs uppercase tracking-wider font-bold shrink-0 cursor-pointer group"
          >
            <span>Solicitar Projeto Completo para Residência</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 6 Cards Grid with 3D Tilt, Clip-Path & Counter-Parallax */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          id="projetos"
          style={{ perspective: 1200 }}
        >
          {ambientesCards.map((card) => (
            <ProjectCard
              key={card.id}
              card={card}
              onInspect={(proj) => setInspectProject(proj)}
            />
          ))}
        </div>

      </div>

      {/* Detail Modal */}
      <ProjectDetailModal
        project={inspectProject}
        onClose={() => setInspectProject(null)}
      />
    </section>
  );
};
