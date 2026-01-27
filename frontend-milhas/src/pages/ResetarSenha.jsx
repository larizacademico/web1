import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ResetarSenha() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function redefinir(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/api/auth/reset-password", { token, newPassword });
      alert("Senha redefinida com sucesso.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#222", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#2b2b2b", padding: 20, borderRadius: 10 }}>
        <h2 style={{ marginTop: 0 }}>Redefinir senha</h2>

        <form onSubmit={redefinir} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>Token</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="cole o token aqui"
            required
            style={{ padding: 12, borderRadius: 6, border: "1px solid #555", background: "#333", color: "#fff" }}
          />

          <label>Nova senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="nova senha"
            required
            style={{ padding: 12, borderRadius: 6, border: "1px solid #555", background: "#333", color: "#fff" }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ padding: 12, border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", background: "#28a745", color: "#fff", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Salvando..." : "Redefinir"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ padding: 12, border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", background: "#666", color: "#fff" }}
          >
            Voltar
          </button>
        </form>
      </div>
    </div>
  );
}
