import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

const BANDEIRAS = ["Visa", "Mastercard", "Elo", "American Express", "Hipercard"];
const TIPOS = ["Nacional", "Internacional", "Gold", "Platinum", "Black/Infinite"];

export default function Cartoes() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartaoParaEditar = location.state;

  const [nome, setNome] = useState(cartaoParaEditar?.name ?? "");
  const [limite, setLimite] = useState(
    cartaoParaEditar?.limit != null ? String(cartaoParaEditar.limit) : ""
  );

  // NOVOS CAMPOS
  const [brand, setBrand] = useState(cartaoParaEditar?.brand ?? "Visa");
  const [type, setType] = useState(cartaoParaEditar?.type ?? "Platinum");
  const [pointsPerDollar, setPointsPerDollar] = useState(
    cartaoParaEditar?.pointsPerDollar != null ? String(cartaoParaEditar.pointsPerDollar) : "1"
  );

  const [programaId, setProgramaId] = useState("");
  const [listaProgramas, setListaProgramas] = useState([]);
  const [loading, setLoading] = useState(true);

  function normalizarProgramas(data) {
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
        ? data.content
        : [];

    // dedupe por id (resolve “Livelo repetido 20x”)
    const map = new Map();
    for (const p of arr) {
      if (p?.id != null && !map.has(p.id)) map.set(p.id, p);
    }
    return Array.from(map.values());
  }

  const programasOrdenados = useMemo(() => {
    return [...listaProgramas].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [listaProgramas]);

  useEffect(() => {
    async function carregarProgramas() {
      try {
        setLoading(true);
        const res = await api.get("/api/programs");
        const programasArray = normalizarProgramas(res.data);
        setListaProgramas(programasArray);

        // se estiver editando, tenta manter o programa que veio do cartão
        const progDoCartao = cartaoParaEditar?.programs?.[0]?.id;

        if (progDoCartao) {
          setProgramaId(String(progDoCartao));
          return;
        }

        // se não tem nada selecionado, auto-seleciona o primeiro
        if (programasArray.length > 0) {
          setProgramaId(String(programasArray[0].id));
        } else {
          setProgramaId("");
        }
      } catch (e) {
        console.error("Erro ao buscar programas:", e);
        setListaProgramas([]);
        setProgramaId("");
      } finally {
        setLoading(false);
      }
    }

    carregarProgramas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartaoParaEditar?.id]);

  async function salvarCartao(e) {
    e.preventDefault();

    const limitNumber = Number(limite);
    if (!Number.isFinite(limitNumber) || limitNumber <= 0) {
      alert("Limite inválido.");
      return;
    }

    const ppd = Number(pointsPerDollar);
    if (!Number.isFinite(ppd) || ppd <= 0) {
      alert("Pontuação inválida (use algo como 1, 1.5, 2...).");
      return;
    }

    const progIdNumber = Number(programaId);
    if (!Number.isFinite(progIdNumber) || progIdNumber <= 0) {
      alert("Selecione um programa válido.");
      return;
    }

    const dados = {
      name: nome,
      limit: limitNumber,
      brand,
      type,
      pointsPerDollar: ppd,
      programIds: [progIdNumber]
    };

    try {
      if (cartaoParaEditar) {
        await api.put(`/api/cards/${cartaoParaEditar.id}`, dados);
        alert("Cartão atualizado!");
      } else {
        await api.post("/api/cards", dados);
        alert("Cartão criado!");
      }
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao salvar cartão.");
    }
  }

  async function criarProgramaTeste() {
    try {
      await api.post("/api/programs", {
        name: "Livelo (Teste)",
        multiplier: 1.0,
        defaultCreditDays: 3
      });

      const res = await api.get("/api/programs");
      const programasArray = normalizarProgramas(res.data);
      setListaProgramas(programasArray);

      const achado = programasArray.find(p => p.name === "Livelo (Teste)");
      const idParaSelecionar = achado?.id || programasArray[0]?.id;

      if (idParaSelecionar) setProgramaId(String(idParaSelecionar));

      alert("Programa criado!");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Erro ao criar programa.");
    }
  }

  return (
    <div style={page.container}>
      <div style={page.card}>
        <h2 style={{ marginTop: 0 }}>
          {cartaoParaEditar ? "Editar Cartão" : "Adicionar Novo Cartão"}
        </h2>

        <form onSubmit={salvarCartao} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>Nome do Cartão</label>
          <input
            placeholder="Ex: Nubank, Visa Infinite..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={styles.input}
          />

          <label>Limite (R$)</label>
          <input
            type="number"
            placeholder="Ex: 5000"
            value={limite}
            onChange={(e) => setLimite(e.target.value)}
            required
            style={styles.input}
          />

          <label>Bandeira</label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} style={styles.input}>
            {BANDEIRAS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <label>Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={styles.input}>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label>Pontos por Dólar (ex: 1, 1.5, 2)</label>
          <input
            type="number"
            step="0.1"
            value={pointsPerDollar}
            onChange={(e) => setPointsPerDollar(e.target.value)}
            required
            style={styles.input}
          />

          <label>Vincular ao Programa</label>
          <select
            value={programaId}
            onChange={(e) => setProgramaId(e.target.value)}
            required
            style={styles.input}
            disabled={loading}
          >
            {loading ? (
              <option>Carregando...</option>
            ) : (
              <>
                <option value="" disabled>Selecione...</option>
                {programasOrdenados.map((prog) => (
                  <option key={prog.id} value={String(prog.id)}>
                    {prog.name}
                  </option>
                ))}
              </>
            )}
          </select>

          {!loading && programasOrdenados.length === 0 && (
            <div style={page.warnBox}>
              <div style={{ color: "orange", fontSize: 13, marginBottom: 10 }}>
                Nenhum programa encontrado. Crie pelo menos um.
              </div>
              <button type="button" onClick={criarProgramaTeste} style={{ ...styles.btn, background: "#0d6efd", color: "#fff" }}>
                Criar "Livelo" (Teste)
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" onClick={() => navigate("/dashboard")} style={{ ...styles.btn, background: "#666" }}>
              Cancelar
            </button>
            <button type="submit" style={{ ...styles.btn, background: "#28a745", color: "#fff" }}>
              {cartaoParaEditar ? "Salvar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const page = {
  container: {
    minHeight: "100vh",
    background: "#222",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#2b2b2b",
    borderRadius: 10,
    padding: 20
  },
  warnBox: {
    background: "#444",
    padding: 12,
    borderRadius: 8
  }
};

const styles = {
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #555",
    background: "#333",
    color: "white"
  },
  btn: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};
