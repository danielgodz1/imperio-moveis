/**
 * Projetos 3D da Império: imagens de projeto (renders), não fotos de obra pronta.
 * Aparecem na página /projetos-3d, separados por tema.
 *
 * Como adicionar um projeto novo (render do SketchUp/Promob ou captura do editor 3D):
 *  1. Exporte a imagem em JPG e gere as variantes com o mesmo nome base em public/projetos3d/:
 *     <id>.jpg, <id>-800.avif, <id>-800.webp, <id>-1600.avif, <id>-1600.webp
 *     (python: veja dev/RELATORIO_DEV.md, seção "Projetos 3D").
 *  2. Acrescente um item na lista abaixo com o tema certo.
 *  3. `projeto` é opcional: só os modelos montados no editor do site têm o link "Abrir no 3D".
 *  4. Rode `npm run build`: a página e o sitemap são refeitos sozinhos.
 */

export type TemaProjeto3D = 'cozinhas' | 'quartos' | 'closets' | 'home-office' | 'banheiros';

export interface Projeto3D {
  id: string;
  tema: TemaProjeto3D;
  nome: string;
  descricao: string;
  /** Caminho base sem extensão, dentro de public/. */
  arquivo: string;
  /** Proporção da imagem (largura / altura). */
  proporcao: string;
  /** Projeto codificado do editor 3D: abre em /projetar#projeto=... */
  projeto?: string;
}

export const TEMAS_PROJETO_3D: { id: TemaProjeto3D; rotulo: string }[] = [
  { id: 'cozinhas', rotulo: 'Cozinhas' },
  { id: 'quartos', rotulo: 'Quartos' },
  { id: 'closets', rotulo: 'Closets' },
  { id: 'home-office', rotulo: 'Home office' },
  { id: 'banheiros', rotulo: 'Banheiros' },
];

export const PROJETOS_3D: Projeto3D[] = [
  {
    id: "cozinha-ilha",
    tema: 'cozinhas',
    nome: "Cozinha com ilha ripada",
    descricao: "Bancada em L, ilha ripada com cooktop, torre quente e nicho de geladeira.",
    arquivo: '/projetos3d/cozinha-ilha',
    proporcao: '1356 / 1077',
    projeto: "z.rZPdbtswDIXfhdey4L84iZ9hWHc_FAUj0YkKWTRouRcN8u6F0qWw06JrtuqSkHg-Hh4d4YlkRIa2VGC4Z8vQguFnFw4ICqzrKYxMI7RH8Cj7SfChh7bWpYJBuJuCdRYtpWKlGwUDPVgn5CKnUqnXJwW4I4mT4Ajt7yNENySRRwzkk8aAQpaghTtQc41C1woGHp1Bvuu6kWKqZrmukoqLLM6_3isUoI-XZ6d7BT3byfOrnrPQwg6DQYuZnwv-XApWus4Xp573zfX2_ci5bkoFaHCHPYWY5uqE3CNn4ga0DAp4gb5dHgXP5zYKhCOatIhcQcT-bNFAVjAzHgXhpP5M4vxh4ZqhEIWvrdteoX-wrlxvVl9mz3VdLNGrC7uuq_IGfpQexfGYoY88_vM6Cl18OFO1-e59vJFHFqGsYwn8CXau16s5aKmb-j-DU-hms3Ci_JQzOHPgbE8eLTlZhOXHNev2K6jrWyxdVzegdixyaZRFivy3ZJfp98-Tna_fExf6lmDnq7ckl0WzwLxX4MlCG2UiBYMbz6lmMeQxYORztlM_w_Lrgr0nn0qBXSRoO_QjnV4A",
  },
  {
    id: "cozinha-salvia",
    tema: 'cozinhas',
    nome: "Cozinha verde-sálvia",
    descricao: "Frentes em verde-sálvia acetinado com tampo em quartzo branco.",
    arquivo: '/projetos3d/cozinha-salvia',
    proporcao: '1356 / 1077',
    projeto: "z.rZPNbtswEITfZc8UoT__6RmKpvciCNbkymZAcYUl5UMMv3tBpw4sJ0jjtjwuRM43s6MjHEgiMnS1AsMDW4YODL-4sEdQYN1AITJF6I7gUXaT4NMAXatrBaNwPwXrLFrKw0YvFYz0ZJ2QS5xHtV6dFOCWJE2CEbqfR0huzCLPGMhnjRGFLEEHD6CuNSrdKhg5OoP80PeRUp4WpW6yiksszr9-VylAny7XTo8KBraT51c9Z6GDLQaDFgt_Lfh9Ltjotpyd9vrdUm_eWy71slaABrc4UEjZ14HEUhHRH1x2xzPyzfwoeDm_okA4ocl7KBUkHM4JjWQFC-NREE7qtxHn97PQDIUkfJvc5ob8g22Ver34Knqp22pO3lzQddvUd-CjDCiOY4E-cfzrZVS6-tBSs_7P23gDTyxCRc8S-BPqUq8W15y1Xrb_1ppKL9ezHOpPMYMzey525NGSk1lTvt2ibr5Curoj0FVzB2nPIlyIG9FykSjxn1pd5x__utXl6j1wpe8odbl4a3FdLWeUjwo8WeiSTKRgdPHcaBZDHgMmPvc6AxqWHxfqHfk8CuwSQdejj3T6BQ",
  },
  {
    id: "cozinha-grafite",
    tema: 'cozinhas',
    nome: "Cozinha grafite com granito",
    descricao: "Frentes em grafite, tampo em granito preto polido e sem forro ripado.",
    arquivo: '/projetos3d/cozinha-grafite',
    proporcao: '1356 / 1077',
    projeto: "z.rZLdbtswDIXfhdey4L_mR88wrLsfioKR6ESFLBqU3IsEeffC7jLEWTek23hJSDzfOeQJXkkSMphageWeHYMBy0cfDwgKnO8pJqYE5gQBZT8KPvdgWl0rGIS7MTrv0NHUbPRKwUDPzgv5zFOr1uuzAtyR5FEwgfl-guyHSeQFI4VJY0AhR2DgEdS1RqVbBQMnb5Efuy5RnrpFqZtJxWcWH97fVQow5Mu385OCnt0Y-F3POzCww2jRYRGuBb8uBRvdlotqr-eWevur5VKvagVocYc9xTyH5-MRi1F2GBkU8IJ8uywFx3mKAuGMdtpDqSBjPye0F4w-czEIZYaz-mHFh8MiNksxC99mt71h_2Bfpd483Atf6rZasjcXeN029acMoPQonlOBIXP664VUuvrQVLP5zxv5CZ5ZhIqOZZ7zO-pSrx-uOWu9av_tciq92ixyqP-IGb09cLGngI68LG7lyy3q9h7S9ScCXTd3kD4pCOTAZBlJweDTNHVgsRQwYubCBpxP2rJ8u7DvKUytyD4TmA5DovMb",
  },
  {
    id: "quarto-tv",
    tema: 'quartos',
    nome: "Suíte com painel de TV",
    descricao: "Cabeceira ripada com LED, guarda-roupa até o teto e painel de TV em frente à cama.",
    arquivo: '/projetos3d/quarto-tv',
    proporcao: '1356 / 1077',
    projeto: "z.zZPBbtswDIbfhWdZkJ0mC_QMRTugx6IoGIsOVMimRks9NMi7F3K21s7SrUAv9ZEw___jT-oAzyQjMthGQcs9OwYLvzJKYlDgfE_DyDSCPUBA2WfBxx7sSm8VROEuD847dHQqrhVEenReyCcupUb_OCrAHUnKgiPY-wMkH4vHEw4UEBREFHIEFq5BzT1q3SiIPPoW-bbrRkqlaoqFTyw-TD8pwJDeOuqjejOILGmhf7fUN9MM5_pVreulhZlbNLo-Pijo2eXAp3m8Awst7qglL1iJj-iwCuTm3jdL76ZENQdv1n_nabTZKMAWd9jTkMpMnZB_4pNH2Q-_5zJJvPwGFk7Ylq2aEsiJUDw6rvo8NX4EZvTVdk5mdLO5RLbafpqsmoL-jmS1Xv0TbJ9RHFbCOS4O6fZ8mc3yRDZrM_-uLmF-frPVf1cb0Q8UqvT83v7R0dd6e3bOFzNcf_3uHhSUN2CTZFIQ_Vh0enTTI2kDSom0Zfn5h3RPoUgP7BOB7TCMdHwF",
  },
  {
    id: "quarto-penteadeira",
    tema: 'quartos',
    nome: "Suíte com penteadeira",
    descricao: "Troca o painel de TV por uma penteadeira com espelho e LED.",
    arquivo: '/projetos3d/quarto-penteadeira',
    proporcao: '1356 / 1077',
    projeto: "z.zZNNbtwwDIXvwrUsyJqfTHWGICmQZRAEHIseKJBNlZazyGDuXsjTpHY6TdNdvCSs9z4-kkd4JhmQwVkFDXfsGRz8GFEygwIfOuoHpgHcESLKYRR87MCt9E5BEm7H3gePns7FjYJEjz4IhcylZPXVSQHuSfIoOIC7P0IOqXg8YU8RQUFCIU_g4BrU3KPWVkHiITTIt207UC5VUyxCZglx-kkBxvz2oj6pN4PEkhf6d0t9M_XwXr-qdb20MHMLq-vTg4KO_Rj53E_w4KDBPTUUBCsJCT1Wkfzc-2bpbUtUc3C7-TNPo81WATa4x476XHpqhcITnz3KfPh3LpPEyy9g4YxNmaopgZwJJaDnqhunh38DM3q9m5MZbbeXyFa7T5NVU9BfkazWqw_BDiOKx0p4TItFun0_TLtcke3GzL_1JczPT7b652gT9ZnQT-vXYIcSug_uyuhvdhnk1YVjNnq9_o_luzzhBwXlDlyWkRSkMBSZ7pU0opRYG5bvr6gHikW555AJXItxoNNP",
  },
  {
    id: "quarto-estudo",
    tema: 'quartos',
    nome: "Quarto com bancada de estudo",
    descricao: "Bancada suspensa com nicho, guarda-roupa de correr e acabamento carvalho.",
    arquivo: '/projetos3d/quarto-estudo',
    proporcao: '1356 / 1077',
    projeto: "z.zZNNjtswDIXvwrUsyM7PpDpD0SnQZTEYMBKTqpBNl5Jm0SB3L-S0qT3NDJBdtSSk9z49kid4IUnIYDsFjnv2DBZ-FJTMoMCHnobElMCeIKIci-BzD3aldwpG4UMZfPDo6VLcKBjp2QehkLmWOv1wVoB7klwEE9ivJ8hhrB7fcaCIoGBEIU9g4SOouUerOwUjp-CQHw-HRLlWTbUImSXE6ZICjPn6oj2rq8HIkhf6X5b6ZvrDa_2m1e3SwswtOt2enxT07Evky3-CBwsO9-QoCDYSRvTYRPJz709L765GNQfvNv_mabTZKkCHe-xpyDzZyAvGb9wMWN9GUMB_o5lUfv5mFs7oamNNzeQCKQE9N33x_A6b0evdHM7obnsLbrW7B66Z4v5P4Vq9epftWFA8NsJlXEzU4-uudstZ2W7M_Kxvkd7V4uatHqvLuKcqwCIkcIXf4-DqRFLKxXNz3e23985slhE_3Ix4fVfERn-4GfGTgroqNkshBWNIValHP-2Siyg1cMfy-Q_tkWKlHzhkAnvAmOj8Cw",
  },
  {
    id: "closet-aberto",
    tema: 'closets',
    nome: "Closet com ilha",
    descricao: "Guarda-roupa até o teto, colmeia iluminada, ilha de gavetas e sapateira.",
    arquivo: '/projetos3d/closet-aberto',
    proporcao: '1356 / 1077',
    projeto: "z.lZLRbtswDEX_hc-yICt1kvkbhnXAHoeiYCUmESCbAiX3oUH-fVCbBbNnBIjeREG8517yDO8kGRl6q8DxwJ6hBxc5UwEFPgw0ZqYM_RkiynESfB2g3-gnBUn4MI0-ePT0VbQKEr36IBQK15LVu4sCfCMpk2CG_vcZSkhVI7EUBAUJhTxBD79A_Sth9F5B4hwc8vPhkKl8VqtCKCwhXq8Yy_WH1e3lRcHAfor8pRU89HCcUDw2wlOaCT7PBVv9zcxOO2--7WavKwEYvVWADt9woLFUkygUsEFHJYzoGRTwzUpjtO2Wgh9XV8IFXR2LuairjSRYKFIQzM1tQDczP5ZmNt0C364Bd_YBYqPb3X8h3CEegztxbiL5O6RG7xek3Vxjs8b99AB2q-2uuwsa4glXMnU0FuFlsHaGa_R-v7oJ3WPB3gB1u4qYMWGpw28oJ4on9LNd_n6f0upuu0a5eWRhjbZ2NcYXBXXGfZGJFKSQa6cB_SeuiygV1bH8_Et7pFhbjxwKQX_AmOnyBw",
  },
  {
    id: "closet-correr",
    tema: 'closets',
    nome: "Closet com portas de correr",
    descricao: "Mesmo closet com portas de correr e acabamento Freijó.",
    arquivo: '/projetos3d/closet-correr',
    proporcao: '1356 / 1077',
    projeto: "z.lZLRbqMwEEX_ZZ6NBU5JsnxD1a60j1VVTfGQuDKMNTZ9aJR_r9xm0UJRlOWNQcw99945wTtJRIbGKGi5Z8vQQOs5UgIF1vU0RKYIzQk8ymEUfOmh2eg7BUG4GwfrLFr6HhoFgV6sE3KJ88jo3VkBvpKkUTBC83SC5ELWCCwJQUFAIUvQwB9Q_0qUeq8gcHQt8mPXRUpf06zgEovzl1f06fKH0dX5WUHPdvT8reUsNHAYUSwWwmOYCT7OBSv9q5w91Xz5tp59XQmg1FsF2OIr9jSkbLITcm9ciAtoGRTwZKQotamXch8XT8IJ21xKtptzirkUFiGBs7rYCoKJPDnBWEyFTeYeluY29cKOWTNQm5sdlLra_Yjkp4OJd3DtkWPhyV7hLPV-wVnPNTZr1Hc3Q1fa7OqrmM4fcSXPloYkvAzVzGBLvd-vXkX9P6FOeLpaBYwYMOXaC4qB_BHt7KrvrzMaXW_XGDe3n26pjVmN8FlBbrdJMpKC4GLe06P9gm09SgZtWX7_ZT2Qz6sHdomg6dBHOn8C",
  },
  {
    id: "closet-nogueira",
    tema: 'closets',
    nome: "Closet Nogueira",
    descricao: "Frentes em Nogueira, sem a ilha central para ganhar circulação.",
    arquivo: '/projetos3d/closet-nogueira',
    proporcao: '1356 / 1077',
    projeto: "z.jZLBTsMwDIbfxec0ajO6QZ4BARJHhJBpvBEprSMn5cC0d0cZY6KlmpZbXcXf99vZwydJQgZrFHTcs2Ow0AVOlEGB8z0NiSmB3UNA2Y2Cbz3Ylb5REIW34-C8Q0c_RaMg0pvzQj5zKRm9OSjAd5I8CiawL3vIPhZGZMkICiIKOQILz6D-Imp9qyBy8h3y43abKB-rheAziw-nTwz5dMPo5vCqoGc3Bv5heQcWdiOKw0p4jBPg4xTY6Lt6cppp83U7-bswgFqvFWCH79jTkEvIgXcjeSlYPmeoam3aOenrFEc4Y1f2UR_UyT8KZgqlTarOmzmneJinWLUzb7Nk2pprVGvdbP7FvqA6-O6DUxXIXVCs9e1MsZ0yVkvCN9f4Ntps2ouGCSPmcq-iFCl8oJu8ifv5NM1cdb0kt7pq8bU2ZlHuVUEZmc0ykoLoU2nRozt6dgGPfTqWp1_NHQUGBQP7TGC3GBIdvgE",
  },
  {
    id: "office-completo",
    tema: 'home-office',
    nome: "Home office completo",
    descricao: "Bancada, estante ripada, gaveteiro, nichos e armário aéreo com LED.",
    arquivo: '/projetos3d/office-completo',
    proporcao: '1356 / 1077',
    projeto: "z.lZPBbtswDIbfhWdZUJw4af0Mw7r7UBSMRCcsZNOg5B4W5N0Htd3qdJmR6khI_D9-kk7wQppQoK0NeOklCLRwlJ4q6Tr2BAYC9zQkoQTtCSLqYVJ86qFd242BUaWbhsABA70WDYz0FFiJs5RCbXdnA7gnzZNigvbnCTKPJeYZB4oIBkZUCgQtfAMzT1jZlYFREnuUh65LlEvVlQjOohxfNxnAmD9OnB8N9BKmKG9hHKCFPQ4eA1ZZcY_xKPPQ75ehtV3POzq72_47prNbA-hxjz0NuQzTKfGzVMojhtJe_vJWzjaNgV_v7CoZfTHuzuadjlLGIdPb4QshD5-F3M3Zats0br7W10jXt6O6MvsC6AFfKBPrkj9nm_qTwPoaVnFyu8H7ZYMD-6OkKlJYJLtrvq5vczPmyta7ZUzUHpWlQlKSjx_2_6e4ujS5vWryCxdcObvd3F-sq8CPBorLNutEBkZOpW2PgVix8hG1vFIv-uMP-YFiSRqEM0HbYUx0_g0",
  },
  {
    id: "office-sofa",
    tema: 'home-office',
    nome: "Home office com sofá",
    descricao: "Escritório com sofá de apoio para receber clientes.",
    arquivo: '/projetos3d/office-sofa',
    proporcao: '1356 / 1077',
    projeto: "z.lZPBbtswDIbfhWdJUBw7Sf0Mw7r7UBSMRCcqZNOg5B4W5N0Htd3qdJmR6Chb_D9-Ek_wSpKQoa0UOO7ZM7Rw5J40d11wBAp86GlITAnaE0SUwyT43EO7NrWCUbibBh88enrbVDDSsw9CIXPZqMz2rAD3JHkSTND-PEEOY4l5wYEigoIRhTxBC99AzRNWZqVg5BQc8mPXJcpl15aIkFlCfPtJAcb8eeL8pKBnP0V-DwseWtjj4NCjzoJ7jEeeh36_DK3Mel7Rmu3m3zat2ShAh3vsacilmU4ovLCWMKIv5fkvr7amaRT8-mAXzuiKcXtWH3SUMg6Z3g9fCHn8KmQ3Z6tM09j5Wl8jXd-OakvvC6AHfKVMQZb8WdNUXwRW17CKk9sNPiwbHII7ctKR_CLZrrlfX30z5spU22VMlB4lsEYS4s8J-_9TXF2a3Fw1eccFa2s29cPFWgRO3KEWcjSWD0uTWt8yNNs7XmK9u0r2pKDccptlIgVjSKVOj56CoHYRpcyPY_nxh_RAsZQeOGSCtsOY6Pwb",
  },
  {
    id: "office-grafite",
    tema: 'home-office',
    nome: "Home office grafite",
    descricao: "Mesma composição em grafite fosco.",
    arquivo: '/projetos3d/office-grafite',
    proporcao: '1356 / 1077',
    projeto: "z.lZPBTuMwEIbfZc62laZNC3mG1bJ3hNDEnrReOZ5o7HCg6rsjsyykUKLi48ie_5vP9hGeSBIytLUCywM7hhYOPJDmvveWQIHzA8XElKA9QkDZT4KPA7Rrs1EwCvdTdN6ho9eigpEenRfymUuhNruTAuxI8iSYoL0_QvZjifmLkQKCghGFHEELv0DNE1ZmpWDk5C3yXd8nyqValQifWXx43aQAQ_44cXpQMLCbAv8L8w5a6DBadKizYIfhwPPQ3-ehtVnPO1Zmt_06ZmW2CtBihwPFXIaxPj6jnqTDWLrzO66uTNMoeH5DF85oi_DqpN7gKGWMmbT4Ed2Zj7vPPm7maLVpmmq-1pdA11eTVmXyBc49PlEmL0v2KtPUn_TVl6iKkqv93S77i94eOOlAbhHspvm5vM21lCtT75YpUQYUzxpJiD9-1_fPcHXucXvR4_W3qyuz3dyerYu8DwqKyTbLRApGn0rXAR15QW0DSnmhluXPf_A9hZIU2WeCtseQ6PQC",
  },
  {
    id: "banheiro-gabinete",
    tema: 'banheiros',
    nome: "Banheiro com espelheira",
    descricao: "Gabinete suspenso com cuba e espelheira com LED.",
    arquivo: '/projetos3d/banheiro-gabinete',
    proporcao: '1356 / 1077',
    projeto: "z.rZLBTsMwDIbfxee0asc2UJ4BARJHNE1u4w6jNI6SlANT3x1lHWWFXZC4_rL8ff6TI7xTiCigVwpa6cUIaGjQvRIHAQWGe3JRKII-gsVwGALue9Crcq3AB-kGZ9igoSlcKfC0NxyIk0zRdlSADYU0BIygX46Q2GeKl5AQFHgMZAg0PIO6RFTlrQIvkVuUx66LlKZ0mxmcJLA9BQrQplmrHtVMeENHdoG4_4nYXkXcLBF1HvuGVOVm3CnoxQxWppPYgIYDNuwoUXHR30x-WJLrXNVi5eZ3n1W5UYAtNtiTS_kiDMRYYEuJHZoMkFm7qMpawce5kyAJ2_ywVS7k5EfRk81iWFgyf5G7u-ZWr_9Dbqcgy-gUBlLgOZ6_RksWHSYpWounJlsJT1--B7I5csKJQHdoI42f",
  },
  {
    id: "banheiro-nichos",
    tema: 'banheiros',
    nome: "Banheiro com nichos",
    descricao: "Gabinete, espelheira e coluna de nichos iluminados.",
    arquivo: '/projetos3d/banheiro-nichos',
    proporcao: '1356 / 1077',
    projeto: "z.rZJBTsMwEEXvMmsnSkpTKp8BUSSWqKom8aR15Xgs22FBlbsjNyU0pQuQ2H5Z89788QneyQdkkAsBDXesGCTUaA-kPYMApTuygSmAPIFBv-897jqQi3wpwHlue6u0QkVjuBDgaKe0Jx15jFaDAKzJx95jAPl2gqhdojj2EUGAQ0-KQMIriGtEkT8KcBx0g7xp20BxTFeJoSN7bc6BADRx0ioHMRGOaMnMEE-3iNVdxMMcUaZn35Air4atgI5Vb3hcSSuQsMdaW4qUXfU3kZ_n5DJVNRtZ_eyzyCsB2GCNHdmYNmo96SNnXjtUaTxP0lmRlwI-Lo14jtiksxapjrMdBUcmaWFmSP1FbX3PrFz-n5rVzYHDrdbm9lbran7q5d3Kfu9V3JXaCkgiMvqeBDgdLn-1IYMWI2eNwfNpG_YvX657MimyrCOBbNEEGj4B",
  },
  {
    id: "banheiro-freijo",
    tema: 'banheiros',
    nome: "Banheiro Freijó",
    descricao: "Gabinete e espelheira em Freijó.",
    arquivo: '/projetos3d/banheiro-freijo',
    proporcao: '1356 / 1077',
    projeto: "z.pZLBTsMwDIbfxee0asc2UJ4BARJHNE1u445MaRw5KQemvjvKOsoKXBDXX5G_z79zgjeSiAx6paDlng2Dhgb9K1lhUGBsTz4yRdAncCiHQXDfg16VawVBuBu8sQYNTeFKQaC9sUI28RRtRwXYkKRBMIJ-OUGyIVMCS0JQEFDIEGh4BnWNqMpbBYGjbZEfuy5SmtJtZtjEYt05UIAuzVr1qGbCET25BeL-O2L7K-Jmiajzsy9IVW7GnYKezeB4Wska0HDAxnpKVFz1N5MfluQ6V7UYufnZZ1VuFGCLDfbkU96oE7JHLsQGNHk8z9JFVdYK3i-NCCds81mrXMfZjmIgl7WwcGT-onb3m1m9_r_aTkFW0UkGUhBsvHyLlhx6TFy0Ds8ttixPn7YHcjnybBOB7tBFGj8A",
  },
];

export const linkProjeto3D = (p: Projeto3D) => (p.projeto ? `/projetar#projeto=${p.projeto}` : '/projetar');
