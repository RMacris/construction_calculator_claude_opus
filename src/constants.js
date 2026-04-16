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

export const PRESETS = {
  ultraEcon: { label: "Ultraeconômico",  mult: 0.60 },
  popular:   { label: "Popular",         mult: 1.00 },
  medio:     { label: "Médio",           mult: 1.35 },
  medioAlto: { label: "Médio-alto",      mult: 1.70 },
  alto:      { label: "Alto",            mult: 2.10 }
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
