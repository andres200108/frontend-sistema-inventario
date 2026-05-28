import { useState, useEffect } from "react";
import { request } from "../api/api";
import Pagination from "../components/Pagination";

const formVacio = { codigo:"", nombre:"", precio:"", unidad_medida:"", proveedor_id:"" };
const PER_PAGE = 10;

export default function Catalogo() {
  const [productos,   setProductos]   = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [form,        setForm]        = useState(formVacio);
  const [editingId,   setEditing]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [filtro,      setFiltro]      = useState("");
  const [page,        setPage]        = useState(1);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const [prods, provs] = await Promise.all([
        request("/productos", "GET"),
        request("/proveedores", "GET"),
      ]);
      setProductos(prods);
      setProveedores(provs);
    } catch(e) { setError("Error cargando datos"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!form.codigo || !form.nombre) return setError("Código y nombre son obligatorios");
    try {
      setLoading(true);
      const payload = {
        codigo: form.codigo, nombre: form.nombre,
        precio: Number(form.precio||0), unidad_medida: form.unidad_medida,
        proveedor: proveedores.find(p=>p.id===Number(form.proveedor_id))?.nombre || "",
      };
      if (editingId) {
        await request(`/productos/${editingId}`, "PUT", payload);
        setSuccess(`Producto "${form.nombre}" actualizado`);
      } else {
        await request("/productos", "POST", { ...payload, stock: 0 });
        setSuccess(`Producto "${form.nombre}" creado`);
      }
      setForm(formVacio); setEditing(null); setPage(1); await cargar();
    } catch(e) { setError(e.message || "Error guardando producto"); }
    finally { setLoading(false); }
  };

  const handleEdit = (p) => {
    const prov = proveedores.find(pr => pr.nombre === p.proveedor);
    setEditing(p.id);
    setForm({ codigo: p.codigo||"", nombre: p.nombre||"", precio: p.precio||"", unidad_medida: p.unidad_medida||"", proveedor_id: prov?.id||"" });
    setError(""); setSuccess(""); window.scrollTo(0,0);
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Desactivar "${nombre}"?`)) return;
    try { await request(`/productos/${id}`, "DELETE"); setSuccess(`"${nombre}" desactivado`); setPage(1); await cargar(); }
    catch(e) { setError(e.message || "Error"); }
  };

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.codigo||"").toLowerCase().includes(filtro.toLowerCase())
  );

  const paginated = filtrados.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <div>
      <h2 style={s.h2}>Catálogo de productos</h2>

      <div style={s.card}>
        <h3 style={s.h3}>{editingId ? "Editar producto" : "Nuevo producto"}</h3>
        <form onSubmit={handleSubmit}>
          <div style={s.grid3}>
            <div style={s.field}>
              <label style={s.label}>Código *</label>
              <input value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value})} placeholder="Ej: 10001" style={s.input} disabled={!!editingId}/>
            </div>
            <div style={{...s.field, gridColumn:"span 2"}}>
              <label style={s.label}>Nombre *</label>
              <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Ej: Nevera Samsung 260L" style={s.input}/>
            </div>
            <div style={s.field}>
              <label style={s.label}>Precio unitario</label>
              <input type="number" min="0" step="0.01" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})} placeholder="0.00" style={s.input}/>
            </div>
            <div style={s.field}>
              <label style={s.label}>Unidad</label>
              <select value={form.unidad_medida} onChange={e=>setForm({...form,unidad_medida:e.target.value})} style={s.input}>
                <option value="">Seleccionar...</option>
                {["UND","KG","LT","MT","CJ","PAQ"].map(u=><option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Proveedor</label>
              <select value={form.proveedor_id} onChange={e=>setForm({...form,proveedor_id:e.target.value})} style={s.input}>
                <option value="">Sin proveedor</option>
                {proveedores.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
          {error && <p style={s.err}>{error}</p>}
          {success && <p style={s.ok}>{success}</p>}
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button type="submit" disabled={loading} style={s.btnPrimary}>
              {loading?"Guardando...":editingId?"Guardar cambios":"Crear producto"}
            </button>
            {editingId && <button type="button" onClick={()=>{setEditing(null);setForm(formVacio);}} style={s.btnSecondary}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div style={s.toolbar}>
        <h3 style={{margin:0,fontSize:15,fontWeight:500}}>Productos ({filtrados.length})</h3>
        <input placeholder="Filtrar por nombre o código..." value={filtro} onChange={e=>{setFiltro(e.target.value);setPage(1);}} style={s.search}/>
      </div>

      {paginated.length===0 ? <p style={{color:"var(--color-text-tertiary)",fontSize:13}}>No hay productos</p> : (
        <>
          <table style={s.table}>
            <thead><tr style={s.thead}>
              {["Código","Nombre","UM","Precio","Stock","Proveedor","Acciones"].map(h=><th key={h} style={s.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {paginated.map(p=>(
                <tr key={p.id} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                  <td style={s.td}>{p.codigo||"—"}</td>
                  <td style={s.td}>{p.nombre}</td>
                  <td style={s.td}>{p.unidad_medida||"—"}</td>
                  <td style={s.td}>${Number(p.precio||0).toLocaleString("es-CO")}</td>
                  <td style={s.td}><span style={{background:p.stock===0?"var(--color-background-danger)":p.stock<=5?"var(--color-background-warning)":"var(--color-background-success)",color:p.stock===0?"var(--color-text-danger)":p.stock<=5?"var(--color-text-warning)":"var(--color-text-success)",padding:"2px 8px",borderRadius:4,fontSize:12,fontWeight:500}}>{p.stock}</span></td>
                  <td style={s.td}>{p.proveedor||"—"}</td>
                  <td style={s.td}>
                    <button onClick={()=>handleEdit(p)} style={s.btnEdit}>Editar</button>
                    <button onClick={()=>handleDelete(p.id,p.nombre)} style={s.btnDel}>Desactivar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination current={page} total={filtrados.length} perPage={PER_PAGE} onChange={setPage} />
        </>
      )}
    </div>
  );
}

const s = {
  h2:{margin:"0 0 1.5rem",fontSize:18,fontWeight:500},h3:{margin:"0 0 1rem",fontSize:15,fontWeight:500},
  card:{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.5rem",marginBottom:"1.5rem"},
  grid3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12},
  field:{display:"flex",flexDirection:"column",gap:4},label:{fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"},
  input:{padding:"8px 12px",fontSize:14,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:"100%",boxSizing:"border-box"},
  err:{color:"var(--color-text-danger)",fontSize:13,margin:"8px 0",padding:"10px 12px",background:"var(--color-background-danger)",borderRadius:6},
  ok:{color:"var(--color-text-success)",fontSize:13,margin:"8px 0",padding:"10px 12px",background:"var(--color-background-success)",borderRadius:6},
  toolbar:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",gap:12},
  search:{padding:"8px 12px",fontSize:13,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:280},
  btnPrimary:{padding:"8px 20px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500},
  btnSecondary:{padding:"8px 16px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,cursor:"pointer",fontSize:13},
  btnEdit:{padding:"4px 10px",background:"var(--color-background-warning)",color:"var(--color-text-warning)",border:"0.5px solid var(--color-border-warning)",borderRadius:4,cursor:"pointer",fontSize:12,marginRight:6},
  btnDel:{padding:"4px 10px",background:"var(--color-background-danger)",color:"var(--color-text-danger)",border:"0.5px solid var(--color-border-danger)",borderRadius:4,cursor:"pointer",fontSize:12},
  table:{width:"100%",borderCollapse:"collapse"},thead:{background:"var(--color-background-secondary)"},
  th:{padding:"10px 12px",textAlign:"left",fontSize:13,fontWeight:500,borderBottom:"0.5px solid var(--color-border-secondary)"},
  td:{padding:"8px 12px",fontSize:13},
};
