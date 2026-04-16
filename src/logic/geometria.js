import { num } from "../utils.js";

// Coeficiente de aproveitamento útil do pavimento
// Em edifícios residenciais, ~20% da área é circulação (corredores, escada, elevador, hall)
export const K_UTIL = 0.85;

// Fator de forma: apartamentos reais são retangulares e possuem recortes,
// gerando mais perímetro que um quadrado perfeito (~15% a mais).
export const FATOR_FORMA = 1.15;

export function resolverCampos(inpRaw) {
  let areaPavimentoBruta = num(inpRaw.areaPavimento);
  let areaApartamentoPrivativa = num(inpRaw.areaApto);
  let numeroApartamentos = num(inpRaw.nApt);
  let numeroPavimentos = num(inpRaw.nPav);
  const calc = inpRaw.calculado || "nPav";

  switch (calc) {
    case "nPav": {
      // Quantos aptos cabem por andar, considerando área útil
      const apartamentosPorAndar = areaApartamentoPrivativa > 0 ? Math.floor((areaPavimentoBruta * K_UTIL) / areaApartamentoPrivativa) : 0;
      numeroPavimentos = apartamentosPorAndar > 0 ? Math.max(1, Math.ceil(numeroApartamentos / apartamentosPorAndar)) : 1;
      break;
    }
    case "nApt": {
      const apartamentosPorAndar = areaApartamentoPrivativa > 0 ? Math.floor((areaPavimentoBruta * K_UTIL) / areaApartamentoPrivativa) : 0;
      numeroApartamentos = apartamentosPorAndar * Math.max(1, numeroPavimentos);
      break;
    }
    case "areaApto": {
      if (numeroApartamentos > 0 && numeroPavimentos > 0) {
        const apartamentosNecessarios = Math.ceil(numeroApartamentos / numeroPavimentos);
        areaApartamentoPrivativa = apartamentosNecessarios > 0
          ? Math.floor(((areaPavimentoBruta * K_UTIL) / apartamentosNecessarios) * 10) / 10
          : areaApartamentoPrivativa;
      }
      break;
    }
    case "areaPavimento": {
      if (numeroApartamentos > 0 && numeroPavimentos > 0 && areaApartamentoPrivativa > 0) {
        const apartamentosNecessarios = Math.ceil(numeroApartamentos / numeroPavimentos);
        // Área bruta necessária = área útil / K_UTIL
        areaPavimentoBruta = Math.ceil((areaApartamentoPrivativa * apartamentosNecessarios) / K_UTIL);
      }
      break;
    }
  }
  return { A_pav: areaPavimentoBruta, A_apt: areaApartamentoPrivativa, n_apt: numeroApartamentos, n_pav: numeroPavimentos };
}

export function geometria(inpRaw) {
  const camposResolvidos = resolverCampos(inpRaw);
  const inp = {
    areaPavimento: camposResolvidos.A_pav,
    areaApto:      camposResolvidos.A_apt,
    nApt:          camposResolvidos.n_apt,
    nPav:          camposResolvidos.n_pav,
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
  // Banheiros reais raramente são quadrados perfeitos, e suas paredes são duplas (dentro/fora) em alguns casos, mas a face interna é a que leva revestimento
  const ladoBanh       = Math.sqrt(Math.max(0, inp.areaBanheiro));
  const perimetroBanh  = 4 * ladoBanh;

  // --- Gêmeo Digital: Grid e Geometria Paramétrica ---
  const perimetroProjecao = 4 * Math.sqrt(areaProjecao) * FATOR_FORMA;
  
  // Malha estrutural estimada: pilares a cada ~4m
  const espacamentoMalha = 4;
  const numPilares = Math.ceil(areaProjecao / (espacamentoMalha * espacamentoMalha)) + Math.ceil(perimetroProjecao / espacamentoMalha);
  
  // Comprimento total de vigas por pavimento (grade simples)
  const compVigasPorPavimento = (areaProjecao / espacamentoMalha) * 2; 

  // Comprimentos lineares de paredes
  const compParedesExtApto = perimetroApto;
  // Desconta os limites externos e áreas comuns; partições internas
  const compParedesIntApto = (perimetroApto * 0.6) + perimetroBanh; 

  // Área exata de paredes considerando pavimentos vs totalAptos
  // Paredes de fachada do prédio:
  const areaFachada = perimetroProjecao * inp.peDireito * pavimentos;
  // Paredes internas dos apartamentos
  const areaParedesInternasTot = compParedesIntApto * inp.peDireito * totalAptos;
  const areaParedeTot = areaFachada + areaParedesInternasTot;
  
  // Azulejo:
  const areaAzulBanh = perimetroBanh * inp.peDireito;
  const areaAzulCoz = 3 * (inp.peDireito / 2);
  const areaAzulTot = (areaAzulBanh + areaAzulCoz) * totalAptos;

  // Área estimada de sala+cozinha (desconta banheiro + quarto ~8m²)
  const areaSalaCoz    = inp.areaApto - inp.areaBanheiro - 8;
  const aptoValido     = areaSalaCoz >= 6 && inp.areaBanheiro >= 2 && inp.areaApto >= 20;

  // --- Volume de Concreto e Cargas (Estimativas Básicas de Engenharia) ---
  // Carga estimada por metro quadrado por pavimento (peso próprio + acidental): ~1 tf/m² (~10 kN/m²)
  const cargaPorPavimento = areaProjecao * 1; // em toneladas-força (tf) approx
  const cargaTotalEdificio = cargaPorPavimento * pavimentos;

  // Ljes: 12cm de espessura média
  const volumeLajes = areaTotal * 0.12; 
  
  // Pilares: seção base depende da carga. Assumindo concreto fck 30 MPa (suporta ~1.5 tf/cm² com margem de segurança)
  // Área de seção transversal média por pilar na base = Carga total / (número de pilares * tensão admissível)
  const cargaPorPilar = cargaTotalEdificio / Math.max(1, numPilares);
  // Área mínima do pilar ~400 cm² (ex: 20x20). 
  const secaoBasePilarM2 = Math.max(0.04, cargaPorPilar / 1000); 
  // Na estrutura do prédio, a seção do pilar afina no topo. A seção média é a metade da base + topo.
  const secaoMediaPilarM2 = (secaoBasePilarM2 + 0.04) / 2;
  const volumePilares = numPilares * secaoMediaPilarM2 * (inp.peDireito * pavimentos);

  // Vigas: seções típicas de 15x40cm a 20x50cm. Seção = ~0.08 m²
  const secaoVigaM2 = 0.08;
  const volumeVigas = compVigasPorPavimento * secaoVigaM2 * pavimentos;

  const volumeConcretoEstrutura = volumeLajes + volumePilares + volumeVigas;
  
  // Fundações
  const volumeFundacao = cargaTotalEdificio * 0.05; // ~0.05 m³ de concreto(sapatas/blocos) para cada tf de carga (regra de bolso simplificada)

  // Canteiro/duração (mantendo sub-linear para escala de tempo)
  const fatorDuracao = Math.pow(pavimentos, 0.55);

  return {
    areaProjecao, areaUtilPav, areaCirculacao,
    aptosPorAndar, pavimentos, totalAptos, areaTotal, areaUtilTotal,
    capacidade, aptosVazios, perimetroProjecao,
    perimetroApto, perimetroBanh, compParedesIntApto, compParedesExtApto, 
    areaParedeTot, areaFachada, areaParedesInternasTot,
    areaAzulBanh, areaAzulCoz, areaAzulTot, areaSalaCoz, aptoValido,
    fatorDuracao,
    
    // Novas propriedades físicas paramétricas
    numPilares,
    compVigasPorPavimento,
    cargaTotalEdificio,
    volumeConcretoEstrutura,
    volumeLajes,
    volumePilares,
    volumeVigas,
    volumeFundacao,
    modalidade: inp.modalidade, vedacao: inp.vedacao,
    resolved: {
      A_pav: camposResolvidos.A_pav, A_apt: camposResolvidos.A_apt, n_apt: camposResolvidos.n_apt, n_pav: camposResolvidos.n_pav
    }
  };
}
