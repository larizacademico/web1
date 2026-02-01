import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

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

    // Atualização Otimista (Muda na hora na tela)
    const novaLista = notificacoes.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotificacoes(novaLista);

    // Envia para o banco
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
    <div style={{ minHeight: "100vh", background: "#121214", color: "#e1e1e6", padding: "20px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "24px", color: "#fff" }}>Notificações</h2>
          <button 
            onClick={() => navigate("/dashboard")}
            style={{ padding: "8px 16px", background: "#29292e", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Voltar
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          {notificacoes.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#777" }}>
              <p>Nenhuma notificação encontrada.</p>
            </div>
          )}

          {notificacoes.map(n => (
            <div 
              key={n.id} 
              onClick={() => marcarComoLida(n.id, n.read)}
              style={{
                background: "#202024",
                padding: "15px",
                borderRadius: "8px",
                // Lógica visual: Verde = Nova / Cinza = Lida
                borderLeft: n.read ? "4px solid #323238" : "4px solid #04d361", 
                opacity: n.read ? 0.6 : 1,
                cursor: n.read ? "default" : "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "0.2s"
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: "16px", color: "#fff" }}>{n.title}</strong>
                <span style={{ fontSize: "14px", color: "#a8a8b3" }}>{n.message}</span>
                <div style={{ fontSize: "12px", color: "#555", marginTop: "5px" }}>{formatarData(n.createdAt)}</div>
              </div>

              {!n.read && (
                <div title="Marcar como lida" style={{ color: "#04d361", fontSize: "20px" }}>
                  ●
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}