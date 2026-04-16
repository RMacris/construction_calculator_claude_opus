import { MODALIDADES, PRESETS } from "../constants.js";
import { fmtBRL, fmtN } from "../utils.js";
import { Metric } from "./Metric.jsx";
import { EtapasTabela } from "./EtapasTabela.jsx";

export function Resumo({ titulo, cor, inp, res, over, setOver, preset }) {
  const alertas = [];
  if (!res.aptoValido)
    alertas.push("Área do apto incompatível: banheiro + quarto (8m²) + sala (6m² mín) não cabem.");
  if (inp.modalidade === "steelframe" && inp.vedacao === "alvenaria")
    alertas.push("Vedação de alvenaria não é compatível com esta modalidade construtiva.");
  if (res.totalAptos === 0)
    alertas.push("Nenhum apto cabe no pavimento — reduza área do apto ou aumente área do pavimento.");

  return (
    <div style={{
      background: "#fff", border: `2px solid ${cor}`, borderRadius: 10, padding: 14, flex: 1, minWidth: 280
    }}>
      <h3 style={{ margin: "0 0 10px", color: cor, fontSize: 15 }}>{titulo}</h3>
      {alertas.map((a, i) => (
        <div key={i} style={{
          background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca",
          padding: 8, borderRadius: 6, fontSize: 12, marginBottom: 6
        }}>⚠ {a}</div>
      ))}
      <div className="metrics-grid">
        <Metric label="Custo total"            valor={fmtBRL(res.custoTotal)} destaque cor={cor} />
        <Metric label="Custo/m² realizado"     valor={fmtBRL(res.custoM2)} destaque cor="#16a34a" />
        <Metric label="Pavimentos"             valor={`${res.pavimentos}`} />
        <Metric label="Apartamentos"
                valor={`${res.totalAptos}`}
                hint={res.aptosVazios > 0
                  ? `Capacidade do prédio: ${res.capacidade} (${res.aptosVazios} slot${res.aptosVazios > 1 ? "s" : ""} vago${res.aptosVazios > 1 ? "s" : ""})`
                  : `Capacidade exata (${res.aptosPorAndar}/andar)`} />
        <Metric label="Área total construída"  valor={`${fmtN(res.areaTotal, 0)} m²`} />
        <Metric label="Área parede total"      valor={`${fmtN(res.areaParedeTot, 0)} m²`} />
        <Metric label="Área azulejo total"     valor={`${fmtN(res.areaAzulTot, 0)} m²`} />
        <Metric label="Custo/apto"             valor={fmtBRL(res.custoApto)} />
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        {MODALIDADES[inp.modalidade].descr} · Desperdício {fmtN(MODALIDADES[inp.modalidade].desperdicio * 100, 0)}% · Preset: {preset === "custom" ? "Personalizado" : `${PRESETS[preset]?.label} — R$ ${PRESETS[preset]?.custoM2.toLocaleString("pt-BR")}/m²`}
      </div>
      <EtapasTabela res={res} cor={cor} over={over} setOver={setOver} />
    </div>
  );
}
