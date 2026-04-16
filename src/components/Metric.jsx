export function Metric({ label, valor, hint, destaque, cor }) {
  return (
    <div style={{
      background: destaque ? cor : "#f8fafc",
      color: destaque ? "#fff" : "#0f172a",
      padding: 8, borderRadius: 6
    }}>
      <div style={{ fontSize: 11, opacity: 0.85 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700 }}>{valor}</div>
      {hint && <div style={{ fontSize: 10, opacity: 0.8 }}>{hint}</div>}
    </div>
  );
}
