import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

  // 🔹 Control submenús
  const [menuOpen, setMenuOpen] = useState({
    productos: false,
    movimientos: false,
    reportes: false,
  });

  // 🔹 Modo colapsado (solo iconos)
  const [collapsed, setCollapsed] = useState(false);

  const toggleMenu = (menu) => {
    setMenuOpen({
      ...menuOpen,
      [menu]: !menuOpen[menu],
    });
  };

  const goTo = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      {/* 🌑 OVERLAY */}
      {open && (
        <div onClick={() => setOpen(false)} style={overlay} />
      )}

      {/* 🧭 SIDEBAR */}
      <div
        style={{
          ...sidebar,
          width: collapsed ? "80px" : "260px",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* 🔹 HEADER */}
        <div style={header}>
          {!collapsed && <h3>📋 Menú</h3>}

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={collapseBtn}
          >
            {collapsed ? "➡" : "⬅"}
          </button>
        </div>

        <ul style={{ listStyle: "none", padding: 0 }}>

          {/* 🏠 INICIO */}
          <li onClick={() => goTo("/home")} style={item}>
            🏠 {!collapsed && "Inicio"}
          </li>

          {/* 📦 PRODUCTOS */}
          <li onClick={() => toggleMenu("productos")} style={item}>
            📦 {!collapsed && "Gestión de productos"}
            {!collapsed && (
              <span style={arrow}>
                {menuOpen.productos ? "▼" : "▶"}
              </span>
            )}
          </li>

	<div style={{
	  ...submenuContainer,
	  maxHeight: menuOpen.productos ? "150px" : "0px"
	}}>
	  <ul style={submenu}>
	    <li onClick={() => goTo("/catalogo")} style={subitem}>
	      • catálogo productos
	    </li>
	    <li onClick={() => goTo("/products")} style={subitem}>
	      • Buscar productos
	    </li>
	  </ul>
	</div>
          {/* 📥 MOVIMIENTOS */}
          <li onClick={() => toggleMenu("movimientos")} style={item}>
            📥 {!collapsed && "Movimientos de almacén"}
            {!collapsed && (
              <span style={arrow}>
                {menuOpen.movimientos ? "▼" : "▶"}
              </span>
            )}
          </li>

	<div style={{
	  ...submenuContainer,
	  maxHeight: menuOpen.movimientos ? "150px" : "0px"
	}}>
	  <ul style={submenu}>
	    <li onClick={() => goTo("/registro-entradas")} style={subitem}>
	      • Registro Entradas
	    </li>
	    <li onClick={() => goTo("/registro-salidas")} style={subitem}>
	      • Registro Salidas
	    </li>
	  </ul>
	</div>

          {/* 📊 REPORTES */}
          <li onClick={() => toggleMenu("reportes")} style={item}>
            📊 {!collapsed && "Reportes"}
            {!collapsed && (
              <span style={arrow}>
                {menuOpen.reportes ? "▼" : "▶"}
              </span>
            )}
          </li>

          <div style={{
            ...submenuContainer,
            maxHeight: menuOpen.reportes ? "180px" : "0px"
          }}>
            <ul style={submenu}>
              <li onClick={() => goTo("/reportes")} style={subitem}>
                • General
              </li>
              <li onClick={() => goTo("/reportes/entradas")} style={subitem}>
                • Entradas
              </li>
              <li onClick={() => goTo("/reportes/salidas")} style={subitem}>
                • Salidas
              </li>
            </ul>
          </div>

          {/* 🔍 CONSULTAS */}
          <li onClick={() => goTo("/consultas")} style={item}>
            🔍 {!collapsed && "Inventario"}
          </li>

        </ul>
      </div>
    </>
  );
}

/* 🎨 ESTILOS PRO */
const sidebar = {
  position: "fixed",
  top: "60px",
  left: 0,
  height: "100%",
  background: "#1e1e1e",
  color: "#fff",
  padding: "15px",
  transition: "all 0.3s ease",
  zIndex: 999,
  overflow: "hidden",
};

const overlay = {
  position: "fixed",
  top: "60px",
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  zIndex: 998,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const collapseBtn = {
  background: "transparent",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  fontSize: "16px",
};

const item = {
  padding: "12px",
  cursor: "pointer",
  borderRadius: "6px",
  marginBottom: "5px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  transition: "0.2s",
};

const submenuContainer = {
  overflow: "hidden",
  transition: "max-height 0.3s ease",
};

const submenu = {
  paddingLeft: "15px",
};

const subitem = {
  padding: "8px",
  cursor: "pointer",
  color: "#ccc",
  fontSize: "14px",
};

const arrow = {
  fontSize: "12px",
};

export default Sidebar;
