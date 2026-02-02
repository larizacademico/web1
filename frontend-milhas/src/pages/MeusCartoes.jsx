import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function MeusCartoes() {
  const [cartoes, setCartoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function carregar() {
    try {
      setLoading(true);
      const res = await api.get("/api/cards");
      setCartoes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar cartões.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluirCartao(id) {
    if (!window.confirm("Tem certeza que deseja excluir este cartão?")) return;
    try {
      await api.delete(`/api/cards/${id}`);
      setCartoes((prev) => prev.filter((c) => c.id !== id));
      alert("Cartão excluído.");
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir cartão.");
    }
  }

  function editar(cartao) {
    navigate("/cartoes", { state: cartao });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", color: "#111827" }}>
      <Navbar />

      <div style={{ padding: 22, maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontWeight: 900 }}>Meus Cartões</h2>

          <button
            onClick={() => navigate("/cartoes")}
            style={{ padding: "10px 14px", background: "#ec4899", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 900, boxShadow: "0 10px 18px rgba(236,72,153,.18)" }}
          >
            + Adicionar cartão
          </button>
        </div>

        {loading ? (
          <div style={{ color: "#6b7280" }}>Carregando...</div>
        ) : cartoes.length === 0 ? (
          <div style={{ background: "#ffffff", padding: 18, borderRadius: 18, color: "#6b7280", border: "1px solid #e5e7eb", boxShadow: "0 10px 22px rgba(0,0,0,.06)" }}>
            Nenhum cartão cadastrado.
          </div>
        ) : (
          <div style={{ background: "#ffffff", borderRadius: 18, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 10px 22px rgba(0,0,0,.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: 12, fontWeight: 900 }}>Nome</th>
                  <th style={{ fontWeight: 900 }}>Bandeira</th>
                  <th style={{ fontWeight: 900 }}>Tipo</th>
                  <th style={{ fontWeight: 900 }}>Limite</th>
                  <th style={{ fontWeight: 900 }}>Programa</th>
                  <th style={{ width: 140, fontWeight: 900 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cartoes.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: 12, fontWeight: 900 }}>{c.name}</td>
                    <td style={{ padding: 12 }}>{c.brand || "—"}</td>
                    <td style={{ padding: 12 }}>{c.type || "—"}</td>
                    <td style={{ padding: 12 }}>{c.limit != null ? `R$ ${c.limit}` : "—"}</td>
                    <td style={{ padding: 12 }}>{c.programs?.[0]?.name || "—"}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => editar(c)}
                          style={{ padding: "8px 10px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 900, boxShadow: "0 10px 18px rgba(59,130,246,.18)" }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirCartao(c.id)}
                          style={{ padding: "8px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 900, boxShadow: "0 10px 18px rgba(239,68,68,.18)" }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
