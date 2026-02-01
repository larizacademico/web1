import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

const BANDEIRAS = ["Visa", "Mastercard", "Elo", "American Express", "Hipercard"];
const TIPOS = ["Nacional", "Internacional", "Gold", "Platinum", "Black/Infinite"];

// Programas "de verdade" pra ficar alinhado com o enunciado
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

  // modo edição
  const [editingId, setEditingId] = useState(null);

  // campos do form
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

      // se ainda não tiver programa selecionado, escolhe o primeiro
      if ((!programaId || programaId === "") && progsArr.length > 0) {
        setProgramaId(String(progsArr[0].id));
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar cartões/programas. Verifique login e backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarTudo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function limparForm() {
    setEditingId(null);
    setNome("");
    setLimite("");
    setBrand("Visa");
    setType("Platinum");
    setPointsPerDollar("1");
    // mantém o programa selecionado se existir
  }

  function preencherParaEditar(card) {
    setEditingId(card.id);
    setNome(card.name ?? "");
    setLimite(card.limit != null ? String(card.limit) : "");
    setBrand(card.brand ?? "Visa");
    setType(card.type ?? "Platinum");
    setPointsPerDollar(card.pointsPerDollar != null ? String(card.pointsPerDollar) : "1");

    const progDoCartao =
      card?.programs?.[0]?.id ??
      card?.programId ??
      card?.program?.id ??
      null;

    if (progDoCartao != null) setProgramaId(String(progDoCartao));
  }

  async function excluirCartao(id) {
    if (!window.confirm("Tem certeza que deseja excluir este cartão?")) return;
    try {
      await api.delete(`/api/cards/${id}`);
      setCartoes((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) limparForm();
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
    if (limite !== "" && (limitNumber == null || limitNumber <= 0)) {
      alert("Limite inválido. Deixe vazio ou use um número maior que zero.");
      return;
    }

    const ppd = parseNumeroSeguro(pointsPerDollar);
    if (ppd == null || ppd <= 0) {
      alert("Pontos por dólar inválido. Use algo como 1, 1.5, 2...");
      return;
    }

    const progIdNumber = parseNumeroSeguro(programaId);
    if (progIdNumber == null || progIdNumber <= 0) {
      alert("Selecione um programa válido.");
      return;
    }

    const payload = {
      name: nomeTrim,
      limit: limitNumber, // pode ser null
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
      limparForm();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao salvar cartão.");
    } finally {
      setSaving(false);
    }
  }

  // ✅ novo: cria programas padrão (evita ficar só “Livelo (Teste)”)
  async function criarProgramasPadrao() {
    if (saving) return;

    try {
      setSaving(true);

      // pega nomes existentes pra não duplicar
      const existentes = new Set(programas.map((p) => String(p.name || "").toLowerCase()));

      const paraCriar = PROGRAMAS_PADRAO.filter(
        (p) => !existentes.has(String(p.name).toLowerCase())
      );

      if (paraCriar.length === 0) {
        alert("Os programas padrão já existem.");
        return;
      }

      // cria em sequência (mais simples e fácil de debugar)
      for (const prog of paraCriar) {
        await api.post("/api/programs", prog);
      }

      alert("Programas padrão criados!");
      await carregarTudo();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Erro ao criar programas padrão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#121214", color: "#fff" }}>
      <Navbar />

      <div style={layout.container}>
        <div style={layout.headerRow}>
          <div>
            <h2 style={{ margin: 0 }}>Meus Cartões</h2>
            <div style={{ color: "#a8a8b3", fontSize: 13, marginTop: 6 }}>
              Cadastre cartões e vincule a um programa de pontos.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={criarProgramasPadrao}
              style={{ ...btn.base, background: "#0d6efd", color: "#fff" }}
              disabled={loading || saving}
              title="Cria Smiles, TudoAzul, Latam Pass e Livelo"
            >
              Criar programas padrão
            </button>

            <button
              onClick={limparForm}
              style={{ ...btn.base, background: "#2b2b2b", color: "#fff" }}
              disabled={loading}
              title="Limpa o formulário para adicionar um novo cartão"
            >
              + Novo cartão
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 20 }}>Carregando...</div>
        ) : (
          <div style={layout.grid}>
            {/* LISTA */}
            <div style={card.box}>
              <div style={card.titleRow}>
                <h3 style={card.h3}>Cartões cadastrados</h3>
                <span style={pill}>{cartoes.length}</span>
              </div>

              {cartoes.length === 0 ? (
                <div style={{ color: "#a8a8b3", padding: 10 }}>
                  Nenhum cartão cadastrado ainda.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {cartoes.map((c) => (
                    <div key={c.id} style={listItem.row}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "#a8a8b3", marginTop: 2 }}>
                          {c.brand || "—"} • {c.type || "—"} •{" "}
                          {c.limit != null ? `Limite: R$ ${c.limit}` : "Sem limite"}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          style={{ ...btn.icon, background: "#1f2937" }}
                          onClick={() => preencherParaEditar(c)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          style={{ ...btn.icon, background: "#3f1d1d" }}
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

            {/* FORM */}
            <div style={card.box}>
              <div style={card.titleRow}>
                <h3 style={card.h3}>{editingId ? "Editar cartão" : "Adicionar novo cartão"}</h3>
                {editingId ? <span style={{ ...pill, background: "#2d6a4f" }}>Editando</span> : null}
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
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={field.group}>
                    <label style={field.label}>Tipo *</label>
                    <select style={field.input} value={type} onChange={(e) => setType(e.target.value)}>
                      {TIPOS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
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
                  <div style={field.hint}>
                    Os pontos da compra são calculados automaticamente com base na <b>bandeira</b>, <b>tipo</b> e{" "}
                    <b>pontos por dólar</b> do cartão.
                  </div>
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
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))
                    )}
                  </select>

                  {programaSelecionado && (
                    <div style={infoBox}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{programaSelecionado.name}</div>
                      <div style={infoLine}>
                        <span>Saldo atual:</span>
                        <b>{Number(programaSelecionado.balance || 0)}</b>
                      </div>
                      <div style={infoLine}>
                        <span>Prazo padrão:</span>
                        <b>{Number(programaSelecionado.defaultCreditDays || 0)} dias</b>
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
                    onClick={limparForm}
                    style={{ ...btn.base, background: "#2b2b2b", color: "#fff" }}
                    disabled={saving}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    style={{ ...btn.base, background: "#28a745", color: "#fff" }}
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : editingId ? "Salvar" : "Cadastrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const layout = {
  container: { maxWidth: 1200, margin: "0 auto", padding: 20 },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  twoCols: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
};

const card = {
  box: {
    background: "#202024",
    borderRadius: 10,
    padding: 16,
    border: "1px solid #29292e",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  h3: { margin: 0, fontSize: 16, color: "#e1e1e6" },
};

const field = {
  group: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "#a8a8b3" },
  input: {
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #323238",
    background: "#121214",
    color: "#fff",
    outline: "none",
  },
  hint: { fontSize: 12, color: "#a8a8b3", marginTop: 6, lineHeight: 1.3 },
};

const listItem = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    background: "#121214",
    border: "1px solid #323238",
  },
};

const btn = {
  base: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  icon: {
    border: "none",
    borderRadius: 8,
    padding: "8px 10px",
    cursor: "pointer",
    color: "#fff",
  },
};

const pill = {
  background: "#1f2937",
  border: "1px solid #323238",
  color: "#e1e1e6",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const infoBox = {
  marginTop: 10,
  padding: 12,
  borderRadius: 10,
  background: "#121214",
  border: "1px solid #323238",
};

const infoLine = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 13,
  color: "#c4c4cc",
  padding: "4px 0",
};
