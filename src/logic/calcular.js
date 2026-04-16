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
  const g = geometria(inp);
  const cat = catalogo(g.modalidade, g.vedacao);
  const removidos = over.removidos || {};
  const precos    = over.precos    || {};
  const qtds      = over.qtds      || {};
  const custom    = over.custom    || {};
  const dimsOver  = over.dims      || {};

  const etapas = cat.map(et => {
    const matsCat = et.mats
      .filter(m => m.obr || !removidos[`${et.id}.${m.k}`])
      .map(m => {
        const key = `${et.id}.${m.k}`;
        // Mesclar dims: override do usuário sobre dims padrão do catálogo
        const dims = m.dims ? { ...m.dims, ...(dimsOver[key] || {}) } : undefined;
        const qtdCalc = m.dims ? m.qtd(g, dims) : m.qtd(g);
        const qtd = qtds[key] !== undefined ? num(qtds[key]) : qtdCalc;
        // Preço unitário: usa override do usuário, ou preço base do catálogo (sem multiplicador)
        const punit = precos[key] !== undefined ? num(precos[key]) : m.base;
        return {
          key, nome: m.nome, un: m.un, qtd, punit,
          subtotal: qtd * punit,
          auto: qtds[key] === undefined,
          custom: false,
          obr: !!m.obr,
          dims: dims,
          dimsDefault: m.dims
        };
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

  // Custo direto = soma bottom-up de todas as etapas
  const custoDireto  = etapas.reduce((s, e) => s + e.valor, 0);
  const bdiPercent   = Math.max(0, num(bdi));
  const bdiValor     = custoDireto * bdiPercent;
  const custoTotal   = custoDireto + bdiValor;

  const custoM2       = g.areaTotal > 0 ? custoTotal / g.areaTotal : 0;
  const custoM2Direto = g.areaTotal > 0 ? custoDireto / g.areaTotal : 0;
  const custoApto     = g.totalAptos > 0 ? custoTotal / g.totalAptos : 0;

  return {
    ...g, etapas,
    custoDireto, bdiPercent, bdiValor,
    custoTotal, custoM2, custoM2Direto, custoApto
  };
}
