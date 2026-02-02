import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

const BANDEIRAS = ["Visa", "Mastercard", "Elo", "American Express", "Hipercard"];
const TIPOS = ["Nacional", "Internacional", "Gold", "Platinum", "Black/Infinite"];

const PROGRAMAS_PADRAO = [
  { name: "Smiles", multiplier: 1.0, defaultCreditDays: 10, description: "Programa Smiles (Gol)" },
  { name: "TudoAzul", multiplier: 1.0, defaultCreditDays: 7, description: "Programa TudoAzul (Azul)" },
  { name: "Latam Pass", multiplier: 1.0, defaultCreditDays: 10, description: "Programa Latam Pass" },
  { name: "Livelo", multiplier: 1.0, defaultCreditDays: 3, description: "Programa Livelo" },
];

export default function Cartoes() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cartoes, setCartoes] = useState([]);
  const [programas, setProgramas] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [nome, setNome] = useState("");
  const [limite, setLimite] = useState("");
  const [brand, setBrand] = useState("Visa");
  const [type, setType] = useState("Platinum");
  const [pointsPerDollar, setPointsPerDollar] = useState("1");
  const [programaId, setProgramaId] = useState("");

  function normalizarArray(data) {
    return Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
  }

  function normalizarProgramas(data) {
    const arr = normalizarArray(data);
    const map = new Map();
    for (const p of arr) {
      if (p?.id != null && !map.has(p.id)) map.set(p.id, p);
    }
    return Array.from(map.values());
  }

  const programasOrdenados = useMemo(() => {
    return [...programas].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [programas]);

  const programaSelecionado = useMemo(() => {
    const idNum = Number(programaId);
    if (!Number.isFinite(idNum)) return null;
    return programas.find((p) => Number(p.id) === idNum) || null;
  }, [programaId, programas]);

  async function carregarTudo() {
    try {
      setLoading(true);
      const [resCards, resPrograms] = await Promise.all([
        api.get("/api/cards"),
        api.get("/api/programs"),
      ]);

      const cardsArr = normalizarArray(resCards.data);
      const progsArr = normalizarProgramas(resPrograms.data);

      setCartoes(cardsArr);
      setProgramas(progsArr);

      if ((!programaId || programaId === "") && progsArr.length > 0) {
        setProgramaId(String(progsArr[0].id));
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar cartões/programas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  function abrirNovoCartao() {
    setEditingId(null);
    setNome("");
    setLimite("");
    setBrand("Visa");
    setType("Platinum");
    setPointsPerDollar("1");
    if (!programaId && programas.length > 0) {
      setProgramaId(String(programas[0].id));
    }
    setIsFormOpen(true);
  }

  function fecharForm() {
    setIsFormOpen(false);
    limparForm();
  }

  function limparForm() {
    setEditingId(null);
    setNome("");
    setLimite("");
    setBrand("Visa");
    setType("Platinum");
    setPointsPerDollar("1");
  }

  function preencherParaEditar(card) {
    setEditingId(card.id);
    setNome(card.name ?? "");
    setLimite(card.limit != null ? String(card.limit) : "");
    setBrand(card.brand ?? "Visa");
    setType(card.type ?? "Platinum");

    const ppd = card.pointsPerDollar ?? card.conversionFactor ?? 1;
    setPointsPerDollar(String(ppd));

    const progDoCartao = card?.programs?.[0]?.id ?? card?.programId ?? card?.program?.id ?? null;

    if (progDoCartao != null) {
      setProgramaId(String(progDoCartao));
    } else if (programas.length > 0) {
      setProgramaId(String(programas[0].id));
    }

    setIsFormOpen(true);
  }

  async function excluirCartao(id) {
    if (!window.confirm("Tem certeza que deseja excluir este cartão?")) return;
    try {
      await api.delete(`/api/cards/${id}`);
      setCartoes((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) fecharForm();
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir cartão.");
    }
  }

  function parseNumeroSeguro(valor) {
    if (valor == null) return null;
    const s = String(valor).trim().replace(",", ".");
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  async function salvar(e) {
    e.preventDefault();
    if (saving) return;

    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      alert("Informe o nome do cartão.");
      return;
    }

    const limitNumber = parseNumeroSeguro(limite);
    const ppd = parseNumeroSeguro(pointsPerDollar);
    if (ppd == null || ppd <= 0) {
      alert("Pontos por dólar inválido.");
      return;
    }

    const progIdNumber = parseNumeroSeguro(programaId);
    if (progIdNumber == null || progIdNumber <= 0) {
      alert("Selecione um programa.");
      return;
    }

    const payload = {
      name: nomeTrim,
      limit: limitNumber,
      brand,
      type,
      pointsPerDollar: ppd,
      programIds: [Number(progIdNumber)],
    };

    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/api/cards/${editingId}`, payload);
        alert("Cartão atualizado!");
      } else {
        await api.post("/api/cards", payload);
        alert("Cartão criado!");
      }
      await carregarTudo();
      fecharForm();
    } catch (err) {
      alert(err?.response?.data?.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function criarProgramasPadrao() {
    if (saving) return;
    try {
      setSaving(true);
      const existentes = new Set(programas.map((p) => String(p.name || "").toLowerCase()));
      const paraCriar = PROGRAMAS_PADRAO.filter((p) => !existentes.has(String(p.name).toLowerCase()));

      if (paraCriar.length === 0) {
        alert("Os programas padrão já existem.");
        return;
      }

      for (const prog of paraCriar) {
        await api.post("/api/programs", prog);
      }
      alert("Programas padrão criados!");
      await carregarTudo();
    } catch (e) {
      alert("Erro ao criar programas padrão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={layout.wrap}>
        <div style={layout.container}>
          <div style={layout.headerRow}>
            <div>
              <h2 style={layout.title}>Meus Cartões</h2>
              <div style={layout.subtitle}>
                Cadastre cartões e vincule a um programa de pontos.
              </div>
            </div>

            <div style={layout.actions}>
              <button
                onClick={criarProgramasPadrao}
                style={btn.primary}
                disabled={loading || saving}
              >
                Criar programas padrão
              </button>

              <button
                onClick={abrirNovoCartao}
                style={btn.ghost}
                disabled={loading}
              >
                + Novo cartão
              </button>
            </div>
          </div>

          {loading ? (
            <div style={layout.loading}>Carregando...</div>
          ) : (
            <div style={layout.grid}>
              <div style={card.box}>
                <div style={card.titleRow}>
                  <h3 style={card.h3}>Cartões cadastrados</h3>
                  <span style={pill}>{cartoes.length}</span>
                </div>

                {cartoes.length === 0 ? (
                  <div style={layout.muted}>Nenhum cartão cadastrado ainda.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {cartoes.map((c) => (
                      <div key={c.id} style={listItem.row}>
                        <div>
                          <div style={{ fontWeight: 900, color: "#111827" }}>{c.name}</div>
                          <div style={layout.small}>
                            {c.brand || "—"} • {c.type || "—"} •{" "}
                            {c.limit != null ? `Limite: R$ ${c.limit}` : "Sem limite"}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            style={btn.iconBlue}
                            onClick={() => preencherParaEditar(c)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            style={btn.iconRed}
                            onClick={() => excluirCartao(c.id)}
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isFormOpen ? (
                <div style={card.box}>
                  <div style={card.titleRow}>
                    <h3 style={card.h3}>{editingId ? "Editar cartão" : "Adicionar novo cartão"}</h3>
                    {editingId && <span style={{ ...pill, background: "#111827", color: "#fff" }}>ID: {editingId}</span>}
                  </div>

                  <form onSubmit={salvar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={field.group}>
                      <label style={field.label}>Nome do cartão *</label>
                      <input
                        style={field.input}
                        placeholder="Ex: Nubank Ultravioleta"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                      />
                    </div>

                    <div style={field.group}>
                      <label style={field.label}>Limite (R$)</label>
                      <input
                        style={field.input}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ex: 5000"
                        value={limite}
                        onChange={(e) => setLimite(e.target.value)}
                      />
                    </div>

                    <div style={layout.twoCols}>
                      <div style={field.group}>
                        <label style={field.label}>Bandeira *</label>
                        <select style={field.input} value={brand} onChange={(e) => setBrand(e.target.value)}>
                          {BANDEIRAS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div style={field.group}>
                        <label style={field.label}>Tipo *</label>
                        <select style={field.input} value={type} onChange={(e) => setType(e.target.value)}>
                          {TIPOS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={field.group}>
                      <label style={field.label}>Pontos por dólar *</label>
                      <input
                        style={field.input}
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Ex: 1, 1.5, 2"
                        value={pointsPerDollar}
                        onChange={(e) => setPointsPerDollar(e.target.value)}
                        required
                      />
                    </div>

                    <div style={field.group}>
                      <label style={field.label}>Vincular ao programa *</label>
                      <select
                        style={field.input}
                        value={programaId}
                        onChange={(e) => setProgramaId(e.target.value)}
                        disabled={programasOrdenados.length === 0}
                        required
                      >
                        {programasOrdenados.length === 0 ? (
                          <option value="">Nenhum programa cadastrado</option>
                        ) : (
                          programasOrdenados.map((p) => (
                            <option key={p.id} value={String(p.id)}>{p.name}</option>
                          ))
                        )}
                      </select>

                      {programaSelecionado && (
                        <div style={infoBox}>
                          <div style={{ fontWeight: 900, marginBottom: 6, color: "#111827" }}>
                            {programaSelecionado.name}
                          </div>
                          <div style={infoLine}>
                            <span>Saldo atual:</span>
                            <b>{Number(programaSelecionado.balance || 0)}</b>
                          </div>
                          <div style={infoLine}>
                            <span>Multiplicador:</span>
                            <b>{Number(programaSelecionado.multiplier || 0)}</b>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={fecharForm}
                        style={btn.ghost}
                        disabled={saving}
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        style={btn.primary}
                        disabled={saving}
                      >
                        {saving ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div style={card.empty}>
                  Selecione um cartão para editar ou clique em "Novo cartão".
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====== ESTÉTICA (tema claro, usando mais largura) ====== */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    color: "#111827",
  },
};

const layout = {
  wrap: {
    display: "flex",
    justifyContent: "center",
    padding: 22,
  },
  container: {
    width: "100%",
    maxWidth: 1400, // usa mais a tela e para de ficar “miúdo” no canto
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    color: "#111827",
    fontWeight: 900,
    fontSize: 28,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 6,
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(420px, 1fr) minmax(520px, 1fr)",
    gap: 14,
    alignItems: "start",
  },
  twoCols: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  loading: { padding: 20, color: "#6b7280" },
  muted: { color: "#6b7280", padding: 10 },
  small: { fontSize: 12, color: "#6b7280", marginTop: 2 },
};

const card = {
  box: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 22px rgba(0,0,0,.06)",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  h3: { margin: 0, fontSize: 15, color: "#111827", fontWeight: 900 },
  empty: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 22px rgba(0,0,0,.06)",
    minHeight: 320,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    textAlign: "center",
  },
};

const field = {
  group: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "#374151", fontWeight: 900 },
  input: {
    padding: "12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#111827",
    outline: "none",
  },
};

const listItem = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
};

const btn = {
  primary: {
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 900,
    background: "#ec4899",
    color: "#fff",
    boxShadow: "0 10px 18px rgba(236,72,153,.18)",
  },
  ghost: {
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 900,
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #e5e7eb",
    boxShadow: "0 6px 16px rgba(0,0,0,.06)",
  },
  iconBlue: {
    border: "none",
    borderRadius: 12,
    padding: "8px 10px",
    cursor: "pointer",
    color: "#fff",
    background: "#3b82f6",
    boxShadow: "0 10px 18px rgba(59,130,246,.18)",
  },
  iconRed: {
    border: "none",
    borderRadius: 12,
    padding: "8px 10px",
    cursor: "pointer",
    color: "#fff",
    background: "#ef4444",
    boxShadow: "0 10px 18px rgba(239,68,68,.18)",
  },
};

const pill = {
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  color: "#111827",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const infoBox = {
  marginTop: 10,
  padding: 12,
  borderRadius: 14,
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
};

const infoLine = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 13,
  color: "#374151",
  padding: "4px 0",
};
