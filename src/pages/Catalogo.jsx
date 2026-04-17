import { useState, useEffect } from "react";
import { request } from "../api/api";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [editingId, setEditingId] = useState(null);

  const formVacio = {
    codigo: "", nombre: "", precio: "",
    stock: "0", unidad_medida: "", proveedor: "",
  };
  const [form, setForm] = useState(formVacio);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await request("/productos", "GET");
      setProductos(data);
    } catch (err) {
      setError("Error cargando productos");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.codigo || !form.nombre) {
      setError("Código y nombre son obligatorios");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Actualizar
        await request(`/productos/${editingId}`, "PUT", {
          ...form,
          precio: Number(form.precio),
          stock:  Number(form.stock),
        });
        setSuccess(`✅ Producto "${form.nombre}" actualizado correctamente`);
      } else {
        // Crear
        await request("/productos", "POST", {
          ...form,
          precio: Number(form.precio),
          stock:  Number(form.stock),
        });
        setSuccess(`✅ Producto "${form.nombre}" creado correctamente`);
      }

      setForm(formVacio);
      setEditingId(null);
      await cargarProductos();

    } catch (err) {
      setError(err.message || "Error guardando producto");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      codigo:        p.codigo        || "",
      nombre:        p.nombre        || "",
      precio:        p.precio        || "",
      stock:         p.stock         || "0",
      unidad_medida: p.unidad_medida || "",
      proveedor:     p.proveedor     || "",
    });
    setError("");
    setSuccess("");
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await request(`/productos/${id}`, "DELETE");
      setSuccess(`✅ Producto "${nombre}" eliminado`);
      await cargarProductos();
    } catch (err) {
      setError("Error eliminando producto");
    }
  };

  const handleCancelar = () => {
    setEditingId(null);
    setForm(formVacio);
    setError("");
    setSuccess("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🗂️ Gestión de catálogo de productos</h2>

      {/* ── FORMULARIO ── */}
      <div style={styleCard}>
        <h3 style={{ marginTop: 0 }}>
          {editingId ? "✏️ Editar producto" : "➕ Nuevo producto"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={styleGrid}>

            {/* Código */}
            <div style={styleField}>
              <label style={styleLabel}>Código *</label>
              <input
                name="codigo" value={form.codigo} onChange={handleChange}
                placeholder="Ej: PROD-001" style={styleInput}
                disabled={!!editingId} // no se puede cambiar el código al editar
              />
            </div>

            {/* Nombre */}
            <div style={styleField}>
              <label style={styleLabel}>Nombre *</label>
              <input
                name="nombre" value={form.nombre} onChange={handleChange}
                placeholder="Ej: Audífonos Bluetooth" style={styleInput}
              />
            </div>

            {/* Precio */}
            <div style={styleField}>
              <label style={styleLabel}>Precio unitario</label>
              <input
                type="number" name="precio" value={form.precio}
                onChange={handleChange} placeholder="Ej: 25000"
                min="0" step="0.01" style={styleInput}
              />
            </div>

            {/* Stock inicial */}
            <div style={styleField}>
              <label style={styleLabel}>Stock inicial</label>
              <input
                type="number" name="stock" value={form.stock}
                onChange={handleChange} placeholder="0"
                min="0" style={styleInput}
                disabled={!!editingId} // el stock lo maneja entradas
              />
              {editingId && (
                <small style={{ color: "#888" }}>El stock se actualiza desde entradas de almacén</small>
              )}
            </div>

            {/* Unidad de medida */}
            <div style={styleField}>
              <label style={styleLabel}>Unidad de medida</label>
              <select name="unidad_medida" value={form.unidad_medida} onChange={handleChange} style={styleInput}>
                <option value="">Seleccionar...</option>
                <option value="UND">Unidad (UND)</option>
                <option value="KG">Kilogramo (KG)</option>
                <option value="LT">Litro (LT)</option>
                <option value="MT">Metro (MT)</option>
                <option value="CJ">Caja (CJ)</option>
                <option value="PAQ">Paquete (PAQ)</option>
              </select>
            </div>

            {/* Proveedor */}
            <div style={styleField}>
              <label style={styleLabel}>Proveedor</label>
              <input
                name="proveedor" value={form.proveedor} onChange={handleChange}
                placeholder="Nombre del proveedor" style={styleInput}
              />
            </div>

          </div>

          {error   && <p style={{ color: "red",   margin: "8px 0" }}>{error}</p>}
          {success && <p style={{ color: "green", margin: "8px 0" }}>{success}</p>}

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" disabled={loading} style={styleBtnPrimary}>
              {loading ? "Guardando..." : editingId ? "Guardar cambios" : "Crear producto"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelar} style={styleBtnSecondary}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── TABLA DE PRODUCTOS ── */}
      <h3 style={{ marginTop: "30px" }}>📦 Productos registrados ({productos.length})</h3>

      {loading && <p>Cargando...</p>}

      {productos.length === 0 && !loading ? (
        <p>No hay productos registrados aún</p>
      ) : (
        <table style={styleTable}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={styleTh}>Código</th>
              <th style={styleTh}>Nombre</th>
              <th style={styleTh}>UM</th>
              <th style={styleTh}>Precio</th>
              <th style={styleTh}>Stock</th>
              <th style={styleTh}>Proveedor</th>
              <th style={styleTh}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={styleTd}>{p.codigo}</td>
                <td style={styleTd}>{p.nombre}</td>
                <td style={styleTd}>{p.unidad_medida || "—"}</td>
                <td style={styleTd}>${Number(p.precio || 0).toLocaleString("es-CO")}</td>
                <td style={{ ...styleTd, color: p.stock === 0 ? "red" : "inherit", fontWeight: p.stock === 0 ? "bold" : "normal" }}>
                  {p.stock}
                </td>
                <td style={styleTd}>{p.proveedor || "—"}</td>
                <td style={styleTd}>
                  <button onClick={() => handleEdit(p)} style={styleBtnEdit}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(p.id, p.nombre)} style={styleBtnDelete}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ── Estilos ── */
const styleCard       = { background: "#f9f9f9", padding: "24px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "20px" };
const styleGrid       = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" };
const styleField      = { display: "flex", flexDirection: "column", gap: "4px" };
const styleLabel      = { fontSize: "13px", fontWeight: "600", color: "#444" };
const styleInput      = { padding: "9px 12px", fontSize: "14px", borderRadius: "6px", border: "1px solid #ccc", width: "100%", boxSizing: "border-box" };
const styleBtnPrimary = { padding: "10px 24px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" };
const styleBtnSecondary = { padding: "10px 20px", background: "#6b7280", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" };
const styleBtnEdit    = { padding: "5px 12px", background: "#f59e0b", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "6px", fontSize: "12px" };
const styleBtnDelete  = { padding: "5px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };
const styleTable      = { width: "100%", borderCollapse: "collapse" };
const styleTh         = { padding: "10px 12px", textAlign: "left", borderBottom: "2px solid #ddd", fontSize: "13px" };
const styleTd         = { padding: "8px 12px", fontSize: "13px" };

export default Catalogo;
