import { MODALIDADES, VEDACOES } from "../constants.js";

import R from "./refs.js";

const coeficientesComuns = R.comum;

// Labels para campos de dimensões (usados no modal)
export const DIM_LABELS = {
  largura: "Largura", altura: "Altura", comprimento: "Comprimento", lado: "Lado"
};

export function catalogo(modalidade, vedacao) {
  const percentualDesperdicio = MODALIDADES[modalidade].desperdicio;
  const fatorDesperdicio = 1 + percentualDesperdicio;

  const etapaPreliminar = R.preliminares;
  const preliminares = { id: "preliminares", nome: "Serviços Preliminares", mats: [
    { k: "tapume",   nome: "Tapume de madeira h=2,2m", un: "m²", obr: true,
      qtd: g => Math.ceil(g.perimetroProjecao * etapaPreliminar.tapume.altura), base: etapaPreliminar.tapume.preco },
    { k: "locacao",  nome: "Locação + topografia", un: "vb",
      qtd: g => Math.max(1, Math.ceil(g.areaProjecao / etapaPreliminar.locacao.areaPorVerba * g.fatorDuracao)), base: etapaPreliminar.locacao.preco },
    { k: "barracao", nome: "Barracão de obra", un: "m²", obr: true,
      qtd: g => Math.ceil(g.areaProjecao * etapaPreliminar.barracao.fracao * g.fatorDuracao), base: etapaPreliminar.barracao.preco },
    { k: "provis",   nome: "Instalações provisórias", un: "vb",
      qtd: g => Math.ceil(g.fatorDuracao), base: etapaPreliminar.provis.preco }
  ]};

  const fundacao = { id: "fundacao", nome: `Fundação — ${MODALIDADES[modalidade].label}`,
    mats: modalidade === "alv_estrutural" ? (() => { const coeficientesFundacao = R.fundacao_alv_estrutural; return [
      { k: "radier_ae",    nome: "Radier / sapata corrida fck 20", un: "m³", obr: true,
        qtd: g => Math.ceil(g.volumeFundacao * 0.8 * fatorDesperdicio), base: coeficientesFundacao.radier_ae.preco },
      { k: "tela_ae",      nome: "Tela soldada Q92",              un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * coeficientesFundacao.tela_ae.sobreposicao), base: coeficientesFundacao.tela_ae.preco },
      { k: "imperm_ae",    nome: "Impermeabilização + lona",      un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaProjecao), base: coeficientesFundacao.imperm_ae.preco },
      { k: "lastro_ae",    nome: "Lastro brita + regularização",  un: "m²",
        qtd: g => Math.ceil(g.areaProjecao), base: coeficientesFundacao.lastro_ae.preco }
    ]; })() : modalidade === "steelframe" ? (() => { const coeficientesFundacao = R.fundacao_steelframe; return [
      { k: "radier_conc",  nome: "Concreto radier fck 25", un: "m³", obr: true,
        qtd: g => Math.ceil(g.volumeFundacao * fatorDesperdicio), base: coeficientesFundacao.radier_conc.preco },
      { k: "tela_sold",    nome: "Tela soldada Q138",      un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaProjecao * coeficientesFundacao.tela_sold.sobreposicao), base: coeficientesFundacao.tela_sold.preco },
      { k: "lona_brita",   nome: "Lona plástica + brita",   un: "m²",
        qtd: g => Math.ceil(g.areaProjecao), base: coeficientesFundacao.lona_brita.preco },
      { k: "imperm_rad",   nome: "Impermeabilização radier", un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaProjecao), base: coeficientesFundacao.imperm_rad.preco }
    ]; })() : modalidade === "metalica" ? (() => { const coeficientesFundacao = R.fundacao_metalica; return [
      { k: "estaca_helice", nome: "Estaca hélice contínua", un: "m", obr: true,
        qtd: g => Math.ceil(g.cargaTotalEdificio * coeficientesFundacao.estaca_helice.porTonelada), base: coeficientesFundacao.estaca_helice.preco },
      { k: "conc_blocos",   nome: "Concreto blocos/vigas fck 25", un: "m³", obr: true,
        qtd: g => Math.ceil(g.volumeFundacao * 0.9 * fatorDesperdicio), base: coeficientesFundacao.conc_blocos.preco },
      { k: "aco_fund",      nome: "Aço CA-50 fundação",     un: "kg", obr: true,
        qtd: g => Math.ceil(g.volumeFundacao * coeficientesFundacao.aco_fund.porVolume * fatorDesperdicio), base: coeficientesFundacao.aco_fund.preco },
      { k: "formas_fund",   nome: "Formas de madeira",      un: "m²",
        qtd: g => Math.ceil(g.areaProjecao * coeficientesFundacao.formas_fund.porM2), base: coeficientesFundacao.formas_fund.preco }
    ]; })() : (() => { const coeficientesFundacao = R.fundacao_convencional; return [
      { k: "estaca_sap",    nome: "Estaca / sapata concreto fck 25", un: "m³", obr: true,
        qtd: g => Math.ceil(g.volumeFundacao * fatorDesperdicio), base: coeficientesFundacao.estaca_sap.preco },
      { k: "aco_fund",      nome: "Aço CA-50 fundação",     un: "kg", obr: true,
        qtd: g => Math.ceil(g.volumeFundacao * coeficientesFundacao.aco_fund.porVolume * fatorDesperdicio), base: coeficientesFundacao.aco_fund.preco },
      { k: "formas_fund",   nome: "Formas de madeira",      un: "m²", obr: true,
        qtd: g => Math.ceil(g.volumeFundacao * coeficientesFundacao.formas_fund.fatorArea), base: coeficientesFundacao.formas_fund.preco },
      { k: "lastro",        nome: "Lastro brita + regularização", un: "m²",
        qtd: g => Math.ceil(g.areaProjecao), base: coeficientesFundacao.lastro.preco }
    ]; })() };

  const estrutura = { id: "estrutura", nome: `Estrutura — ${MODALIDADES[modalidade].label}`,
    mats: modalidade === "alv_estrutural" ? (() => { const coeficientesEstrutura = R.estrutura_alv_estrutural; return [
      { k: "bloco_estr",   nome: "Bloco concreto estrutural 14×19×39", un: "un", obr: true,
        dims: { ...coeficientesEstrutura.bloco_estr.dims },
        qtd: (g, dimensoesCustomizadas) => { const areaPeca = (dimensoesCustomizadas?.altura||coeficientesEstrutura.bloco_estr.dims.altura)/100 * (dimensoesCustomizadas?.comprimento||coeficientesEstrutura.bloco_estr.dims.comprimento)/100;
          return Math.ceil(g.areaParedeTot / areaPeca * fatorDesperdicio); }, base: coeficientesEstrutura.bloco_estr.preco },
      { k: "graute",       nome: "Graute fck 20 (canaletas/vertic.)", un: "L",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesEstrutura.graute.porM2), base: coeficientesEstrutura.graute.preco },
      { k: "aco_ae",       nome: "Aço CA-50/CA-60 (canaletas)",  un: "kg", obr: true,
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesEstrutura.aco_ae.porM2 * fatorDesperdicio), base: coeficientesEstrutura.aco_ae.preco },
      { k: "argam_ae",     nome: "Argamassa assentamento",        un: "kg",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesComuns.argamassaPorM2), base: coeficientesEstrutura.argam_ae.preco },
      { k: "laje_pre",     nome: "Laje pré-moldada treliçada + capa", un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaTotal * coeficientesEstrutura.laje_pre.sobreposicao), base: coeficientesEstrutura.laje_pre.preco },
      { k: "vergas_ae",    nome: "Canaletas U (vergas/contravergas)", un: "m",
        qtd: g => Math.ceil(g.perimetroApto * coeficientesComuns.vergasFracao * g.totalAptos), base: coeficientesEstrutura.vergas_ae.preco }
    ]; })() : modalidade === "steelframe" ? (() => { const coeficientesEstrutura = R.estrutura_steelframe; return [
      { k: "perfis_lsf",   nome: "Perfis aço galvanizado LSF", un: "kg", obr: true,
        qtd: g => Math.ceil(g.areaTotal * coeficientesEstrutura.perfis_lsf.porM2 * fatorDesperdicio), base: coeficientesEstrutura.perfis_lsf.preco },
      { k: "osb",          nome: "OSB estrutural 11,1mm",     un: "m²", obr: true,
        qtd: g => Math.ceil((g.areaParedeTot * coeficientesEstrutura.osb.sobrepParede + g.areaTotal * coeficientesEstrutura.osb.fracaoLaje)), base: coeficientesEstrutura.osb.preco },
      { k: "paraf_lsf",    nome: "Parafusos autoperfurantes", un: "mi",
        qtd: g => Math.ceil(g.areaTotal * coeficientesEstrutura.paraf_lsf.porM2), base: coeficientesEstrutura.paraf_lsf.preco },
      { k: "membrana",     nome: "Membrana hidrófuga",        un: "m²",
        qtd: g => Math.ceil(g.areaFachada * coeficientesEstrutura.membrana.fracao), base: coeficientesEstrutura.membrana.preco }
    ]; })() : modalidade === "metalica" ? (() => { const coeficientesEstrutura = R.estrutura_metalica; return [
      { k: "perfis_pes",   nome: "Perfis estruturais I/H/W",  un: "kg", obr: true,
        qtd: g => Math.ceil(g.areaTotal * coeficientesEstrutura.perfis_pes.kgPorM2 * fatorDesperdicio), base: coeficientesEstrutura.perfis_pes.preco },
      { k: "steel_deck",   nome: "Laje steel deck (painel)",  un: "m²", obr: true,
        qtd: g => Math.ceil(g.areaTotal * coeficientesEstrutura.steel_deck.cobertura), base: coeficientesEstrutura.steel_deck.preco },
      { k: "cap_conc",     nome: "Concreto capeamento fck 25", un: "m³",
        qtd: g => Math.ceil(g.volumeLajes * fatorDesperdicio), base: coeficientesEstrutura.cap_conc.preco },
      { k: "solda_chumb",  nome: "Solda/parafusos/chumbadores", un: "vb",
        qtd: g => Math.ceil(g.numPilares * g.pavimentos), base: coeficientesEstrutura.solda_chumb.preco }
    ]; })() : (() => { const coeficientesEstrutura = R.estrutura_convencional; return [
      { k: "conc_estr",    nome: "Concreto fck 30 (pilar/viga/laje)", un: "m³", obr: true,
        qtd: g => Math.ceil(g.volumeConcretoEstrutura * fatorDesperdicio), base: coeficientesEstrutura.conc_estr.preco },
      { k: "aco_estr",     nome: "Aço CA-50 estrutura (100kg/m³)",       un: "kg", obr: true,
        qtd: g => Math.ceil(g.volumeConcretoEstrutura * coeficientesEstrutura.aco_estr.porVolume * fatorDesperdicio), base: coeficientesEstrutura.aco_estr.preco },
      { k: "formas_estr",  nome: "Formas de madeira compensada", un: "m²", obr: true,
        qtd: g => Math.ceil((g.volumePilares + g.volumeVigas) * coeficientesEstrutura.formas_estr.fatorArea), base: coeficientesEstrutura.formas_estr.preco },
      { k: "escora",       nome: "Escoramento metálico (loc.)", un: "m²",
        qtd: g => Math.ceil(g.areaTotal * coeficientesEstrutura.escora.porM2), base: coeficientesEstrutura.escora.preco }
    ]; })() };

  const etapaVedacao = { id: "vedacao", nome: `Vedação interna — ${VEDACOES[vedacao].label}`,
    mats: vedacao === "alvenaria" ? (() => { const coeficientesVedacao = R.vedacao_alvenaria; return [
      { k: "bloco",     nome: "Bloco cerâmico 14×19×29", un: "un", obr: true,
        dims: { ...coeficientesVedacao.bloco.dims },
        qtd: (g, dimensoesCustomizadas) => { const areaPeca = (dimensoesCustomizadas?.altura||coeficientesVedacao.bloco.dims.altura)/100 * (dimensoesCustomizadas?.comprimento||coeficientesVedacao.bloco.dims.comprimento)/100;
          return Math.ceil(g.areaParedeTot / areaPeca * fatorDesperdicio); }, base: coeficientesVedacao.bloco.preco },
      { k: "argamassa", nome: "Argamassa assentamento",  un: "kg",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesComuns.argamassaPorM2), base: coeficientesVedacao.argamassa.preco },
      { k: "reboco",    nome: "Chapisco+emboço+reboco (ambas faces)", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesVedacao.reboco.faces), base: coeficientesVedacao.reboco.preco },
      { k: "vergas",    nome: "Vergas/contravergas",     un: "m",
        qtd: g => Math.ceil(g.perimetroApto * coeficientesComuns.vergasFracao * g.totalAptos), base: coeficientesVedacao.vergas.preco }
    ]; })() : vedacao === "drywall" ? (() => { const coeficientesVedacao = R.vedacao_drywall; return [
      { k: "gesso",       nome: "Placa gesso ST 12,5mm (1,2×2,4m)", un: "un", obr: true,
        dims: { ...coeficientesVedacao.gesso.dims },
        qtd: (g, dimensoesCustomizadas) => { const areaPeca = (dimensoesCustomizadas?.largura||coeficientesVedacao.gesso.dims.largura) * (dimensoesCustomizadas?.altura||coeficientesVedacao.gesso.dims.altura);
          return Math.ceil(g.areaParedeTot * coeficientesVedacao.gesso.chapasPorFace / areaPeca); }, base: coeficientesVedacao.gesso.preco },
      { k: "perfis_dry",  nome: "Perfis montante/guia 48mm", un: "m",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesVedacao.perfis_dry.porM2), base: coeficientesVedacao.perfis_dry.preco },
      { k: "massa_fita",  nome: "Massa+fita+parafusos",    un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesVedacao.massa_fita.faces), base: coeficientesVedacao.massa_fita.preco },
      { k: "la_vidro",    nome: "Lã de vidro 50mm",        un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesVedacao.la_vidro.fracao), base: coeficientesVedacao.la_vidro.preco }
    ]; })() : vedacao === "drywallAcustico" ? (() => { const coeficientesVedacao = R.vedacao_drywallAcustico; return [
      { k: "gesso_dup",   nome: "Placa gesso dupla RU/ST (1,2×2,4m)", un: "un", obr: true,
        dims: { ...coeficientesVedacao.gesso_dup.dims },
        qtd: (g, dimensoesCustomizadas) => { const areaPeca = (dimensoesCustomizadas?.largura||coeficientesVedacao.gesso_dup.dims.largura) * (dimensoesCustomizadas?.altura||coeficientesVedacao.gesso_dup.dims.altura);
          return Math.ceil(g.areaParedeTot * coeficientesVedacao.gesso_dup.chapasPorFace / areaPeca); }, base: coeficientesVedacao.gesso_dup.preco },
      { k: "perf_ref",    nome: "Perfis reforçados",       un: "m",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesVedacao.perf_ref.porM2), base: coeficientesVedacao.perf_ref.preco },
      { k: "la_min",      nome: "Lã mineral acústica 70mm", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot), base: coeficientesVedacao.la_min.preco },
      { k: "banda_ac",    nome: "Banda acústica + vedação", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesVedacao.banda_ac.faces), base: coeficientesVedacao.banda_ac.preco }
    ]; })() : (() => { const coeficientesVedacao = R.vedacao_steelframeInterno; return [
      { k: "cim_placa",   nome: "Placa cimentícia 10mm (1,2×2,4m)", un: "un", obr: true,
        dims: { ...coeficientesVedacao.cim_placa.dims },
        qtd: (g, dimensoesCustomizadas) => { const areaPeca = (dimensoesCustomizadas?.largura||coeficientesVedacao.cim_placa.dims.largura) * (dimensoesCustomizadas?.altura||coeficientesVedacao.cim_placa.dims.altura);
          return Math.ceil(g.areaParedeTot * coeficientesVedacao.cim_placa.chapasPorFace / areaPeca); }, base: coeficientesVedacao.cim_placa.preco },
      { k: "perf_gal",    nome: "Perfis aço galvanizado LSF", un: "m",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesVedacao.perf_gal.porM2), base: coeficientesVedacao.perf_gal.preco },
      { k: "la_memb",     nome: "Lã de vidro + membrana hidrófuga", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesVedacao.la_memb.fracao), base: coeficientesVedacao.la_memb.preco },
      { k: "paraf_jun",   nome: "Parafusos + tratamento juntas", un: "m²",
        qtd: g => Math.ceil(g.areaParedeTot * coeficientesVedacao.paraf_jun.faces), base: coeficientesVedacao.paraf_jun.preco }
    ]; })() };

  const etapaCobertura = R.cobertura;
  const cobertura = { id: "cobertura", nome: "Cobertura e Impermeabilização", mats: [
    { k: "manta",  nome: "Manta asfáltica 4mm",      un: "m²", obr: true,
      qtd: g => Math.ceil(g.areaProjecao * etapaCobertura.manta.sobreposicao), base: etapaCobertura.manta.preco },
    { k: "telha",  nome: "Telha (metálica/cerâmica)", un: "un", obr: true,
      dims: { ...etapaCobertura.telha.dims },
      qtd: (g, dimensoesCustomizadas) => { const areaPeca = (dimensoesCustomizadas?.largura||etapaCobertura.telha.dims.largura)/100 * (dimensoesCustomizadas?.comprimento||etapaCobertura.telha.dims.comprimento)/100 * etapaCobertura.telha.coberturaUtil;
        return Math.ceil(g.areaProjecao * etapaCobertura.telha.inclinacao / areaPeca); }, base: etapaCobertura.telha.preco },
    { k: "calha",  nome: "Calhas e rufos",           un: "m",
      qtd: g => Math.ceil(g.perimetroProjecao * etapaCobertura.calha.fatorPerimetro), base: etapaCobertura.calha.preco },
    { k: "isolam", nome: "Isolamento térmico",       un: "m²",
      qtd: g => Math.ceil(g.areaProjecao), base: etapaCobertura.isolam.preco }
  ]};

  const etapaEsquadrias = R.esquadrias;
  const esquadrias = { id: "esquadrias", nome: "Esquadrias (Portas e Janelas)", mats: [
    { k: "porta_ent", nome: "Porta entrada (apto)",  un: "un", obr: true,
      qtd: g => g.totalAptos, base: etapaEsquadrias.porta_ent.preco },
    { k: "porta_int", nome: "Portas internas",       un: "un",
      qtd: g => g.totalAptos * etapaEsquadrias.porta_int.porApto, base: etapaEsquadrias.porta_int.preco },
    { k: "janela",    nome: "Janelas alumínio",      un: "un", obr: true,
      dims: { ...etapaEsquadrias.janela.dims },
      qtd: (g, dimensoesCustomizadas) => { const areaPeca = (dimensoesCustomizadas?.largura||etapaEsquadrias.janela.dims.largura) * (dimensoesCustomizadas?.altura||etapaEsquadrias.janela.dims.altura);
        return Math.ceil(g.totalAptos * etapaEsquadrias.janela.areaPorApto / areaPeca); }, base: etapaEsquadrias.janela.preco },
    { k: "ferragem",  nome: "Ferragens e fechaduras", un: "cj",
      qtd: g => g.totalAptos * etapaEsquadrias.ferragem.porApto, base: etapaEsquadrias.ferragem.preco }
  ]};

  const etapaRevestimentos = R.revestimentos;
  const revestim = { id: "revestimentos", nome: "Revestimentos e Pisos", mats: [
    { k: "porcelanato", nome: "Porcelanato piso 60×60",    un: "un", obr: true,
      dims: { ...etapaRevestimentos.porcelanato.dims },
      qtd: (g, dimensoesCustomizadas) => { const areaPeca = (dimensoesCustomizadas?.largura||etapaRevestimentos.porcelanato.dims.largura)/100 * (dimensoesCustomizadas?.comprimento||etapaRevestimentos.porcelanato.dims.comprimento)/100;
        return Math.ceil(g.areaTotal * etapaRevestimentos.porcelanato.perda / areaPeca); }, base: etapaRevestimentos.porcelanato.preco },
    { k: "azulejo",     nome: "Azulejo parede 30×60",     un: "un", obr: true,
      dims: { ...etapaRevestimentos.azulejo.dims },
      qtd: (g, dimensoesCustomizadas) => { const areaPeca = (dimensoesCustomizadas?.largura||etapaRevestimentos.azulejo.dims.largura)/100 * (dimensoesCustomizadas?.comprimento||etapaRevestimentos.azulejo.dims.comprimento)/100;
        return Math.ceil(g.areaAzulTot * etapaRevestimentos.azulejo.perda / areaPeca); }, base: etapaRevestimentos.azulejo.preco },
    { k: "arg_cola",    nome: "Argamassa colante ACIII",   un: "kg",
      qtd: g => Math.ceil((g.areaTotal + g.areaAzulTot) * etapaRevestimentos.arg_cola.porM2), base: etapaRevestimentos.arg_cola.preco },
    { k: "rodape",      nome: "Rodapé e soleiras",         un: "m",
      qtd: g => Math.ceil(g.perimetroApto * g.totalAptos), base: etapaRevestimentos.rodape.preco }
  ]};

  const etapaHidraulica = R.hidraulica;
  const hidraulica = { id: "hidraulica", nome: "Instalações Hidrossanitárias", mats: [
    { k: "tubos",     nome: "Tubos e conexões PVC (kit/apto)", un: "cj", obr: true,
      qtd: g => g.totalAptos, base: etapaHidraulica.tubos.preco },
    { k: "loucas",    nome: "Louças sanitárias (vaso+lavatório)", un: "cj", obr: true,
      qtd: g => g.totalAptos, base: etapaHidraulica.loucas.preco },
    { k: "metais",    nome: "Metais sanitários",          un: "cj",
      qtd: g => g.totalAptos, base: etapaHidraulica.metais.preco },
    { k: "registros", nome: "Registros e válvulas",       un: "cj",
      qtd: g => g.totalAptos, base: etapaHidraulica.registros.preco },
    { k: "cx_agua",   nome: "Caixa d'água + barrilete",   un: "vb",
      qtd: g => Math.max(1, Math.ceil(Math.pow(g.totalAptos, etapaHidraulica.cx_agua.expoente) / etapaHidraulica.cx_agua.divisor)), base: etapaHidraulica.cx_agua.preco }
  ]};

  const etapaEletrica = R.eletrica;
  const eletrica = { id: "eletrica", nome: "Instalações Elétricas", mats: [
    { k: "qdc",     nome: "Quadro distribuição (QDC)",  un: "un", obr: true,
      qtd: g => g.totalAptos + 1, base: etapaEletrica.qdc.preco },
    { k: "fios",    nome: "Fios e cabos",               un: "m", obr: true,
      qtd: g => Math.ceil(g.areaTotal * etapaEletrica.fios.porM2), base: etapaEletrica.fios.preco },
    { k: "eletrod", nome: "Eletrodutos",                un: "m",
      qtd: g => Math.ceil(g.areaTotal * etapaEletrica.eletrod.porM2), base: etapaEletrica.eletrod.preco },
    { k: "tomada",  nome: "Tomadas + interruptores",    un: "un",
      qtd: g => Math.ceil(g.totalAptos * etapaEletrica.tomada.porApto), base: etapaEletrica.tomada.preco },
    { k: "disj",    nome: "Disjuntores + DR",           un: "un",
      qtd: g => g.totalAptos * etapaEletrica.disj.porApto, base: etapaEletrica.disj.preco }
  ]};

  const etapaPintura = R.pintura;
  const pintura = { id: "pintura", nome: "Pintura", mats: [
    { k: "massa",   nome: "Massa corrida/acrílica",     un: "kg",
      qtd: g => Math.ceil(g.areaParedeTot * etapaPintura.massa.porM2Face * 2), base: etapaPintura.massa.preco }, // ambas as faces (2)
    { k: "tinta",   nome: "Tinta látex/acrílica",       un: "L", obr: true,
      qtd: g => Math.ceil(g.areaParedeTot * etapaPintura.tinta.porM2Face * 2), base: etapaPintura.tinta.preco },
    { k: "selador", nome: "Selador/fundo",              un: "L",
      qtd: g => Math.ceil(g.areaParedeTot * etapaPintura.selador.porM2Face * 2), base: etapaPintura.selador.preco },
    { k: "mo_pint", nome: "Mão de obra aplicação",      un: "m²",
      qtd: g => Math.ceil(g.areaParedeTot * 2), base: etapaPintura.mo_pint.preco }
  ]};

  const etapaLimpeza = R.limpeza;
  const limpeza = { id: "limpeza", nome: "Limpeza e Finalização", mats: [
    { k: "cacamba",   nome: "Caçambas de entulho",        un: "un",
      qtd: g => Math.ceil(g.areaTotal * etapaLimpeza.cacamba.porM2 * fatorDesperdicio), base: etapaLimpeza.cacamba.preco },
    { k: "limp_obra", nome: "Limpeza pós-obra",           un: "m²",
      qtd: g => Math.ceil(g.areaTotal), base: etapaLimpeza.limp_obra.preco },
    { k: "polimento", nome: "Polimento e finalização",    un: "m²",
      qtd: g => Math.ceil(g.areaTotal * etapaLimpeza.polimento.fracao), base: etapaLimpeza.polimento.preco }
  ]};

  return [preliminares, fundacao, estrutura, etapaVedacao, cobertura,
          esquadrias, revestim, hidraulica, eletrica, pintura, limpeza];
}
