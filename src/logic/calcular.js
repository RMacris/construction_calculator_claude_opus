import { BDI_PADRAO } from "../constants.js";
import { num } from "../utils.js";
import { geometria } from "./geometria.js";
import { catalogo } from "./catalogo.js";

/**
 * Cálculo bottom-up: quantidades × preços unitários reais.
 * O BDI (Bonificações e Despesas Indiretas) é aplicado sobre o custo direto total.
 *
 * @param {object} inp   - Inputs do formulário
 * @param {object} over  - Overrides (precos, qtds, removidos, custom)
 * @param {number} bdi   - BDI como fração (ex: 0.25 = 25%)
 */
export function calcular(inp, over, bdi = BDI_PADRAO) {
  const dadosGeometricos = geometria(inp);
  const etapasCatalogo = catalogo(dadosGeometricos.modalidade, dadosGeometricos.vedacao);
  const removidos = over.removidos || {};
  const precos    = over.precos    || {};
  const qtds      = over.qtds      || {};
  const custom    = over.custom    || {};
  const dimsOver  = over.dims      || {};

  const etapas = etapasCatalogo.map(etapa => {
    const matsCat = etapa.mats
      .filter(material => material.obr || !removidos[`${etapa.id}.${material.k}`])
      .map(material => {
        const key = `${etapa.id}.${material.k}`;
        // Mesclar dims: override do usuário sobre dims padrão do catálogo
        const dims = material.dims ? { ...material.dims, ...(dimsOver[key] || {}) } : undefined;
        const qtdCalc = material.dims ? material.qtd(dadosGeometricos, dims) : material.qtd(dadosGeometricos);
        const qtd = qtds[key] !== undefined ? num(qtds[key]) : qtdCalc;
        // Preço unitário: usa override do usuário, ou preço base do catálogo (sem multiplicador)
        const punit = precos[key] !== undefined ? num(precos[key]) : material.base;
        return {
          key, nome: material.nome, un: material.un, qtd, punit,
          subtotal: qtd * punit,
          auto: qtds[key] === undefined,
          custom: false,
          obr: !!material.obr,
          dims: dims,
          dimsDefault: material.dims
        };
      });
    const matsCustom = (custom[etapa.id] || []).map(materialCustom => ({
      key: materialCustom.key, nome: materialCustom.nome, un: materialCustom.un,
      qtd: num(materialCustom.qtd), punit: num(materialCustom.punit),
      subtotal: num(materialCustom.qtd) * num(materialCustom.punit),
      auto: false, custom: true
    }));
    const mats = [...matsCat, ...matsCustom];
    const valor = mats.reduce((soma, material) => soma + material.subtotal, 0);
    return { id: etapa.id, nome: etapa.nome, mats, valor };
  });

  // Custo direto = soma bottom-up de todas as etapas
  const custoDireto  = etapas.reduce((soma, etapaAtual) => soma + etapaAtual.valor, 0);
  const bdiPercent   = Math.max(0, num(bdi));
  const bdiValor     = custoDireto * bdiPercent;
  const custoTotal   = custoDireto + bdiValor;

  const custoM2       = dadosGeometricos.areaTotal > 0 ? custoTotal / dadosGeometricos.areaTotal : 0;
  const custoM2Direto = dadosGeometricos.areaTotal > 0 ? custoDireto / dadosGeometricos.areaTotal : 0;
  const custoApto     = dadosGeometricos.totalAptos > 0 ? custoTotal / dadosGeometricos.totalAptos : 0;

  return {
    ...dadosGeometricos, etapas,
    custoDireto, bdiPercent, bdiValor,
    custoTotal, custoM2, custoM2Direto, custoApto
  };
}
