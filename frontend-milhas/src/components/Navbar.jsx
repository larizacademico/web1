import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Usuário");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      const firstName = storedName.split(" ")[0];
      setUserName(firstName);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo} onClick={() => navigate("/dashboard")}>
        MilhasApp ✈️
      </div>

      <div style={styles.menu}>
        {/* Link para o Perfil */}
        <Link to="/perfil" style={styles.userBadge}>
          Olá, <span style={{ color: "#ec4899", fontWeight: "900" }}>{userName}</span>
        </Link>

        {/* Links do Menu */}
        <Link to="/dashboard" style={styles.link}>
          Início
        </Link>

        <Link to="/meus-cartoes" style={styles.link}>
          Meus Cartões
        </Link>

        <Link to="/compras" style={styles.link}>
          Nova Compra
        </Link>

        <Link to="/notificacoes" style={styles.link}>
          Notificações
        </Link>

        <button onClick={handleLogout} style={styles.btnSair}>
          Sair
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 22px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  logo: {
    fontSize: "18px",
    fontWeight: "900",
    cursor: "pointer",
    color: "#111827",
    letterSpacing: "0.2px",
  },
  menu: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  userBadge: {
    background: "#fce7f3",
    padding: "10px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    color: "#831843",
    textDecoration: "none",
    border: "1px solid #fbcfe8",
    cursor: "pointer",
    display: "inline-flex",
    gap: "6px",
    alignItems: "center",
    fontWeight: "800",
  },
  link: {
    background: "#f3f4f6",
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    color: "#111827",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  },
  btnSair: {
    padding: "10px 14px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "13px",
    boxShadow: "0 10px 18px rgba(239,68,68,.18)",
  },
};
