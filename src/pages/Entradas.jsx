import { useState } from "react";
import { createEntrada } from "../services/entrada.service";
import { getProductByCodigo } from "../services/product.service";

function Entradas() {

  const [form, setForm] = useState({
    codigo: "",
    cantidad: "",
    numero_remision: ""
  });

  // 🔥 Producto encontrado
  const [producto, setProducto] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /**
   * 🔍 Buscar producto automáticamente
   */
  const handleCodigoChange = async (e) => {
    const codigo = e.target.value;

    setForm({ ...form, codigo });
    setProducto(null);

    if (codigo.length < 2) return; // evitar spam

    try {
      const data = await getProductByCodigo(codigo);
      setProducto(data);
      setMessage("");

    } catch (err) {
      setProducto(null);
      setMessage("❌ Producto no encontrado");
    }
  };

  /**
   * 📥 Registrar entrada
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!producto) {
      setMessage("❌ Debes seleccionar un producto válido");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await createEntrada({
        ...form,
        cantidad: Number(form.cantidad)
      });

      setMessage("✅ Entrada registrada correctamente");

      setForm({
        codigo: "",
        cantidad: "",
        numero_remision: ""
      });

      setProducto(null);

    } catch (err) {
      console.error(err);
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📥 Registro de entradas</h2>

      <form onSubmit={handleSubmit}>

        {/* 🔍 CÓDIGO */}
        <input
          name="codigo"
          placeholder="Código del producto"
          value={form.codigo}
          onChange={handleCodigoChange}
          required
        />

        {/* 🔥 INFO AUTOMÁTICA */}
        {producto && (
          <div style={box}>
            <p><b>Nombre:</b> {producto.nombre}</p>
            <p><b>Proveedor:</b> {producto.proveedor}</p>
            <p><b>Precio:</b> ${producto.precio}</p>
            <p><b>Stock actual:</b> {producto.stock}</p>
          </div>
        )}

        <input
          name="cantidad"
          type="number"
          placeholder="Cantidad"
          value={form.cantidad}
          onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
          required
        />

        <input
          name="numero_remision"
          placeholder="Número de remisión"
          value={form.numero_remision}
          onChange={(e) =>
            setForm({ ...form, numero_remision: e.target.value })
          }
        />

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Registrar entrada"}
        </button>

      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

const box = {
  background: "#f5f5f5",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "5px"
};

export default Entradas;
