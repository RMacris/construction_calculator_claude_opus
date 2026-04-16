/**
 * refs.js — Fonte da verdade para coeficientes, preços e dimensões.
 *
 * Estrutura aninhada por etapa → material. Cada material reúne:
 *   preco      → preço unitário base R$ (SINAPI/CUB 2025)
 *   consumo    → coeficiente(s) de consumo técnico
 *   dims       → dimensões padrão da peça (quando aplicável)
 *
 * Coeficientes compartilhados ficam em REFS.comum.
 *
 * Fontes: SINAPI (CEF), TCPO (PINI), CUB (SINDUSCON), NBR 12721, fabricantes.
 */

const REFS = {

  // ── Coeficientes compartilhados entre múltiplos materiais ─────────────
  comum: {
    pinturaFaces:         2,      // nº de faces pintadas (ambas)
    vergasFracao:         0.6,    // fração do perímetro com vergas
    argamassaPorM2:       12,     // kg/m² – consumo SINAPI c/ 15% perda
    perimetroLados:       4,      // lados do perímetro (quadrado equivalente)
  },

  // ── Preliminares ──────────────────────────────────────────────────────
  preliminares: {
    tapume:     { preco: 55,   altura: 2.2 },
    locacao:    { preco: 3200, areaPorVerba: 500 },
    barracao:   { preco: 520,  fracao: 0.04 },
    provis:     { preco: 4800 },
  },

  // ── Fundação — Alvenaria Estrutural ───────────────────────────────────
  fundacao_alv_estrutural: {
    radier_ae:  { preco: 280, espessura: 0.12 },
    tela_ae:    { preco: 28,  sobreposicao: 1.05 },
    imperm_ae:  { preco: 30 },
    lastro_ae:  { preco: 28 },
  },

  // ── Fundação — Steel Frame ────────────────────────────────────────────
  fundacao_steelframe: {
    radier_conc: { preco: 340, espessura: 0.15 },
    tela_sold:   { preco: 42,  sobreposicao: 1.05 },
    lona_brita:  { preco: 30 },
    imperm_rad:  { preco: 52 },
  },

  // ── Fundação — Metálica ───────────────────────────────────────────────
  fundacao_metalica: {
    estaca_helice: { preco: 210, porTonelada: 0.15 },
    conc_blocos:   { preco: 370 },
    aco_fund:      { preco: 10,  porVolume: 65 },
    formas_fund:   { preco: 98,  porM2: 0.8 },
  },

  // ── Fundação — Convencional ───────────────────────────────────────────
  fundacao_convencional: {
    estaca_sap:  { preco: 420 },
    aco_fund:    { preco: 10,  porVolume: 80 },
    formas_fund: { preco: 98,  fatorArea: 5 },
    lastro:      { preco: 42 },
  },

  // ── Estrutura — Alvenaria Estrutural ──────────────────────────────────
  estrutura_alv_estrutural: {
    bloco_estr: { preco: 2.80, dims: { altura: 19, comprimento: 39, un: "cm" } },
    graute:     { preco: 1.40, porM2: 2 },
    aco_ae:     { preco: 8.5,  porM2: 4 },
    argam_ae:   { preco: 1.0 },                // usa comum.argamassaPorM2
    laje_pre:   { preco: 72,   sobreposicao: 1.05 },
    vergas_ae:  { preco: 9 },                   // usa comum.vergasFracao
  },

  // ── Estrutura — Steel Frame ───────────────────────────────────────────
  estrutura_steelframe: {
    perfis_lsf: { preco: 17,  porM2: 18 },
    osb:        { preco: 78,  sobrepParede: 1.05, fracaoLaje: 0.3 },
    paraf_lsf:  { preco: 210, porM2: 0.08 },
    membrana:    { preco: 22,  fracao: 0.6 },
  },

  // ── Estrutura — Metálica ──────────────────────────────────────────────
  estrutura_metalica: {
    perfis_pes:  { preco: 22,  kgPorM2: 60 },
    steel_deck:  { preco: 145, cobertura: 0.95 },
    cap_conc:    { preco: 360, espessura: 0.10 },
    solda_chumb: { preco: 88 },
  },

  // ── Estrutura — Convencional ──────────────────────────────────────────
  estrutura_convencional: {
    conc_estr:   { preco: 390 },
    aco_estr:    { preco: 10,  porVolume: 100 }, // kg/m³
    formas_estr: { preco: 98,  fatorArea: 10 }, // m² de forma por m³
    escora:      { preco: 42,  porM2: 0.8 },
  },

  // ── Vedação — Alvenaria ───────────────────────────────────────────────
  vedacao_alvenaria: {
    bloco:     { preco: 2.0,  dims: { altura: 19, comprimento: 29, un: "cm" } },
    argamassa: { preco: 1.0 },                   // usa comum.argamassaPorM2
    reboco:    { preco: 33,   faces: 2 },
    vergas:    { preco: 32 },                     // usa comum.vergasFracao
  },

  // ── Vedação — Drywall ─────────────────────────────────────────────────
  vedacao_drywall: {
    gesso:      { preco: 38,  chapasPorFace: 2.05, dims: { largura: 1.2, altura: 2.4, un: "m" } },
    perfis_dry: { preco: 13,  porM2: 2.8 },
    massa_fita: { preco: 16,  faces: 2 },
    la_vidro:   { preco: 30,  fracao: 0.4 },
  },

  // ── Vedação — Drywall Acústico ────────────────────────────────────────
  vedacao_drywallAcustico: {
    gesso_dup: { preco: 50,  chapasPorFace: 4.1, dims: { largura: 1.2, altura: 2.4, un: "m" } },
    perf_ref:  { preco: 22,  porM2: 2.8 },
    la_min:    { preco: 72 },
    banda_ac:  { preco: 28,  faces: 2 },
  },

  // ── Vedação — Steel Frame Interno ─────────────────────────────────────
  vedacao_steelframeInterno: {
    cim_placa:  { preco: 72,  chapasPorFace: 2.05, dims: { largura: 1.2, altura: 2.4, un: "m" } },
    perf_gal:   { preco: 17,  porM2: 2.8 },
    la_memb:    { preco: 45,  fracao: 0.9 },
    paraf_jun:  { preco: 16,  faces: 2 },
  },

  // ── Cobertura ─────────────────────────────────────────────────────────
  cobertura: {
    manta:  { preco: 45,  sobreposicao: 1.1 },
    telha:  { preco: 35,  coberturaUtil: 0.85, inclinacao: 1.15,
              dims: { largura: 33, comprimento: 42, un: "cm" } },
    calha:  { preco: 65,  fatorPerimetro: 1.2 },
    isolam: { preco: 28 },
  },

  // ── Esquadrias ────────────────────────────────────────────────────────
  esquadrias: {
    porta_ent: { preco: 850 },
    porta_int: { preco: 350,  porApto: 3 },
    janela:    { preco: 420,  areaPorApto: 9, dims: { largura: 1.2, altura: 1.0, un: "m" } },
    ferragem:  { preco: 120,  porApto: 4 },
  },

  // ── Revestimentos ─────────────────────────────────────────────────────
  revestimentos: {
    porcelanato: { preco: 42, perda: 1.05, dims: { largura: 60, comprimento: 60, un: "cm" } },
    azulejo:     { preco: 35, perda: 1.1,  dims: { largura: 30, comprimento: 60, un: "cm" } },
    arg_cola:    { preco: 1.8, porM2: 5 },
    rodape:      { preco: 18 },
  },

  // ── Hidráulica ────────────────────────────────────────────────────────
  hidraulica: {
    tubos:     { preco: 1800 },
    loucas:    { preco: 850 },
    metais:    { preco: 650 },
    registros: { preco: 350 },
    cx_agua:   { preco: 7500, expoente: 0.65, divisor: 4 },
  },

  // ── Elétrica ──────────────────────────────────────────────────────────
  eletrica: {
    qdc:     { preco: 320 },
    fios:    { preco: 4.0,  porM2: 12 },
    eletrod: { preco: 5.5,  porM2: 4 },
    tomada:  { preco: 22,   porApto: 18 },
    disj:    { preco: 38,   porApto: 8 },
  },

  // ── Pintura ───────────────────────────────────────────────────────────
  pintura: {
    massa:   { preco: 6.5, porM2Face: 0.8 },
    tinta:   { preco: 30,  porM2Face: 0.12 },
    selador: { preco: 24,  porM2Face: 0.06 },
    mo_pint: { preco: 15 },
  },

  // ── Limpeza ───────────────────────────────────────────────────────────
  limpeza: {
    cacamba:   { preco: 350, porM2: 0.02 },
    limp_obra: { preco: 10 },
    polimento: { preco: 18,  fracao: 0.3 },
  },
};

export default REFS