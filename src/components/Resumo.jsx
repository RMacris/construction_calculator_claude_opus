import { MODALIDADES, CUB_REFERENCIAS } from "../constants.js";
import { fmtBRL, fmtN } from "../utils.js";
import { K_UTIL, FATOR_FORMA } from "../logic/geometria.js";
import { Metric } from "./Metric.jsx";
import { EtapasTabela } from "./EtapasTabela.jsx";

export function Resumo({ titulo, cor, inp, res, over, setOver }) {
  const alertas = [];
  if (!res.aptoValido)
    alertas.push("Área do apto incompatível: banheiro + quarto (8m²) + sala (6m² mín) não cabem.");
  if (inp.modalidade === "steelframe" && inp.vedacao === "alvenaria")
    alertas.push("Vedação de alvenaria não é compatível com esta modalidade construtiva.");
  if (res.totalAptos === 0)
    alertas.push("Nenhum apto cabe no pavimento — reduza área do apto ou aumente área do pavimento.");

  // Encontrar a referência CUB mais próxima
  const cubEntries = Object.values(CUB_REFERENCIAS);
  const cubProximo = cubEntries.reduce((best, c) =>
    Math.abs(c.custoM2 - res.custoM2) < Math.abs(best.custoM2 - res.custoM2) ? c : best
  , cubEntries[0]);

  const desvio = cubProximo.custoM2 > 0
    ? ((res.custoM2 / cubProximo.custoM2) - 1) * 100
    : 0;

  return (
    <div className="panel-card" style={{
      background: "#fff", border: `2px solid ${cor}`, flex: 1, minWidth: 280
    }}>
      <h3 style={{ margin: "0 0 10px", color: cor, fontSize: 15 }}>{titulo}</h3>
      {alertas.map((a, i) => (
        <div key={i} style={{
          background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca",
          padding: 8, borderRadius: 6, fontSize: 12, marginBottom: 6
        }}>⚠ {a}</div>
      ))}
      <div className="metrics-grid">
        <Metric label="Custo direto (s/ BDI)"  valor={fmtBRL(res.custoDireto)} />
        <Metric label={`BDI (${fmtN(res.bdiPercent * 100, 0)}%)`}
                valor={fmtBRL(res.bdiValor)} />
        <Metric label="Custo total (c/ BDI)"   valor={fmtBRL(res.custoTotal)} destaque cor={cor} />
        <Metric label="Custo/m² (c/ BDI)"      valor={fmtBRL(res.custoM2)} destaque cor="#16a34a" />
        <Metric label="Custo/m² direto"         valor={fmtBRL(res.custoM2Direto)} />
        <Metric label="Pavimentos"              valor={`${res.pavimentos}`} />
        <Metric label="Apartamentos"
                valor={`${res.totalAptos}`}
                hint={res.aptosVazios > 0
                  ? `Capacidade: ${res.capacidade} (${res.aptosVazios} vago${res.aptosVazios > 1 ? "s" : ""})`
                  : `Capacidade exata (${res.aptosPorAndar}/andar)`} />
        <Metric label="Área total construída"   valor={`${fmtN(res.areaTotal, 0)} m²`} />
        <Metric label="Área útil total"         valor={`${fmtN(res.areaUtilTotal, 0)} m²`}
                hint={`${fmtN(K_UTIL * 100, 0)}% da área bruta`} />
        <Metric label="Área parede total"       valor={`${fmtN(res.areaParedeTot, 0)} m²`}
                hint={`Fator forma: ${fmtN(FATOR_FORMA, 2)}`} />
        <Metric label="Área azulejo total"      valor={`${fmtN(res.areaAzulTot, 0)} m²`} />
        <Metric label="Custo/apto"              valor={fmtBRL(res.custoApto)} />
      </div>

      {/* Comparação CUB */}
      <div style={{
        marginTop: 10, padding: 8, borderRadius: 6,
        background: "#f0f9ff", border: "1px solid #bae6fd", fontSize: 12
      }}>
        <div style={{ fontWeight: 600, color: "#0369a1", marginBottom: 4 }}>
          Comparação com CUB/SINAPI
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
          {cubEntries.map((c, i) => (
            <span key={i} style={{
              padding: "2px 6px", borderRadius: 4, fontSize: 11,
              background: c === cubProximo ? "#0369a1" : "#e0f2fe",
              color: c === cubProximo ? "#fff" : "#0c4a6e",
              fontWeight: c === cubProximo ? 700 : 400
            }}>
              {c.label}: {fmtBRL(c.custoM2)}/m²
            </span>
          ))}
        </div>
        <div style={{ color: "#334155" }}>
          Seu custo/m²: <strong>{fmtBRL(res.custoM2)}</strong> —
          {" "}{desvio >= 0 ? "+" : ""}{fmtN(desvio, 1)}% vs {cubProximo.label}
        </div>
        <div style={{
          marginTop: 8, paddingTop: 6, borderTop: "1px solid #bae6fd",
          fontSize: 11, color: "#475569", lineHeight: 1.5
        }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>Fontes para calibrar seus valores:</div>
          <div style={{ marginBottom: 3 }}>
            <a href="https://sinduscon-mg.org.br/wp-content/uploads/2026/04/tabela_cub_marco_2026.pdf"
               target="_blank" rel="noopener noreferrer"
               style={{ color: "#0369a1", textDecoration: "underline" }}>
              Tabela CUB — Sinduscon-MG
            </a>
            {" — "}Consulte o CUB/m² atualizado por padrão (baixo, normal, alto) e tipo de edificação. Use para validar se seu custo/m² está coerente com o mercado.
          </div>
          <div>
            <a href="https://orcamentador.com.br/"
               target="_blank" rel="noopener noreferrer"
               style={{ color: "#0369a1", textDecoration: "underline" }}>
              Orcamentador.com.br
            </a>
            {" — "}Pesquise preços unitários reais de materiais e serviços (cimento, aço, mão de obra, etc). Use para atualizar os preços de cada item na tabela de etapas abaixo.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        {MODALIDADES[inp.modalidade].descr}
        {" · "}Desperdício {fmtN(MODALIDADES[inp.modalidade].desperdicio * 100, 0)}%
        {" · "}BDI {fmtN(res.bdiPercent * 100, 0)}%
        {" · "}Eficiência planta: {fmtN(K_UTIL * 100, 0)}%
      </div>
      <EtapasTabela res={res} cor={cor} over={over} setOver={setOver} />
    </div>
  );
}
