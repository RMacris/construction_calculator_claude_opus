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
    tapume:     { preco: 68,   altura: 2.2 },
    locacao:    { preco: 4200, areaPorVerba: 500 },
    barracao:   { preco: 720,  fracao: 0.04 },
    provis:     { preco: 6500 },
  },

  // ── Fundação — Alvenaria Estrutural ───────────────────────────────────
  fundacao_alv_estrutural: {
    radier_ae:  { preco: 320, espessura: 0.12 },
    tela_ae:    { preco: 32,  sobreposicao: 1.05 },
    imperm_ae:  { preco: 38 },
    lastro_ae:  { preco: 35 },
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
    bloco_estr: { preco: 3.50, dims: { altura: 19, comprimento: 39, un: "cm" } },
    graute:     { preco: 1.80, porM2: 2 },
    aco_ae:     { preco: 10,   porM2: 4 },
    argam_ae:   { preco: 1.3 },                // usa comum.argamassaPorM2
    laje_pre:   { preco: 95,   sobreposicao: 1.05 },
    vergas_ae:  { preco: 12 },                  // usa comum.vergasFracao
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
    perfis_pes:  { preco: 22,  porVolume: 2.2 }, // Aço em t por m³ de bloco fênix equivalente?
    steel_deck:  { preco: 145, cobertura: 0.95 },
    cap_conc:    { preco: 360, espessura: 0.10 },
    solda_chumb: { preco: 88, porPilar: 8 },
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
    bloco:     { preco: 2.8,  dims: { altura: 19, comprimento: 29, un: "cm" } },
    argamassa: { preco: 1.3 },                   // usa comum.argamassaPorM2
    reboco:    { preco: 52,   faces: 2 },
    vergas:    { preco: 45 },                     // usa comum.vergasFracao
  },

  // ── Vedação — Drywall ─────────────────────────────────────────────────
  vedacao_drywall: {
    gesso:      { preco: 38,  chapasPorFace: 2.05, dims: { largura: 1.2, altura: 2.4, un: "m" } },
    perfis_dry: { preco: 13,  porM2: 2.8 },
    massa_fita: { preco: 16,  faces: 2 },
    la_vidro:   { preco: 30,  fracao: 1.0 },
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
    manta:  { preco: 62,  sobreposicao: 1.1 },
    telha:  { preco: 78,  coberturaUtil: 0.85, inclinacao: 1.15,
              dims: { largura: 33, comprimento: 42, un: "cm" } },
    calha:  { preco: 98,  fatorPerimetro: 1.2 },
    isolam: { preco: 42 },
  },

  // ── Esquadrias ────────────────────────────────────────────────────────
  esquadrias: {
    porta_ent: { preco: 1450 },
    porta_int: { preco: 580,  porApto: 3 },
    janela:    { preco: 780,  areaPorApto: 9, dims: { largura: 1.2, altura: 1.0, un: "m" } },
    ferragem:  { preco: 220,  porApto: 4 },
  },

  // ── Revestimentos ─────────────────────────────────────────────────────
  revestimentos: {
    porcelanato: { preco: 88, perda: 1.05, dims: { largura: 60, comprimento: 60, un: "cm" } },
    azulejo:     { preco: 75, perda: 1.1,  dims: { largura: 30, comprimento: 60, un: "cm" } },
    arg_cola:    { preco: 2.2, porM2: 5 },
    rodape:      { preco: 32 },
  },

  // ── Hidráulica ────────────────────────────────────────────────────────
  hidraulica: {
    tubos:     { preco: 2600 },
    loucas:    { preco: 1650 },
    metais:    { preco: 1250 },
    registros: { preco: 520 },
    cx_agua:   { preco: 10000, expoente: 0.65, divisor: 4 },
  },

  // ── Elétrica ──────────────────────────────────────────────────────────
  eletrica: {
    qdc:     { preco: 420 },
    fios:    { preco: 5.2,  porM2: 12 },
    eletrod: { preco: 7.2,  porM2: 4 },
    tomada:  { preco: 32,   porApto: 18 },
    disj:    { preco: 52,   porApto: 8 },
  },

  // ── Pintura ───────────────────────────────────────────────────────────
  pintura: {
    massa:   { preco: 9,   porM2Face: 0.8 },
    tinta:   { preco: 45,  porM2Face: 0.12 },
    selador: { preco: 34,  porM2Face: 0.06 },
    mo_pint: { preco: 22 },
  },

  // ── Limpeza ───────────────────────────────────────────────────────────
  limpeza: {
    cacamba:   { preco: 420, porM2: 0.02 },
    limp_obra: { preco: 14 },
    polimento: { preco: 26,  fracao: 0.3 },
  },
};

export default REFS