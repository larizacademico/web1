import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Notificacoes() {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  function carregarNotificacoes() {
    api.get("/api/notifications")
      .then(res => setNotificacoes(res.data))
      .catch(err => console.error("Erro ao buscar notificações", err));
  }

  async function marcarComoLida(id, jaLida) {
    if (jaLida) return;

    const novaLista = notificacoes.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotificacoes(novaLista);

    try {
      await api.put(`/api/notifications/${id}/read`);
    } catch (error) {
      console.error("Erro ao salvar status", error);
    }
  }

  function formatarData(dataISO) {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    }).format(data);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", color: "#111827" }}>
      <Navbar />

      <div style={{ padding: 22, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 720 }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 24, margin: 0, fontWeight: 900 }}>Notificações</h2>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ padding: "10px 12px", background: "#ffffff", color: "#111827", border: "1px solid #e5e7eb", borderRadius: 12, cursor: "pointer", fontWeight: 900, boxShadow: "0 6px 16px rgba(0,0,0,.06)" }}
            >
              Voltar
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {notificacoes.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#6b7280", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 18, boxShadow: "0 10px 22px rgba(0,0,0,.06)" }}>
                <p>Nenhuma notificação encontrada.</p>
              </div>
            )}

            {notificacoes.map(n => (
              <div
                key={n.id}
                onClick={() => marcarComoLida(n.id, n.read)}
                style={{
                  background: "#ffffff",
                  padding: 14,
                  borderRadius: 18,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 10px 22px rgba(0,0,0,.06)",
                  borderLeft: n.read ? "6px solid #e5e7eb" : "6px solid #22c55e",
                  opacity: n.read ? 0.7 : 1,
                  cursor: n.read ? "default" : "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "0.2s"
                }}
              >
                <div>
                  <strong style={{ display: "block", fontSize: 15, color: "#111827" }}>{n.title}</strong>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{n.message}</span>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>{formatarData(n.createdAt)}</div>
                </div>

                {!n.read && (
                  <div title="Marcar como lida" style={{ color: "#22c55e", fontSize: 18, fontWeight: 900 }}>
                    ●
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
