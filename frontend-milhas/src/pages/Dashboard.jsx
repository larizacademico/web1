import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar"; // ✅ 1. Import da Navbar

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function carregarDados() {
    try {
      setLoading(true);

      const [resCards, resPurchases] = await Promise.all([
        api.get("/api/cards"),
        api.get("/api/purchases")
      ]);

      setCartoes(Array.isArray(resCards.data) ? resCards.data : []);
      setCompras(Array.isArray(resPurchases.data) ? resPurchases.data : []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function excluirCartao(id) {
    if (!window.confirm("Tem certeza que deseja excluir este cartão?")) return;
    try {
      await api.delete(`/api/cards/${id}`);
      setCartoes((prev) => prev.filter((card) => card.id !== id));
      alert("Cartão excluído com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir cartão.");
    }
  }

  function editarCartao(card) {
    navigate("/cartoes", { state: card });
  }

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

  if (loading) {
    return (
      <div style={{ background: "#121214", color: "#fff", height: "100vh", padding: "20px" }}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#121214", color: "#fff" }}>
      
      {/* ✅ 2. Navbar inserida aqui (substitui o cabeçalho antigo) */}
      <Navbar />

      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* ✅ 3. Barra de Ferramentas (Botões de Exportar que sobraram) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
           <h2 style={{ margin: 0, fontSize: "24px" }}>Visão Geral</h2>
           
           <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={exportarCSV}
                style={{ padding: "8px 15px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
              >
                📥 Exportar CSV
              </button>

              <button
                onClick={exportarPDF}
                style={{ padding: "8px 15px", background: "#198754", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
              >
                📄 Exportar PDF
              </button>
           </div>
        </div>

        {/* --- CARDS DE RESUMO --- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          <div style={{ background: "#202024", padding: "20px", borderRadius: "8px", borderLeft: "5px solid #28a745" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#a8a8b3" }}>Total de Pontos (Creditados)</h3>
            <span style={{ fontSize: "28px", fontWeight: "bold" }}>{resumoPontos.total}</span>
          </div>

          <div style={{ background: "#202024", padding: "20px", borderRadius: "8px", borderLeft: "5px solid #ffc107" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#a8a8b3" }}>Pontos a Receber (Pendentes)</h3>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "#ffc107" }}>{resumoPontos.pendente}</span>
          </div>

          <div style={{ background: "#202024", padding: "20px", borderRadius: "8px", borderLeft: "5px solid #007bff" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#a8a8b3" }}>Cartões Ativos</h3>
            <span style={{ fontSize: "28px", fontWeight: "bold" }}>{cartoes.length}</span>
          </div>

          <div style={{ background: "#202024", padding: "20px", borderRadius: "8px", borderLeft: "5px solid #9c27b0" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#a8a8b3" }}>Prazo Médio Previsto</h3>
            <span style={{ fontSize: "28px", fontWeight: "bold" }}>
              {prazoMedioPrevistoDias ? `${prazoMedioPrevistoDias.toFixed(1)} dias` : "—"}
            </span>
          </div>
        </div>

        {/* --- GRÁFICO --- */}
        {dadosPontosPorCartao.length > 0 && (
          <div style={{ width: "100%", height: 300, background: "#202024", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "20px", color: "#e1e1e6" }}>Pontos por Cartão</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPontosPorCartao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: "#333", border: "none", color: "#fff" }} />
                <Legend />
                <Bar dataKey="pontos" fill="#8257e5" name="Pontos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* --- TABELAS --- */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
          
          {/* Coluna Cartões */}
          <div>
            <div style={{ background: "#202024", padding: "20px", borderRadius: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid #323238", paddingBottom: "10px" }}>
                <h3>Meus Cartões</h3>
                <button onClick={() => navigate("/cartoes")} style={{ background: "transparent", border: "none", color: "#007bff", cursor: "pointer", fontSize: "12px" }}>
                  + Adicionar
                </button>
              </div>

              {cartoes.length === 0 ? (
                <p style={{ color: "#aaa", textAlign: "center" }}>Nenhum cartão.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {cartoes.map((card) => (
                    <li key={card.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #323238" }}>
                      <div>
                        <strong>{card.name}</strong>
                        <div style={{ fontSize: "11px", color: "#aaa" }}>
                          {card.limit ? `R$ ${card.limit}` : "Sem limite"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button onClick={() => editarCartao(card)} style={{ background: "none", border: "none", cursor: "pointer" }}>✏️</button>
                        <button onClick={() => excluirCartao(card.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>🗑️</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Coluna Histórico */}
          <div>
            <div style={{ background: "#202024", padding: "20px", borderRadius: "10px" }}>
              <h3 style={{ borderBottom: "1px solid #323238", paddingBottom: "10px", marginBottom: "15px" }}>
                Histórico de Aquisições
              </h3>

              {compras.length === 0 ? (
                <p style={{ textAlign: "center", color: "#aaa", padding: "20px" }}>Nenhuma compra registrada.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#aaa", borderBottom: "1px solid #323238" }}>
                      <th style={{ padding: "10px" }}>Data</th>
                      <th>Descrição</th>
                      <th>Cartão</th>
                      <th>Pontos</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compras.map((compra) => {
                      const status = (compra.status || "").toUpperCase();
                      const cardName = compra.cardName || compra.card?.name || (compra.cardId ? `Cartão ${compra.cardId}` : "N/A");
                      const dataCompra = compra.purchaseDate || compra.createdAt;

                      return (
                        <tr key={compra.id} style={{ borderBottom: "1px solid #323238" }}>
                          <td style={{ padding: "10px" }}>
                            {dataCompra ? new Date(dataCompra).toLocaleDateString("pt-BR") : "-"}
                          </td>
                          <td>{compra.description || "—"}</td>
                          <td>{cardName}</td>
                          <td style={{ fontWeight: "bold", color: "#fff" }}>+{compra.pointsGenerated || 0}</td>
                          <td>
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                background: status === "PENDING" ? "#ffc107" : "#28a745",
                                color: "#000"
                              }}
                            >
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

      </div>
    </div>
  );
}