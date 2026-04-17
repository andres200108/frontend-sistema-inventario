import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏠 Inicio</h2>
      <p>Bienvenido al sistema de gestión de inventario</p>

      <div style={{ marginTop: "30px" }}>
        <h3>¿Qué deseas hacer?</h3>

        <button style={btn} onClick={() => navigate("/dashboard")}>
          📊 Ver panel general
        </button>

        <br /><br />

        <button style={btn} onClick={() => navigate("/registro-entradas")}>
          📥 Registrar entradas de almacén
        </button>

        <br /><br />

        <button style={btn} onClick={() => navigate("/registro-salidas")}>
          📤 Registrar salidas de almacén
        </button>

        <br /><br />

        <button style={btn} onClick={() => navigate("/productos")}>
          📦 Gestión de productos
        </button>
      </div>
    </div>
  );
}

const btn = {
  padding: "10px 15px",
  borderRadius: "8px",
  border: "none",
  background: "#e53935",
  color: "#fff",
  cursor: "pointer",
};

export default Home;
