import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { CORES } from "../constants.js";
import { fmtBRL } from "../utils.js";

export function PieChartPanel({ etapas, titulo, cor }) {
  const data = etapas.map(e => ({ name: e.nome, value: e.valor }));
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 12 }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 14, color: cor }}>{titulo}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label={false}>
            {data.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => fmtBRL(v)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonBarChart({ resA, resB }) {
  const allEtapaIds = Array.from(new Set([
    ...resA.etapas.map(e => e.id), ...resB.etapas.map(e => e.id)
  ]));
  const barData = allEtapaIds.map(id => {
    const a = resA.etapas.find(e => e.id === id);
    const b = resB.etapas.find(e => e.id === id);
    return {
      nome: (a || b).nome.split(" ")[0].replace("—", "").slice(0, 12),
      "Cenário A": a?.valor || 0,
      "Cenário B": b?.valor || 0
    };
  });

  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 12 }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Comparação A vs B por etapa</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="nome" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={v => fmtBRL(v)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Cenário A" fill="#2563eb" />
          <Bar dataKey="Cenário B" fill="#db2777" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
