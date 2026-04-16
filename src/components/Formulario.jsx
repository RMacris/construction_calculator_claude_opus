import { MODALIDADES, VEDACOES, PRESETS, CAMPOS_CALC } from "../constants.js";
import { resolverCampos } from "../logic/geometria.js";
import { NumInput, inputStyle } from "./NumInput.jsx";
import { Campo } from "./Campo.jsx";

export function Formulario({ titulo, cor, inp, setInp, preset, setPreset, onResetPrecos }) {
  const setN = (k) => (raw) => setInp({ ...inp, [k]: raw });
  const setS = (k) => (e) => setInp({ ...inp, [k]: e.target.value });
  const vedOk = Object.entries(VEDACOES).filter(([k]) =>
    !(inp.modalidade === "steelframe" && k === "alvenaria") &&
    !(inp.modalidade === "alv_estrutural" && k === "alvenaria"));

  const r = resolverCampos(inp);

  const setCalculado = (novo) => {
    const mapa = { areaPavimento: "A_pav", areaApto: "A_apt", nApt: "n_apt", nPav: "n_pav" };
    const prevKey = mapa[inp.calculado];
    const valResolvido = r[prevKey];
    setInp({
      ...inp,
      [inp.calculado]: String(valResolvido).replace(".", ","),
      calculado: novo
    });
  };

  const campoInter = (key, label, hint) => {
    const mapa = { areaPavimento: "A_pav", areaApto: "A_apt", nApt: "n_apt", nPav: "n_pav" };
    const ehCalc = inp.calculado === key;
    const valExib = ehCalc ? r[mapa[key]] : inp[key];
    return (
      <Campo label={
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>{label}</span>
          {ehCalc && <span style={{
            fontSize: 9, background: "#16a34a", color: "#fff",
            padding: "1px 6px", borderRadius: 8, fontWeight: 700
          }}>AUTO</span>}
        </span>
      } hint={hint}>
        <NumInput
          value={ehCalc ? String(valExib).replace(".", ",") : inp[key]}
          onChange={ehCalc ? () => {} : setN(key)}
          style={ehCalc
            ? { ...inputStyle, background: "#f0fdf4", color: "#166534",
                fontWeight: 600, cursor: "not-allowed" }
            : inputStyle}
        />
      </Campo>
    );
  };

  return (
    <div style={{
      background: "#fff", border: `2px solid ${cor}`, borderRadius: 10,
      padding: 14, flex: 1, minWidth: 280
    }}>
      <h3 style={{ margin: "0 0 10px", color: cor, fontSize: 15 }}>{titulo}</h3>

      <div style={{
        background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6,
        padding: 8, marginBottom: 10, fontSize: 12
      }}>
        <div style={{ fontWeight: 600, color: "#166534", marginBottom: 4 }}>
          Campo calculado automaticamente
        </div>
        <select style={inputStyle} value={inp.calculado}
                onChange={e => setCalculado(e.target.value)}>
          {Object.entries(CAMPOS_CALC).map(([k, v]) =>
            <option key={k} value={k}>{v}</option>)}
        </select>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
          Os outros 3 campos são editáveis e propagam para este.
        </div>
      </div>

      {campoInter("areaPavimento", "Área do pavimento (m²)", "Área de cada andar")}
      {campoInter("areaApto", "Área por apartamento (m²)", "1 quarto + 1 banheiro + sala/cozinha")}
      {campoInter("nApt", "Nº de apartamentos (total)")}
      {campoInter("nPav", "Nº de pavimentos")}

      <Campo label="Área do banheiro (m²)" hint="Aumenta área de azulejo">
        <NumInput value={inp.areaBanheiro} onChange={setN("areaBanheiro")} />
      </Campo>
      <Campo label="Pé-direito (m)" hint="Aumenta área de paredes, azulejo e pintura">
        <NumInput value={inp.peDireito} onChange={setN("peDireito")} />
      </Campo>
      <Campo label="Modalidade construtiva">
        <select style={inputStyle} value={inp.modalidade}
          onChange={(e) => {
            const nova = e.target.value;
            const ved = ((nova === "steelframe" || nova === "alv_estrutural") && inp.vedacao === "alvenaria")
              ? "drywall" : inp.vedacao;
            setInp({ ...inp, modalidade: nova, vedacao: ved });
          }}>
          {Object.entries(MODALIDADES).map(([k, v]) =>
            <option key={k} value={k}>{v.label}</option>)}
        </select>
      </Campo>
      <Campo label="Sistema de vedação interna">
        <select style={inputStyle} value={inp.vedacao} onChange={setS("vedacao")}>
          {vedOk.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </Campo>
      <Campo label="Preset de qualidade dos materiais"
             hint="Semeia preços iniciais — você pode editar cada material abaixo">
        <div style={{ display: "flex", gap: 6 }}>
          <select style={inputStyle} value={preset} onChange={e => setPreset(e.target.value)}>
            {Object.entries(PRESETS).map(([k, v]) =>
              <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={onResetPrecos} style={{
            padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6,
            background: "#f8fafc", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap"
          }}>Resetar</button>
        </div>
      </Campo>
    </div>
  );
}
