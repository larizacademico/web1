import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Compras() {
  const [cartoes, setCartoes] = useState([]);
  const [cartaoId, setCartaoId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca os cartões para preencher o Select
    api.get("/api/cards")
      .then(res => {
        setCartoes(res.data);
        if (res.data.length > 0) setCartaoId(res.data[0].id);
      })
      .catch(err => console.error("Erro ao carregar cartões", err));
  }, []);

  async function registrarCompra(e) {
    e.preventDefault();
    if (!cartaoId) {
      alert("Cadastre um cartão primeiro!");
      return;
    }

    const formData = new FormData();
    formData.append("cardId", cartaoId);
    formData.append("description", descricao);
    formData.append("amount", valor);
    
    // Só anexa o arquivo se o usuário tiver selecionado um
    if (arquivo) {
      formData.append("file", arquivo);
    }

    try {
      // ✅ CORREÇÃO AQUI: 
      // Removemos o { headers: ... }. O Axios agora detecta automaticamente 
      // que é um FormData e configura o 'boundary' correto para o Java ler os dados.
      await api.post("/api/purchases", formData);
      
      alert("Compra registrada e pontos calculados! ✈️");
      navigate("/dashboard");
    } catch (err) {
      console.error("Erro no envio:", err);
      alert("Erro ao registrar compra.");
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", color: "#fff", background: "#222", minHeight: "100vh" }}>
      <h2>Nova Compra</h2>
      <button 
        onClick={() => navigate("/dashboard")} 
        style={{marginBottom: "15px", cursor: "pointer", padding: "5px 10px", background: "#555", color: "white", border: "none", borderRadius: "4px"}}
      >
        Voltar
      </button>

      <form onSubmit={registrarCompra} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label>Selecione o Cartão:</label>
            <select 
                value={cartaoId} 
                onChange={e => setCartaoId(e.target.value)}
                style={{padding: "10px", borderRadius: "5px"}}
            >
            {cartoes.length === 0 && <option>Nenhum cartão encontrado</option>}
            {cartoes.map(c => (
                <option key={c.id} value={c.id}>{c.name} - Limite: R$ {c.limit}</option>
            ))}
            </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label>Descrição:</label>
            <input 
            placeholder="Ex: Supermercado, Passagem Aérea..." 
            value={descricao} 
            onChange={e => setDescricao(e.target.value)} 
            required
            style={{padding: "10px", borderRadius: "5px"}}
            />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label>Valor (R$):</label>
            <input 
            type="number" 
            placeholder="0.00" 
            value={valor} 
            onChange={e => setValor(e.target.value)} 
            required
            style={{padding: "10px", borderRadius: "5px"}}
            />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label>Comprovante (Imagem/PDF):</label>
            <input 
            type="file" 
            accept="image/*,.pdf"
            onChange={e => setArquivo(e.target.files[0])} 
            style={{background: "#333", padding: "10px", borderRadius: "5px", color: "#ccc"}}
            />
        </div>

        <button type="submit" style={{ padding: "12px", marginTop: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>
          Registrar Compra
        </button>
      </form>
    </div>
  );
}