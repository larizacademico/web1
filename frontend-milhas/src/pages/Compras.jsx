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

    if (!arquivo) {
      alert("⚠️ É obrigatório anexar o comprovante da compra!");
      return;
    }

    const formData = new FormData();
    formData.append("cardId", cartaoId);
    formData.append("description", descricao);
    formData.append("amount", valor);
    formData.append("file", arquivo);

    try {
      await api.post("/api/purchases", formData);
      alert("Compra registrada e pontos calculados! ✈️");
      navigate("/dashboard");
    } catch (err) {
      console.error("Erro no envio:", err);
      alert(err?.response?.data?.message || "Erro ao registrar compra.");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Nova Compra</h2>

        <button
          onClick={() => navigate("/dashboard")}
          style={styles.btnVoltar}
        >
          ← Voltar ao Início
        </button>

        <form onSubmit={registrarCompra} style={styles.form}>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Selecione o Cartão:</label>
            <select
              value={cartaoId}
              onChange={e => setCartaoId(e.target.value)}
              style={styles.input}
            >
              {cartoes.length === 0 && <option>Nenhum cartão encontrado</option>}
              {cartoes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} - Limite: R$ {c.limit}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Descrição:</label>
            <input
              placeholder="Ex: Supermercado, Passagem Aérea..."
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Valor (R$):</label>
            <input
              type="number"
              placeholder="0.00"
              value={valor}
              onChange={e => setValor(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Comprovante (Imagem/PDF): <span style={{ color: "#ec4899" }}>*</span>
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={e => setArquivo(e.target.files[0])}
              required
              style={styles.fileInput}
            />
          </div>

          <button type="submit" style={styles.btnSubmit}>
            Registrar Compra
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "22px",
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#ffffff",
    padding: 18,
    borderRadius: 18,
    width: "100%",
    maxWidth: 520,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 22px rgba(0,0,0,.06)"
  },
  title: {
    margin: "0 0 10px 0",
    color: "#111827",
    fontSize: 22,
    fontWeight: 900
  },
  btnVoltar: {
    marginBottom: 16,
    cursor: "pointer",
    padding: "10px 12px",
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 900,
    boxShadow: "0 6px 16px rgba(0,0,0,.06)"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  label: {
    color: "#374151",
    fontSize: 13,
    fontWeight: 900
  },
  input: {
    padding: "12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#111827",
    outline: "none",
    fontSize: 14
  },
  fileInput: {
    background: "#f9fafb",
    padding: "10px",
    borderRadius: 12,
    color: "#111827",
    border: "1px dashed #ec4899",
    fontSize: 13
  },
  btnSubmit: {
    padding: "12px",
    marginTop: 6,
    background: "#ec4899",
    color: "white",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
    boxShadow: "0 10px 18px rgba(236,72,153,.18)"
  }
};
