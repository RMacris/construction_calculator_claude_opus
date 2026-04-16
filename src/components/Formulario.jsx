import { useState } from "react";
import { MODALIDADES, VEDACOES, CAMPOS_CALC, CUB_REFERENCIAS } from "../constants.js";
import { resolverCampos } from "../logic/geometria.js";
import { NumInput, inputStyle } from "./NumInput.jsx";
import { Campo } from "./Campo.jsx";
import { ConfirmModal } from "./ConfirmModal.jsx";

export function Formulario({ titulo, cor, inp, setInp, bdi, setBdi, onResetPrecos, onResetInp }) {  const [confirmReset, setConfirmReset] = useState(false);  const setN = (k) => (raw) => setInp({ ...inp, [k]: raw });
  const setS = (k) => (e) => setInp({ ...inp, [k]: e.target.value });
  const vedOk = Object.entries(VEDACOES).filter(([k]) =>
    !(inp.modalidade === "steelframe" && k === "alvenaria"));

  const r = resolverCampos(inp);

  const setCalculado = (novo) => {
    const mapa = { areaPavimento: "A_pav", areaApto: "A_apt", nApt: "n_apt", nPav: "n_pav" };
    const prevKey = mapa[inp.calculado];
    const valResolvido = r[prevKey];
    setInp({
      ...inp,
      [inp.calculado]: String(valResolvido).replace(".", ","),
      calculado: novo
    });
  };

  const campoInter = (key, label, hint) => {
    const mapa = { areaPavimento: "A_pav", areaApto: "A_apt", nApt: "n_apt", nPav: "n_pav" };
    const ehCalc = inp.calculado === key;
    const valExib = ehCalc ? r[mapa[key]] : inp[key];
    return (
      <Campo label={
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>{label}</span>
          {ehCalc && <span style={{
            fontSize: 9, background: "#16a34a", color: "#fff",
            padding: "1px 6px", borderRadius: 8, fontWeight: 700
          }}>AUTO</span>}
        </span>
      } hint={hint}>
        <NumInput
          value={ehCalc ? String(valExib).replace(".", ",") : inp[key]}
          onChange={ehCalc ? () => {} : setN(key)}
          style={ehCalc
            ? { ...inputStyle, background: "#f0fdf4", color: "#166534",
                fontWeight: 600, cursor: "not-allowed" }
            : inputStyle}
        />
      </Campo>
    );
  };

  const bdiPct = (typeof bdi === "number" ? bdi : parseFloat(String(bdi).replace(",", ".")) || 0);

  return (
    <div className="panel-card" style={{
      background: "#fff", border: `2px solid ${cor}`, flex: 1, minWidth: 280
    }}>
      <h3 style={{ margin: "0 0 10px", color: cor, fontSize: 15 }}>{titulo}</h3>

      <div style={{
        background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6,
        padding: 8, marginBottom: 10, fontSize: 12
      }}>
        <div style={{ fontWeight: 600, color: "#166534", marginBottom: 4 }}>
          Campo calculado automaticamente
        </div>
        <select style={inputStyle} value={inp.calculado}
                onChange={e => setCalculado(e.target.value)}>
          {Object.entries(CAMPOS_CALC).map(([k, v]) =>
            <option key={k} value={k}>{v}</option>)}
        </select>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
          Os outros 3 campos são editáveis e propagam para este.
        </div>
      </div>

      {campoInter("areaPavimento", "Área do pavimento (m²)", "Área bruta de cada andar (incl. circulação ~20%)")}
      {campoInter("areaApto", "Área por apartamento (m²)", "Área privativa do apto")}
      {campoInter("nApt", "Nº de apartamentos (total)")}
      {campoInter("nPav", "Nº de pavimentos")}

      <Campo label="Área do banheiro (m²)" hint="Aumenta área de azulejo">
        <NumInput value={inp.areaBanheiro} onChange={setN("areaBanheiro")} />
      </Campo>
      <Campo label="Pé-direito (m)" hint="Aumenta área de paredes, azulejo e pintura">
        <NumInput value={inp.peDireito} onChange={setN("peDireito")} />
      </Campo>
      <Campo label="Modalidade construtiva">
        <select style={inputStyle} value={inp.modalidade}
          onChange={(e) => {
            const nova = e.target.value;
            const ved = (nova === "steelframe" && inp.vedacao === "alvenaria")
              ? "drywall" : inp.vedacao;
            setInp({ ...inp, modalidade: nova, vedacao: ved });
          }}>
          {Object.entries(MODALIDADES).map(([k, v]) =>
            <option key={k} value={k}>{v.label}</option>)}
        </select>
      </Campo>
      <Campo label="Sistema de vedação interna">
        <select style={inputStyle} value={inp.vedacao} onChange={setS("vedacao")}>
          {vedOk.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </Campo>

      <Campo label="BDI — Bonificações e Despesas Indiretas (%)"
             hint="Administração central, lucro, impostos, seguros, garantias">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="range" min="0" max="50" step="1"
            value={Math.round(bdiPct * 100)}
            onChange={e => setBdi(parseInt(e.target.value, 10) / 100)}
            style={{ flex: 1 }}
          />
          <span style={{
            minWidth: 48, textAlign: "center", fontWeight: 700,
            fontSize: 14, color: cor
          }}>{Math.round(bdiPct * 100)}%</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
          {[15, 20, 25, 30, 35].map(v => (
            <button key={v}
              onClick={() => setBdi(v / 100)}
              style={{
                padding: "2px 8px", fontSize: 11, borderRadius: 4, cursor: "pointer",
                border: Math.round(bdiPct * 100) === v ? `2px solid ${cor}` : "1px solid #cbd5e1",
                background: Math.round(bdiPct * 100) === v ? "#eff6ff" : "#fff",
                fontWeight: Math.round(bdiPct * 100) === v ? 700 : 400
              }}>
              {v}%
            </button>
          ))}
        </div>
      </Campo>

      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        <button onClick={onResetPrecos} style={{
          padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: 6,
          background: "#f8fafc", fontSize: 12, cursor: "pointer", width: "100%"
        }}>Resetar preços para base do catálogo</button>
        <button onClick={() => setConfirmReset(true)} style={{
          padding: "6px 12px", border: "1px solid #fca5a5", borderRadius: 6,
          background: "#fef2f2", color: "#b91c1c", fontSize: 12,
          cursor: "pointer", width: "100%", fontWeight: 600
        }}>⟳ Resetar todos os inputs para o padrão</button>
      </div>

      {confirmReset && (
        <ConfirmModal
          title="Resetar inputs do formulário?"
          message={`Todos os valores de "${titulo}" (área, pavimentos, apartamentos, etc.) serão restaurados para os valores padrão. Esta ação não pode ser desfeita.`}
          onConfirm={() => { onResetInp(); setConfirmReset(false); }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
