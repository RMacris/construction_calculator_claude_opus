import { MODALIDADES, VEDACOES } from "../constants.js";
import R from "./refs.js";

const c = R.comum;

// Labels para campos de dimensões (usados no modal)
export const DIM_LABELS = {
  largura: "Largura", altura: "Altura", comprimento: "Comprimento", lado: "Lado"
};

export function catalogo(modalidade, vedacao) {
  const desp = MODALIDADES[modalidade].desperdicio;
  const w = 1 + desp;

  const pr = R.preliminares;
  const preliminares = { id: "preliminares", nome: "Serviços Preliminares", mats: [
    { k: "tapume",   nome: "Tapume de madeira h=2,2m", un: "m²", obr: true,
      qtd: g => Math.ceil(c.perimetroLados * Math.sqrt(g.areaProjecao) * pr.tapume.altura), base: pr.tapume.preco },
    { k: "locacao",  nome: "Locação + topografia", un: "vb",
      qtd: g => Math.max(1, Math.ceil(g.areaProjecao / pr.locacao.areaPorVerba * g.fatorDuracao)), base: pr.locacao.preco },
    { k: "barracao", nome: "Barracão de obra", un: "m²", obr: true,
      qtd: g => Math.ceil(g.areaProjecao * pr.barracao.fracao * g.fatorDuracao), base: pr.barracao.preco },
    { k: "provis",   nome: "Instalações provisórias", un: "vb",
      qtd: g => Math.ceil(g.fatorDuracao), base: pr.provis.preco }
  ]};

  const fundacao = { id: "fundacao", nome: `Fundação — ${MODALIDADES[modalidade].label}`,
    mats: modalidade === "alv_estrutural" ? (() => { const f = R.fundacao_alv_estrutural; return [
      { k: "radier_ae",    nome: "Radier / sapata corrida fck 20", un: "m³", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * f.radier_ae.espessura * w * g.fatorCarga), base: f.radier_ae.preco },
      { k: "tela_ae",      nome: "Tela soldada Q92",              un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * f.tela_ae.sobreposicao * g.fatorCarga), base: f.tela_ae.preco },
      { k: "imperm_ae",    nome: "Impermeabilização + lona",      un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaProjecao), base: f.imperm_ae.preco },
      { k: "lastro_ae",    nome: "Lastro brita + regularização",  un: "m²",
        qtd: g => Math.ceil(g.areaProjecao), base: f.lastro_ae.preco }
    ]; })() : modalidade === "steelframe" ? (() => { const f = R.fundacao_steelframe; return [
      { k: "radier_conc",  nome: "Concreto radier fck 25", un: "m³", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * f.radier_conc.espessura * w * g.fatorCarga), base: f.radier_conc.preco },
      { k: "tela_sold",    nome: "Tela soldada Q138",      un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * f.tela_sold.sobreposicao * g.fatorCarga), base: f.tela_sold.preco },
      { k: "lona_brita",   nome: "Lona plástica + brita",   un: "m²",
        qtd: g => Math.ceil(g.areaProjecao), base: f.lona_brita.preco },
      { k: "imperm_rad",   nome: "Impermeabilização radier", un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaProjecao), base: f.imperm_rad.preco }
    ]; })() : modalidade === "metalica" ? (() => { const f = R.fundacao_metalica; return [
      { k: "estaca_helice", nome: "Estaca hélice contínua", un: "m", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * f.estaca_helice.porM2 * g.fatorCarga), base: f.estaca_helice.preco },
      { k: "conc_blocos",   nome: "Concreto blocos/vigas fck 25", un: "m³", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * f.conc_blocos.espessura * w * g.fatorCarga), base: f.conc_blocos.preco },
      { k: "aco_fund",      nome: "Aço CA-50 fundação",     un: "kg", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * f.aco_fund.porM2 * w * g.fatorCarga), base: f.aco_fund.preco },
      { k: "formas_fund",   nome: "Formas de madeira",      un: "m²",
        qtd: g => Math.ceil(g.areaProjecao * f.formas_fund.porM2 * g.fatorCarga), base: f.formas_fund.preco }
    ]; })() : (() => { const f = R.fundacao_convencional; return [
      { k: "estaca_sap",    nome: "Estaca / sapata concreto fck 25", un: "m³", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * f.estaca_sap.volumePorM2 * w * g.fatorCarga), base: f.estaca_sap.preco },
      { k: "aco_fund",      nome: "Aço CA-50 fundação",     un: "kg", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * f.aco_fund.porM2 * w * g.fatorCarga), base: f.aco_fund.preco },
      { k: "formas_fund",   nome: "Formas de madeira",      un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * f.formas_fund.porM2 * g.fatorCarga), base: f.formas_fund.preco },
      { k: "lastro",        nome: "Lastro brita + regularização", un: "m²",
        qtd: g => Math.ceil(g.areaProjecao), base: f.lastro.preco }
    ]; })() };

  const estrutura = { id: "estrutura", nome: `Estrutura — ${MODALIDADES[modalidade].label}`,
    mats: modalidade === "alv_estrutural" ? (() => { const e = R.estrutura_alv_estrutural; return [
      { k: "bloco_estr",   nome: "Bloco concreto estrutural 14×19×39", un: "un", obr: true,
        dims: { ...e.bloco_estr.dims },
        qtd: (g, d) => { const a = (d?.altura||e.bloco_estr.dims.altura)/100 * (d?.comprimento||e.bloco_estr.dims.comprimento)/100;
          return Math.ceil(g.areaParedeTot / a * w * g.fatorAltura); }, base: e.bloco_estr.preco },
      { k: "graute",       nome: "Graute fck 20 (canaletas/vertic.)", un: "L",
        qtd: g => Math.ceil(g.areaParedeTot * e.graute.porM2 * g.fatorAltura), base: e.graute.preco },
      { k: "aco_ae",       nome: "Aço CA-50/CA-60 (canaletas)",  un: "kg", obr: true,
        qtd: g => Math.ceil(g.areaParedeTot * e.aco_ae.porM2 * w * g.fatorAltura), base: e.aco_ae.preco },
      { k: "argam_ae",     nome: "Argamassa assentamento",        un: "kg",
        qtd: g => Math.ceil(g.areaParedeTot * c.argamassaPorM2 * g.fatorAltura), base: e.argam_ae.preco },
      { k: "laje_pre",     nome: "Laje pré-moldada treliçada + capa", un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaTotal * e.laje_pre.sobreposicao * g.fatorAltura), base: e.laje_pre.preco },
      { k: "vergas_ae",    nome: "Canaletas U (vergas/contravergas)", un: "m",
        qtd: g => Math.ceil(g.perimetroApto * c.vergasFracao * g.totalAptos * g.fatorAltura), base: e.vergas_ae.preco }
    ]; })() : modalidade === "steelframe" ? (() => { const e = R.estrutura_steelframe; return [
      { k: "perfis_lsf",   nome: "Perfis aço galvanizado LSF", un: "kg", obr: true,
        qtd: g => Math.ceil(g.areaTotal * e.perfis_lsf.porM2 * w * g.fatorAltura), base: e.perfis_lsf.preco },
      { k: "osb",          nome: "OSB estrutural 11,1mm",     un: "m²", obr: true,
        qtd: g => Math.ceil((g.areaParedeTot * e.osb.sobrepParede + g.areaTotal * e.osb.fracaoLaje) * g.fatorAltura), base: e.osb.preco },
      { k: "paraf_lsf",    nome: "Parafusos autoperfurantes", un: "mi",
        qtd: g => Math.ceil(g.areaTotal * e.paraf_lsf.porM2 * g.fatorAltura), base: e.paraf_lsf.preco },
      { k: "membrana",     nome: "Membrana hidrófuga",        un: "m²",
        qtd: g => Math.ceil(g.areaParedeApto * g.totalAptos * e.membrana.fracao * g.fatorAltura), base: e.membrana.preco }
    ]; })() : modalidade === "metalica" ? (() => { const e = R.estrutura_metalica; return [
      { k: "perfis_pes",   nome: "Perfis estruturais I/H/W",  un: "kg", obr: true,
        qtd: g => Math.ceil(g.areaTotal * e.perfis_pes.porM2 * w * g.fatorAltura), base: e.perfis_pes.preco },
      { k: "steel_deck",   nome: "Laje steel deck (painel)",  un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaTotal * e.steel_deck.cobertura * g.fatorAltura), base: e.steel_deck.preco },
      { k: "cap_conc",     nome: "Concreto capeamento fck 25", un: "m³",
        qtd: g => Math.ceil(g.areaTotal * e.cap_conc.espessura * w * g.fatorAltura), base: e.cap_conc.preco },
      { k: "solda_chumb",  nome: "Solda/parafusos/chumbadores", un: "vb",
        qtd: g => Math.ceil(g.areaTotal * g.fatorAltura), base: e.solda_chumb.preco }
    ]; })() : (() => { const e = R.estrutura_convencional; return [
      { k: "conc_estr",    nome: "Concreto fck 30 (pilar/viga/laje)", un: "m³", obr: true,
        qtd: g => Math.ceil(g.areaTotal * e.conc_estr.porM2 * w * g.fatorAltura), base: e.conc_estr.preco },
      { k: "aco_estr",     nome: "Aço CA-50 estrutura",       un: "kg", obr: true,
        qtd: g => Math.ceil(g.areaTotal * e.aco_estr.porM2 * w * g.fatorAltura), base: e.aco_estr.preco },
      { k: "formas_estr",  nome: "Formas de madeira compensada", un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaTotal * e.formas_estr.porM2 * g.fatorAltura), base: e.formas_estr.preco },
      { k: "escora",       nome: "Escoramento metálico (loc.)", un: "m²",
        qtd: g => Math.ceil(g.areaTotal * e.escora.porM2 * g.fatorAltura), base: e.escora.preco }
    ]; })() };

  const ved = { id: "vedacao", nome: `Vedação interna — ${VEDACOES[vedacao].label}`,
    mats: vedacao === "alvenaria" ? (() => { const v = R.vedacao_alvenaria; return [
      { k: "bloco",     nome: "Bloco cerâmico 14×19×29", un: "un", obr: true,
        dims: { ...v.bloco.dims },
        qtd: (g, d) => { const a = (d?.altura||v.bloco.dims.altura)/100 * (d?.comprimento||v.bloco.dims.comprimento)/100;
          return Math.ceil(g.areaParedeTot / a * w); }, base: v.bloco.preco },
      { k: "argamassa", nome: "Argamassa assentamento",  un: "kg",
        qtd: g => Math.ceil(g.areaParedeTot * c.argamassaPorM2), base: v.argamassa.preco },
      { k: "reboco",    nome: "Chapisco+emboço+reboco (ambas faces)", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * v.reboco.faces), base: v.reboco.preco },
      { k: "vergas",    nome: "Vergas/contravergas",     un: "m",
        qtd: g => Math.ceil(g.perimetroApto * c.vergasFracao * g.totalAptos), base: v.vergas.preco }
    ]; })() : vedacao === "drywall" ? (() => { const v = R.vedacao_drywall; return [
      { k: "gesso",       nome: "Placa gesso ST 12,5mm (1,2×2,4m)", un: "un", obr: true,
        dims: { ...v.gesso.dims },
        qtd: (g, d) => { const a = (d?.largura||v.gesso.dims.largura) * (d?.altura||v.gesso.dims.altura);
          return Math.ceil(g.areaParedeTot * v.gesso.chapasPorFace / a); }, base: v.gesso.preco },
      { k: "perfis_dry",  nome: "Perfis montante/guia 48mm", un: "m",
        qtd: g => Math.ceil(g.areaParedeTot * v.perfis_dry.porM2), base: v.perfis_dry.preco },
      { k: "massa_fita",  nome: "Massa+fita+parafusos",    un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * v.massa_fita.faces), base: v.massa_fita.preco },
      { k: "la_vidro",    nome: "Lã de vidro 50mm",        un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * v.la_vidro.fracao), base: v.la_vidro.preco }
    ]; })() : vedacao === "drywallAcustico" ? (() => { const v = R.vedacao_drywallAcustico; return [
      { k: "gesso_dup",   nome: "Placa gesso dupla RU/ST (1,2×2,4m)", un: "un", obr: true,
        dims: { ...v.gesso_dup.dims },
        qtd: (g, d) => { const a = (d?.largura||v.gesso_dup.dims.largura) * (d?.altura||v.gesso_dup.dims.altura);
          return Math.ceil(g.areaParedeTot * v.gesso_dup.chapasPorFace / a); }, base: v.gesso_dup.preco },
      { k: "perf_ref",    nome: "Perfis reforçados",       un: "m",
        qtd: g => Math.ceil(g.areaParedeTot * v.perf_ref.porM2), base: v.perf_ref.preco },
      { k: "la_min",      nome: "Lã mineral acústica 70mm", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot), base: v.la_min.preco },
      { k: "banda_ac",    nome: "Banda acústica + vedação", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * v.banda_ac.faces), base: v.banda_ac.preco }
    ]; })() : (() => { const v = R.vedacao_steelframeInterno; return [
      { k: "cim_placa",   nome: "Placa cimentícia 10mm (1,2×2,4m)", un: "un", obr: true,
        dims: { ...v.cim_placa.dims },
        qtd: (g, d) => { const a = (d?.largura||v.cim_placa.dims.largura) * (d?.altura||v.cim_placa.dims.altura);
          return Math.ceil(g.areaParedeTot * v.cim_placa.chapasPorFace / a); }, base: v.cim_placa.preco },
      { k: "perf_gal",    nome: "Perfis aço galvanizado LSF", un: "m",
        qtd: g => Math.ceil(g.areaParedeTot * v.perf_gal.porM2), base: v.perf_gal.preco },
      { k: "la_memb",     nome: "Lã de vidro + membrana hidrófuga", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * v.la_memb.fracao), base: v.la_memb.preco },
      { k: "paraf_jun",   nome: "Parafusos + tratamento juntas", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * v.paraf_jun.faces), base: v.paraf_jun.preco }
    ]; })() };

  const cb = R.cobertura;
  const cobertura = { id: "cobertura", nome: "Cobertura e Impermeabilização", mats: [
    { k: "manta",  nome: "Manta asfáltica 4mm",      un: "m²", obr: true,
      qtd: g => Math.ceil(g.areaProjecao * cb.manta.sobreposicao), base: cb.manta.preco },
    { k: "telha",  nome: "Telha (metálica/cerâmica)", un: "un", obr: true,
      dims: { ...cb.telha.dims },
      qtd: (g, d) => { const a = (d?.largura||cb.telha.dims.largura)/100 * (d?.comprimento||cb.telha.dims.comprimento)/100 * cb.telha.coberturaUtil;
        return Math.ceil(g.areaProjecao * cb.telha.inclinacao / a); }, base: cb.telha.preco },
    { k: "calha",  nome: "Calhas e rufos",           un: "m",
      qtd: g => Math.ceil(c.perimetroLados * Math.sqrt(g.areaProjecao) * cb.calha.fatorPerimetro), base: cb.calha.preco },
    { k: "isolam", nome: "Isolamento térmico",       un: "m²",
      qtd: g => Math.ceil(g.areaProjecao), base: cb.isolam.preco }
  ]};

  const esq = R.esquadrias;
  const esquadrias = { id: "esquadrias", nome: "Esquadrias (Portas e Janelas)", mats: [
    { k: "porta_ent", nome: "Porta entrada (apto)",  un: "un", obr: true,
      qtd: g => g.totalAptos, base: esq.porta_ent.preco },
    { k: "porta_int", nome: "Portas internas",       un: "un",
      qtd: g => g.totalAptos * esq.porta_int.porApto, base: esq.porta_int.preco },
    { k: "janela",    nome: "Janelas alumínio",      un: "un", obr: true,
      dims: { ...esq.janela.dims },
      qtd: (g, d) => { const a = (d?.largura||esq.janela.dims.largura) * (d?.altura||esq.janela.dims.altura);
        return Math.ceil(g.totalAptos * esq.janela.areaPorApto / a); }, base: esq.janela.preco },
    { k: "ferragem",  nome: "Ferragens e fechaduras", un: "cj",
      qtd: g => g.totalAptos * esq.ferragem.porApto, base: esq.ferragem.preco }
  ]};

  const rv = R.revestimentos;
  const revestim = { id: "revestimentos", nome: "Revestimentos e Pisos", mats: [
    { k: "porcelanato", nome: "Porcelanato piso 60×60",    un: "un", obr: true,
      dims: { ...rv.porcelanato.dims },
      qtd: (g, d) => { const a = (d?.largura||rv.porcelanato.dims.largura)/100 * (d?.comprimento||rv.porcelanato.dims.comprimento)/100;
        return Math.ceil(g.areaTotal * rv.porcelanato.perda / a); }, base: rv.porcelanato.preco },
    { k: "azulejo",     nome: "Azulejo parede 30×60",     un: "un", obr: true,
      dims: { ...rv.azulejo.dims },
      qtd: (g, d) => { const a = (d?.largura||rv.azulejo.dims.largura)/100 * (d?.comprimento||rv.azulejo.dims.comprimento)/100;
        return Math.ceil(g.areaAzulTot * rv.azulejo.perda / a); }, base: rv.azulejo.preco },
    { k: "arg_cola",    nome: "Argamassa colante ACIII",   un: "kg",
      qtd: g => Math.ceil((g.areaTotal + g.areaAzulTot) * rv.arg_cola.porM2), base: rv.arg_cola.preco },
    { k: "rodape",      nome: "Rodapé e soleiras",         un: "m",
      qtd: g => Math.ceil(g.perimetroApto * g.totalAptos), base: rv.rodape.preco }
  ]};

  const hd = R.hidraulica;
  const hidraulica = { id: "hidraulica", nome: "Instalações Hidrossanitárias", mats: [
    { k: "tubos",     nome: "Tubos e conexões PVC (kit/apto)", un: "cj", obr: true,
      qtd: g => g.totalAptos, base: hd.tubos.preco },
    { k: "loucas",    nome: "Louças sanitárias (vaso+lavatório)", un: "cj", obr: true,
      qtd: g => g.totalAptos, base: hd.loucas.preco },
    { k: "metais",    nome: "Metais sanitários",          un: "cj",
      qtd: g => g.totalAptos, base: hd.metais.preco },
    { k: "registros", nome: "Registros e válvulas",       un: "cj",
      qtd: g => g.totalAptos, base: hd.registros.preco },
    { k: "cx_agua",   nome: "Caixa d'água + barrilete",   un: "vb",
      qtd: g => Math.max(1, Math.ceil(Math.pow(g.totalAptos, hd.cx_agua.expoente) / hd.cx_agua.divisor)), base: hd.cx_agua.preco }
  ]};

  const el = R.eletrica;
  const eletrica = { id: "eletrica", nome: "Instalações Elétricas", mats: [
    { k: "qdc",     nome: "Quadro distribuição (QDC)",  un: "un", obr: true,
      qtd: g => g.totalAptos + 1, base: el.qdc.preco },
    { k: "fios",    nome: "Fios e cabos",               un: "m", obr: true,
      qtd: g => Math.ceil(g.areaTotal * el.fios.porM2), base: el.fios.preco },
    { k: "eletrod", nome: "Eletrodutos",                un: "m",
      qtd: g => Math.ceil(g.areaTotal * el.eletrod.porM2), base: el.eletrod.preco },
    { k: "tomada",  nome: "Tomadas + interruptores",    un: "un",
      qtd: g => Math.ceil(g.totalAptos * el.tomada.porApto), base: el.tomada.preco },
    { k: "disj",    nome: "Disjuntores + DR",           un: "un",
      qtd: g => g.totalAptos * el.disj.porApto, base: el.disj.preco }
  ]};

  const pt = R.pintura;
  const pintura = { id: "pintura", nome: "Pintura", mats: [
    { k: "massa",   nome: "Massa corrida/acrílica",     un: "kg",
      qtd: g => Math.ceil(g.areaParedeTot * c.pinturaFaces * pt.massa.porM2Face), base: pt.massa.preco },
    { k: "tinta",   nome: "Tinta látex/acrílica",       un: "L", obr: true,
      qtd: g => Math.ceil(g.areaParedeTot * c.pinturaFaces * pt.tinta.porM2Face), base: pt.tinta.preco },
    { k: "selador", nome: "Selador/fundo",              un: "L",
      qtd: g => Math.ceil(g.areaParedeTot * c.pinturaFaces * pt.selador.porM2Face), base: pt.selador.preco },
    { k: "mo_pint", nome: "Mão de obra aplicação",      un: "m²",
      qtd: g => Math.ceil(g.areaParedeTot * c.pinturaFaces), base: pt.mo_pint.preco }
  ]};

  const lp = R.limpeza;
  const limpeza = { id: "limpeza", nome: "Limpeza e Finalização", mats: [
    { k: "cacamba",   nome: "Caçambas de entulho",        un: "un",
      qtd: g => Math.ceil(g.areaTotal * lp.cacamba.porM2 * w), base: lp.cacamba.preco },
    { k: "limp_obra", nome: "Limpeza pós-obra",           un: "m²",
      qtd: g => Math.ceil(g.areaTotal), base: lp.limp_obra.preco },
    { k: "polimento", nome: "Polimento e finalização",    un: "m²",
      qtd: g => Math.ceil(g.areaTotal * lp.polimento.fracao), base: lp.polimento.preco }
  ]};

  return [preliminares, fundacao, estrutura, ved, cobertura,
          esquadrias, revestim, hidraulica, eletrica, pintura, limpeza];
}
