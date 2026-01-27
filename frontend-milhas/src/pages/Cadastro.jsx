import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api"; // Verifique se o caminho do api está certo

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  async function registrar(e) {
    e.preventDefault();
    console.log("Tentando cadastrar...");

    try {
      // O Java espera: { name, email, password }
      // A rota correta é: /api/auth/signup
      await api.post("/api/auth/signup", {
        name: nome,      // Envia o 'nome' do input como 'name'
        email: email,
        password: senha  // Envia a 'senha' do input como 'password'
      });

      alert("Cadastro realizado com sucesso! Faça login.");
      navigate("/"); // Manda para a tela de login
      
    } catch (err) {
      console.error("Erro no cadastro:", err);
      // Tenta pegar a mensagem específica do erro, se houver
      const msg = err.response?.data?.message || "Erro ao cadastrar. Verifique os dados.";
      alert(msg);
    }
  }

  return (
    <div style={{ 
      display: "flex", flexDirection: "column", alignItems: "center", 
      justifyContent: "center", height: "100vh", background: "#222", color: "#fff" 
    }}>
      <h2>Crie sua Conta</h2>
      <form onSubmit={registrar} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
        
        <input 
          placeholder="Nome Completo" 
          value={nome} 
          onChange={e => setNome(e.target.value)} 
          required 
          style={{ padding: "10px", borderRadius: "5px", border: "none" }}
        />
        
        <input 
          type="email" 
          placeholder="Seu Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          style={{ padding: "10px", borderRadius: "5px", border: "none" }}
        />
        
        <input 
          type="password" 
          placeholder="Senha (mínimo 6 dígitos)" 
          value={senha} 
          onChange={e => setSenha(e.target.value)} 
          required 
          minLength={6}
          style={{ padding: "10px", borderRadius: "5px", border: "none" }}
        />

        <button type="submit" style={{ 
          padding: "10px", background: "#007bff", color: "#fff", 
          border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" 
        }}>
          Cadastrar
        </button>
      </form>
      
      <p style={{ marginTop: "15px" }}>
        Já tem conta? <Link to="/" style={{ color: "#4fa3ff" }}>Faça Login</Link>
      </p>
    </div>
  );
}