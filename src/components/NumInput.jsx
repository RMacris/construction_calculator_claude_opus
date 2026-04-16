export const inputStyle = {
  width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1",
  borderRadius: 6, fontSize: 13, background: "#fff", boxSizing: "border-box"
};

export function NumInput({ value, onChange, style, placeholder }) {
  const display = value === undefined || value === null
    ? "" : String(value).replace(".", ",");
  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "" || /^-?\d*[.,]?\d*$/.test(raw)) {
          onChange(raw);
        }
      }}
      style={style || inputStyle}
    />
  );
}
