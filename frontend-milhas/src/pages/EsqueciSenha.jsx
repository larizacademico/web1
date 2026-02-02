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
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={{ marginTop: 0, marginBottom: 12, fontWeight: 900, color: "#111827" }}>Recuperar senha</h2>

        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={styles.label}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            style={styles.btnSecondary}
          >
            Voltar
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    padding: 18,
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 22px rgba(0,0,0,.06)"
  },
  label: { fontSize: 13, fontWeight: 900, color: "#374151" },
  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#111827",
    outline: "none"
  },
  btnPrimary: {
    padding: 12,
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    background: "#ec4899",
    color: "#fff",
    boxShadow: "0 10px 18px rgba(236,72,153,.18)"
  },
  btnSecondary: {
    padding: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    background: "#ffffff",
    color: "#111827",
    boxShadow: "0 6px 16px rgba(0,0,0,.06)"
  }
};
