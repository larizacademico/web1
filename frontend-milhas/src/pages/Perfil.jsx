// src/pages/Perfil.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Perfil() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function carregarPerfil() {
    try {
      setLoading(true);
      const res = await api.get("/api/user/me");
      setName(res.data?.name || "");
      setEmail(res.data?.email || "");
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        alert("Sessão expirada. Faça login novamente.");
        localStorage.removeItem("token");
        navigate("/");
        return;
      }
      alert(err?.response?.data?.message || "Erro ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvar(e) {
    e.preventDefault();

    try {
      const payload = { name, email };

      if (newPassword.trim() !== "") {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await api.put("/api/user/me", payload);

      alert("Perfil atualizado com sucesso.");

      setCurrentPassword("");
      setNewPassword("");

      await carregarPerfil();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao salvar perfil.");
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#222", color: "#fff", padding: 20 }}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Meu perfil</h2>
          <button type="button" onClick={() => navigate("/dashboard")} style={styles.btnVoltar}>
            Voltar
          </button>
        </div>

        <form onSubmit={salvar} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
              placeholder="Seu nome"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div style={styles.divider} />

          <div>
            <div style={styles.sectionTitle}>Alterar senha (opcional)</div>

            <div style={styles.grid2}>
              <div style={styles.field}>
                <label style={styles.label}>Senha atual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={styles.input}
                  placeholder="Sua senha atual"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Nova senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                  placeholder="Digite a nova senha"
                />
              </div>
            </div>

            <div style={styles.hint}>
              Dica: para trocar a senha, preencha “Nova senha” e confirme com a “Senha atual”.
            </div>
          </div>

          <button type="submit" style={styles.btnSalvar}>
            Salvar alterações
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#222",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "#2b2b2b",
    padding: 22,
    borderRadius: 12
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  label: {
    fontSize: 13,
    color: "#d0d0d0"
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #555",
    background: "#333",
    color: "white",
    width: "100%",
    boxSizing: "border-box"
  },
  divider: {
    marginTop: 4,
    borderTop: "1px solid #444"
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 10,
    color: "#bbb",
    fontSize: 13
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: "#aaa"
  },
  btnVoltar: {
    padding: "8px 12px",
    background: "#666",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  },
  btnSalvar: {
    marginTop: 6,
    padding: "12px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};
