import { num } from "../utils.js";

export const K_UTIL = 0.80;

export function resolverCampos(inpRaw) {
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

export function geometria(inpRaw) {
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
