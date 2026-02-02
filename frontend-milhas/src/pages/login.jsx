import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    console.log("Tentando logar...");

    try {
      const response = await api.post("/api/auth/login", {
        email: email,
        password: senha
      });

      const token = response.data.token;
      localStorage.setItem("token", token);

      alert("Login realizado com sucesso!");
      navigate("/dashboard");

    } catch (err) {
      console.error("Erro no login:", err);
      alert("Falha no login. Verifique email e senha.");
    }
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Login</h2>

      <form onSubmit={handleLogin} style={styles.card}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.btnPrimary}>
          Entrar
        </button>

        <p style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
          <span
            onClick={() => navigate("/esqueci-senha")}
            style={{ color: "#ec4899", cursor: "pointer", textDecoration: "underline", fontWeight: 900 }}
          >
            Esqueci minha senha
          </span>
        </p>
      </form>

      <p style={styles.footer}>
        Não tem conta? <Link to="/cadastro" style={styles.link}>Crie uma agora</Link>
      </p>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f3f4f6",
    color: "#111827",
    padding: 20
  },
  title: { margin: "0 0 14px 0", fontWeight: 900, fontSize: 26, color: "#111827" },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "100%",
    maxWidth: 360,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 10px 22px rgba(0,0,0,.06)"
  },
  input: {
    padding: "12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#111827",
    outline: "none"
  },
  btnPrimary: {
    padding: "12px",
    background: "#ec4899",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 10px 18px rgba(236,72,153,.18)"
  },
  footer: { marginTop: 12, color: "#6b7280" },
  link: { color: "#ec4899", fontWeight: 900, textDecoration: "none" }
};
