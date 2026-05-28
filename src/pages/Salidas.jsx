import { useState, useEffect } from "react";
import { request } from "../api/api";
import { getClientesActivos } from "../services/cliente.service";
import Pagination from "../components/Pagination";

const PER_PAGE = 10;

export default function Salidas() {
  const [salidas, setSalidas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [producto, setProducto] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [destinatario, setDestinatario] = useState("interno");
  const [clienteId, setClienteId] = useState("");
  const [form, setForm] = useState({ codigo:"", cantidad:"", precio_unitario:"", motivo:"" });
  const [page, setPage] = useState(1);

  useEffect(() => { cargarSalidas(); cargarClientes(); }, []);

  const cargarSalidas = async () => { try { setSalidas(await request("/salidas","GET")); } catch(e) {} };
  const cargarClientes = async () => { try { setClientes(await getClientesActivos()); } catch(e) {} };

  const buscarProducto = async () => {
    if (!form.codigo.trim()) return;
    try { setBuscando(true); setProducto(null); setError(""); setProducto(await request(`/productos/codigo/${form.codigo.trim()}`,"GET")); }
    catch(e) { setError(`Producto "${form.codigo}" no encontrado`); }
    finally { setBuscando(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!producto) return setError("Busca y selecciona un producto primero");
    if (!form.cantidad||Number(form.cantidad)<=0) return setError("Cantidad mayor a cero");
    if (destinatario==="cliente"&&!clienteId) return setError("Selecciona un cliente");
    try {
      setLoading(true);
      const res = await request("/salidas","POST",{producto_id:producto.id,cantidad:Number(form.cantidad),precio_unitario:Number(form.precio_unitario||0),motivo:form.motivo,cliente_id:destinatario==="cliente"?Number(clienteId):null});
      setSuccess(`Salida registrada. Stock nuevo: ${res.stock_nuevo} unidades`);
      setForm({codigo:"",cantidad:"",precio_unitario:"",motivo:""});setProducto(null);setClienteId("");await cargarSalidas();
    } catch(e) { setError(e.message||"Error"); }
    finally { setLoading(false); }
  };

  const paginated = salidas.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <div>
      <h2 style={s.h2}>Salida de almacén</h2>
      <div style={s.card}><h3 style={s.h3}>Registrar salida</h3>
        <form onSubmit={handleSubmit}>
          <div style={s.field}><label style={s.label}>Tipo de destinatario</label>
            <div style={{display:"flex",gap:0,border:"0.5px solid var(--color-border-secondary)",borderRadius:8,overflow:"hidden",width:"fit-content"}}>
              <button type="button" onClick={()=>{setDestinatario("interno");setClienteId("");}} style={{...s.toggleBtn,...(destinatario==="interno"?s.toggleActive:{})}}>Interno / General</button>
              <button type="button" onClick={()=>setDestinatario("cliente")} style={{...s.toggleBtn,...(destinatario==="cliente"?s.toggleActive:{})}}>Cliente</button>
            </div>
          </div>
          {destinatario==="cliente"&&(<div style={s.field}><label style={s.label}>Seleccionar cliente *</label><select value={clienteId} onChange={e=>setClienteId(e.target.value)} style={s.input}><option value="">Selecciona...</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nombre} — {c.identificacion}</option>)}</select></div>)}
          <div style={s.field}><label style={s.label}>Código del producto *</label><div style={{display:"flex",gap:8}}><input value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value})} onBlur={buscarProducto} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),buscarProducto())} placeholder="Ej: 10001" style={{...s.input,flex:1}}/><button type="button" onClick={buscarProducto} style={s.btnSecondary}>{buscando?"Buscando...":"Buscar"}</button></div></div>
          {producto&&(<div style={s.infoBox}><strong>{producto.nombre}</strong><span>Código: {producto.codigo} | UM: {producto.unidad_medida||"—"} | Stock: <strong>{producto.stock}</strong></span></div>)}
          <div style={s.grid2}><div style={s.field}><label style={s.label}>Cantidad *</label><input type="number" min="1" value={form.cantidad} onChange={e=>setForm({...form,cantidad:e.target.value})} style={s.input}/></div><div style={s.field}><label style={s.label}>Precio unitario</label><input type="number" min="0" step="0.01" value={form.precio_unitario} onChange={e=>setForm({...form,precio_unitario:e.target.value})} style={s.input}/></div></div>
          <div style={s.field}><label style={s.label}>Motivo / Nota</label><input value={form.motivo} onChange={e=>setForm({...form,motivo:e.target.value})} style={s.input}/></div>
          {form.cantidad&&form.precio_unitario&&(<div style={s.totalBox}><span>Total:</span><strong>${(Number(form.cantidad)*Number(form.precio_unitario)).toLocaleString("es-CO")}</strong></div>)}
          {error&&<p style={s.err}>{error}</p>}{success&&<p style={s.ok}>{success}</p>}
          <button type="submit" disabled={loading||!producto} style={s.btnPrimary}>{loading?"Registrando...":"Registrar salida"}</button>
        </form>
      </div>
      <h3 style={s.h3}>Historial de salidas</h3>
      {salidas.length===0?<p>Sin salidas</p>:<><table style={s.table}><thead><tr style={s.thead}>{["Fecha","Código","Producto","Cantidad","Precio unit.","Total","Motivo","Cliente","Usuario"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead><tbody>{paginated.map(s2=>(<tr key={s2.id} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}><td style={s.td}>{new Date(s2.fecha).toLocaleDateString("es-CO")}</td><td style={s.td}>{s2.codigo}</td><td style={s.td}>{s2.producto}</td><td style={s.td}>{s2.cantidad}</td><td style={s.td}>${Number(s2.precio_unitario||0).toLocaleString("es-CO")}</td><td style={s.td}>${(s2.cantidad*(s2.precio_unitario||0)).toLocaleString("es-CO")}</td><td style={s.td}>{s2.motivo||"—"}</td><td style={s.td}>{s2.cliente||"—"}</td><td style={s.td}>{s2.usuario||"—"}</td></tr>))}</tbody></table><Pagination current={page} total={salidas.length} perPage={PER_PAGE} onChange={setPage} /></>}
    </div>
  );
}

const s = {
  h2:{margin:"0 0 1.5rem",fontSize:18,fontWeight:500},h3:{margin:"1.5rem 0 1rem",fontSize:15,fontWeight:500},
  card:{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.5rem",marginBottom:"1.5rem",maxWidth:560},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},field:{display:"flex",flexDirection:"column",gap:4,marginBottom:12},
  label:{fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"},input:{padding:"9px 12px",fontSize:14,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:"100%",boxSizing:"border-box"},
  infoBox:{background:"var(--color-background-success)",border:"0.5px solid var(--color-border-success)",borderRadius:8,padding:"12px",marginBottom:12,display:"flex",flexDirection:"column",gap:4,fontSize:13},
  totalBox:{background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",fontSize:14},
  err:{color:"var(--color-text-danger)",fontSize:13,margin:"8px 0",padding:"10px 12px",background:"var(--color-background-danger)",borderRadius:6},
  ok:{color:"var(--color-text-success)",fontSize:13,margin:"8px 0",padding:"10px 12px",background:"var(--color-background-success)",borderRadius:6},
  toggleBtn:{padding:"8px 16px",fontSize:13,cursor:"pointer",border:"none",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)"},
  toggleActive:{background:"var(--color-background-info)",color:"var(--color-text-info)",fontWeight:500},
  btnPrimary:{padding:"10px 24px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:14,fontWeight:500,width:"100%"},
  btnSecondary:{padding:"9px 16px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,cursor:"pointer",fontSize:13},
  table:{width:"100%",borderCollapse:"collapse"},thead:{background:"var(--color-background-secondary)"},
  th:{padding:"10px 12px",textAlign:"left",fontSize:12,fontWeight:500,borderBottom:"0.5px solid var(--color-border-secondary)"},td:{padding:"8px 12px",fontSize:12},
};
