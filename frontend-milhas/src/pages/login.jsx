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
      // O Java espera: { email, password }
      // A rota correta é: /api/auth/login
      const response = await api.post("/api/auth/login", {
        email: email,
        password: senha // Envia a 'senha' como 'password'
      });

      // Sucesso: Salva o token e entra no sistema
      const token = response.data.token; // Ajuste se seu backend retornar diferente
      localStorage.setItem("token", token);
      
      alert("Login realizado com sucesso!");
      navigate("/dashboard"); // Vai para a página principal

    } catch (err) {
      console.error("Erro no login:", err);
      alert("Falha no login. Verifique email e senha.");
    }
  }

  return (
    <div style={{ 
      display: "flex", flexDirection: "column", alignItems: "center", 
      justifyContent: "center", height: "100vh", background: "#222", color: "#fff" 
    }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
        
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          style={{ padding: "10px", borderRadius: "5px", border: "none" }}
        />
        
        <input 
          type="password" 
          placeholder="Senha" 
          value={senha} 
          onChange={e => setSenha(e.target.value)} 
          required 
          style={{ padding: "10px", borderRadius: "5px", border: "none" }}
        />

        <button type="submit" style={{ 
          padding: "10px", background: "#28a745", color: "#fff", 
          border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" 
        }}>
          Entrar
        </button>
              <p style={{ marginTop: 10, fontSize: 12 }}>
        <span
          onClick={() => navigate("/esqueci-senha")}
          style={{ color: "#0d6efd", cursor: "pointer", textDecoration: "underline" }}
        >
          Esqueci minha senha
        </span>
      </p>
      </form>

      <p style={{ marginTop: "15px" }}>
        Não tem conta? <Link to="/cadastro" style={{ color: "#4fa3ff" }}>Crie uma agora</Link>
      </p>
    </div>
  );
}