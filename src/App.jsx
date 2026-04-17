import { BrowserRouter, Routes, Route } from "react-router-dom";

// 📄 Páginas
import Login from "./pages/Login";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Entradas from "./pages/Entradas";
import Salidas from "./pages/Salidas";
import Inventario from "./pages/Inventario";
import Reportes from "./pages/Reportes";
import Catalogo from "./pages/Catalogo";

// 🧱 Layout (desde components)
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 LOGIN */}
        <Route path="/" element={<Login />} />

        {/* 🔒 RUTAS CON LAYOUT */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/registro-entradas" element={<Entradas />} />
          <Route path="/registro-salidas" element={<Salidas />} />
          <Route path="/consultas" element={<Inventario />} />
          <Route path="/catalogo" element={<Catalogo />} />

     

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
