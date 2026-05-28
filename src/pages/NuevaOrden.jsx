import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createOrden } from "../services/orden.service";
import { request } from "../api/api";

export default function NuevaOrden() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [productos,   setProductos]   = useState([]);
  const [filtroP,     setFiltroP]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const [form, setForm] = useState({ proveedor_id:"", observaciones:"" });
  const [detalles, setDetalles] = useState([]);

  useEffect(() => {
    Promise.all([
      request("/proveedores","GET"),
      request("/productos","GET"),
    ]).then(([provs, prods]) => {
      setProveedores(provs);
      setProductos(prods);
    });
  }, []);

  const prodsFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtroP.toLowerCase()) ||
    (p.codigo||"").toLowerCase().includes(filtroP.toLowerCase())
  ).filter(p => !detalles.find(d => d.producto_id === p.id));

  const agregarProducto = (p) => {
    setDetalles(prev => [...prev, {
      producto_id:    p.id,
      codigo:         p.codigo,
      producto:       p.nombre,
      unidad_medida:  p.unidad_medida || "—",
      cantidad_pedida: 1,
      precio_unitario: Number(p.precio || 0),
    }]);
    setFiltroP("");
  };

  const actualizarDetalle = (idx, campo, valor) => {
    setDetalles(prev => prev.map((d, i) =>
      i === idx ? { ...d, [campo]: Number(valor) } : d
    ));
  };

  const eliminarDetalle = (idx) => {
    setDetalles(prev => prev.filter((_, i) => i !== idx));
  };

  const total = detalles.reduce((acc, d) => acc + (d.cantidad_pedida * d.precio_unitario), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.proveedor_id) return setError("Selecciona un proveedor");
    if (detalles.length === 0) return setError("Agrega al menos un producto");
    try {
      setLoading(true);
      const oc = await createOrden({ ...form, detalles });
      navigate(`/ordenes/${oc.id}`);
    } catch(e) { setError(e.message||"Error creando orden"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={s.pageHeader}>
        <h2 style={s.h2}>Nueva orden de compra</h2>
        <button onClick={()=>navigate("/ordenes")} style={s.btnSecondary}>← Volver</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={s.grid2}>

          <div style={s.card}>
            <h3 style={s.h3}>Datos generales</h3>
            <div style={s.field}>
              <label style={s.label}>Proveedor *</label>
              <select value={form.proveedor_id}
                onChange={e=>setForm({...form,proveedor_id:e.target.value})} style={s.input}>
                <option value="">Selecciona un proveedor...</option>
                {proveedores.map(p=>(
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Observaciones</label>
              <textarea value={form.observaciones}
                onChange={e=>setForm({...form,observaciones:e.target.value})}
                placeholder="Condiciones de entrega, notas especiales..."
                rows={4} style={{...s.input,resize:"vertical"}}/>
            </div>
          </div>

          <div style={s.card}>
            <h3 style={s.h3}>Buscar producto para agregar</h3>
            <div style={s.field}>
              <input value={filtroP} onChange={e=>setFiltroP(e.target.value)}
                placeholder="Escribe nombre o código del producto..."
                style={s.input}/>
            </div>
            {filtroP && prodsFiltrados.length > 0 && (
              <div style={s.dropdown}>
                {prodsFiltrados.slice(0,8).map(p=>(
                  <div key={p.id} onClick={()=>agregarProducto(p)} style={s.dropItem}>
                    <div style={{fontWeight:500,fontSize:13}}>{p.nombre}</div>
                    <div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>
                      {p.codigo} | Stock: {p.stock} | ${Number(p.precio||0).toLocaleString("es-CO")}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filtroP && prodsFiltrados.length===0 && (
              <p style={{fontSize:13,color:"var(--color-text-tertiary)"}}>No hay productos disponibles</p>
            )}
          </div>
        </div>

        <div style={s.card}>
          <h3 style={s.h3}>Productos de la orden ({detalles.length})</h3>
          {detalles.length===0 ? (
            <div style={s.empty}>Busca y agrega productos desde el panel de la derecha</div>
          ) : (
            <>
              <table style={s.table}>
                <thead><tr style={s.thead}>
                  {["Código","Producto","UM","Cantidad","Precio unit.","Subtotal",""].map(h=>(
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {detalles.map((d,i)=>(
                    <tr key={i} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                      <td style={s.td}>{d.codigo}</td>
                      <td style={s.td}>{d.producto}</td>
                      <td style={s.td}>{d.unidad_medida}</td>
                      <td style={s.td}>
                        <input type="number" min="1" value={d.cantidad_pedida}
                          onChange={e=>actualizarDetalle(i,"cantidad_pedida",e.target.value)}
                          style={{...s.inputSm,width:70}}/>
                      </td>
                      <td style={s.td}>
                        <input type="number" min="0" step="0.01" value={d.precio_unitario}
                          onChange={e=>actualizarDetalle(i,"precio_unitario",e.target.value)}
                          style={{...s.inputSm,width:100}}/>
                      </td>
                      <td style={s.td}>
                        ${(d.cantidad_pedida*d.precio_unitario).toLocaleString("es-CO")}
                      </td>
                      <td style={s.td}>
                        <button type="button" onClick={()=>eliminarDetalle(i)} style={s.btnDel}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={s.totalRow}>
                <span style={{fontSize:14,fontWeight:500}}>Total estimado:</span>
                <span style={{fontSize:18,fontWeight:500,color:"var(--color-text-info)"}}>
                  ${total.toLocaleString("es-CO")}
                </span>
              </div>
            </>
          )}
        </div>

        {error && <p style={s.err}>{error}</p>}

        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button type="button" onClick={()=>navigate("/ordenes")} style={s.btnSecondary}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} style={s.btnPrimary}>
            {loading?"Creando...":"Crear orden de compra"}
          </button>
        </div>
      </form>
    </div>
  );
}

const s = {
  pageHeader:  {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"},
  h2:          {margin:0,fontSize:18,fontWeight:500},
  h3:          {margin:"0 0 1rem",fontSize:15,fontWeight:500},
  grid2:       {display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16},
  card:        {background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.5rem",marginBottom:16},
  field:       {display:"flex",flexDirection:"column",gap:4,marginBottom:12},
  label:       {fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"},
  input:       {padding:"8px 12px",fontSize:14,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:"100%",boxSizing:"border-box"},
  inputSm:     {padding:"5px 8px",fontSize:13,borderRadius:4,border:"0.5px solid var(--color-border-secondary)"},
  dropdown:    {border:"0.5px solid var(--color-border-secondary)",borderRadius:8,overflow:"hidden",marginTop:4},
  dropItem:    {padding:"10px 12px",cursor:"pointer",borderBottom:"0.5px solid var(--color-border-tertiary)"},
  empty:       {textAlign:"center",padding:"2rem",color:"var(--color-text-tertiary)",fontSize:13,background:"var(--color-background-secondary)",borderRadius:8},
  table:       {width:"100%",borderCollapse:"collapse",marginBottom:12},
  thead:       {background:"var(--color-background-secondary)"},
  th:          {padding:"10px 12px",textAlign:"left",fontSize:13,fontWeight:500,borderBottom:"0.5px solid var(--color-border-secondary)"},
  td:          {padding:"8px 12px",fontSize:13},
  totalRow:    {display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"var(--color-background-info)",borderRadius:8,border:"0.5px solid var(--color-border-info)"},
  err:         {color:"var(--color-text-danger)",fontSize:13,margin:"0 0 1rem",padding:"10px 12px",background:"var(--color-background-danger)",borderRadius:6},
  btnPrimary:  {padding:"9px 24px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500},
  btnSecondary:{padding:"9px 20px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,cursor:"pointer",fontSize:13},
  btnDel:      {padding:"2px 8px",background:"var(--color-background-danger)",color:"var(--color-text-danger)",border:"0.5px solid var(--color-border-danger)",borderRadius:4,cursor:"pointer",fontSize:14,fontWeight:500},
};
