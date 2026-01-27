import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function EsqueciSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/api/auth/forgot-password", { email });
      alert("Se o email existir, enviamos instruções. (No seu projeto, isso pode ser via token/console.)");
      navigate("/resetar-senha");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao solicitar recuperação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#222", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#2b2b2b", padding: 20, borderRadius: 10 }}>
        <h2 style={{ marginTop: 0 }}>Recuperar senha</h2>

        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            required
            style={{ padding: 12, borderRadius: 6, border: "1px solid #555", background: "#333", color: "#fff" }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ padding: 12, border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", background: "#0d6efd", color: "#fff", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Enviando..." : "Enviar"}
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
