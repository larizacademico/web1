import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Cartoes from "./pages/Cartoes";
import MeusCartoes from "./pages/MeusCartoes"; // ✅ NOVO
import Compras from "./pages/Compras";
import Perfil from "./pages/Perfil";
import Notificacoes from "./pages/Notificacoes";

import EsqueciSenha from "./pages/EsqueciSenha";
import ResetarSenha from "./pages/ResetarSenha";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/dashboard" element={<Dashboard />} />

        {/* ✅ NOVO: lista/gestão de cartões */}
        <Route path="/meus-cartoes" element={<MeusCartoes />} />

        {/* formulário (criar/editar via state) */}
        <Route path="/cartoes" element={<Cartoes />} />

        <Route path="/compras" element={<Compras />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/notificacoes" element={<Notificacoes />} />

        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/resetar-senha" element={<ResetarSenha />} />
      </Routes>
    </BrowserRouter>
  );
}
