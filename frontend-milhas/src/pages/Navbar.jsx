import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Usuário";

  function handleLogout() {
    localStorage.clear(); // Limpa token e nome
    navigate("/"); // Manda pro login
  }

  return (
    <nav style={styles.nav}>
      <h2 style={{ margin: 0 }}>MilhasApp ✈️</h2>
      <div style={styles.menu}>
        <span style={{ marginRight: "20px" }}>Olá, {userName}</span>
        <Link to="/dashboard" style={styles.link}>Início</Link>
        
        {/* 👇 AQUI FOI A MUDANÇA (linha 16) 👇 */}
        <Link to="/compras" style={styles.link}>Nova Compra</Link>
        
        <button onClick={handleLogout} style={styles.btnSair}>Sair</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#007BFF",
    color: "white",
    marginBottom: "20px"
  },
  menu: { display: "flex", alignItems: "center", gap: "15px" },
  link: { color: "white", textDecoration: "none", fontWeight: "bold" },
  btnSair: {
    backgroundColor: "transparent",
    border: "1px solid white",
    color: "white",
    padding: "5px 10px",
    cursor: "pointer",
    borderRadius: "4px"
  }
};

export default Navbar;