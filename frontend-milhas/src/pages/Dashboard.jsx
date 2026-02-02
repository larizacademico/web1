import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [cartoes, setCartoes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function carregarDados() {
    try {
      setLoading(true);

      const [resCards, resPurchases, resPrograms] = await Promise.all([
        api.get("/api/cards"),
        api.get("/api/purchases"),
        api.get("/api/programs")
      ]);

      setCartoes(Array.isArray(resCards.data) ? resCards.data : []);
      setCompras(Array.isArray(resPurchases.data) ? resPurchases.data : []);
      setProgramas(Array.isArray(resPrograms.data) ? resPrograms.data : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      if (error.response?.status === 403) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function extrairFilename(contentDisposition, fallback) {
    if (!contentDisposition) return fallback;
    const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
    return match?.[1] || fallback;
  }

  async function baixarArquivo(path, fallbackName) {
    try {
      const res = await api.get(path, { responseType: "blob" });
      const cd = res.headers?.["content-disposition"];
      const filename = extrairFilename(cd, fallbackName);

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar. Verifique se você está logada e se o backend está rodando.");
    }
  }

  function exportarCSV() {
    baixarArquivo("/api/export/compras/csv", "compras.csv");
  }

  function exportarPDF() {
    baixarArquivo("/api/export/compras/pdf", "compras.pdf");
  }

  const resumoPontos = useMemo(() => {
    const totalCredited = compras
      .filter((c) => (c.status || "").toUpperCase() === "CREDITED")
      .reduce((acc, item) => acc + Number(item.pointsGenerated || 0), 0);

    const totalPendente = compras
      .filter((c) => (c.status || "").toUpperCase() === "PENDING")
      .reduce((acc, item) => acc + Number(item.pointsGenerated || 0), 0);

    return { total: totalCredited, pendente: totalPendente };
  }, [compras]);

  const prazoMedioPrevistoDias = useMemo(() => {
    const prazos = compras
      .map((c) => {
        const startRaw = c.createdAt || c.purchaseDate;
        const endRaw = c.expectedCreditDate;
        if (!startRaw || !endRaw) return null;

        const a = new Date(startRaw);
        const b = new Date(endRaw);
        if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;

        const diffDays = (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 ? diffDays : null;
      })
      .filter((v) => v !== null);

    if (prazos.length === 0) return 0;
    return prazos.reduce((acc, v) => acc + v, 0) / prazos.length;
  }, [compras]);

  const dadosPontosPorCartao = useMemo(() => {
    const mapa = new Map();

    for (const c of compras) {
      const cardName =
        c.cardName ||
        c.card?.name ||
        (c.cardId ? `Cartão ${c.cardId}` : "Sem cartão");

      const atual = mapa.get(cardName) || 0;
      mapa.set(cardName, atual + Number(c.pointsGenerated || 0));
    }

    return Array.from(mapa.entries()).map(([name, pontos]) => ({ name, pontos }));
  }, [compras]);

  const programasPorId = useMemo(() => {
    const m = new Map();
    for (const p of programas) {
      const id = p.id ?? p.programId;
      if (id != null) m.set(Number(id), p);
    }
    return m;
  }, [programas]);

  const programasPorNome = useMemo(() => {
    const m = new Map();
    for (const p of programas) {
      const nome = p.name ?? p.programName;
      if (nome) m.set(String(nome).toLowerCase(), p);
    }
    return m;
  }, [programas]);

  const dadosPontosPorPrograma = useMemo(() => {
    const mapa = new Map();

    for (const c of compras) {
      const status = (c.status || "").toUpperCase();
      const pontos = Number(c.pointsGenerated || 0);

      const rawId = c.programId ?? c.program?.id ?? null;
      const rawName = c.programName ?? c.program?.name ?? null;

      let resolvedProgram = null;
      if (rawId != null) {
        resolvedProgram = programasPorId.get(Number(rawId)) || null;
      }
      if (!resolvedProgram && rawName) {
        resolvedProgram = programasPorNome.get(String(rawName).toLowerCase()) || null;
      }

      const resolvedId =
        resolvedProgram?.id != null
          ? Number(resolvedProgram.id)
          : rawId != null
            ? Number(rawId)
            : null;

      const resolvedName =
        resolvedProgram?.name ||
        rawName ||
        (resolvedId != null ? `Programa ${resolvedId}` : "Sem programa");

      const key =
        resolvedId != null
          ? `id:${resolvedId}`
          : `name:${String(resolvedName).toLowerCase()}`;

      const atual = mapa.get(key) || {
        programId: resolvedId,
        name: resolvedName,
        credited: 0,
        pending: 0,
        disponivel: resolvedProgram ? Number(resolvedProgram.balance || 0) : 0
      };

      if (status === "CREDITED") atual.credited += pontos;
      else if (status === "PENDING") atual.pending += pontos;

      if (atual.disponivel === 0 && resolvedProgram) {
        atual.disponivel = Number(resolvedProgram.balance || 0);
      }

      mapa.set(key, atual);
    }

    return Array.from(mapa.values())
      .map((p) => ({ ...p, previsto: p.disponivel + p.pending }))
      .filter((p) => (p.credited + p.pending) > 0)
      .sort((a, b) => b.previsto - a.previsto);
  }, [compras, programasPorId, programasPorNome]);

  const programasAtivos = useMemo(() => dadosPontosPorPrograma.length, [dadosPontosPorPrograma]);

  if (loading) {
    return (
      <div style={{ background: TOKENS.bg, color: TOKENS.text, height: "100vh", padding: 22 }}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Visão Geral</h2>

          <div style={styles.headerActions}>
            <button onClick={() => navigate("/meus-cartoes")} style={styles.btnSecondary}>
              💳 Meus Cartões
            </button>

            <button onClick={exportarCSV} style={styles.btnPrimary}>
              📥 Exportar CSV
            </button>

            <button onClick={exportarPDF} style={styles.btnSecondarySoft}>
              📄 Exportar PDF
            </button>
          </div>
        </div>

        <div style={styles.gridCards}>
          <div style={{ ...styles.card, borderLeft: `6px solid ${TOKENS.rosa}` }}>
            <h3 style={styles.cardLabel}>Total de Pontos (Creditados)</h3>
            <span style={styles.cardValue}>{resumoPontos.total}</span>
          </div>

          <div style={{ ...styles.card, borderLeft: "6px solid #f59e0b" }}>
            <h3 style={styles.cardLabel}>Pontos a Receber (Pendentes)</h3>
            <span style={{ ...styles.cardValue, color: "#92400e" }}>{resumoPontos.pendente}</span>
          </div>

          <div style={{ ...styles.card, borderLeft: "6px solid #3b82f6" }}>
            <h3 style={styles.cardLabel}>Cartões Ativos</h3>
            <span style={styles.cardValue}>{cartoes.length}</span>
          </div>

          <div style={{ ...styles.card, borderLeft: "6px solid #10b981" }}>
            <h3 style={styles.cardLabel}>Programas Ativos</h3>
            <span style={styles.cardValue}>{programasAtivos}</span>
          </div>

          <div style={{ ...styles.card, borderLeft: "6px solid #8b5cf6" }}>
            <h3 style={styles.cardLabel}>Prazo Médio Previsto</h3>
            <span style={styles.cardValue}>
              {prazoMedioPrevistoDias ? `${prazoMedioPrevistoDias.toFixed(1)} dias` : "—"}
            </span>
          </div>
        </div>

        <div style={styles.gridCharts}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Pontos por Cartão</h3>
            {dadosPontosPorCartao.length === 0 ? (
              <div style={styles.emptyState}>Sem dados.</div>
            ) : (
              <div style={styles.chartArea}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosPontosPorCartao} margin={{ top: 8, right: 10, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
                    <XAxis dataKey="name" tick={{ fill: TOKENS.muted }} />
                    <YAxis tick={{ fill: TOKENS.muted }} />
                    <Tooltip contentStyle={styles.tooltip} />
                    <Legend verticalAlign="top" align="center" height={28} />
                    <Bar dataKey="pontos" fill={TOKENS.rosa} name="Pontos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Pontos por Programa (Previsto)</h3>
            {dadosPontosPorPrograma.length === 0 ? (
              <div style={styles.emptyState}>Sem dados.</div>
            ) : (
              <div style={styles.chartArea}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosPontosPorPrograma} margin={{ top: 8, right: 10, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
                    <XAxis dataKey="name" tick={{ fill: TOKENS.muted }} />
                    <YAxis tick={{ fill: TOKENS.muted }} />
                    <Tooltip contentStyle={styles.tooltip} />
                    <Legend verticalAlign="top" align="center" height={28} />
                    <Bar dataKey="previsto" fill="#10b981" name="Previsto (Disponível + Pendente)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Tabela Programas */}
        {dadosPontosPorPrograma.length > 0 && (
          <div style={styles.tableCard}>
            <h3 style={styles.tableTitle}>Programas</h3>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Programa</th>
                  <th style={styles.th}>Disponível</th>
                  <th style={styles.th}>Pendente</th>
                  <th style={styles.th}>Previsto</th>
                </tr>
              </thead>
              <tbody>
                {dadosPontosPorPrograma.map((p) => (
                  <tr key={`${p.programId ?? "x"}-${p.name}`} style={styles.tr}>
                    <td style={styles.td}>{p.name}</td>

                    {/* Disponível: Verde */}
                    <td style={styles.td}>
                      <span style={styles.cellGreen}>{p.disponivel}</span>
                    </td>

                    {/* Pendente: Amarelo */}
                    <td style={styles.td}>
                      <span style={styles.cellAmber}>{p.pending}</span>
                    </td>

                    {/* Previsto: Roxo */}
                    <td style={styles.td}>
                      <span style={styles.cellPurple}>{p.previsto}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={styles.tableCard}>
          <h3 style={styles.tableTitle}>Histórico de Aquisições</h3>
          {compras.length === 0 ? (
            <p style={styles.emptyState}>Nenhuma compra registrada.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Descrição</th>
                  <th style={styles.th}>Cartão</th>
                  <th style={styles.th}>Pontos</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((compra) => {
                  const status = (compra.status || "").toUpperCase();
                  const cardName =
                    compra.cardName ||
                    compra.card?.name ||
                    (compra.cardId ? `Cartão ${compra.cardId}` : "N/A");
                  const dataCompra = compra.purchaseDate || compra.createdAt;

                  return (
                    <tr key={compra.id} style={styles.tr}>
                      <td style={styles.td}>
                        {dataCompra ? new Date(dataCompra).toLocaleDateString("pt-BR") : "-"}
                      </td>
                      <td style={styles.td}>{compra.description || "—"}</td>
                      <td style={styles.td}>{cardName}</td>
                      <td style={{ ...styles.td, fontWeight: 900, color: "#111827" }}>
                        +{compra.pointsGenerated || 0}
                      </td>
                      <td style={styles.td}>
                        <span style={status === "PENDING" ? styles.badgePending : styles.badgeSuccess}>
                          {status === "PENDING" ? "PENDENTE" : "CREDITADO"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Tema: claro neutro + rosa só de acento ===== */
const TOKENS = {
  bg: "#f6f7fb",
  surface: "#ffffff",
  border: "#e5e7eb",
  softBorder: "#f1f5f9",
  text: "#111827",
  muted: "#6b7280",
  grid: "#eef2f7",
  rosa: "#db2777",
  rosaSoft: "#fce7f3"
};

const styles = {
  page: { minHeight: "100vh", background: TOKENS.bg, color: TOKENS.text },
  container: { padding: 22, maxWidth: 1200, margin: "0 auto" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    flexWrap: "wrap",
    gap: 12
  },
  title: { margin: 0, fontSize: 28, fontWeight: 900, color: TOKENS.text },
  headerActions: { display: "flex", gap: 10, flexWrap: "wrap" },

  btnSecondary: {
    padding: "10px 14px",
    background: TOKENS.surface,
    color: TOKENS.text,
    border: `1px solid ${TOKENS.border}`,
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    boxShadow: "0 6px 16px rgba(0,0,0,.05)"
  },
  btnSecondarySoft: {
    padding: "10px 14px",
    background: TOKENS.surface,
    color: TOKENS.text,
    border: `1px solid ${TOKENS.border}`,
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    boxShadow: "0 6px 16px rgba(0,0,0,.05)"
  },
  btnPrimary: {
    padding: "10px 14px",
    background: TOKENS.rosa,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    boxShadow: "0 12px 22px rgba(219,39,119,.22)"
  },

  gridCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 18
  },
  card: {
    background: TOKENS.surface,
    padding: 16,
    borderRadius: 18,
    border: `1px solid ${TOKENS.border}`,
    boxShadow: "0 12px 24px rgba(17,24,39,.06)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 6
  },
  cardLabel: { margin: 0, fontSize: 13, color: TOKENS.muted, fontWeight: 800 },
  cardValue: { fontSize: 26, fontWeight: 900, color: TOKENS.text },

  gridCharts: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 },
  chartCard: {
    width: "100%",
    height: 360,
    background: TOKENS.surface,
    padding: 16,
    borderRadius: 18,
    border: `1px solid ${TOKENS.border}`,
    boxShadow: "0 12px 24px rgba(17,24,39,.06)",
    overflow: "hidden"
  },
  chartTitle: { margin: "0 0 10px 0", color: TOKENS.text, fontSize: 14, fontWeight: 900 },
  chartArea: {
    height: 300,
    borderRadius: 14,
    background: "#fafafa",
    border: `1px solid ${TOKENS.softBorder}`,
    padding: 8
  },

  tooltip: {
    backgroundColor: TOKENS.surface,
    border: `1px solid ${TOKENS.border}`,
    color: TOKENS.text,
    borderRadius: 12
  },
  emptyState: { color: TOKENS.muted, textAlign: "center", padding: 16 },

  tableCard: {
    background: TOKENS.surface,
    padding: 16,
    borderRadius: 18,
    marginBottom: 18,
    border: `1px solid ${TOKENS.border}`,
    boxShadow: "0 12px 24px rgba(17,24,39,.06)",
    overflowX: "auto"
  },
  tableTitle: {
    borderBottom: `1px solid ${TOKENS.softBorder}`,
    paddingBottom: 10,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 900,
    color: TOKENS.text
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 },
  trHead: { textAlign: "left", color: TOKENS.muted, borderBottom: `1px solid ${TOKENS.softBorder}` },
  th: { padding: "10px 12px", fontWeight: 900 },
  tr: { borderBottom: `1px solid ${TOKENS.softBorder}` },
  td: { padding: "10px 12px", color: TOKENS.text },

  badgePending: {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fde68a"
  },
  badgeSuccess: {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
    background: TOKENS.rosaSoft,
    color: "#9d174d",
    border: "1px solid #fbcfe8"
  },

  /* Chips da tabela Programas */
  cellGreen: {
    fontWeight: 900,
    color: "#166534",
    background: "#dcfce7",
    border: "1px solid #bbf7d0",
    borderRadius: 10,
    padding: "6px 10px",
    display: "inline-block",
    minWidth: 70,
    textAlign: "right"
  },
  cellAmber: {
    fontWeight: 900,
    color: "#92400e",
    background: "#fef3c7",
    border: "1px solid #fde68a",
    borderRadius: 10,
    padding: "6px 10px",
    display: "inline-block",
    minWidth: 70,
    textAlign: "right"
  },
  cellPurple: {
    fontWeight: 900,
    color: "#5b21b6",
    background: "#ede9fe",
    border: "1px solid #ddd6fe",
    borderRadius: 10,
    padding: "6px 10px",
    display: "inline-block",
    minWidth: 70,
    textAlign: "right"
  }
};
