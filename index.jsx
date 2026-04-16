import React, { useState, useMemo, useEffect } from "react";
import { defaultInp, defaultInpB, BDI_PADRAO } from "./src/constants.js";
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
  const [bdiA, setBdiA] = useState(saved?.bdiA ?? BDI_PADRAO);
  const [bdiB, setBdiB] = useState(saved?.bdiB ?? BDI_PADRAO);
  const [overA, setOverA] = useState(saved?.overA ?? {});
  const [overB, setOverB] = useState(saved?.overB ?? {});
  const [comparar, setComparar] = useState(saved?.comparar ?? false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        inpA, inpB, bdiA, bdiB, overA, overB, comparar
      }));
    } catch {
      // storage quota exceeded or unavailable — fail silently
    }
  }, [inpA, inpB, bdiA, bdiB, overA, overB, comparar]);

  const resA = useMemo(() => calcular(inpA, overA, bdiA), [inpA, overA, bdiA]);
  const resB = useMemo(() => calcular(inpB, overB, bdiB), [inpB, overB, bdiB]);

  return (
    <div className="app-wrapper" style={{
      fontFamily: "system-ui, -apple-system, sans-serif",
      background: "#f1f5f9", minHeight: "100vh", color: "#0f172a"
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>
            Simulador de Custo de Construção — Edifício Residencial
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
            Custo bottom-up: geometria × preço unitário real. K<sub>util</sub> {"\u00A0"}80% · Fator forma 1,15 · Referência SINAPI/CUB 2025.
          </p>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13 }}>
            <input type="checkbox" checked={comparar} onChange={e => setComparar(e.target.checked)} />
            Comparar dois cenários
          </label>
        </header>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <Formulario titulo="Cenário A" cor="#2563eb" inp={inpA} setInp={setInpA}
                      bdi={bdiA} setBdi={setBdiA}
                      onResetPrecos={() => setOverA({})} />
          {comparar &&
            <Formulario titulo="Cenário B" cor="#db2777" inp={inpB} setInp={setInpB}
                        bdi={bdiB} setBdi={setBdiB}
                        onResetPrecos={() => setOverB({})} />}
        </div>

        <div className={comparar ? "grid-cols-2" : "grid-cols-1"} style={{ marginBottom: 16 }}>
          <PieChartPanel etapas={resA.etapas}
                         titulo="Distribuição por etapa — Cenário A"
                         cor="#2563eb" />
          {comparar && <ComparisonBarChart resA={resA} resB={resB} />}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Resumo titulo="Resumo — Cenário A" cor="#2563eb" inp={inpA} res={resA}
                  over={overA} setOver={setOverA} />
          {comparar &&
            <Resumo titulo="Resumo — Cenário B" cor="#db2777" inp={inpB} res={resB}
                    over={overB} setOver={setOverB} />}
        </div>

        {comparar && (
          <div className="panel-card" style={{ marginTop: 16, background: "#fff" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Diferença A → B</h3>
            <div className="grid-cols-4">
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
