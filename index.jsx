import React, { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

/* ============================================================
   Simulador de Custo de Construção — Bottom-up editável
   - Quantidades geométricas reais.
   - Preços editáveis por material.
   - Usuário pode adicionar ou remover materiais de cada etapa.
   - Custo/m² é SAÍDA (não entrada).
   ============================================================ */

const fmtBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(isFinite(v) ? v : 0);
const fmtN = (v, d = 2) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: d, maximumFractionDigits: d
  }).format(isFinite(v) ? v : 0);

// Converte string (com vírgula ou ponto) ou número em número
const num = (v) => {
  if (typeof v === "number") return isFinite(v) ? v : 0;
  if (v === "" || v === undefined || v === null) return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return isFinite(n) ? n : 0;
};

const MODALIDADES = {
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
const VEDACOES = {
  alvenaria:         { label: "Alvenaria (tijolo)" },
  drywall:           { label: "Drywall simples" },
  drywallAcustico:   { label: "Drywall acústico" },
  steelframeInterno: { label: "Steel Frame + cimentícia" }
};
const PRESETS = {
  ultraEcon: { label: "Ultraeconômico",  mult: 0.60 },
  popular:   { label: "Popular",         mult: 1.00 },
  medio:     { label: "Médio",           mult: 1.35 },
  medioAlto: { label: "Médio-alto",      mult: 1.70 },
  alto:      { label: "Alto",            mult: 2.10 }
};

/* ----------------- Resolver campos interdependentes -----------------
   Restrição: n_apt = floor(A_pav · k / A_apt) × n_pav,  k = 0.80
   O usuário escolhe qual dos 4 campos é calculado automaticamente.
   Os outros 3 são entradas livres. Edição propaga via fórmulas inversas.
-------------------------------------------------------------------- */
const K_UTIL = 0.80;

function resolverCampos(inpRaw) {
  let A_pav = num(inpRaw.areaPavimento);
  let A_apt = num(inpRaw.areaApto);
  let n_apt = num(inpRaw.nApt);
  let n_pav = num(inpRaw.nPav);
  const calc = inpRaw.calculado || "nPav";

  switch (calc) {
    case "nPav": {
      const p = A_apt > 0 ? Math.floor(A_pav * K_UTIL / A_apt) : 0;
      n_pav = p > 0 ? Math.max(1, Math.ceil(n_apt / p)) : 1;
      break;
    }
    case "nApt": {
      const p = A_apt > 0 ? Math.floor(A_pav * K_UTIL / A_apt) : 0;
      n_apt = p * Math.max(1, n_pav);
      break;
    }
    case "areaApto": {
      if (n_apt > 0 && n_pav > 0) {
        const pNeeded = Math.ceil(n_apt / n_pav);
        A_apt = pNeeded > 0
          ? Math.floor((A_pav * K_UTIL / pNeeded) * 10) / 10
          : A_apt;
      }
      break;
    }
    case "areaPavimento": {
      if (n_apt > 0 && n_pav > 0 && A_apt > 0) {
        const pNeeded = Math.ceil(n_apt / n_pav);
        A_pav = Math.ceil(A_apt * pNeeded / K_UTIL);
      }
      break;
    }
  }
  return { A_pav, A_apt, n_apt, n_pav };
}

/* ----------------- Geometria ----------------- */
function geometria(inpRaw) {
  const r = resolverCampos(inpRaw);
  const inp = {
    areaPavimento: r.A_pav,
    areaApto:      r.A_apt,
    nApt:          r.n_apt,
    nPav:          r.n_pav,
    areaBanheiro:  num(inpRaw.areaBanheiro),
    peDireito:     num(inpRaw.peDireito),
    modalidade:    inpRaw.modalidade,
    vedacao:       inpRaw.vedacao
  };
  const areaProjecao = inp.areaPavimento;
  const areaUtilAndar = areaProjecao * K_UTIL;
  const aptosPorAndar = Math.max(0,
    Math.floor(areaUtilAndar / Math.max(1, inp.areaApto)));
  const pavimentos = Math.max(1, inp.nPav);
  // totalAptos = nApt (valor efetivo solicitado). Capacidade é separada.
  const totalAptos = Math.max(0, inp.nApt);
  const capacidade = aptosPorAndar * pavimentos;
  const aptosVazios = Math.max(0, capacidade - totalAptos);
  const areaTotal  = areaProjecao * pavimentos;

  const ladoApto       = Math.sqrt(Math.max(0, inp.areaApto));
  const perimetroApto  = 4 * ladoApto;
  const ladoBanh       = Math.sqrt(Math.max(0, inp.areaBanheiro));
  const perimetroBanh  = 4 * ladoBanh;

  const paredesExtApto = perimetroApto * inp.peDireito;
  const paredesIntApto = 0.6 * perimetroApto * inp.peDireito;
  const areaParedeApto = paredesExtApto + paredesIntApto;
  const areaParedeTot  = areaParedeApto * totalAptos;

  const areaAzulBanh   = perimetroBanh * inp.peDireito;
  const areaAzulCoz    = 3 * (inp.peDireito / 2);
  const areaAzulTot    = (areaAzulBanh + areaAzulCoz) * totalAptos;

  const areaSalaCoz    = inp.areaApto - inp.areaBanheiro - 8;
  const aptoValido     = areaSalaCoz >= 6 && inp.areaBanheiro >= 2 && inp.areaApto >= 20;

  return {
    areaProjecao, aptosPorAndar, pavimentos, totalAptos, areaTotal,
    capacidade, aptosVazios,
    perimetroApto, perimetroBanh, areaParedeApto, areaParedeTot,
    areaAzulBanh, areaAzulCoz, areaAzulTot, areaSalaCoz, aptoValido,
    modalidade: inp.modalidade, vedacao: inp.vedacao,
    resolved: {
      A_pav: r.A_pav, A_apt: r.A_apt, n_apt: r.n_apt, n_pav: r.n_pav
    }
  };
}

/* -------------- Catálogo -------------- */
function catalogo(modalidade, vedacao) {
  const desp = MODALIDADES[modalidade].desperdicio;
  const w = 1 + desp;
  const preliminares = { id: "preliminares", nome: "Serviços Preliminares", mats: [
    { k: "tapume",   nome: "Tapume de madeira h=2,2m", un: "m²",
      qtd: g => Math.ceil(4 * Math.sqrt(g.areaProjecao) * 2.2), base: 68 },
    { k: "locacao",  nome: "Locação + topografia", un: "vb",
      qtd: g => 1, base: 4200 },
    { k: "barracao", nome: "Barracão de obra", un: "m²",
      qtd: g => Math.ceil(g.areaProjecao * 0.04), base: 720 },
    { k: "provis",   nome: "Instalações provisórias", un: "vb",
      qtd: g => 1, base: 6500 }
  ]};
  const fundacao = { id: "fundacao", nome: `Fundação — ${MODALIDADES[modalidade].label}`,
    mats: modalidade === "alv_estrutural" ? [
      // Alv. estrutural: radier ou sapata corrida (carga distribuída nas paredes)
      // Fundação mais leve que conv., ~30% mais barata (sem cargas concentradas em pilares)
      { k: "radier_ae",    nome: "Radier / sapata corrida fck 20", un: "m³",
        qtd: g => Math.ceil(g.areaProjecao * 0.12 * w), base: 320 },
      { k: "tela_ae",      nome: "Tela soldada Q92",              un: "m²",
        qtd: g => Math.ceil(g.areaProjecao * 1.05),              base: 32 },
      { k: "imperm_ae",    nome: "Impermeabilização + lona",      un: "m²",
        qtd: g => Math.ceil(g.areaProjecao),                     base: 38 },
      { k: "lastro_ae",    nome: "Lastro brita + regularização",  un: "m²",
        qtd: g => Math.ceil(g.areaProjecao),                     base: 35 }
    ] : modalidade === "steelframe" ? [
      // Radier: concreto usinado fck 25 — SINAPI/SP 2025: R$240–360/m³ bombeado
      { k: "radier_conc",  nome: "Concreto radier fck 25", un: "m³",
        qtd: g => Math.ceil(g.areaProjecao * 0.15 * w), base: 340 },
      { k: "tela_sold",    nome: "Tela soldada Q138",      un: "m²",
        qtd: g => Math.ceil(g.areaProjecao * 1.05),       base: 42 },
      { k: "lona_brita",   nome: "Lona plástica + brita",   un: "m²",
        qtd: g => Math.ceil(g.areaProjecao),               base: 30 },
      { k: "imperm_rad",   nome: "Impermeabilização radier", un: "m²",
        qtd: g => Math.ceil(g.areaProjecao),               base: 52 }
    ] : modalidade === "metalica" ? [
      { k: "estaca_helice", nome: "Estaca hélice contínua", un: "m",
        qtd: g => Math.ceil(g.areaProjecao * 0.9),          base: 210 },
      // Concreto usinado fck 25 bombeado — mercado 2025: R$300–400/m³
      { k: "conc_blocos",   nome: "Concreto blocos/vigas fck 25", un: "m³",
        qtd: g => Math.ceil(g.areaProjecao * 0.12 * w),     base: 370 },
      // Aço CA-50 — mercado 2025: R$8–12/kg
      { k: "aco_fund",      nome: "Aço CA-50 fundação",     un: "kg",
        qtd: g => Math.ceil(g.areaProjecao * 35 * w),       base: 10 },
      { k: "formas_fund",   nome: "Formas de madeira",      un: "m²",
        qtd: g => Math.ceil(g.areaProjecao * 0.8),          base: 98 }
    ] : [
      // Estaca/sapata fck 25 bombeado: R$350–420/m³ (inclui custos de escavação/cravação)
      { k: "estaca_sap",    nome: "Estaca / sapata concreto fck 25", un: "m³",
        qtd: g => Math.ceil(g.areaProjecao * 0.20 * w),     base: 420 },
      // Aço CA-50: R$8–12/kg → base R$10/kg
      { k: "aco_fund",      nome: "Aço CA-50 fundação",     un: "kg",
        qtd: g => Math.ceil(g.areaProjecao * 55 * w),       base: 10 },
      { k: "formas_fund",   nome: "Formas de madeira",      un: "m²",
        qtd: g => Math.ceil(g.areaProjecao * 1.2),          base: 98 },
      { k: "lastro",        nome: "Lastro brita + regularização", un: "m²",
        qtd: g => Math.ceil(g.areaProjecao),                base: 42 }
    ]};
  const estrutura = { id: "estrutura", nome: `Estrutura — ${MODALIDADES[modalidade].label}`,
    mats: modalidade === "alv_estrutural" ? [
      // Alvenaria Estrutural: a parede é a estrutura. Blocos 14cm + graute + armação.
      // Sem formas, sem pilares, sem vigas convencionais → economia 10-20%.
      // Bloco concreto estrutural 14×19×39: ~R$3,50/un, 13 un/m² de parede
      { k: "bloco_estr",   nome: "Bloco concreto estrutural 14×19×39", un: "un",
        qtd: g => Math.ceil(g.areaParedeTot * 13 * w), base: 3.50 },
      // Graute (preenchimento vertical a cada 80cm + canaletas): ~2L/m² parede
      { k: "graute",       nome: "Graute fck 20 (canaletas/vertic.)", un: "L",
        qtd: g => Math.ceil(g.areaParedeTot * 2), base: 1.80 },
      // Armação nas canaletas: muito menos aço que concreto armado (~4kg/m² parede)
      { k: "aco_ae",       nome: "Aço CA-50/CA-60 (canaletas)",  un: "kg",
        qtd: g => Math.ceil(g.areaParedeTot * 4 * w), base: 10 },
      // Argamassa: ~18kg/m²
      { k: "argam_ae",     nome: "Argamassa assentamento",        un: "kg",
        qtd: g => Math.ceil(g.areaParedeTot * 18), base: 1.3 },
      // Laje: pré-moldada treliçada (mais econômica que maciça)
      { k: "laje_pre",     nome: "Laje pré-moldada treliçada + capa", un: "m²",
        qtd: g => Math.ceil(g.areaTotal * 1.05), base: 95 },
      // Vergas/contravergas em canaleta U: incluído no graute+bloco, custo adicional mínimo
      { k: "vergas_ae",    nome: "Canaletas U (vergas/contravergas)", un: "m",
        qtd: g => Math.ceil(g.perimetroApto * 0.6 * g.totalAptos), base: 12 }
    ] : modalidade === "steelframe" ? [
      // Perfis LSF: R$14–20/kg → base R$17/kg (IBRACON/Arquitecasa 2025)
      { k: "perfis_lsf",   nome: "Perfis aço galvanizado LSF", un: "kg",
        qtd: g => Math.ceil(g.areaTotal * 18 * w), base: 17 },
      // OSB 11mm: R$70–90/m² → base R$78/m²
      { k: "osb",          nome: "OSB estrutural 11,1mm",     un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 1.05 + g.areaTotal * 0.3), base: 78 },
      { k: "paraf_lsf",    nome: "Parafusos autoperfurantes", un: "mi",
        qtd: g => Math.ceil(g.areaTotal * 0.08), base: 210 },
      { k: "membrana",     nome: "Membrana hidrófuga",        un: "m²",
        qtd: g => Math.ceil(g.areaParedeApto * g.totalAptos * 0.6), base: 22 }
    ] : modalidade === "metalica" ? [
      // Perfis I/H/W: R$18–25/kg → base R$22/kg (Bepex/SINAPI 2025)
      { k: "perfis_pes",   nome: "Perfis estruturais I/H/W",  un: "kg",
        qtd: g => Math.ceil(g.areaTotal * 45 * w), base: 22 },
      // Steel deck (painel): R$120–165/m² → base R$145/m² (mercado 2025, só painel)
      { k: "steel_deck",   nome: "Laje steel deck (painel)",  un: "m²",
        qtd: g => Math.ceil(g.areaTotal * 0.95), base: 145 },
      // Concreto capeamento fck 25: R$300–380/m³ → base R$360/m³
      { k: "cap_conc",     nome: "Concreto capeamento fck 25", un: "m³",
        qtd: g => Math.ceil(g.areaTotal * 0.10 * w), base: 360 },
      { k: "solda_chumb",  nome: "Solda/parafusos/chumbadores", un: "vb",
        qtd: g => Math.ceil(g.areaTotal), base: 88 }
    ] : [
      // Concreto fck 30 bombeado: R$300–450/m³ → base R$390/m³ (SINAPI/SP 2025)
      { k: "conc_estr",    nome: "Concreto fck 30 (pilar/viga/laje)", un: "m³",
        qtd: g => Math.ceil(g.areaTotal * 0.22 * w), base: 390 },
      // Aço CA-50: R$8–12/kg → base R$10/kg
      { k: "aco_estr",     nome: "Aço CA-50 estrutura",       un: "kg",
        qtd: g => Math.ceil(g.areaTotal * 18 * w), base: 10 },
      { k: "formas_estr",  nome: "Formas de madeira compensada", un: "m²",
        qtd: g => Math.ceil(g.areaTotal * 2.4), base: 98 },
      { k: "escora",       nome: "Escoramento metálico (loc.)", un: "m²",
        qtd: g => Math.ceil(g.areaTotal * 0.8), base: 42 }
    ]};
  const ved = { id: "vedacao", nome: `Vedação interna — ${VEDACOES[vedacao].label}`,
    mats: vedacao === "alvenaria" ? [
      // Bloco cerâmico 14×19×29: R$2,20–3,20/un → base R$2,80/un (mercado 2025)
      { k: "bloco",     nome: "Bloco cerâmico 14×19×29", un: "un",
        qtd: g => Math.ceil(g.areaParedeTot * 24 * w), base: 2.8 },
      { k: "argamassa", nome: "Argamassa assentamento",  un: "kg",
        qtd: g => Math.ceil(g.areaParedeTot * 18), base: 1.3 },
      // Chapisco+emboço+reboco ambas faces: R$45–65/m² → base R$52/m² (Cronoshare 2026)
      { k: "reboco",    nome: "Chapisco+emboço+reboco (ambas faces)", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 2), base: 52 },
      { k: "vergas",    nome: "Vergas/contravergas",     un: "m",
        qtd: g => Math.ceil(g.perimetroApto * 0.6 * g.totalAptos), base: 45 }
      // Custo total ~R$195–215/m² parede, coerente com Sienge 2025: R$200–215/m²
    ] : vedacao === "drywall" ? [
      // Drywall simples instalado: R$80–140/m² total (Cronoshare 2025)
      // Placa gesso ST: R$35–45/m² → base R$38/m²
      { k: "gesso",       nome: "Placa gesso ST 12,5mm",   un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 2.05), base: 38 },
      // Perfis 48mm: R$10–16/m → base R$13/m
      { k: "perfis_dry",  nome: "Perfis montante/guia 48mm", un: "m",
        qtd: g => Math.ceil(g.areaParedeTot * 2.8), base: 13 },
      { k: "massa_fita",  nome: "Massa+fita+parafusos",    un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 2), base: 16 },
      { k: "la_vidro",    nome: "Lã de vidro 50mm",        un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 0.4), base: 30 }
      // Total ~R$110–130/m², coerente com mercado R$80–140/m²
    ] : vedacao === "drywallAcustico" ? [
      // Drywall acústico instalado: R$180–240/m² total (Sienge 2025)
      // Placa gesso dupla (RU): R$45–55/m² → base R$50/m²
      { k: "gesso_dup",   nome: "Placa gesso dupla (RU/ST)", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 4.1), base: 50 },
      { k: "perf_ref",    nome: "Perfis reforçados",       un: "m",
        qtd: g => Math.ceil(g.areaParedeTot * 2.8), base: 22 },
      // Lã mineral acústica 70mm: R$65–80/m² → base R$72/m²
      { k: "la_min",      nome: "Lã mineral acústica 70mm", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot), base: 72 },
      { k: "banda_ac",    nome: "Banda acústica + vedação", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 2), base: 28 }
      // Total ~R$185–220/m², coerente com mercado R$180–240/m²
    ] : [
      // Steel Frame + placa cimentícia: similar ao LSF (estrutura já considera como base)
      { k: "cim_placa",   nome: "Placa cimentícia 10mm",   un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 2.05), base: 72 },
      { k: "perf_gal",    nome: "Perfis aço galvanizado LSF", un: "m",
        qtd: g => Math.ceil(g.areaParedeTot * 2.8), base: 17 },
      { k: "la_memb",     nome: "Lã de vidro + membrana hidrófuga", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 0.9), base: 45 },
      { k: "paraf_jun",   nome: "Parafusos + tratamento juntas", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 2), base: 16 }
    ]};
  const cobertura = { id: "cobertura", nome: "Cobertura e Impermeabilização", mats: [
    { k: "manta",  nome: "Manta asfáltica 4mm",      un: "m²",
      qtd: g => Math.ceil(g.areaProjecao * 1.1), base: 62 },
    { k: "telha",  nome: "Telha (metálica/cerâmica)", un: "m²",
      qtd: g => Math.ceil(g.areaProjecao * 1.15), base: 78 },
    { k: "calha",  nome: "Calhas e rufos",           un: "m",
      qtd: g => Math.ceil(4 * Math.sqrt(g.areaProjecao) * 1.2), base: 98 },
    { k: "isolam", nome: "Isolamento térmico",       un: "m²",
      qtd: g => Math.ceil(g.areaProjecao), base: 42 }
  ]};
  const esquadrias = { id: "esquadrias", nome: "Esquadrias (Portas e Janelas)", mats: [
    { k: "porta_ent", nome: "Porta entrada (apto)",  un: "un",
      qtd: g => g.totalAptos, base: 1450 },
    { k: "porta_int", nome: "Portas internas",       un: "un",
      qtd: g => g.totalAptos * 3, base: 580 },
    { k: "janela",    nome: "Janelas alumínio",      un: "m²",
      qtd: g => Math.ceil(g.totalAptos * 9), base: 780 },
    { k: "ferragem",  nome: "Ferragens e fechaduras", un: "cj",
      qtd: g => g.totalAptos * 4, base: 220 }
  ]};
  const revestim = { id: "revestimentos", nome: "Revestimentos e Pisos", mats: [
    { k: "porcelanato", nome: "Porcelanato piso",          un: "m²",
      qtd: g => Math.ceil(g.areaTotal * 1.05), base: 88 },
    { k: "azulejo",     nome: "Azulejo banheiro + cozinha", un: "m²",
      qtd: g => Math.ceil(g.areaAzulTot * 1.1), base: 75 },
    { k: "arg_cola",    nome: "Argamassa colante ACIII",   un: "kg",
      qtd: g => Math.ceil((g.areaTotal + g.areaAzulTot) * 5), base: 2.2 },
    { k: "rodape",      nome: "Rodapé e soleiras",         un: "m",
      qtd: g => Math.ceil(g.perimetroApto * g.totalAptos), base: 32 }
  ]};
  const hidraulica = { id: "hidraulica", nome: "Instalações Hidrossanitárias", mats: [
    { k: "tubos",     nome: "Tubos e conexões PVC (kit/apto)", un: "cj",
      qtd: g => g.totalAptos, base: 2600 },
    { k: "loucas",    nome: "Louças sanitárias (vaso+lavatório)", un: "cj",
      qtd: g => g.totalAptos, base: 1650 },
    { k: "metais",    nome: "Metais sanitários",          un: "cj",
      qtd: g => g.totalAptos, base: 1250 },
    { k: "registros", nome: "Registros e válvulas",       un: "cj",
      qtd: g => g.totalAptos, base: 520 },
    { k: "cx_agua",   nome: "Caixa d'água + barrilete",   un: "vb",
      qtd: g => 1, base: 10000 }
  ]};
  const eletrica = { id: "eletrica", nome: "Instalações Elétricas", mats: [
    { k: "qdc",     nome: "Quadro distribuição (QDC)",  un: "un",
      qtd: g => g.totalAptos + 1, base: 420 },
    { k: "fios",    nome: "Fios e cabos",               un: "m",
      qtd: g => Math.ceil(g.areaTotal * 12), base: 5.2 },
    { k: "eletrod", nome: "Eletrodutos",                un: "m",
      qtd: g => Math.ceil(g.areaTotal * 4), base: 7.2 },
    { k: "tomada",  nome: "Tomadas + interruptores",    un: "un",
      qtd: g => Math.ceil(g.totalAptos * 18), base: 32 },
    { k: "disj",    nome: "Disjuntores + DR",           un: "un",
      qtd: g => g.totalAptos * 8, base: 52 }
  ]};
  const pintura = { id: "pintura", nome: "Pintura", mats: [
    { k: "massa",   nome: "Massa corrida/acrílica",     un: "kg",
      qtd: g => Math.ceil(g.areaParedeTot * 2 * 0.8), base: 9 },
    { k: "tinta",   nome: "Tinta látex/acrílica",       un: "L",
      qtd: g => Math.ceil(g.areaParedeTot * 2 * 0.12), base: 45 },
    { k: "selador", nome: "Selador/fundo",              un: "L",
      qtd: g => Math.ceil(g.areaParedeTot * 2 * 0.06), base: 34 },
    { k: "mo_pint", nome: "Mão de obra aplicação",      un: "m²",
      qtd: g => Math.ceil(g.areaParedeTot * 2), base: 22 }
  ]};
  const limpeza = { id: "limpeza", nome: "Limpeza e Finalização", mats: [
    { k: "cacamba",   nome: "Caçambas de entulho",        un: "un",
      qtd: g => Math.ceil(g.areaTotal * 0.02 * w), base: 420 },
    { k: "limp_obra", nome: "Limpeza pós-obra",           un: "m²",
      qtd: g => Math.ceil(g.areaTotal), base: 14 },
    { k: "polimento", nome: "Polimento e finalização",    un: "m²",
      qtd: g => Math.ceil(g.areaTotal * 0.3), base: 26 }
  ]};
  return [preliminares, fundacao, estrutura, ved, cobertura,
          esquadrias, revestim, hidraulica, eletrica, pintura, limpeza];
}

/* -------------- Cálculo -------------- */
function calcular(inp, over, preset) {
  const g = geometria(inp);
  const cat = catalogo(g.modalidade, g.vedacao);
  const mult = PRESETS[preset].mult;
  const removidos = over.removidos || {};
  const precos    = over.precos    || {};
  const qtds      = over.qtds      || {};
  const custom    = over.custom    || {};

  const etapas = cat.map(et => {
    const matsCat = et.mats
      .filter(m => !removidos[`${et.id}.${m.k}`])
      .map(m => {
        const key = `${et.id}.${m.k}`;
        const qtdCalc = m.qtd(g);
        const qtd = qtds[key] !== undefined ? num(qtds[key]) : qtdCalc;
        const punit = precos[key] !== undefined ? num(precos[key]) : m.base * mult;
        return { key, nome: m.nome, un: m.un, qtd, punit,
                 subtotal: qtd * punit, auto: qtds[key] === undefined, custom: false };
      });
    const matsCustom = (custom[et.id] || []).map(c => ({
      key: c.key, nome: c.nome, un: c.un,
      qtd: num(c.qtd), punit: num(c.punit),
      subtotal: num(c.qtd) * num(c.punit),
      auto: false, custom: true
    }));
    const mats = [...matsCat, ...matsCustom];
    const valor = mats.reduce((s, m) => s + m.subtotal, 0);
    return { id: et.id, nome: et.nome, mats, valor };
  });
  const custoTotal = etapas.reduce((s, e) => s + e.valor, 0);
  const custoM2    = g.areaTotal > 0 ? custoTotal / g.areaTotal : 0;
  const custoApto  = g.totalAptos > 0 ? custoTotal / g.totalAptos : 0;
  return { ...g, etapas, custoTotal, custoM2, custoApto };
}

/* -------------- UI helpers -------------- */
const inputStyle = {
  width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1",
  borderRadius: 6, fontSize: 13, background: "#fff", boxSizing: "border-box"
};

// Numeric input que aceita "", "2.5", "2,5", "2."
function NumInput({ value, onChange, style, placeholder, min }) {
  const display = value === undefined || value === null
    ? "" : String(value).replace(".", ",");
  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "" || /^-?\d*[.,]?\d*$/.test(raw)) {
          onChange(raw);
        }
      }}
      style={style || inputStyle}
    />
  );
}

function Campo({ label, children, hint }) {
  return (
    <label style={{ display: "block", marginBottom: 10, fontSize: 13 }}>
      <span style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>
        {label}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: "#64748b" }}>{hint}</span>}
    </label>
  );
}

function Metric({ label, valor, hint, destaque, cor }) {
  return (
    <div style={{
      background: destaque ? cor : "#f8fafc",
      color: destaque ? "#fff" : "#0f172a",
      padding: 8, borderRadius: 6
    }}>
      <div style={{ fontSize: 11, opacity: 0.85 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700 }}>{valor}</div>
      {hint && <div style={{ fontSize: 10, opacity: 0.8 }}>{hint}</div>}
    </div>
  );
}

/* -------------- Formulário -------------- */
function Formulario({ titulo, cor, inp, setInp, preset, setPreset, onResetPrecos }) {
  const setN = (k) => (raw) => setInp({ ...inp, [k]: raw });
  const setS = (k) => (e) => setInp({ ...inp, [k]: e.target.value });
  const vedOk = Object.entries(VEDACOES).filter(([k]) =>
    !(inp.modalidade === "steelframe" && k === "alvenaria") &&
    !(inp.modalidade === "alv_estrutural" && k === "alvenaria"));

  // Resolver os 4 campos interdependentes
  const r = resolverCampos(inp);

  // Ao trocar qual campo é calculado, copia o valor resolvido atual
  // para o state do campo que antes era calculado (evita "pulos").
  const setCalculado = (novo) => {
    const mapa = { areaPavimento: "A_pav", areaApto: "A_apt", nApt: "n_apt", nPav: "n_pav" };
    const prevKey = mapa[inp.calculado];
    const valResolvido = r[prevKey];
    setInp({
      ...inp,
      [inp.calculado]: String(valResolvido).replace(".", ","),
      calculado: novo
    });
  };

  // Renderiza um campo interdependente: se for o "calculado",
  // mostra o valor resolvido em readonly; caso contrário, input normal.
  const campoInter = (key, label, hint) => {
    const mapa = { areaPavimento: "A_pav", areaApto: "A_apt", nApt: "n_apt", nPav: "n_pav" };
    const ehCalc = inp.calculado === key;
    const valExib = ehCalc ? r[mapa[key]] : inp[key];
    return (
      <Campo label={
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>{label}</span>
          {ehCalc && <span style={{
            fontSize: 9, background: "#16a34a", color: "#fff",
            padding: "1px 6px", borderRadius: 8, fontWeight: 700
          }}>AUTO</span>}
        </span>
      } hint={hint}>
        <NumInput
          value={ehCalc ? String(valExib).replace(".", ",") : inp[key]}
          onChange={ehCalc ? () => {} : setN(key)}
          style={ehCalc
            ? { ...inputStyle, background: "#f0fdf4", color: "#166534",
                fontWeight: 600, cursor: "not-allowed" }
            : inputStyle}
        />
      </Campo>
    );
  };

  return (
    <div style={{
      background: "#fff", border: `2px solid ${cor}`, borderRadius: 10,
      padding: 14, flex: 1, minWidth: 280
    }}>
      <h3 style={{ margin: "0 0 10px", color: cor, fontSize: 15 }}>{titulo}</h3>

      <div style={{
        background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6,
        padding: 8, marginBottom: 10, fontSize: 12
      }}>
        <div style={{ fontWeight: 600, color: "#166534", marginBottom: 4 }}>
          Campo calculado automaticamente
        </div>
        <select style={inputStyle} value={inp.calculado}
                onChange={e => setCalculado(e.target.value)}>
          {Object.entries(CAMPOS_CALC).map(([k, v]) =>
            <option key={k} value={k}>{v}</option>)}
        </select>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
          Os outros 3 campos são editáveis e propagam para este.
        </div>
      </div>

      {campoInter("areaPavimento", "Área do pavimento (m²)", "Área de cada andar")}
      {campoInter("areaApto", "Área por apartamento (m²)", "1 quarto + 1 banheiro + sala/cozinha")}
      {campoInter("nApt", "Nº de apartamentos (total)")}
      {campoInter("nPav", "Nº de pavimentos")}

      <Campo label="Área do banheiro (m²)" hint="Aumenta área de azulejo">
        <NumInput value={inp.areaBanheiro} onChange={setN("areaBanheiro")} />
      </Campo>
      <Campo label="Pé-direito (m)" hint="Aumenta área de paredes, azulejo e pintura">
        <NumInput value={inp.peDireito} onChange={setN("peDireito")} />
      </Campo>
      <Campo label="Modalidade construtiva">
        <select style={inputStyle} value={inp.modalidade}
          onChange={(e) => {
            const nova = e.target.value;
            const ved = ((nova === "steelframe" || nova === "alv_estrutural") && inp.vedacao === "alvenaria")
              ? "drywall" : inp.vedacao;
            setInp({ ...inp, modalidade: nova, vedacao: ved });
          }}>
          {Object.entries(MODALIDADES).map(([k, v]) =>
            <option key={k} value={k}>{v.label}</option>)}
        </select>
      </Campo>
      <Campo label="Sistema de vedação interna">
        <select style={inputStyle} value={inp.vedacao} onChange={setS("vedacao")}>
          {vedOk.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </Campo>
      <Campo label="Preset de qualidade dos materiais"
             hint="Semeia preços iniciais — você pode editar cada material abaixo">
        <div style={{ display: "flex", gap: 6 }}>
          <select style={inputStyle} value={preset} onChange={e => setPreset(e.target.value)}>
            {Object.entries(PRESETS).map(([k, v]) =>
              <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={onResetPrecos} style={{
            padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6,
            background: "#f8fafc", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap"
          }}>Resetar</button>
        </div>
      </Campo>
    </div>
  );
}

/* -------------- Tabela de materiais editável -------------- */
const cellInp = {
  width: "100%", padding: "3px 5px", fontSize: 11,
  border: "1px solid #cbd5e1", borderRadius: 4, textAlign: "right",
  boxSizing: "border-box", background: "#fff"
};
const cellInpL = { ...cellInp, textAlign: "left" };

function EtapasTabela({ res, cor, over, setOver }) {
  const [expand, setExpand] = useState({});
  const [editMode, setEditMode] = useState({});

  const maxPct = Math.max(...res.etapas.map(e => e.valor / (res.custoTotal || 1)));

  const setPreco = (key, v) => setOver({ ...over, precos: { ...(over.precos||{}), [key]: v }});
  const setQtd   = (key, v) => setOver({ ...over, qtds:   { ...(over.qtds  ||{}), [key]: v }});
  const remover  = (key)    => setOver({ ...over, removidos: { ...(over.removidos||{}), [key]: true }});
  const setCustomField = (etapaId, idx, field, v) => {
    const custom = { ...(over.custom || {}) };
    const arr = [...(custom[etapaId] || [])];
    arr[idx] = { ...arr[idx], [field]: v };
    custom[etapaId] = arr;
    setOver({ ...over, custom });
  };
  const adicionarCustom = (etapaId) => {
    const custom = { ...(over.custom || {}) };
    const arr = [...(custom[etapaId] || [])];
    arr.push({
      key: `custom_${etapaId}_${Date.now()}`,
      nome: "Novo item", un: "un", qtd: "1", punit: "0"
    });
    custom[etapaId] = arr;
    setOver({ ...over, custom });
  };
  const removerCustom = (etapaId, idx) => {
    const custom = { ...(over.custom || {}) };
    const arr = [...(custom[etapaId] || [])];
    arr.splice(idx, 1);
    custom[etapaId] = arr;
    setOver({ ...over, custom });
  };

  return (
    <div style={{ marginTop: 10 }}>
      {res.etapas.map((e, i) => {
        const pct = e.valor / (res.custoTotal || 1);
        const ed = !!editMode[e.id];
        const customList = (over.custom || {})[e.id] || [];
        return (
          <div key={e.id} style={{
            border: "1px solid #e2e8f0", borderRadius: 6, marginBottom: 6, background: "#fff"
          }}>
            <div
              onClick={() => setExpand({ ...expand, [e.id]: !expand[e.id] })}
              style={{ padding: "8px 10px", cursor: "pointer", display: "flex",
                       alignItems: "center", gap: 10, fontSize: 13 }}>
              <span style={{ width: 16, color: "#64748b" }}>{expand[e.id] ? "▾" : "▸"}</span>
              <span style={{ flex: 1, fontWeight: 600, color: "#1e293b" }}>{e.nome}</span>
              <span style={{ width: 70, textAlign: "right", color: "#475569" }}>
                {fmtN(pct * 100, 1)}%
              </span>
              <div style={{ width: 100, height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${(pct / (maxPct || 1)) * 100}%`, height: "100%", background: CORES[i % CORES.length] }} />
              </div>
              <span style={{ width: 130, textAlign: "right", fontWeight: 600, color: cor }}>
                {fmtBRL(e.valor)}
              </span>
            </div>
            {expand[e.id] && (
              <div style={{ padding: "6px 10px 10px 20px", background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    {e.mats.length} {e.mats.length === 1 ? "item" : "itens"}
                  </span>
                  <button onClick={(ev) => { ev.stopPropagation(); setEditMode({ ...editMode, [e.id]: !ed }); }}
                          style={{
                            padding: "4px 10px", fontSize: 11, border: "1px solid #cbd5e1",
                            borderRadius: 4, background: ed ? "#fef3c7" : "#fff", cursor: "pointer"
                          }}>
                    {ed ? "✓ Pronto" : "✎ Editar itens"}
                  </button>
                </div>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ color: "#64748b", textAlign: "left" }}>
                      <th style={{ padding: 4, width: "38%" }}>Material</th>
                      <th style={{ padding: 4, width: 80, textAlign: "right" }}>Qtd</th>
                      <th style={{ padding: 4, width: 60 }}>Un</th>
                      <th style={{ padding: 4, width: 110, textAlign: "right" }}>Preço unit.</th>
                      <th style={{ padding: 4, textAlign: "right" }}>Subtotal</th>
                      {ed && <th style={{ width: 28 }}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {e.mats.map((m) => {
                      const idxCustom = m.custom
                        ? customList.findIndex(c => c.key === m.key) : -1;
                      return (
                        <tr key={m.key} style={{ borderTop: "1px solid #e2e8f0" }}>
                          <td style={{ padding: 4 }}>
                            {ed && m.custom ? (
                              <input type="text" value={customList[idxCustom]?.nome || ""}
                                onChange={ev => setCustomField(e.id, idxCustom, "nome", ev.target.value)}
                                style={cellInpL} />
                            ) : (
                              <span>{m.nome}{m.custom && <span style={{ color:"#db2777", fontSize:10 }}> ✚</span>}</span>
                            )}
                          </td>
                          <td style={{ padding: 4, textAlign: "right" }}>
                            {ed ? (
                              <NumInput
                                style={cellInp}
                                value={m.custom
                                  ? customList[idxCustom]?.qtd
                                  : ((over.qtds||{})[m.key] !== undefined
                                      ? (over.qtds||{})[m.key] : m.qtd)}
                                onChange={(v) => m.custom
                                  ? setCustomField(e.id, idxCustom, "qtd", v)
                                  : setQtd(m.key, v)}
                              />
                            ) : fmtN(m.qtd, 0)}
                          </td>
                          <td style={{ padding: 4 }}>
                            {ed && m.custom ? (
                              <input type="text" value={customList[idxCustom]?.un || ""}
                                onChange={ev => setCustomField(e.id, idxCustom, "un", ev.target.value)}
                                style={cellInpL} />
                            ) : m.un}
                          </td>
                          <td style={{ padding: 4, textAlign: "right" }}>
                            {ed ? (
                              <NumInput
                                style={cellInp}
                                value={m.custom
                                  ? customList[idxCustom]?.punit
                                  : ((over.precos||{})[m.key] !== undefined
                                      ? (over.precos||{})[m.key] : m.punit.toFixed(2))}
                                onChange={(v) => m.custom
                                  ? setCustomField(e.id, idxCustom, "punit", v)
                                  : setPreco(m.key, v)}
                              />
                            ) : fmtBRL(m.punit)}
                          </td>
                          <td style={{ padding: 4, textAlign: "right", fontWeight: 600 }}>
                            {fmtBRL(m.subtotal)}
                          </td>
                          {ed && (
                            <td style={{ padding: 4, textAlign: "center" }}>
                              <button onClick={() =>
                                  m.custom ? removerCustom(e.id, idxCustom) : remover(m.key)}
                                title="Remover"
                                style={{ border: "none", background: "transparent",
                                         color: "#dc2626", cursor: "pointer", fontSize: 14,
                                         padding: 0, lineHeight: 1 }}>✕</button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {ed && (
                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => adicionarCustom(e.id)} style={{
                      padding: "4px 10px", fontSize: 11, border: "1px dashed #94a3b8",
                      borderRadius: 4, background: "#fff", cursor: "pointer", color: "#475569"
                    }}>+ Adicionar material</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Resumo({ titulo, cor, inp, res, over, setOver, preset }) {
  const alertas = [];
  if (!res.aptoValido)
    alertas.push("Área do apto incompatível: banheiro + quarto (8m²) + sala (6m² mín) não cabem.");
  if ((inp.modalidade === "steelframe" || inp.modalidade === "alv_estrutural") && inp.vedacao === "alvenaria")
    alertas.push("Vedação de alvenaria não é compatível com esta modalidade construtiva.");
  if (res.totalAptos === 0)
    alertas.push("Nenhum apto cabe no pavimento — reduza área do apto ou aumente área do pavimento.");
  return (
    <div style={{
      background: "#fff", border: `2px solid ${cor}`, borderRadius: 10, padding: 14, flex: 1
    }}>
      <h3 style={{ margin: "0 0 10px", color: cor, fontSize: 15 }}>{titulo}</h3>
      {alertas.map((a, i) => (
        <div key={i} style={{
          background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca",
          padding: 8, borderRadius: 6, fontSize: 12, marginBottom: 6
        }}>⚠ {a}</div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
        <Metric label="Custo total"            valor={fmtBRL(res.custoTotal)} destaque cor={cor} />
        <Metric label="Custo/m² realizado"     valor={fmtBRL(res.custoM2)} destaque cor="#16a34a" />
        <Metric label="Pavimentos"             valor={`${res.pavimentos}`} />
        <Metric label="Apartamentos"
                valor={`${res.totalAptos}`}
                hint={res.aptosVazios > 0
                  ? `Capacidade do prédio: ${res.capacidade} (${res.aptosVazios} slot${res.aptosVazios>1?"s":""} vago${res.aptosVazios>1?"s":""})`
                  : `Capacidade exata (${res.aptosPorAndar}/andar)`} />
        <Metric label="Área total construída"  valor={`${fmtN(res.areaTotal, 0)} m²`} />
        <Metric label="Área parede total"      valor={`${fmtN(res.areaParedeTot, 0)} m²`} />
        <Metric label="Área azulejo total"     valor={`${fmtN(res.areaAzulTot, 0)} m²`} />
        <Metric label="Custo/apto"             valor={fmtBRL(res.custoApto)} />
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        {MODALIDADES[inp.modalidade].descr} · Desperdício {fmtN(MODALIDADES[inp.modalidade].desperdicio * 100, 0)}% · Preset: {PRESETS[preset].label}
      </div>
      <EtapasTabela res={res} cor={cor} over={over} setOver={setOver} />
    </div>
  );
}

/* -------------- Root -------------- */
const CORES = ["#2563eb","#7c3aed","#db2777","#dc2626","#ea580c","#ca8a04",
               "#16a34a","#0891b2","#0284c7","#4338ca","#9333ea"];

const defaultInp = {
  areaPavimento: "300", areaApto: "60", nApt: "10", nPav: "3",
  areaBanheiro: "4", peDireito: "2,8",
  modalidade: "alv_estrutural", vedacao: "drywall",
  calculado: "nPav"
};
const defaultInpB = {
  ...defaultInp, modalidade: "alvenaria", vedacao: "alvenaria"
};

const CAMPOS_CALC = {
  areaPavimento: "Área do pavimento",
  areaApto:      "Área do apartamento",
  nApt:          "Nº de apartamentos",
  nPav:          "Nº de pavimentos"
};

export default function SimuladorConstrucao() {
  const [inpA, setInpA] = useState(defaultInp);
  const [inpB, setInpB] = useState(defaultInpB);
  const [presetA, setPresetA] = useState("ultraEcon");
  const [presetB, setPresetB] = useState("popular");
  const [overA, setOverA] = useState({});
  const [overB, setOverB] = useState({});
  const [comparar, setComparar] = useState(false);

  const resA = useMemo(() => calcular(inpA, overA, presetA), [inpA, overA, presetA]);
  const resB = useMemo(() => calcular(inpB, overB, presetB), [inpB, overB, presetB]);

  const pieA = resA.etapas.map(e => ({ name: e.nome, value: e.valor }));
  const allEtapaIds = Array.from(new Set([
    ...resA.etapas.map(e => e.id), ...resB.etapas.map(e => e.id)
  ]));
  const barData = allEtapaIds.map(id => {
    const a = resA.etapas.find(e => e.id === id);
    const b = resB.etapas.find(e => e.id === id);
    return {
      nome: (a || b).nome.split(" ")[0].replace("—", "").slice(0, 12),
      "Cenário A": a?.valor || 0,
      "Cenário B": b?.valor || 0
    };
  });

  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, sans-serif",
      background: "#f1f5f9", minHeight: "100vh", padding: 16, color: "#0f172a"
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>
            Simulador de Custo de Construção — Edifício Residencial
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
            Custo bottom-up: geometria × preço unitário. Referência CUB/SINAPI 2025-2026 (custos diretos, sem BDI/honorários).
          </p>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13 }}>
            <input type="checkbox" checked={comparar} onChange={e => setComparar(e.target.checked)} />
            Comparar dois cenários
          </label>
        </header>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <Formulario titulo="Cenário A" cor="#2563eb" inp={inpA} setInp={setInpA}
                      preset={presetA} setPreset={setPresetA}
                      onResetPrecos={() => setOverA({})} />
          {comparar &&
            <Formulario titulo="Cenário B" cor="#db2777" inp={inpB} setInp={setInpB}
                        preset={presetB} setPreset={setPresetB}
                        onResetPrecos={() => setOverB({})} />}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: comparar ? "1fr 1fr" : "1fr",
          gap: 12, marginBottom: 16
        }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 12 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14, color: "#2563eb" }}>
              Distribuição por etapa — Cenário A
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieA} dataKey="value" nameKey="name" outerRadius={90} label={false}>
                  {pieA.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtBRL(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {comparar && (
            <div style={{ background: "#fff", borderRadius: 10, padding: 12 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Comparação A vs B por etapa</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="nome" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => fmtBRL(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Cenário A" fill="#2563eb" />
                  <Bar dataKey="Cenário B" fill="#db2777" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Resumo titulo="Resumo — Cenário A" cor="#2563eb" inp={inpA} res={resA}
                  over={overA} setOver={setOverA} preset={presetA} />
          {comparar &&
            <Resumo titulo="Resumo — Cenário B" cor="#db2777" inp={inpB} res={resB}
                    over={overB} setOver={setOverB} preset={presetB} />}
        </div>

        {comparar && (
          <div style={{ marginTop: 16, background: "#fff", borderRadius: 10, padding: 14 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Diferença A → B</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 13 }}>
              <Metric label="Δ Custo total"
                      valor={fmtBRL(resB.custoTotal - resA.custoTotal)}
                      hint={resA.custoTotal > 0
                        ? `${fmtN(((resB.custoTotal/resA.custoTotal)-1)*100, 1)}%` : "—"} />
              <Metric label="Δ Custo/m²" valor={fmtBRL(resB.custoM2 - resA.custoM2)} />
              <Metric label="Δ Apartamentos" valor={`${resB.totalAptos - resA.totalAptos}`} />
              <Metric label="Δ Custo/apto" valor={fmtBRL(resB.custoApto - resA.custoApto)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}