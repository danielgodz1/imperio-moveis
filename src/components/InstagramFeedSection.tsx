import React from 'react';
import { Camera, ExternalLink, Heart } from 'lucide-react';
import { playWoodChimeSound } from '../utils/helpers';

export const InstagramFeedSection: React.FC = () => {
  const posts = [
    {
      id: 1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8bcHhYZv760vuM6RXWlsXw3EVi0fwyiU8dGk_WsVydsEun-ai-XZze9RCoglCTGQeI35p9EWpvSDTWxvwPwn4NPwWM_K9TdlY_pZ3QUzrBRlmLTy3F4BsTuOEKWLcsb580zuiua05fIlZVy4ijImeWmM9Iadrw0kOKEW4PYW3Z5Karuj6EZ8PeUiR7m_jWvwPsZOtLFgrRk73aeYN-oSyIgd26wytx490e7UDiZk',
      caption: 'Cozinha com lâmina natural e granito em Jaú'
    },
    {
      id: 2,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4sfhpTcqDrVFDOPgh4arb-yPHdxvzgQyKjOAbQ_BUufMOje9S-1LqKGEqfW7nCrQLwRMKKuZwJcLc9DtN0IKfFvPkkroz1Mp5qVPTHmJs-uyjYvl3hjqby9JNi9Es_F8aaxKaFaRWuhuZ9AvV6ZIXTZtDH8fJj5tC3d36ofLiDhfzQJx14dDHL-cpqvxFXQgWnvZC1Gy23YmmrXVAar_aLYtONw_Dgze4jv1BRJw',
      caption: 'Closet com perfis de LED e gavetas aveludadas'
    },
    {
      id: 3,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJvuimd78weU5D5nt2fdwByVJlmH7p2Wk2gFZQJhEt6-F70-IB2-z-tuzJG063vwJwQT-mG60jnNCdXX6pqsocTowY5tVmK7iOy-AV2yvTPW-8ucGWwo4WxaA2HW2SZtKdoJcFtM2vd_WH7tigHDUsGpWDI4Py2U3nrEePJc4WoaHjwCYHdfUejyGB1XXu2b5EpBAfRDfVODtvA5uBF7RKb4iLYI_t4ix8bEjEDEw',
      caption: 'Painel ripado para TV com fiação embutida'
    },
    {
      id: 4,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2wYSKDCgOk8etxKwhPp5rkdNOtzrB9L8ebZ3soFRj4GdEHIncNekGg259Vjhs8vd0A4nyZpQ-ZroQHPMWl9xCdmJbl56ywtbtGaeOCk-BKRGKWEfgDrudG6MTmyRDaDorNr5BeSLAJhxV9WARu5Xsp1fg_roDIYHBf_xP4aCmA5KZ3mKwkILts7WID5f81JPFu-88ix_0FaBIRXuzpPnhlMjg5dkl-HrmFiZnLLM',
      caption: 'Puxadores em latão escovado e amortecimento'
    },
    {
      id: 5,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAb2TqZfR-Zt-BI1x-RrLnvOXh-zwGbAza0EjVvW6BU-t9p1JgJWJGYR-QVgIkY1e7gwSyfsky0AY3VduvldiDzQZqSg1m11-UronnXZGB5YVBOnZjUwD4_IL5YFb1LvixnXvN3p1XtDPwQhWtplJ1LNXpVUab7oEPnHCkkwT6iPdLvZ9E7qC29INrKFRq0f_ZmlRS9VGwGu_sD0hlypHW5G1AIAti6vwc-kcLIogI',
      caption: 'Home office executivo em carvalho entregue em Jaú'
    },
    {
      id: 6,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1aUHSdGatrTitjmkXxU24dSkJA6nFC2jDYiIEcLLe5mqGXSa4T3H9U9-9K5l_aF7w1QCYp12aj0uW-Q0fxjIM4LyByrBssji1cLCJ_3cFh6OT34NnTRlzw2bHDg4lqPqsyFkkq4tuL_p-qWonCGMPyJdelY9LByMhA21ZsbonPQEJSN9RcJ49LSSRzuHDIOy5BInOqib32JVvjb3PeUpZDJt7XjqAfF5PW17sR0E',
      caption: 'Equipe própria na montagem cuidadosa do banheiro'
    }
  ];

  return (
    <section className="w-full py-16 lg:py-24 bg-[#fef8f4] border-b border-[#ddd7cd]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col space-y-10">
        
        {/* Header */}
        <div className="gsap-reveal flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#775a19] font-bold">
              <span>Galeria em Tempo Real</span>
              <span className="text-[#d3c4b9]">•</span>
              <span>@imperio.moveis.jau</span>
            </div>
            <h2 className="font-serif-atelier text-3xl sm:text-4xl text-[#1d1b19] font-semibold">
              Inspirações no Instagram
            </h2>
            <p className="text-sm text-[#4f453c]">
              Acompanhe o dia a dia da nossa produção, bastidores de montagens em Jaú e novas tendências de interiores.
            </p>
          </div>

          <a
            href="https://www.instagram.com/imperio.moveis.jau/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playWoodChimeSound}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-[#f3ede9] hover:bg-[#ede7e3] text-[#1d1b19] transition-colors text-xs font-semibold uppercase tracking-wider shrink-0 border border-[#ddd7cd] group"
          >
            <Camera className="w-4 h-4 text-[#775a19]" />
            <span>Seguir @imperio.moveis.jau</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#81756b]" />
          </a>
        </div>

        {/* 6 Square Grid */}
        <div className="gsap-stagger-parent grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/imperio.moveis.jau/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playWoodChimeSound}
              className="gsap-stagger-child relative group rounded-xl overflow-hidden aspect-square bg-[#e7e1de] shadow-sm border border-[#ddd7cd] block cursor-pointer"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-[#52371c]/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                <Heart className="w-6 h-6 fill-white mb-1" />
                <span className="text-[10px] line-clamp-2 leading-tight">{post.caption}</span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};
