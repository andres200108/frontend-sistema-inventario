import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login        from "./pages/Login";
import Home         from "./pages/Home";
import Products     from "./pages/Products";
import Entradas     from "./pages/Entradas";
import Salidas      from "./pages/Salidas";
import Inventario   from "./pages/Inventario";
import Reportes     from "./pages/Reportes";
import Catalogo     from "./pages/Catalogo";
import Proveedores  from "./pages/Proveedores";
import Usuarios     from "./pages/Usuarios";
import Auditoria    from "./pages/Auditoria";
import Perfil       from "./pages/Perfil";
import Ordenes      from "./pages/Ordenes";
import NuevaOrden   from "./pages/NuevaOrden";
import DetalleOrden from "./pages/DetalleOrden";
import Clientes     from "./pages/Clientes";
import MainLayout   from "./components/MainLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/home"              element={<Home />} />
          <Route path="/catalogo"          element={<Catalogo />} />
          <Route path="/products"          element={<Products />} />
          <Route path="/entradas"          element={<Entradas />} />
          <Route path="/salidas"           element={<Salidas />} />
          <Route path="/consultas"         element={<Inventario />} />
          <Route path="/reportes"          element={<Reportes />} />
          <Route path="/proveedores"       element={<Proveedores />} />
          <Route path="/clientes"          element={<Clientes />} />
          <Route path="/usuarios"          element={<Usuarios />} />
          <Route path="/auditoria"         element={<Auditoria />} />
          <Route path="/perfil"            element={<Perfil />} />
          <Route path="/ordenes"           element={<Ordenes />} />
          <Route path="/ordenes/nueva"     element={<NuevaOrden />} />
          <Route path="/ordenes/:id"       element={<DetalleOrden />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
