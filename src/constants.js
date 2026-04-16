export const MODALIDADES = {
  alv_estrutural: {
    label: "Alvenaria Estrutural", desperdicio: 0.08,
    descr: "Bloco de concreto estrutural — parede É a estrutura. Sem pilares/vigas/formas. Economia 10–20% vs convencional."
  },
  alvenaria:  { label: "Alvenaria Convencional", desperdicio: 0.15,
                descr: "Concreto armado + blocos cerâmicos." },
  steelframe: { label: "Steel Frame (LSF)",       desperdicio: 0.05,
                descr: "Perfis galvanizados leves + radier." },
  metalica:   { label: "Estrutura Metálica",      desperdicio: 0.08,
                descr: "Perfis pesados I/H + steel deck." }
};

export const VEDACOES = {
  alvenaria:         { label: "Alvenaria (tijolo)" },
  drywall:           { label: "Drywall simples" },
  drywallAcustico:   { label: "Drywall acústico" },
  steelframeInterno: { label: "Steel Frame + cimentícia" }
};

// BDI padrão: 25% (bonificações e despesas indiretas)
// Inclui: administração central, lucro, impostos, seguros, garantias
export const BDI_PADRAO = 0.25;

// Referências CUB/SINAPI para comparação (R$/m² - valores médios nacionais 2025)
export const CUB_REFERENCIAS = {
  r1b:  { label: "CUB R1-B (Popular 1 pav.)",     custoM2: 1850 },
  pp4n: { label: "CUB PP4-N (Médio multi-pav.)",   custoM2: 2400 },
  r8a:  { label: "CUB R8-A (Alto multi-pav.)",     custoM2: 3100 },
  r16a: { label: "CUB R16-A (Alto 16+ pav.)",      custoM2: 3500 }
};

// Mantido para retrocompatibilidade de localStorage (não usado no cálculo)
export const PRESETS = {
  ultraEcon: { label: "Ultraeconômico",  custoM2: 1000 },
  popular:   { label: "Popular",         custoM2: 1500 },
  medio:     { label: "Médio",           custoM2: 2000 },
  medioAlto: { label: "Médio-alto",      custoM2: 2500 },
  alto:      { label: "Alto",            custoM2: 3500 }
};

export const CAMPOS_CALC = {
  areaPavimento: "Área do pavimento",
  areaApto:      "Área do apartamento",
  nApt:          "Nº de apartamentos",
  nPav:          "Nº de pavimentos"
};

export const CORES = [
  "#2563eb","#7c3aed","#db2777","#dc2626","#ea580c","#ca8a04",
  "#16a34a","#0891b2","#0284c7","#4338ca","#9333ea"
];

export const defaultInp = {
  areaPavimento: "300", areaApto: "60", nApt: "10", nPav: "3",
  areaBanheiro: "4", peDireito: "2,8",
  modalidade: "alv_estrutural", vedacao: "drywall",
  calculado: "nPav"
};

export const defaultInpB = {
  ...defaultInp, modalidade: "alvenaria", vedacao: "alvenaria"
};
