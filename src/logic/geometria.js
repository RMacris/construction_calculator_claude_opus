import { num } from "../utils.js";

// Coeficiente de aproveitamento útil do pavimento
// Em edifícios residenciais, ~20% da área é circulação (corredores, escada, elevador, hall)
export const K_UTIL = 0.85;

// Fator de forma: apartamentos reais são retangulares e possuem recortes,
// gerando mais perímetro que um quadrado perfeito (~15% a mais).
export const FATOR_FORMA = 1.15;

export function resolverCampos(inpRaw) {
  let A_pav = num(inpRaw.areaPavimento);
  let A_apt = num(inpRaw.areaApto);
  let n_apt = num(inpRaw.nApt);
  let n_pav = num(inpRaw.nPav);
  const calc = inpRaw.calculado || "nPav";

  switch (calc) {
    case "nPav": {
      // Quantos aptos cabem por andar, considerando área útil
      const p = A_apt > 0 ? Math.floor((A_pav * K_UTIL) / A_apt) : 0;
      n_pav = p > 0 ? Math.max(1, Math.ceil(n_apt / p)) : 1;
      break;
    }
    case "nApt": {
      const p = A_apt > 0 ? Math.floor((A_pav * K_UTIL) / A_apt) : 0;
      n_apt = p * Math.max(1, n_pav);
      break;
    }
    case "areaApto": {
      if (n_apt > 0 && n_pav > 0) {
        const pNeeded = Math.ceil(n_apt / n_pav);
        A_apt = pNeeded > 0
          ? Math.floor(((A_pav * K_UTIL) / pNeeded) * 10) / 10
          : A_apt;
      }
      break;
    }
    case "areaPavimento": {
      if (n_apt > 0 && n_pav > 0 && A_apt > 0) {
        const pNeeded = Math.ceil(n_apt / n_pav);
        // Área bruta necessária = área útil / K_UTIL
        A_pav = Math.ceil((A_apt * pNeeded) / K_UTIL);
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

  const areaProjecao  = inp.areaPavimento;
  const areaUtilPav   = areaProjecao * K_UTIL;
  const areaCirculacao = areaProjecao - areaUtilPav;

  const aptosPorAndar = Math.max(0,
    Math.floor(areaUtilPav / Math.max(1, inp.areaApto)));
  const pavimentos   = Math.max(1, inp.nPav);
  const totalAptos   = Math.max(0, inp.nApt);
  const capacidade   = aptosPorAndar * pavimentos;
  const aptosVazios  = Math.max(0, capacidade - totalAptos);
  const areaTotal    = areaProjecao * pavimentos;
  const areaUtilTotal = areaUtilPav * pavimentos;

  // Perímetros com fator de forma (apartamentos não são quadrados)
  const ladoApto       = Math.sqrt(Math.max(0, inp.areaApto));
  const perimetroApto  = 4 * ladoApto * FATOR_FORMA;
  const ladoBanh       = Math.sqrt(Math.max(0, inp.areaBanheiro));
  const perimetroBanh  = 4 * ladoBanh * FATOR_FORMA;

  // Paredes por apartamento
  // Nota: em prédios reais, paredes entre aptos adjacentes são compartilhadas.
  // O pequeno excesso serve como proxy para paredes de áreas comuns (hall, escada).
  const paredesExtApto = perimetroApto * inp.peDireito;
  const paredesIntApto = 0.6 * perimetroApto * inp.peDireito;
  const areaParedeApto = paredesExtApto + paredesIntApto;
  const areaParedeTot  = areaParedeApto * totalAptos;

  // Azulejo: banheiro (piso ao teto) + cozinha (faixa acima da bancada)
  const areaAzulBanh   = perimetroBanh * inp.peDireito;
  // Cozinha: ~3m lineares de bancada × metade do pé-direito (faixa de azulejo)
  const areaAzulCoz    = 3 * (inp.peDireito / 2);
  const areaAzulTot    = (areaAzulBanh + areaAzulCoz) * totalAptos;

  // Área estimada de sala+cozinha (desconta banheiro + quarto ~8m²)
  const areaSalaCoz    = inp.areaApto - inp.areaBanheiro - 8;
  const aptoValido     = areaSalaCoz >= 6 && inp.areaBanheiro >= 2 && inp.areaApto >= 20;

  // --- Fatores de escala (leis de potência, calibrados com CUB/SINAPI) ---
  // Fundação: carga ∝ pav, dimensionamento escala sub-linearmente (sapatas/estacas maiores)
  const fatorCarga   = Math.pow(pavimentos, 0.8);
  // Estrutura: sobrecusto por m² (pilares maiores na base, vento ∝ h², bombeamento)
  // Aplicado sobre areaTotal (já ∝ pav), custo efetivo ∝ pav^1.25
  const fatorAltura  = Math.pow(pavimentos, 0.25);
  // Canteiro/duração: sub-linear (economia de escala, equipe estabilizada)
  const fatorDuracao = Math.pow(pavimentos, 0.55);

  return {
    areaProjecao, areaUtilPav, areaCirculacao,
    aptosPorAndar, pavimentos, totalAptos, areaTotal, areaUtilTotal,
    capacidade, aptosVazios,
    perimetroApto, perimetroBanh, areaParedeApto, areaParedeTot,
    areaAzulBanh, areaAzulCoz, areaAzulTot, areaSalaCoz, aptoValido,
    fatorCarga, fatorAltura, fatorDuracao,
    modalidade: inp.modalidade, vedacao: inp.vedacao,
    resolved: {
      A_pav: r.A_pav, A_apt: r.A_apt, n_apt: r.n_apt, n_pav: r.n_pav
    }
  };
}
