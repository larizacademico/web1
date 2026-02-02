import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  async function registrar(e) {
    e.preventDefault();
    console.log("Tentando cadastrar...");

    try {
      await api.post("/api/auth/signup", {
        name: nome,
        email: email,
        password: senha
      });

      alert("Cadastro realizado com sucesso! Faça login.");
      navigate("/"); // Manda para a tela de login

    } catch (err) {
      console.error("Erro no cadastro:", err);
      const msg = err.response?.data?.message || "Erro ao cadastrar. Verifique os dados.";
      alert(msg);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Crie sua Conta</h2>

      <form onSubmit={registrar} style={styles.form}>
        <input
          placeholder="Nome Completo"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="email"
          placeholder="Seu Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Senha (mínimo 6 dígitos)"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          minLength={6}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Cadastrar
        </button>
      </form>

      <p style={styles.text}>
        Já tem conta? <Link to="/" style={styles.link}>Faça Login</Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f3f4f6",
    color: "#111827",
    padding: 20,
  },
  title: {
    marginBottom: 16,
    fontSize: 26,
    color: "#111827",
    fontWeight: 900,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: "100%",
    maxWidth: 380,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 10px 22px rgba(0,0,0,.06)",
  },
  input: {
    padding: "12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#111827",
    outline: "none",
    fontSize: 14,
  },
  button: {
    padding: "12px 14px",
    background: "#ec4899",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
    marginTop: 6,
    boxShadow: "0 10px 18px rgba(236,72,153,.18)",
  },
  text: {
    marginTop: 14,
    color: "#6b7280",
    fontSize: 13,
  },
  link: {
    color: "#ec4899",
    textDecoration: "none",
    fontWeight: 900,
    marginLeft: 6,
  }
};
