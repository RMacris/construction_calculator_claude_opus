import React, { useState, useMemo, useEffect } from "react";
import { defaultInp, defaultInpB } from "./src/constants.js";
import { fmtBRL, fmtN, num } from "./src/utils.js";
import { calcular } from "./src/logic/calcular.js";
import { Formulario } from "./src/components/Formulario.jsx";
import { Resumo } from "./src/components/Resumo.jsx";
import { Metric } from "./src/components/Metric.jsx";
import { PieChartPanel, ComparisonBarChart } from "./src/components/Charts.jsx";

const STORAGE_KEY = "simulador_construcao_state";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function SimuladorConstrucao() {
  const saved = loadState();
  const [inpA, setInpA] = useState(saved?.inpA ?? defaultInp);
  const [inpB, setInpB] = useState(saved?.inpB ?? defaultInpB);
  const [presetA, setPresetA] = useState(saved?.presetA ?? "ultraEcon");
  const [presetB, setPresetB] = useState(saved?.presetB ?? "popular");
  const [customM2A, setCustomM2A] = useState(saved?.customM2A ?? "");
  const [customM2B, setCustomM2B] = useState(saved?.customM2B ?? "");
  const [overA, setOverA] = useState(saved?.overA ?? {});
  const [overB, setOverB] = useState(saved?.overB ?? {});
  const [comparar, setComparar] = useState(saved?.comparar ?? false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        inpA, inpB, presetA, presetB, customM2A, customM2B, overA, overB, comparar
      }));
    } catch {
      // storage quota exceeded or unavailable — fail silently
    }
  }, [inpA, inpB, presetA, presetB, customM2A, customM2B, overA, overB, comparar]);

  const resA = useMemo(() => calcular(inpA, overA, presetA, num(customM2A)), [inpA, overA, presetA, customM2A]);
  const resB = useMemo(() => calcular(inpB, overB, presetB, num(customM2B)), [inpB, overB, presetB, customM2B]);

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
                      customM2={customM2A} setCustomM2={setCustomM2A}
                      onResetPrecos={() => setOverA({})} />
          {comparar &&
            <Formulario titulo="Cenário B" cor="#db2777" inp={inpB} setInp={setInpB}
                        preset={presetB} setPreset={setPresetB}
                        customM2={customM2B} setCustomM2={setCustomM2B}
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
