export function Campo({ label, children, hint }) {
  return (
    <label style={{ display: "block", marginBottom: 10, fontSize: 13 }}>
      <span style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>
        {label}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: "#64748b" }}>{hint}</span>}
    </label>
  );
}
