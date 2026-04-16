import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { CORES } from "../constants.js";
import { fmtBRL } from "../utils.js";

export function PieChartPanel({ etapas, titulo, cor }) {
  const data = etapas.map(etapa => ({ name: etapa.nome, value: etapa.valor }));
  return (
    <div className="panel-card-sm" style={{ background: "#fff" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 14, color: cor }}>{titulo}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label={false}>
            {data.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
          </Pie>
          <Tooltip formatter={(valor) => fmtBRL(valor)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonBarChart({ resA, resB }) {
  const allEtapaIds = Array.from(new Set([
    ...resA.etapas.map(etapa => etapa.id), ...resB.etapas.map(etapa => etapa.id)
  ]));
  const barData = allEtapaIds.map(id => {
    const etapaResultadoA = resA.etapas.find(etapa => etapa.id === id);
    const etapaResultadoB = resB.etapas.find(etapa => etapa.id === id);
    return {
      nome: (etapaResultadoA || etapaResultadoB).nome.split(" ")[0].replace("—", "").slice(0, 12),
      "Cenário A": etapaResultadoA?.valor || 0,
      "Cenário B": etapaResultadoB?.valor || 0
    };
  });

  return (
    <div className="panel-card-sm" style={{ background: "#fff" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Comparação A vs B por etapa</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="nome" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={valor => `R$${(valor / 1000).toFixed(0)}k`} />
          <Tooltip formatter={valor => fmtBRL(valor)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Cenário A" fill="#2563eb" />
          <Bar dataKey="Cenário B" fill="#db2777" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
