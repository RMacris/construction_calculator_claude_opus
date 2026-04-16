import { PRESETS } from "../constants.js";
import { num } from "../utils.js";
import { geometria } from "./geometria.js";
import { catalogo } from "./catalogo.js";

export function calcular(inp, over, preset, customM2 = 0) {
  const g = geometria(inp);
  const cat = catalogo(g.modalidade, g.vedacao);
  const removidos = over.removidos || {};
  const precos    = over.precos    || {};
  const qtds      = over.qtds      || {};
  const custom    = over.custom    || {};

  const targetM2 = preset === "custom" ? customM2 : (PRESETS[preset]?.custoM2 ?? 2800);

  let refTotal = 0;
  cat.forEach(et => {
    et.mats
      .filter(m => !removidos[`${et.id}.${m.k}`] && precos[`${et.id}.${m.k}`] === undefined)
      .forEach(m => {
        const key = `${et.id}.${m.k}`;
        const qtd = qtds[key] !== undefined ? num(qtds[key]) : m.qtd(g);
        refTotal += m.base * qtd;
      });
  });
  const refM2 = g.areaTotal > 0 ? refTotal / g.areaTotal : 0;
  const mult = targetM2 > 0 && refM2 > 0 ? targetM2 / refM2 : 1;

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
