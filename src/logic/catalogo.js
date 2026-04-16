import { MODALIDADES, VEDACOES } from "../constants.js";

export function catalogo(modalidade, vedacao) {
  const desp = MODALIDADES[modalidade].desperdicio;
  const w = 1 + desp;
  const preliminares = { id: "preliminares", nome: "Serviços Preliminares", mats: [
    { k: "tapume",   nome: "Tapume de madeira h=2,2m", un: "m²",
      qtd: g => Math.ceil(4 * Math.sqrt(g.areaProjecao) * 2.2), base: 68 },
    { k: "locacao",  nome: "Locação + topografia", un: "vb",
      qtd: g => Math.max(1, Math.ceil(g.areaProjecao / 500 * g.fatorDuracao)), base: 4200 },
    { k: "barracao", nome: "Barracão de obra", un: "m²",
      qtd: g => Math.ceil(g.areaProjecao * 0.04 * g.fatorDuracao), base: 720 },
    { k: "provis",   nome: "Instalações provisórias", un: "vb",
      qtd: g => Math.ceil(g.fatorDuracao), base: 6500 }
  ]};
  const fundacao = { id: "fundacao", nome: `Fundação — ${MODALIDADES[modalidade].label}`,
    mats: modalidade === "alv_estrutural" ? [
      { k: "radier_ae",    nome: "Radier / sapata corrida fck 20", un: "m³",
        qtd: g => Math.ceil(g.areaProjecao * 0.12 * w * g.fatorCarga), base: 320 },
      { k: "tela_ae",      nome: "Tela soldada Q92",              un: "m²",
        qtd: g => Math.ceil(g.areaProjecao * 1.05 * g.fatorCarga), base: 32 },
      { k: "imperm_ae",    nome: "Impermeabilização + lona",      un: "m²",
        qtd: g => Math.ceil(g.areaProjecao),                     base: 38 },
      { k: "lastro_ae",    nome: "Lastro brita + regularização",  un: "m²",
        qtd: g => Math.ceil(g.areaProjecao),                     base: 35 }
    ] : modalidade === "steelframe" ? [
      { k: "radier_conc",  nome: "Concreto radier fck 25", un: "m³",
        qtd: g => Math.ceil(g.areaProjecao * 0.15 * w * g.fatorCarga), base: 340 },
      { k: "tela_sold",    nome: "Tela soldada Q138",      un: "m²",
        qtd: g => Math.ceil(g.areaProjecao * 1.05 * g.fatorCarga), base: 42 },
      { k: "lona_brita",   nome: "Lona plástica + brita",   un: "m²",
        qtd: g => Math.ceil(g.areaProjecao),               base: 30 },
      { k: "imperm_rad",   nome: "Impermeabilização radier", un: "m²",
        qtd: g => Math.ceil(g.areaProjecao),               base: 52 }
    ] : modalidade === "metalica" ? [
      { k: "estaca_helice", nome: "Estaca hélice contínua", un: "m",
        qtd: g => Math.ceil(g.areaProjecao * 0.9 * g.fatorCarga), base: 210 },
      { k: "conc_blocos",   nome: "Concreto blocos/vigas fck 25", un: "m³",
        qtd: g => Math.ceil(g.areaProjecao * 0.12 * w * g.fatorCarga), base: 370 },
      { k: "aco_fund",      nome: "Aço CA-50 fundação",     un: "kg",
        qtd: g => Math.ceil(g.areaProjecao * 35 * w * g.fatorCarga), base: 10 },
      { k: "formas_fund",   nome: "Formas de madeira",      un: "m²",
        qtd: g => Math.ceil(g.areaProjecao * 0.8 * g.fatorCarga), base: 98 }
    ] : [
      { k: "estaca_sap",    nome: "Estaca / sapata concreto fck 25", un: "m³",
        qtd: g => Math.ceil(g.areaProjecao * 0.20 * w * g.fatorCarga), base: 420 },
      { k: "aco_fund",      nome: "Aço CA-50 fundação",     un: "kg",
        qtd: g => Math.ceil(g.areaProjecao * 55 * w * g.fatorCarga), base: 10 },
      { k: "formas_fund",   nome: "Formas de madeira",      un: "m²",
        qtd: g => Math.ceil(g.areaProjecao * 1.2 * g.fatorCarga), base: 98 },
      { k: "lastro",        nome: "Lastro brita + regularização", un: "m²",
        qtd: g => Math.ceil(g.areaProjecao),                base: 42 }
    ]};
  const estrutura = { id: "estrutura", nome: `Estrutura — ${MODALIDADES[modalidade].label}`,
    mats: modalidade === "alv_estrutural" ? [
      { k: "bloco_estr",   nome: "Bloco concreto estrutural 14×19×39", un: "un",
        qtd: g => Math.ceil(g.areaParedeTot * 13 * w * g.fatorAltura), base: 3.50 },
      { k: "graute",       nome: "Graute fck 20 (canaletas/vertic.)", un: "L",
        qtd: g => Math.ceil(g.areaParedeTot * 2 * g.fatorAltura), base: 1.80 },
      { k: "aco_ae",       nome: "Aço CA-50/CA-60 (canaletas)",  un: "kg",
        qtd: g => Math.ceil(g.areaParedeTot * 4 * w * g.fatorAltura), base: 10 },
      { k: "argam_ae",     nome: "Argamassa assentamento",        un: "kg",
        qtd: g => Math.ceil(g.areaParedeTot * 18 * g.fatorAltura), base: 1.3 },
      { k: "laje_pre",     nome: "Laje pré-moldada treliçada + capa", un: "m²",
        qtd: g => Math.ceil(g.areaTotal * 1.05 * g.fatorAltura), base: 95 },
      { k: "vergas_ae",    nome: "Canaletas U (vergas/contravergas)", un: "m",
        qtd: g => Math.ceil(g.perimetroApto * 0.6 * g.totalAptos * g.fatorAltura), base: 12 }
    ] : modalidade === "steelframe" ? [
      { k: "perfis_lsf",   nome: "Perfis aço galvanizado LSF", un: "kg",
        qtd: g => Math.ceil(g.areaTotal * 18 * w * g.fatorAltura), base: 17 },
      { k: "osb",          nome: "OSB estrutural 11,1mm",     un: "m²",
        qtd: g => Math.ceil((g.areaParedeTot * 1.05 + g.areaTotal * 0.3) * g.fatorAltura), base: 78 },
      { k: "paraf_lsf",    nome: "Parafusos autoperfurantes", un: "mi",
        qtd: g => Math.ceil(g.areaTotal * 0.08 * g.fatorAltura), base: 210 },
      { k: "membrana",     nome: "Membrana hidrófuga",        un: "m²",
        qtd: g => Math.ceil(g.areaParedeApto * g.totalAptos * 0.6 * g.fatorAltura), base: 22 }
    ] : modalidade === "metalica" ? [
      { k: "perfis_pes",   nome: "Perfis estruturais I/H/W",  un: "kg",
        qtd: g => Math.ceil(g.areaTotal * 45 * w * g.fatorAltura), base: 22 },
      { k: "steel_deck",   nome: "Laje steel deck (painel)",  un: "m²",
        qtd: g => Math.ceil(g.areaTotal * 0.95 * g.fatorAltura), base: 145 },
      { k: "cap_conc",     nome: "Concreto capeamento fck 25", un: "m³",
        qtd: g => Math.ceil(g.areaTotal * 0.10 * w * g.fatorAltura), base: 360 },
      { k: "solda_chumb",  nome: "Solda/parafusos/chumbadores", un: "vb",
        qtd: g => Math.ceil(g.areaTotal * g.fatorAltura), base: 88 }
    ] : [
      { k: "conc_estr",    nome: "Concreto fck 30 (pilar/viga/laje)", un: "m³",
        qtd: g => Math.ceil(g.areaTotal * 0.22 * w * g.fatorAltura), base: 390 },
      { k: "aco_estr",     nome: "Aço CA-50 estrutura",       un: "kg",
        qtd: g => Math.ceil(g.areaTotal * 18 * w * g.fatorAltura), base: 10 },
      { k: "formas_estr",  nome: "Formas de madeira compensada", un: "m²",
        qtd: g => Math.ceil(g.areaTotal * 2.4 * g.fatorAltura), base: 98 },
      { k: "escora",       nome: "Escoramento metálico (loc.)", un: "m²",
        qtd: g => Math.ceil(g.areaTotal * 0.8 * g.fatorAltura), base: 42 }
    ]};
  const ved = { id: "vedacao", nome: `Vedação interna — ${VEDACOES[vedacao].label}`,
    mats: vedacao === "alvenaria" ? [
      { k: "bloco",     nome: "Bloco cerâmico 14×19×29", un: "un",
        qtd: g => Math.ceil(g.areaParedeTot * 24 * w), base: 2.8 },
      { k: "argamassa", nome: "Argamassa assentamento",  un: "kg",
        qtd: g => Math.ceil(g.areaParedeTot * 18), base: 1.3 },
      { k: "reboco",    nome: "Chapisco+emboço+reboco (ambas faces)", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 2), base: 52 },
      { k: "vergas",    nome: "Vergas/contravergas",     un: "m",
        qtd: g => Math.ceil(g.perimetroApto * 0.6 * g.totalAptos), base: 45 }
    ] : vedacao === "drywall" ? [
      { k: "gesso",       nome: "Placa gesso ST 12,5mm",   un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 2.05), base: 38 },
      { k: "perfis_dry",  nome: "Perfis montante/guia 48mm", un: "m",
        qtd: g => Math.ceil(g.areaParedeTot * 2.8), base: 13 },
      { k: "massa_fita",  nome: "Massa+fita+parafusos",    un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 2), base: 16 },
      { k: "la_vidro",    nome: "Lã de vidro 50mm",        un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 0.4), base: 30 }
    ] : vedacao === "drywallAcustico" ? [
      { k: "gesso_dup",   nome: "Placa gesso dupla (RU/ST)", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 4.1), base: 50 },
      { k: "perf_ref",    nome: "Perfis reforçados",       un: "m",
        qtd: g => Math.ceil(g.areaParedeTot * 2.8), base: 22 },
      { k: "la_min",      nome: "Lã mineral acústica 70mm", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot), base: 72 },
      { k: "banda_ac",    nome: "Banda acústica + vedação", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * 2), base: 28 }
    ] : [
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
      qtd: g => Math.max(1, Math.ceil(Math.pow(g.totalAptos, 0.65) / 4)), base: 10000 }
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
