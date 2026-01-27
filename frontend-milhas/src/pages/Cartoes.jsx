import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function Cartoes() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartaoParaEditar = location.state;

  const [nome, setNome] = useState(cartaoParaEditar ? cartaoParaEditar.name : "");
  const [limite, setLimite] = useState(cartaoParaEditar ? String(cartaoParaEditar.limit ?? "") : "");
  const [programaId, setProgramaId] = useState("");
  const [listaProgramas, setListaProgramas] = useState([]);
  const [criandoPrograma, setCriandoPrograma] = useState(false);

  function normalizarProgramas(data) {
    return Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
  }

  useEffect(() => {
    async function carregarProgramas() {
      try {
        const response = await api.get("/api/programs");
        const programasArray = normalizarProgramas(response.data);

        setListaProgramas(programasArray);

        // Se está editando e já tem programa vinculado
        if (cartaoParaEditar && cartaoParaEditar.programs?.length > 0) {
          setProgramaId(String(cartaoParaEditar.programs[0].id));
          return;
        }

        // Se não está editando e ainda não tem seleção, seleciona o primeiro
        if (!cartaoParaEditar && (!programaId || programaId === "") && programasArray.length > 0) {
          setProgramaId(String(programasArray[0].id));
          return;
        }

        if (programasArray.length === 0) {
          setProgramaId("");
        }
      } catch (error) {
        console.error("Erro ao buscar programas:", error);
        setListaProgramas([]);
        setProgramaId("");
      }
    }

    carregarProgramas();
  }, [cartaoParaEditar, programaId]);

  async function salvarCartao(e) {
    e.preventDefault();

    try {
      const limitNumber = Number(limite);
      if (!Number.isFinite(limitNumber)) {
        alert("Limite inválido.");
        return;
      }

      const progIdNumber = Number(programaId);
      if (!Number.isFinite(progIdNumber) || progIdNumber <= 0) {
        alert("Selecione um programa válido.");
        return;
      }

      const dados = {
        name: nome,
        limit: limitNumber,
        programIds: [progIdNumber]
      };

      if (cartaoParaEditar) {
        await api.put(`/api/cards/${cartaoParaEditar.id}`, dados);
        alert("Cartão atualizado!");
      } else {
        await api.post("/api/cards", dados);
        alert("Cartão criado!");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      const msg = err?.response?.data?.message || "Erro ao salvar. Verifique se selecionou um programa.";
      alert(msg);
    }
  }

  async function criarProgramaTeste() {
    try {
      if (criandoPrograma) return;
      setCriandoPrograma(true);

      // Se já existe Livelo (Teste), só seleciona (não duplica)
      const jaExiste = (Array.isArray(listaProgramas) ? listaProgramas : []).find(
        p => (p.name || "").toLowerCase() === "livelo (teste)".toLowerCase()
      );
      if (jaExiste?.id) {
        setProgramaId(String(jaExiste.id));
        alert('Programa "Livelo (Teste)" já existe. Selecionado.');
        return;
      }

      await api.post("/api/programs", {
        name: "Livelo (Teste)",
        multiplier: 1.0,
        defaultCreditDays: 3
      });

      // Recarrega lista
      const response = await api.get("/api/programs");
      const programasArray = normalizarProgramas(response.data);

      setListaProgramas(programasArray);

      // Seleciona o criado pelo nome; se não achar, pega o primeiro
      const achado = programasArray.find(p => (p.name || "") === "Livelo (Teste)");
      const idParaSelecionar = achado?.id || programasArray[0]?.id;

      if (idParaSelecionar) {
        setProgramaId(String(idParaSelecionar));
        alert("Programa criado e selecionado!");
      } else {
        setProgramaId("");
        alert("Programa criado, mas não consegui selecionar automaticamente.");
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Erro ao criar programa.");
    } finally {
      setCriandoPrograma(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#222",
        color: "#fff",
        padding: "20px"
      }}
    >
      <h2>{cartaoParaEditar ? "Editar Cartão" : "Adicionar Novo Cartão"}</h2>

      <form
        onSubmit={salvarCartao}
        style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%", maxWidth: "350px" }}
      >
        <label>Nome do Cartão</label>
        <input
          placeholder="Ex: Nubank, Visa Infinite..."
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          style={styles.input}
        />

        <label>Limite (R$)</label>
        <input
          type="number"
          placeholder="Ex: 5000"
          value={limite}
          onChange={e => setLimite(e.target.value)}
          required
          style={styles.input}
        />

        <label>Vincular ao Programa</label>
        <select value={programaId} onChange={e => setProgramaId(e.target.value)} required style={styles.input}>
          <option value="" disabled>
            Selecione...
          </option>
          {(Array.isArray(listaProgramas) ? listaProgramas : []).map(prog => (
            <option key={prog.id} value={String(prog.id)}>
              {prog.name}
            </option>
          ))}
        </select>

        {listaProgramas.length === 0 && (
          <div style={{ textAlign: "center", background: "#444", padding: "10px", borderRadius: "5px" }}>
            <p style={{ color: "orange", margin: "0 0 10px 0", fontSize: "14px" }}>
              ⚠️ Nenhum programa encontrado.
            </p>
            <button
              type="button"
              onClick={criarProgramaTeste}
              disabled={criandoPrograma}
              style={{
                ...styles.btn,
                background: "#007bff",
                color: "white",
                opacity: criandoPrograma ? 0.7 : 1
              }}
            >
              🪄 Criar "Livelo" Automaticamente
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button type="button" onClick={() => navigate("/dashboard")} style={{ ...styles.btn, background: "#666" }}>
            Cancelar
          </button>
          <button
            type="submit"
            style={{
              ...styles.btn,
              background: cartaoParaEditar ? "#ffc107" : "#28a745",
              color: cartaoParaEditar ? "#000" : "#fff"
            }}
          >
            {cartaoParaEditar ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  input: { padding: "12px", borderRadius: "5px", border: "1px solid #555", background: "#333", color: "white" },
  btn: { flex: 1, padding: "12px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }
};
