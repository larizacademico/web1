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
    // reaproveita seu formulário atual via state
    navigate("/cartoes", { state: cartao });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#121214", color: "#fff" }}>
      <Navbar />

      <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Meus Cartões</h2>

          <button
            onClick={() => navigate("/cartoes")}
            style={{ padding: "10px 14px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}
          >
            + Adicionar cartão
          </button>
        </div>

        {loading ? (
          <div>Carregando...</div>
        ) : cartoes.length === 0 ? (
          <div style={{ background: "#202024", padding: 20, borderRadius: 10, color: "#aaa" }}>
            Nenhum cartão cadastrado.
          </div>
        ) : (
          <div style={{ background: "#202024", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#aaa", borderBottom: "1px solid #323238" }}>
                  <th style={{ padding: 12 }}>Nome</th>
                  <th>Bandeira</th>
                  <th>Tipo</th>
                  <th>Limite</th>
                  <th>Programa</th>
                  <th style={{ width: 120 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cartoes.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #323238" }}>
                    <td style={{ padding: 12, fontWeight: "bold" }}>{c.name}</td>
                    <td>{c.brand || "—"}</td>
                    <td>{c.type || "—"}</td>
                    <td>{c.limit != null ? `R$ ${c.limit}` : "—"}</td>
                    <td>{c.programs?.[0]?.name || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => editar(c)}
                          style={{ padding: "6px 10px", background: "#333", color: "#fff", border: "1px solid #444", borderRadius: 6, cursor: "pointer" }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirCartao(c.id)}
                          style={{ padding: "6px 10px", background: "#dc3545", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
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
