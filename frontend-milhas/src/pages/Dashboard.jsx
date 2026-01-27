import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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

      setCartoes(resCards.data || []);
      setCompras(resPurchases.data || []);
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

  async function excluirCartao(id) {
    if (!window.confirm("Tem certeza que deseja excluir este cartão?")) return;
    try {
      await api.delete(`/api/cards/${id}`);
      setCartoes(cartoes.filter(card => card.id !== id));
      alert("Cartão excluído com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir cartão.");
    }
  }

  function editarCartao(card) {
    navigate("/cartoes", { state: card });
  }

  // --------- KPIs corretos (CREDITED vs PENDING) ---------
  const resumoPontos = useMemo(() => {
    const totalCredited = compras
      .filter(c => (c.status || "").toUpperCase() === "CREDITED")
      .reduce((acc, item) => acc + Number(item.pointsGenerated || 0), 0);

    const totalPendente = compras
      .filter(c => (c.status || "").toUpperCase() === "PENDING")
      .reduce((acc, item) => acc + Number(item.pointsGenerated || 0), 0);

    return { total: totalCredited, pendente: totalPendente };
  }, [compras]);

  // --------- Prazo médio previsto (createdAt/purchaseDate -> expectedCreditDate) ---------
  const prazoMedioPrevistoDias = useMemo(() => {
    const prazos = compras
      .map(c => {
        const startRaw = c.createdAt || c.purchaseDate; // depende do seu backend
        const endRaw = c.expectedCreditDate;
        if (!startRaw || !endRaw) return null;

        const a = new Date(startRaw);
        const b = new Date(endRaw);
        if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;

        const diffDays = (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 ? diffDays : null;
      })
      .filter(v => v !== null);

    if (prazos.length === 0) return 0;
    return prazos.reduce((acc, v) => acc + v, 0) / prazos.length;
  }, [compras]);

  // --------- Gráfico: Pontos por Cartão (exigência do enunciado) ---------
  const dadosPontosPorCartao = useMemo(() => {
    const mapa = new Map();

    for (const c of compras) {
      // tenta várias chaves possíveis; ajuste se você souber o nome real
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
      <div style={{ background: "#222", color: "#fff", height: "100vh", padding: "20px" }}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#222", color: "#fff", padding: "20px" }}>
      {/* CABEÇALHO */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>Dashboard - Minhas Milhas</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/compras")}
            style={{ padding: "8px 15px", background: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            + Nova Compra
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userName");
              navigate("/");
            }}
            style={{ padding: "8px 15px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: "#333", padding: "20px", borderRadius: "8px", borderLeft: "5px solid #28a745" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#ccc" }}>Total de Pontos (Creditados)</h3>
          <span style={{ fontSize: "28px", fontWeight: "bold" }}>{resumoPontos.total}</span>
        </div>

        <div style={{ background: "#333", padding: "20px", borderRadius: "8px", borderLeft: "5px solid #ffc107" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#ccc" }}>Pontos a Receber (Pendentes)</h3>
          <span style={{ fontSize: "28px", fontWeight: "bold", color: "#ffc107" }}>{resumoPontos.pendente}</span>
        </div>

        <div style={{ background: "#333", padding: "20px", borderRadius: "8px", borderLeft: "5px solid #007bff" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#ccc" }}>Cartões Ativos</h3>
          <span style={{ fontSize: "28px", fontWeight: "bold" }}>{cartoes.length}</span>
        </div>

        <div style={{ background: "#333", padding: "20px", borderRadius: "8px", borderLeft: "5px solid #9c27b0" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#ccc" }}>Prazo Médio Previsto</h3>
          <span style={{ fontSize: "28px", fontWeight: "bold" }}>
            {prazoMedioPrevistoDias ? `${prazoMedioPrevistoDias.toFixed(1)} dias` : "—"}
          </span>
        </div>
      </div>

      {/* GRÁFICO: Pontos por Cartão */}
      {dadosPontosPorCartao.length > 0 && (
        <div style={{ width: "100%", height: 300, background: "#2a2a2a", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "20px" }}>Pontos por Cartão</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosPontosPorCartao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#333", border: "none", color: "#fff" }} />
              <Legend />
              <Bar dataKey="pontos" fill="#8884d8" name="Pontos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* CONTEÚDO EM DUAS COLUNAS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
        {/* COLUNA 1 */}
        <div>
          <div style={{ background: "#333", padding: "20px", borderRadius: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid #555", paddingBottom: "10px" }}>
              <h3>Meus Cartões</h3>
              <button onClick={() => navigate("/cartoes")} style={{ background: "transparent", border: "none", color: "#007bff", cursor: "pointer", fontSize: "12px" }}>
                + Adicionar
              </button>
            </div>

            {cartoes.length === 0 ? (
              <p style={{ color: "#aaa", textAlign: "center" }}>Nenhum cartão.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {cartoes.map(card => (
                  <li key={card.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #444" }}>
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

        {/* COLUNA 2 */}
        <div>
          <div style={{ background: "#333", padding: "20px", borderRadius: "10px" }}>
            <h3 style={{ borderBottom: "1px solid #555", paddingBottom: "10px", marginBottom: "15px" }}>
              Histórico de Aquisições
            </h3>

            {compras.length === 0 ? (
              <p style={{ textAlign: "center", color: "#aaa", padding: "20px" }}>Nenhuma compra registrada.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#aaa", borderBottom: "1px solid #444" }}>
                    <th style={{ padding: "10px" }}>Data</th>
                    <th>Descrição</th>
                    <th>Cartão</th>
                    <th>Pontos</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map(compra => {
                    const status = (compra.status || "").toUpperCase();
                    const cardName = compra.cardName || compra.card?.name || (compra.cardId ? `Cartão ${compra.cardId}` : "N/A");
                    const dataCompra = compra.purchaseDate || compra.createdAt;

                    return (
                      <tr key={compra.id} style={{ borderBottom: "1px solid #444" }}>
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
  );
}
