import { useState } from "react";
import { CORES } from "../constants.js";
import { fmtBRL, fmtN } from "../utils.js";
import { NumInput } from "./NumInput.jsx";

const cellInp = {
  width: "100%", padding: "3px 5px", fontSize: 11,
  border: "1px solid #cbd5e1", borderRadius: 4, textAlign: "right",
  boxSizing: "border-box", background: "#fff"
};
const cellInpL = { ...cellInp, textAlign: "left" };

function MaterialRow({ m, ed, e, over, setOver, customList }) {
  const idxCustom = m.custom ? customList.findIndex(c => c.key === m.key) : -1;

  const setPreco = (key, v) => setOver({ ...over, precos: { ...(over.precos || {}), [key]: v } });
  const setQtd   = (key, v) => setOver({ ...over, qtds:   { ...(over.qtds   || {}), [key]: v } });
  const remover  = (key)    => setOver({ ...over, removidos: { ...(over.removidos || {}), [key]: true } });
  const setCustomField = (etapaId, idx, field, v) => {
    const custom = { ...(over.custom || {}) };
    const arr = [...(custom[etapaId] || [])];
    arr[idx] = { ...arr[idx], [field]: v };
    custom[etapaId] = arr;
    setOver({ ...over, custom });
  };
  const removerCustom = (etapaId, idx) => {
    const custom = { ...(over.custom || {}) };
    const arr = [...(custom[etapaId] || [])];
    arr.splice(idx, 1);
    custom[etapaId] = arr;
    setOver({ ...over, custom });
  };

  return (
    <tr style={{ borderTop: "1px solid #e2e8f0" }}>
      <td style={{ padding: 4 }}>
        {ed && m.custom ? (
          <input type="text" value={customList[idxCustom]?.nome || ""}
            onChange={ev => setCustomField(e.id, idxCustom, "nome", ev.target.value)}
            style={cellInpL} />
        ) : (
          <span>{m.nome}{m.custom && <span style={{ color: "#db2777", fontSize: 10 }}> ✚</span>}</span>
        )}
      </td>
      <td style={{ padding: 4, textAlign: "right" }}>
        {ed ? (
          <NumInput
            style={cellInp}
            value={m.custom
              ? customList[idxCustom]?.qtd
              : ((over.qtds || {})[m.key] !== undefined
                  ? (over.qtds || {})[m.key] : m.qtd)}
            onChange={(v) => m.custom
              ? setCustomField(e.id, idxCustom, "qtd", v)
              : setQtd(m.key, v)}
          />
        ) : fmtN(m.qtd, 0)}
      </td>
      <td style={{ padding: 4 }}>
        {ed && m.custom ? (
          <input type="text" value={customList[idxCustom]?.un || ""}
            onChange={ev => setCustomField(e.id, idxCustom, "un", ev.target.value)}
            style={cellInpL} />
        ) : m.un}
      </td>
      <td style={{ padding: 4, textAlign: "right" }}>
        {ed ? (
          <NumInput
            style={cellInp}
            value={m.custom
              ? customList[idxCustom]?.punit
              : ((over.precos || {})[m.key] !== undefined
                  ? (over.precos || {})[m.key] : m.punit.toFixed(2))}
            onChange={(v) => m.custom
              ? setCustomField(e.id, idxCustom, "punit", v)
              : setPreco(m.key, v)}
          />
        ) : fmtBRL(m.punit)}
      </td>
      <td style={{ padding: 4, textAlign: "right", fontWeight: 600 }}>
        {fmtBRL(m.subtotal)}
      </td>
      {ed && (
        <td style={{ padding: 4, textAlign: "center" }}>
          <button
            onClick={() => m.custom ? removerCustom(e.id, idxCustom) : remover(m.key)}
            title="Remover"
            style={{ border: "none", background: "transparent",
                     color: "#dc2626", cursor: "pointer", fontSize: 14,
                     padding: 0, lineHeight: 1 }}>✕</button>
        </td>
      )}
    </tr>
  );
}

function EtapaRow({ e, i, cor, over, setOver, maxPct, custoTotal }) {
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const pct = e.valor / (custoTotal || 1);
  const customList = (over.custom || {})[e.id] || [];

  const adicionarCustom = () => {
    const custom = { ...(over.custom || {}) };
    const arr = [...(custom[e.id] || [])];
    arr.push({
      key: `custom_${e.id}_${Date.now()}`,
      nome: "Novo item", un: "un", qtd: "1", punit: "0"
    });
    custom[e.id] = arr;
    setOver({ ...over, custom });
  };

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, marginBottom: 6, background: "#fff" }}>
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ padding: "8px 10px", cursor: "pointer", display: "flex",
                 alignItems: "center", gap: 10, fontSize: 13 }}>
        <span style={{ width: 16, color: "#64748b" }}>{expanded ? "▾" : "▸"}</span>
        <span style={{ flex: 1, fontWeight: 600, color: "#1e293b" }}>{e.nome}</span>
        <span style={{ width: 70, textAlign: "right", color: "#475569" }}>
          {fmtN(pct * 100, 1)}%
        </span>
        <div style={{ width: 100, height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${(pct / (maxPct || 1)) * 100}%`, height: "100%", background: CORES[i % CORES.length] }} />
        </div>
        <span style={{ width: 130, textAlign: "right", fontWeight: 600, color: cor }}>
          {fmtBRL(e.valor)}
        </span>
      </div>
      {expanded && (
        <div style={{ padding: "6px 10px 10px 20px", background: "#f8fafc" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>
              {e.mats.length} {e.mats.length === 1 ? "item" : "itens"}
            </span>
            <button
              onClick={(ev) => { ev.stopPropagation(); setEditMode(v => !v); }}
              style={{
                padding: "4px 10px", fontSize: 11, border: "1px solid #cbd5e1",
                borderRadius: 4, background: editMode ? "#fef3c7" : "#fff", cursor: "pointer"
              }}>
              {editMode ? "✓ Pronto" : "✎ Editar itens"}
            </button>
          </div>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#64748b", textAlign: "left" }}>
                <th style={{ padding: 4, width: "38%" }}>Material</th>
                <th style={{ padding: 4, width: 80, textAlign: "right" }}>Qtd</th>
                <th style={{ padding: 4, width: 60 }}>Un</th>
                <th style={{ padding: 4, width: 110, textAlign: "right" }}>Preço unit.</th>
                <th style={{ padding: 4, textAlign: "right" }}>Subtotal</th>
                {editMode && <th style={{ width: 28 }}></th>}
              </tr>
            </thead>
            <tbody>
              {e.mats.map((m) => (
                <MaterialRow key={m.key} m={m} ed={editMode} e={e}
                             over={over} setOver={setOver} customList={customList} />
              ))}
            </tbody>
          </table>
          {editMode && (
            <div style={{ marginTop: 6 }}>
              <button onClick={adicionarCustom} style={{
                padding: "4px 10px", fontSize: 11, border: "1px dashed #94a3b8",
                borderRadius: 4, background: "#fff", cursor: "pointer", color: "#475569"
              }}>+ Adicionar material</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EtapasTabela({ res, cor, over, setOver }) {
  const maxPct = Math.max(...res.etapas.map(e => e.valor / (res.custoTotal || 1)));
  return (
    <div style={{ marginTop: 10 }}>
      {res.etapas.map((e, i) => (
        <EtapaRow key={e.id} e={e} i={i} cor={cor} over={over} setOver={setOver}
                  maxPct={maxPct} custoTotal={res.custoTotal} />
      ))}
    </div>
  );
}
