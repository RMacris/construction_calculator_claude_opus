import { useEffect } from "react";

/**
 * Modal de confirmação reutilizável.
 * Props:
 *   title   — título do modal
 *   message — mensagem de aviso (string ou JSX)
 *   onConfirm — callback ao confirmar
 *   onCancel  — callback ao cancelar / fechar
 */
export function ConfirmModal({ title, message, onConfirm, onCancel }) {
  // Fechar com ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 10, padding: 24,
          maxWidth: 380, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <h3 style={{ margin: 0, fontSize: 16, color: "#1e293b" }}>{title}</h3>
        </div>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px", borderRadius: 6, border: "1px solid #cbd5e1",
              background: "#f8fafc", cursor: "pointer", fontSize: 13
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 18px", borderRadius: 6, border: "none",
              background: "#dc2626", color: "#fff", cursor: "pointer",
              fontSize: 13, fontWeight: 700
            }}
          >
            Sim, apagar
          </button>
        </div>
      </div>
    </div>
  );
}
