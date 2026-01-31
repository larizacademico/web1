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
          Olá, <span style={{ color: "#fff", fontWeight: "bold" }}>{userName}</span>
        </Link>

        {/* Links do Menu */}
        <Link to="/dashboard" style={styles.link}>
          Início
        </Link>
        
        <Link to="/compras" style={styles.link}>
          Nova Compra
        </Link>
        
        {/* ✅ AGORA ESTÁ CLICÁVEL NOVAMENTE */}
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
    padding: "15px 30px",
    background: "#121214",
    borderBottom: "1px solid #29292e",
    color: "#fff",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#fff"
  },
  menu: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  userBadge: {
    background: "#202024",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    color: "#a8a8b3",
    textDecoration: "none",
    border: "1px solid #323238",
    transition: "0.2s",
    cursor: "pointer",
    display: "flex",
    gap: "5px"
  },
  link: {
    color: "#e1e1e6",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    transition: "color 0.2s",
    cursor: "pointer" // Garante a mãozinha do mouse
  },
  btnSair: {
    padding: "8px 16px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px"
  },
};