import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"; // 👈 IMPORTANTE
import { logout } from "../services/auth.service";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* 🔴 NAVBAR SUPERIOR */}
      <div style={{
        width: "100%",
        height: "60px",
        background: "#d32f2f",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        color: "#fff"
      }}>

        {/* ☰ BOTÓN */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            fontSize: "24px",
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer"
          }}
        >
          ☰
        </button>

        <h3>Inventario</h3>

        <button
          onClick={handleLogout}
          style={{
            background: "#b71c1c",
            border: "none",
            padding: "6px 12px",
            borderRadius: "5px",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* 👇 SIDEBAR CONTROLADO DESDE AQUÍ */}
      <Sidebar open={open} setOpen={setOpen} />
    </>
  );
}

export default Navbar;
