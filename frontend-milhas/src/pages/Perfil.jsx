import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

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

      if (res.data?.name) {
        localStorage.setItem("userName", res.data.name);
      }

    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        alert("Sessão expirada. Faça login novamente.");
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
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

      localStorage.setItem("userName", name);

      alert("Perfil atualizado com sucesso.");

      setCurrentPassword("");
      setNewPassword("");

      window.location.reload();

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao salvar perfil.");
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f3f4f6", color: "#111827", padding: 22 }}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={{ margin: 0, fontWeight: 900 }}>Meu perfil</h2>
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
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    color: "#111827",
  },
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 22
  },
  card: {
    width: "100%",
    maxWidth: 560,
    background: "#ffffff",
    padding: 18,
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 22px rgba(0,0,0,.06)"
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
    color: "#374151",
    fontWeight: 900
  },
  input: {
    padding: "12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#111827",
    width: "100%",
    boxSizing: "border-box",
    outline: "none"
  },
  divider: {
    marginTop: 4,
    borderTop: "1px solid #e5e7eb"
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 10,
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 900
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280"
  },
  btnVoltar: {
    padding: "10px 12px",
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 6px 16px rgba(0,0,0,.06)"
  },
  btnSalvar: {
    marginTop: 6,
    padding: "12px",
    background: "#ec4899",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 10px 18px rgba(236,72,153,.18)"
  }
};
