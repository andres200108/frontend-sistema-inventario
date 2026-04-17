import { useState } from "react";
import {
  searchProducts,
  updateProduct,
  deleteProduct,
} from "../services/product.service";

function Products() {
  const [query, setQuery]       = useState("");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nombre: "", precio: "", stock: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // 🔍 Buscar productos
  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Escribe algo para buscar");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await searchProducts(query);
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({ nombre: product.nombre, precio: product.precio, stock: product.stock });
  };

  // 💾 Guardar cambios
  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateProduct(editingId, {
        ...form,
        precio: Number(form.precio),
        stock: Number(form.stock),
      });
      setEditingId(null);
      setForm({ nombre: "", precio: "", stock: "" });
      await handleSearch();
    } catch (err) {
      console.error(err);
      setError("Error actualizando");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Eliminar
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      await deleteProduct(id);
      await handleSearch();
    } catch (err) {
      console.error(err);
      setError("Error eliminando");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Búsqueda de productos</h2>

      {/* 🔍 BUSCADOR */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Buscar por código, nombre o proveedor..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={styleInput}
        />
        <button onClick={handleSearch} style={styleButton}>
          Buscar
        </button>
      </div>

      {error   && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Cargando...</p>}

      {/* 📊 TABLA */}
      {products.length > 0 && (
        <table style={styleTable}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Proveedor</th>
              <th>UM</th>
              <th>Cantidad</th>
              <th>Costo unitario</th>
              <th>Costo total</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.codigo}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.proveedor}</td>
                <td>{p.unidad_medida}</td>
                <td>{p.stock}</td>
                <td>${p.precio}</td>
                <td>${p.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {products.length === 0 && !loading && <p>No hay resultados</p>}
    </div>
  );
}

const styleTable  = { width: "100%", borderCollapse: "collapse" };
const styleInput  = { padding: "8px", width: "300px", marginRight: "10px" };
const styleButton = { padding: "8px 12px", cursor: "pointer" };

export default Products;

