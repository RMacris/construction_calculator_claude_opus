import { useState } from "react";
import { CORES } from "../constants.js";
import { fmtBRL, fmtN } from "../utils.js";
import { NumInput } from "./NumInput.jsx";
import { MaterialModal } from "./MaterialModal.jsx";
import { ConfirmModal } from "./ConfirmModal.jsx";

const cellInp = {
  width: "100%", padding: "3px 5px", fontSize: 11,
  border: "1px solid #cbd5e1", borderRadius: 4, textAlign: "right",
  boxSizing: "border-box", background: "#fff"
};
const cellInpL = { ...cellInp, textAlign: "left" };

function MaterialRow({ material, modoEdicao, etapa, over, setOver, customList, onOpenModal }) {
  const indiceCustomizado = material.custom ? customList.findIndex(itemCustomizado => itemCustomizado.key === material.key) : -1;

  const setPreco = (key, novoValor) => setOver({ ...over, precos: { ...(over.precos || {}), [key]: novoValor } });
  const setQtd   = (key, novoValor) => setOver({ ...over, qtds:   { ...(over.qtds   || {}), [key]: novoValor } });
  const remover  = (key)    => setOver({ ...over, removidos: { ...(over.removidos || {}), [key]: true } });
  const setCustomField = (etapaId, indice, field, novoValor) => {
    const custom = { ...(over.custom || {}) };
    const listaItens = [...(custom[etapaId] || [])];
    listaItens[indice] = { ...listaItens[indice], [field]: novoValor };
    custom[etapaId] = listaItens;
    setOver({ ...over, custom });
  };
  const removerCustom = (etapaId, indice) => {
    const custom = { ...(over.custom || {}) };
    const listaItens = [...(custom[etapaId] || [])];
    listaItens.splice(indice, 1);
    custom[etapaId] = listaItens;
    setOver({ ...over, custom });
  };

  return (
    <tr style={{ borderTop: "1px solid #e2e8f0" }}>
      <td style={{ padding: 4 }}>
        {modoEdicao && material.custom ? (
          <input type="text" value={customList[indiceCustomizado]?.nome || ""}
            onChange={ev => setCustomField(etapa.id, indiceCustomizado, "nome", ev.target.value)}
            style={cellInpL} />
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {material.obr && <span className="badge-obr" title="Obrigatório">●</span>}
            {material.nome}
            {material.custom && <span style={{ color: "#db2777", fontSize: 10 }}> ✚</span>}
            {material.dims && modoEdicao && (
              <button onClick={() => onOpenModal(material)} title="Editar dimensões"
                style={{ border: "none", background: "transparent", cursor: "pointer",
                         color: "#3b82f6", fontSize: 12, padding: 0, marginLeft: 2 }}>⚙</button>
            )}
          </span>
        )}
      </td>
      <td style={{ padding: 4, textAlign: "right" }}>
        {modoEdicao ? (
          <NumInput
            style={cellInp}
            value={material.custom
              ? customList[indiceCustomizado]?.qtd
              : ((over.qtds || {})[material.key] !== undefined
                  ? (over.qtds || {})[material.key] : material.qtd)}
            onChange={(novoValor) => material.custom
              ? setCustomField(etapa.id, indiceCustomizado, "qtd", novoValor)
              : setQtd(material.key, novoValor)}
          />
        ) : fmtN(material.qtd, 0)}
      </td>
      <td style={{ padding: 4 }}>
        {modoEdicao && material.custom ? (
          <input type="text" value={customList[indiceCustomizado]?.un || ""}
            onChange={ev => setCustomField(etapa.id, indiceCustomizado, "un", ev.target.value)}
            style={cellInpL} />
        ) : material.un}
      </td>
      <td style={{ padding: 4, textAlign: "right" }}>
        {modoEdicao ? (
          <NumInput
            style={cellInp}
            value={material.custom
              ? customList[indiceCustomizado]?.punit
              : ((over.precos || {})[material.key] !== undefined
                  ? (over.precos || {})[material.key] : material.punit.toFixed(2))}
            onChange={(novoValor) => material.custom
              ? setCustomField(etapa.id, indiceCustomizado, "punit", novoValor)
              : setPreco(material.key, novoValor)}
          />
        ) : fmtBRL(material.punit)}
      </td>
      <td style={{ padding: 4, textAlign: "right", fontWeight: 600 }}>
        {fmtBRL(material.subtotal)}
      </td>
      {modoEdicao && (
        <td style={{ padding: 4, textAlign: "center" }}>
          {!material.obr ? (
            <button
              onClick={() => material.custom ? removerCustom(etapa.id, indiceCustomizado) : remover(material.key)}
              title="Remover"
              style={{ border: "none", background: "transparent",
                       color: "#dc2626", cursor: "pointer", fontSize: 14,
                       padding: 0, lineHeight: 1 }}>✕</button>
          ) : (
            <span title="Material obrigatório" style={{ color: "#94a3b8", fontSize: 12 }}>🔒</span>
          )}
        </td>
      )}
    </tr>
  );
}

function EtapaRow({ etapa, indice, cor, over, setOver, maxPct, custoTotal }) {
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [modalMat, setModalMat] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const percentualCusto = etapa.valor / (custoTotal || 1);
  const customList = (over.custom || {})[etapa.id] || [];

  // Reset all overrides for this etapa (precos, qtds, removidos, custom, dims)
  const resetEtapa = () => {
    const next = { ...over };
    const prefix = `${etapa.id}.`;
    if (next.precos) {
      next.precos = Object.fromEntries(
        Object.entries(next.precos).filter(([chave]) => !chave.startsWith(prefix))
      );
    }
    if (next.qtds) {
      next.qtds = Object.fromEntries(
        Object.entries(next.qtds).filter(([chave]) => !chave.startsWith(prefix))
      );
    }
    if (next.removidos) {
      next.removidos = Object.fromEntries(
        Object.entries(next.removidos).filter(([chave]) => !chave.startsWith(prefix))
      );
    }
    if (next.dims) {
      next.dims = Object.fromEntries(
        Object.entries(next.dims).filter(([chave]) => !chave.startsWith(prefix))
      );
    }
    if (next.custom) {
      const { [etapa.id]: _removed, ...rest } = next.custom;
      next.custom = rest;
    }
    setOver(next);
    setConfirmReset(false);
    setEditMode(false);
  };

  const adicionarCustom = () => {
    const custom = { ...(over.custom || {}) };
    const listaItens = [...(custom[etapa.id] || [])];
    listaItens.push({
      key: `custom_${etapa.id}_${Date.now()}`,
      nome: "Novo item", un: "un", qtd: "1", punit: "0"
    });
    custom[etapa.id] = listaItens;
    setOver({ ...over, custom });
  };

  const handleModalSave = (result) => {
    if (!modalMat) return;
    const key = modalMat.key;
    const next = { ...over };
    // Preço
    next.precos = { ...(next.precos || {}), [key]: result.preco };
    // Dims
    if (result.dims) {
      next.dims = { ...(next.dims || {}), [key]: result.dims };
    }
    setOver(next);
    setModalMat(null);
  };

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, marginBottom: 6, background: "#fff" }}>
      <div className="etapa-row-header" onClick={() => setExpanded(estadoAtual => !estadoAtual)}>
        <span style={{ width: 16, color: "#64748b" }}>{expanded ? "▾" : "▸"}</span>
        <span style={{ flex: 1, fontWeight: 600, color: "#1e293b", minWidth: 120 }}>{etapa.nome}</span>
        <span className="etapa-row-pct">
          {fmtN(percentualCusto * 100, 1)}%
        </span>
        <div className="etapa-row-bar">
          <div style={{ width: `${(percentualCusto / (maxPct || 1)) * 100}%`, height: "100%", background: CORES[indice % CORES.length] }} />
        </div>
        <span className="etapa-row-valor" style={{ color: cor }}>
          {fmtBRL(etapa.valor)}
        </span>
      </div>
      {expanded && (
        <div className="etapa-expanded-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>
              {etapa.mats.length} {etapa.mats.length === 1 ? "item" : "itens"}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setConfirmReset(true)}
                title="Resetar todos os dados desta etapa"
                style={{
                  padding: "4px 8px", fontSize: 11, border: "1px solid #fca5a5",
                  borderRadius: 4, background: "#fef2f2", color: "#b91c1c",
                  cursor: "pointer"
                }}>
                ⟳ Reset
              </button>
              <button
                onClick={(ev) => { ev.stopPropagation(); setEditMode(estadoAtual => !estadoAtual); }}
                style={{
                  padding: "4px 10px", fontSize: 11, border: "1px solid #cbd5e1",
                  borderRadius: 4, background: editMode ? "#fef3c7" : "#fff", cursor: "pointer"
                }}>
                {editMode ? "✓ Pronto" : "✎ Editar itens"}
              </button>
            </div>
          </div>
          <div className="table-responsive">
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: 340 }}>
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
                {etapa.mats.map((material) => (
                  <MaterialRow key={material.key} material={material} modoEdicao={editMode} etapa={etapa}
                               over={over} setOver={setOver} customList={customList}
                               onOpenModal={setModalMat} />
                ))}
              </tbody>
            </table>
          </div>
          {editMode && (
            <div style={{ marginTop: 6 }}>
              <button onClick={adicionarCustom} style={{
                padding: "4px 10px", fontSize: 11, border: "1px dashed #94a3b8",
                borderRadius: 4, background: "#fff", cursor: "pointer", color: "#475569"
              }}>+ Adicionar material</button>
            </div>
          )}
          {modalMat && (
            <MaterialModal mat={modalMat} onClose={() => setModalMat(null)}
                           onSave={handleModalSave} />
          )}
          {confirmReset && (
            <ConfirmModal
              title={`Resetar etapa "${etapa.nome}"?`}
              message="Todos os preços, quantidades, itens removidos e materiais adicionados nesta etapa serão apagados e restaurados para os valores calculados automaticamente."
              onConfirm={resetEtapa}
              onCancel={() => setConfirmReset(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

const GRUPOS_SIMULTANEOS = [
  { ids: ["vedacao", "cobertura"],        titulo: "Vedação e Cobertura",     icone: "🧱", corDestaque: "#0ea5e9", fundo: "#f0f9ff" }, // sky-500, sky-50
  { ids: ["esquadrias", "revestimentos"], titulo: "Esquadrias e Acabamento", icone: "🪟", corDestaque: "#10b981", fundo: "#f0fdf4" }, // emerald-500, emerald-50
  { ids: ["hidraulica", "eletrica"],      titulo: "Instalações Embutidas",   icone: "⚡", corDestaque: "#8b5cf6", fundo: "#f5f3ff" }  // violet-500, violet-50
];

function agruparEtapas(etapas) {
  const lista = [];
  const jaAgrupados = new Set();

  for (const etapa of etapas) {
    if (jaAgrupados.has(etapa.id)) continue;
    
    const grupo = GRUPOS_SIMULTANEOS.find(g => g.ids.includes(etapa.id));
    if (grupo) {
      const etapasDoGrupo = etapas.filter(e => grupo.ids.includes(e.id));
      etapasDoGrupo.forEach(e => jaAgrupados.add(e.id));
      lista.push({ tipo: "grupo", ...grupo, etapas: etapasDoGrupo });
    } else {
      lista.push({ tipo: "simples", etapa });
    }
  }
  return lista;
}

export function EtapasTabela({ res, cor, over, setOver }) {
  const maxPct = Math.max(...res.etapas.map(etapa => etapa.valor / (res.custoTotal || 1)));
  const listaAgrupada = agruparEtapas(res.etapas);
  
  let idxLogico = 0;

  return (
    <div style={{ marginTop: 10 }}>
      {listaAgrupada.map((item) => {
        if (item.tipo === "grupo") {
          const startIndex = idxLogico;
          idxLogico += item.etapas.length;
          return (
            <div key={item.titulo} style={{
              border: "1px solid #e2e8f0",
              borderLeft: `4px solid ${item.corDestaque}`,
              backgroundColor: item.fundo,
              borderRadius: "6px",
              padding: "10px 10px 4px 10px",
              marginBottom: 8,
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}>
              <div style={{ 
                fontSize: 11, fontWeight: 700, color: item.corDestaque, 
                textTransform: "uppercase", letterSpacing: "0.5px", 
                paddingLeft: 4, paddingBottom: 8, 
                display: "flex", alignItems: "center", gap: 6 
              }}>
                <span style={{ fontSize: 13 }}>{item.icone}</span> 
                <span>{item.titulo} <span style={{ opacity: 0.7, fontWeight: 500, textTransform: "none" }}>— Fases Simultâneas</span></span>
              </div>
              {item.etapas.map((etapa, i) => (
                <EtapaRow key={etapa.id} etapa={etapa} indice={startIndex + i} cor={cor} over={over} setOver={setOver} maxPct={maxPct} custoTotal={res.custoTotal} />
              ))}
            </div>
          );
        }
        
        const iGlobal = idxLogico++;
        return (
          <EtapaRow key={item.etapa.id} etapa={item.etapa} indice={iGlobal} cor={cor} over={over} setOver={setOver} maxPct={maxPct} custoTotal={res.custoTotal} />
        );
      })}
    </div>
  );
}
