import React, { useState, useMemo } from "react";
import { defaultInp, defaultInpB } from "./src/constants.js";
import { fmtBRL, fmtN } from "./src/utils.js";
import { calcular } from "./src/logic/calcular.js";
import { Formulario } from "./src/components/Formulario.jsx";
import { Resumo } from "./src/components/Resumo.jsx";
import { Metric } from "./src/components/Metric.jsx";
import { PieChartPanel, ComparisonBarChart } from "./src/components/Charts.jsx";


export default function SimuladorConstrucao() {
  const [inpA, setInpA] = useState(defaultInp);
  const [inpB, setInpB] = useState(defaultInpB);
  const [presetA, setPresetA] = useState("ultraEcon");
  const [presetB, setPresetB] = useState("popular");
  const [overA, setOverA] = useState({});
  const [overB, setOverB] = useState({});
  const [comparar, setComparar] = useState(false);

  const resA = useMemo(() => calcular(inpA, overA, presetA), [inpA, overA, presetA]);
  const resB = useMemo(() => calcular(inpB, overB, presetB), [inpB, overB, presetB]);

  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, sans-serif",
      background: "#f1f5f9", minHeight: "100vh", padding: 16, color: "#0f172a"
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>
            Simulador de Custo de Construção — Edifício Residencial
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
            Custo bottom-up: geometria × preço unitário. Referência CUB/SINAPI 2025-2026 (custos diretos, sem BDI/honorários).
          </p>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13 }}>
            <input type="checkbox" checked={comparar} onChange={e => setComparar(e.target.checked)} />
            Comparar dois cenários
          </label>
        </header>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <Formulario titulo="Cenário A" cor="#2563eb" inp={inpA} setInp={setInpA}
                      preset={presetA} setPreset={setPresetA}
                      onResetPrecos={() => setOverA({})} />
          {comparar &&
            <Formulario titulo="Cenário B" cor="#db2777" inp={inpB} setInp={setInpB}
                        preset={presetB} setPreset={setPresetB}
                        onResetPrecos={() => setOverB({})} />}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: comparar ? "1fr 1fr" : "1fr",
          gap: 12, marginBottom: 16
        }}>
          <PieChartPanel etapas={resA.etapas}
                         titulo="Distribuição por etapa — Cenário A"
                         cor="#2563eb" />
          {comparar && <ComparisonBarChart resA={resA} resB={resB} />}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Resumo titulo="Resumo — Cenário A" cor="#2563eb" inp={inpA} res={resA}
                  over={overA} setOver={setOverA} preset={presetA} />
          {comparar &&
            <Resumo titulo="Resumo — Cenário B" cor="#db2777" inp={inpB} res={resB}
                    over={overB} setOver={setOverB} preset={presetB} />}
        </div>

        {comparar && (
          <div style={{ marginTop: 16, background: "#fff", borderRadius: 10, padding: 14 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Diferença A → B</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 13 }}>
              <Metric label="Δ Custo total"
                      valor={fmtBRL(resB.custoTotal - resA.custoTotal)}
                      hint={resA.custoTotal > 0
                        ? `${fmtN(((resB.custoTotal / resA.custoTotal) - 1) * 100, 1)}%` : "—"} />
              <Metric label="Δ Custo/m²" valor={fmtBRL(resB.custoM2 - resA.custoM2)} />
              <Metric label="Δ Apartamentos" valor={`${resB.totalAptos - resA.totalAptos}`} />
              <Metric label="Δ Custo/apto" valor={fmtBRL(resB.custoApto - resA.custoApto)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
