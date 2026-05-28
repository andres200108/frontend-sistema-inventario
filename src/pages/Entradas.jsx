import { useState, useEffect } from "react";
import { registrarEntrada, getEntradas, recibirDesdeOC } from "../services/entrada.service";
import { getOrdenes } from "../services/orden.service";
import { request } from "../api/api";
import Pagination from "../components/Pagination";

const PER_PAGE = 10;

export default function Entradas() {
  const [entradas,  setEntradas]  = useState([]);
  const [ordenes,   setOrdenes]   = useState([]);
  const [producto,  setProducto]  = useState(null);
  const [buscando,  setBuscando]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [modo,      setModo]      = useState("manual");
  const [ocSel,     setOcSel]     = useState("");
  const [ocDetalle, setOcDetalle] = useState(null);
  const [obsOC,     setObsOC]     = useState("");
  const [pageHist,  setPageHist]  = useState(1);
  const [form, setForm] = useState({ codigo:"", cantidad:"", precio_unitario:"", proveedor:"", observacion:"" });

  useEffect(() => { cargarEntradas(); cargarOrdenes(); }, []);

  const cargarEntradas = async () => { try { setEntradas(await request("/entradas","GET")); } catch(e) {} };
  const cargarOrdenes = async () => { try { const all = await getOrdenes(); setOrdenes(all.filter(o => ["aprobada","recibida_parcial"].includes(o.estado))); } catch(e) {} };

  const buscarProducto = async () => {
    if (!form.codigo.trim()) return;
    try { setBuscando(true); setProducto(null); setError(""); setProducto(await request(`/productos/codigo/${form.codigo.trim()}`,"GET")); }
    catch(e) { setError(`Producto "${form.codigo}" no encontrado`); }
    finally { setBuscando(false); }
  };

  const cargarOC = async (id) => {
    if (!id) { setOcDetalle(null); return; }
    try { setError(""); setObsOC(""); setOcDetalle(await request(`/ordenes/${id}`,"GET")); }
    catch(e) { setError("Error cargando orden de compra"); }
  };

  const handleSubmitManual = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!producto) return setError("Busca y selecciona un producto primero");
    if (!form.cantidad||Number(form.cantidad)<=0) return setError("La cantidad debe ser mayor a cero");
    try {
      setLoading(true);
      await registrarEntrada({codigo:producto.codigo,producto_id:producto.id,cantidad:Number(form.cantidad),precio_unitario:Number(form.precio_unitario||0),proveedor:form.proveedor,observacion:form.observacion});
      setSuccess(`Entrada registrada. Stock de "${producto.nombre}" actualizado.`);
      setForm({codigo:"",cantidad:"",precio_unitario:"",proveedor:"",observacion:""});setProducto(null);await cargarEntradas();
    } catch(e) { setError(e.message||"Error"); }
    finally { setLoading(false); }
  };

  const handleSubmitOC = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!ocDetalle) return setError("Selecciona una orden de compra");
    const recepciones = [];
    for (const d of ocDetalle.detalles) {
      const input = document.getElementById(`oc-cant-${d.id}`); const cant = Number(input?.value||0);
      if (cant>0) { const pendiente = d.cantidad_pedida-d.cantidad_recibida; if (cant>pendiente) return setError(`"${d.producto}" solo tiene ${pendiente} pendientes`); recepciones.push({detalle_id:d.id,cantidad:cant}); }
    }
    if (recepciones.length===0) return setError("Ingresa al menos una cantidad mayor a cero");
    try {
      setLoading(true);
      const result = await recibirDesdeOC(ocDetalle.id, recepciones, obsOC);
      setSuccess(`Recepción registrada. Estado: ${result.estado||"actualizado"}.`);
      await cargarOC(ocDetalle.id); await cargarEntradas(); await cargarOrdenes();
      if (result.estado==="recibida"||result.estado==="cerrada") { setOcSel(""); setOcDetalle(null); }
    } catch(e) { setError(e.message||"Error"); }
    finally { setLoading(false); }
  };

  const paginatedEntradas = entradas.slice((pageHist-1)*PER_PAGE, pageHist*PER_PAGE);

  return (
    <div>
      <h2 style={s.h2}>Entrada de almacén</h2>
      <div style={s.modoSwitch}>
        <button onClick={()=>setModo("manual")} style={{...s.modoBtn,...(modo==="manual"?s.modoBtnActive:{})}}>Entrada manual</button>
        <button onClick={()=>setModo("oc")} style={{...s.modoBtn,...(modo==="oc"?s.modoBtnActive:{})}}>Desde orden de compra</button>
      </div>
      {modo==="manual"?(
        <div style={s.card}><h3 style={s.h3}>Registrar entrada manual</h3>
          <form onSubmit={handleSubmitManual}>
            <div style={s.field}><label style={s.label}>Código del producto *</label><div style={{display:"flex",gap:8}}><input value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value})} onBlur={buscarProducto} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),buscarProducto())} placeholder="Ej: 10001" style={{...s.input,flex:1}}/><button type="button" onClick={buscarProducto} style={s.btnSecondary}>{buscando?"Buscando...":"Buscar"}</button></div></div>
            {producto&&<div style={s.infoBox}><strong>{producto.nombre}</strong><span>Código: {producto.codigo} | UM: {producto.unidad_medida||"—"} | Stock: <strong>{producto.stock}</strong></span></div>}
            <div style={s.grid2}><div style={s.field}><label style={s.label}>Cantidad *</label><input type="number" min="1" value={form.cantidad} onChange={e=>setForm({...form,cantidad:e.target.value})} style={s.input}/></div><div style={s.field}><label style={s.label}>Precio unitario</label><input type="number" min="0" step="0.01" value={form.precio_unitario} onChange={e=>setForm({...form,precio_unitario:e.target.value})} style={s.input}/></div><div style={s.field}><label style={s.label}>Proveedor</label><input value={form.proveedor} onChange={e=>setForm({...form,proveedor:e.target.value})} style={s.input}/></div><div style={s.field}><label style={s.label}>Observación / No. Remisión</label><input value={form.observacion} onChange={e=>setForm({...form,observacion:e.target.value})} style={s.input}/></div></div>
            {form.cantidad&&form.precio_unitario&&<div style={s.totalBox}><span>Total:</span><strong>${(Number(form.cantidad)*Number(form.precio_unitario)).toLocaleString("es-CO")}</strong></div>}
            {error&&<p style={s.err}>{error}</p>}{success&&<p style={s.ok}>{success}</p>}
            <button type="submit" disabled={loading||!producto} style={s.btnPrimary}>{loading?"Registrando...":"Registrar entrada"}</button>
          </form></div>
      ):(
        <div style={s.card}><h3 style={s.h3}>Registrar entrada desde orden de compra</h3>
          <div style={s.field}><label style={s.label}>Seleccionar orden de compra aprobada</label><select value={ocSel} onChange={e=>{setOcSel(e.target.value);cargarOC(e.target.value);}} style={s.input}><option value="">Selecciona...</option>{ordenes.map(o=><option key={o.id} value={o.id}>{o.numero} — {o.proveedor} ({o.estado})</option>)}</select></div>
          {ocDetalle&&<form onSubmit={handleSubmitOC}>
            <div style={s.infoBox}><strong>OC: {ocDetalle.numero}</strong><span>Proveedor: {ocDetalle.proveedor} | Estado: {ocDetalle.estado} | Total: ${Number(ocDetalle.total_estimado||0).toLocaleString("es-CO")}</span></div>
            <div style={s.field}><label style={s.label}>Observación / No. Remisión</label><input value={obsOC} onChange={e=>setObsOC(e.target.value)} style={s.input}/></div>
            <table style={s.table}><thead><tr style={s.thead}>{["Código","Producto","UM","Cant. pedida","Ya recibido","Pendiente","Precio unit.","Cantidad a ingresar"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead><tbody>{ocDetalle.detalles.map(d=>{const pendiente=d.cantidad_pedida-d.cantidad_recibida;const agotado=pendiente<=0;return (<tr key={d.id}><td style={s.td}>{d.codigo}</td><td style={s.td}>{d.producto}</td><td style={s.td}>{d.unidad_medida||"—"}</td><td style={s.td}>{d.cantidad_pedida}</td><td style={s.td}>{d.cantidad_recibida}</td><td style={s.td}><span style={{background:agotado?"var(--color-background-success)":"var(--color-background-warning)",color:agotado?"var(--color-text-success)":"var(--color-text-warning)",padding:"2px 8px",borderRadius:4,fontSize:11}}>{pendiente}</span></td><td style={s.td}>${Number(d.precio_unitario||0).toLocaleString("es-CO")}</td><td style={s.td}>{agotado?<span style={{fontSize:11,color:"var(--color-text-success)"}}>Completo ✓</span>:<div style={{display:"flex",alignItems:"center",gap:4}}><input id={`oc-cant-${d.id}`} type="number" min="0" max={pendiente} defaultValue={pendiente} style={{...s.inputSm,width:80}}/><button type="button" onClick={()=>{const inp=document.getElementById(`oc-cant-${d.id}`);if(inp)inp.value=pendiente;}} style={s.btnMax}>Max</button></div>}</td></tr>)})}</tbody></table>
            {error&&<p style={s.err}>{error}</p>}{success&&<p style={s.ok}>{success}</p>}
            <button type="submit" disabled={loading} style={{...s.btnPrimary,marginTop:12}}>{loading?"Registrando...":"Registrar entradas desde OC"}</button>
          </form>}
        </div>
      )}
      <h3 style={{margin:"1.5rem 0 1rem",fontSize:15,fontWeight:500}}>Historial de entradas</h3>
      {entradas.length===0?<p>Sin entradas</p>:<><table style={s.table}><thead><tr style={s.thead}>{["Fecha","Código","Producto","Cantidad","Precio unit.","Total","Proveedor","Obs."].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead><tbody>{paginatedEntradas.map(e=>(<tr key={e.id} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}><td style={s.td}>{new Date(e.fecha).toLocaleDateString("es-CO")}</td><td style={s.td}>{e.codigo||"—"}</td><td style={s.td}>{e.nombre||e.producto||"—"}</td><td style={s.td}>{e.cantidad}</td><td style={s.td}>${Number(e.precio||e.precio_unitario||0).toLocaleString("es-CO")}</td><td style={s.td}>${(e.cantidad*(e.precio||e.precio_unitario||0)).toLocaleString("es-CO")}</td><td style={s.td}>{e.proveedor||"—"}</td><td style={s.td}>{e.observacion||e.numero_remision||"—"}</td></tr>))}</tbody></table><Pagination current={pageHist} total={entradas.length} perPage={PER_PAGE} onChange={setPageHist} /></>}
    </div>
  );
}

const s = {
  h2:{margin:"0 0 1.5rem",fontSize:18,fontWeight:500},h3:{margin:"0 0 1rem",fontSize:15,fontWeight:500},
  modoSwitch:{display:"flex",gap:0,marginBottom:"1.5rem",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,overflow:"hidden",width:"fit-content"},
  modoBtn:{padding:"8px 20px",fontSize:13,cursor:"pointer",border:"none",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)"},
  modoBtnActive:{background:"var(--color-background-info)",color:"var(--color-text-info)",fontWeight:500},
  card:{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.5rem",marginBottom:"1.5rem",maxWidth:750},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},field:{display:"flex",flexDirection:"column",gap:4,marginBottom:12},
  label:{fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"},input:{padding:"9px 12px",fontSize:14,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:"100%",boxSizing:"border-box"},
  inputSm:{padding:"5px 8px",fontSize:13,borderRadius:4,border:"0.5px solid var(--color-border-secondary)"},
  infoBox:{background:"var(--color-background-success)",border:"0.5px solid var(--color-border-success)",borderRadius:8,padding:"12px",marginBottom:12,display:"flex",flexDirection:"column",gap:4,fontSize:13},
  totalBox:{background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",fontSize:14},
  err:{color:"var(--color-text-danger)",fontSize:13,margin:"8px 0",padding:"10px 12px",background:"var(--color-background-danger)",borderRadius:6},
  ok:{color:"var(--color-text-success)",fontSize:13,margin:"8px 0",padding:"10px 12px",background:"var(--color-background-success)",borderRadius:6},
  btnPrimary:{padding:"10px 24px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:14,fontWeight:500,width:"100%"},
  btnSecondary:{padding:"9px 16px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,cursor:"pointer",fontSize:13},
  btnMax:{padding:"4px 8px",fontSize:11,background:"var(--color-background-success)",color:"var(--color-text-success)",border:"0.5px solid var(--color-border-success)",borderRadius:4,cursor:"pointer"},
  table:{width:"100%",borderCollapse:"collapse"},thead:{background:"var(--color-background-secondary)"},
  th:{padding:"10px 12px",textAlign:"left",fontSize:12,fontWeight:500,borderBottom:"0.5px solid var(--color-border-secondary)"},td:{padding:"8px 12px",fontSize:12},
};
