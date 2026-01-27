import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Cartoes from "./pages/Cartoes";
import Compras from "./pages/Compras";

import EsqueciSenha from "./pages/EsqueciSenha";
import ResetarSenha from "./pages/ResetarSenha";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cartoes" element={<Cartoes />} />
        <Route path="/compras" element={<Compras />} />

        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/resetar-senha" element={<ResetarSenha />} />
      </Routes>
    </BrowserRouter>
  );
}
