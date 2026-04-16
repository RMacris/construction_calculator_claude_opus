export const fmtBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(isFinite(v) ? v : 0);

export const fmtN = (v, d = 2) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: d, maximumFractionDigits: d
  }).format(isFinite(v) ? v : 0);

// Converte string (com vírgula ou ponto) ou número em número
export const num = (v) => {
  if (typeof v === "number") return isFinite(v) ? v : 0;
  if (v === "" || v === undefined || v === null) return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return isFinite(n) ? n : 0;
};
