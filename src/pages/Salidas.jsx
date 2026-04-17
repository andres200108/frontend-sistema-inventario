import { useState } from "react";
import { createSalida } from "../services/salida.service";
import { getProductByCodigo } from "../services/product.service";

function Salidas() {

  const [codigo, setCodigo] = useState("");
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔍 Buscar producto automáticamente
  const handleBuscar = async () => {
    try {
      setError("");
      const data = await getProductByCodigo(codigo);
      setProducto(data);
    } catch (err) {
      setProducto(null);
      setError("Producto no encontrado");
    }
  };

  // 📤 Registrar salida
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      await createSalida({
        codigo,
        cantidad: Number(cantidad),
        motivo
      });

      setSuccess("Salida registrada correctamente");

      setCodigo("");
      setProducto(null);
      setCantidad("");
      setMotivo("");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📤 Registro de Salidas de Almacén</h2>

      {/* BUSCAR PRODUCTO */}
      <input
        type="text"
        placeholder="Código del producto"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />
      <button onClick={handleBuscar}>Buscar</button>

      {/* INFO PRODUCTO */}
      {producto && (
        <div style={{ marginTop: "10px" }}>
          <p><b>{producto.nombre}</b></p>
          <p>Stock actual: {producto.stock}</p>
          <p>Proveedor: {producto.proveedor}</p>
        </div>
      )}

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Cantidad a retirar"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />

        <input
          type="text"
          placeholder="Motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />

        <button type="submit">Registrar salida</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}

export default Salidas;

