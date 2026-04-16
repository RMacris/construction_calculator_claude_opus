import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NumInput, inputStyle } from "./NumInput.jsx";
import { DIM_LABELS } from "../logic/catalogo.js";
import { fmtN } from "../utils.js";

const dimFields = (dims) => {
  if (!dims) return [];
  return Object.entries(dims)
    .filter(([k]) => k !== "un")
    .map(([k, v]) => ({ key: k, label: DIM_LABELS[k] || k, value: v }));
};

export function MaterialModal({ mat, onSave, onClose }) {
  const [nome, setNome] = useState(mat.nome);
  const [preco, setPreco] = useState(String(mat.punit).replace(".", ","));
  const [dims, setDims] = useState(() => {
    if (!mat.dims) return null;
    const d = {};
    for (const [k, v] of Object.entries(mat.dims)) {
      if (k !== "un") d[k] = String(v).replace(".", ",");
    }
    return d;
  });

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const unDims = mat.dims?.un || "";
  const fields = dims ? dimFields(mat.dimsDefault || mat.dims) : [];

  const handleSave = () => {
    const result = { nome, preco };
    if (dims) {
      const parsed = {};
      for (const [k, v] of Object.entries(dims)) {
        parsed[k] = parseFloat(String(v).replace(",", ".")) || 0;
      }
      result.dims = parsed;
    }
    onSave(result);
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700, fontSize: 14 }}>Editar Material</span>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <div className="modal-body">
          <label className="modal-field">
            <span className="modal-label">Nome do material</span>
            <input type="text" value={nome}
              onChange={e => setNome(e.target.value)}
              style={inputStyle} />
          </label>

          {fields.length > 0 && (
            <div className="modal-dims-section">
              <span className="modal-label" style={{ marginBottom: 6 }}>
                Dimensões {unDims && <span style={{ color: "#64748b" }}>({unDims})</span>}
              </span>
              <div className="modal-dims-grid">
                {fields.map(f => (
                  <label key={f.key} className="modal-field" style={{ margin: 0 }}>
                    <span style={{ fontSize: 11, color: "#475569", marginBottom: 2 }}>{f.label}</span>
                    <NumInput
                      value={dims[f.key]}
                      onChange={v => setDims({ ...dims, [f.key]: v })}
                      style={inputStyle}
                    />
                  </label>
                ))}
              </div>
              {dims && (
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                  Área da peça: {(() => {
                    const vals = Object.entries(dims)
                      .map(([, v]) => parseFloat(String(v).replace(",", ".")) || 0);
                    const divisor = unDims === "cm" ? 10000 : 1;
                    const area = vals.reduce((a, b) => a * b, 1) / divisor;
                    return `${fmtN(area, 4)} m²`;
                  })()}
                </div>
              )}
            </div>
          )}

          <label className="modal-field">
            <span className="modal-label">Preço unitário (R$)</span>
            <NumInput value={preco} onChange={setPreco} style={inputStyle} />
          </label>

          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Quantidade: <strong>{fmtN(mat.qtd, 0)}</strong> {mat.un}
            {mat.obr && <span className="badge-obr" style={{ marginLeft: 8 }}>obrigatório</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="modal-btn modal-btn-cancel">Cancelar</button>
          <button onClick={handleSave} className="modal-btn modal-btn-save">Salvar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
