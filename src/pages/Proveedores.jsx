import { useState, useEffect } from "react";
import { getProveedores, createProveedor, updateProveedor, desactivarProveedor, getHistorialProveedor } from "../services/proveedor.service";
import { descargar } from "../api/api";
import Pagination from "../components/Pagination";

const formVacio = { nombre: "", nit: "", contacto: "", telefono: "", email: "", direccion: "" };
const PER_PAGE = 10;

export default function Proveedores() {
  const [lista, setLista]       = useState([]);
  const [form, setForm]         = useState(formVacio);
  const [editingId, setEditing] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [filtro, setFiltro]     = useState("");
  const [modo, setModo]         = useState("lista");
  const [provSel, setProvSel]   = useState(null);
  const [historial, setHistorial] = useState(null);
  const [filtrosHist, setFiltrosHist] = useState({ desde: "", hasta: "", producto: "" });
  const [page, setPage]         = useState(1);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setLista(await getProveedores()); } catch (e) { setError("Error cargando proveedores"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!form.nombre) return setError("El nombre es obligatorio");
    try {
      setLoading(true);
      editingId ? await updateProveedor(editingId, form) : await createProveedor(form);
      setSuccess(editingId ? "Actualizado" : "Creado");
      setForm(formVacio); setEditing(null); setModo("lista"); setPage(1); await cargar();
    } catch (e) { setError(e.message || "Error"); }
    finally { setLoading(false); }
  };

  const handleEdit = (p) => {
    setEditing(p.id);
    setForm({ nombre: p.nombre, nit: p.nit||"", contacto: p.contacto||"", telefono: p.telefono||"", email: p.email||"", direccion: p.direccion||"" });
    setError(""); setSuccess(""); setModo("form");
  };

  const handleDesactivar = async (id, nombre) => {
    if (!confirm(`¿Desactivar "${nombre}"? Su historial se conservará.`)) return;
    try { await desactivarProveedor(id); setSuccess("Desactivado"); await cargar(); }
    catch (e) { setError("Error"); }
  };

  const verHistorial = async (prov) => {
    setProvSel(prov); setModo("historial"); setError("");
    try { const data = await getHistorialProveedor(prov.id, filtrosHist); setHistorial(data.historial); }
    catch(e) { setError("Error"); }
  };

  const filtrarHistorial = async () => {
    if (!provSel) return;
    try { const data = await getHistorialProveedor(provSel.id, filtrosHist); setHistorial(data.historial); }
    catch(e) { setError("Error"); }
  };

  const exportarDirectorio = () => descargar("/proveedores/exportar/directorio/excel", "directorio_proveedores.xlsx");
  const exportarHistorialExcel = () => {
    if (!provSel) return;
    const params = new URLSearchParams();
    if (filtrosHist.desde) params.append('desde', filtrosHist.desde);
    if (filtrosHist.hasta) params.append('hasta', filtrosHist.hasta);
    if (filtrosHist.producto) params.append('producto', filtrosHist.producto);
    descargar(`/proveedores/${provSel.id}/historial/excel?${params.toString()}`, `historial_${provSel.nombre}.xlsx`);
  };
  const exportarHistorialPDF = () => {
    if (!provSel) return;
    const params = new URLSearchParams();
    if (filtrosHist.desde) params.append('desde', filtrosHist.desde);
    if (filtrosHist.hasta) params.append('hasta', filtrosHist.hasta);
    if (filtrosHist.producto) params.append('producto', filtrosHist.producto);
    descargar(`/proveedores/${provSel.id}/historial/pdf?${params.toString()}`, `historial_${provSel.nombre}.pdf`);
  };

  const filtrados = lista.filter(p => p.nombre.toLowerCase().includes(filtro.toLowerCase()) || (p.nit||"").toLowerCase().includes(filtro.toLowerCase()));
  const paginated = filtrados.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const activos = lista.filter(p => p.activo !== 0).length;

  if (modo === "form") return (
    <div>
      <div style={s.pageHeader}><button onClick={()=>{setModo("lista");setEditing(null);setForm(formVacio);}} style={s.btnSecondary}>← Volver</button><h2 style={s.h2}>{editingId?"Editar":"Nuevo"} proveedor</h2></div>
      <div style={s.card}>
        <form onSubmit={handleSubmit}>
          <div style={s.grid2}>
            {[["nombre","Nombre *"],["nit","NIT"],["contacto","Contacto"],["telefono","Teléfono"],["email","Email"],["direccion","Dirección"]].map(([key,label])=>(
              <div key={key} style={s.field}><label style={s.label}>{label}</label><input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={s.input}/></div>
            ))}
          </div>
          {error && <p style={s.err}>{error}</p>}{success && <p style={s.ok}>{success}</p>}
          <div style={{display:"flex",gap:10,marginTop:12}}>
            <button type="submit" disabled={loading} style={s.btnPrimary}>{loading?"Guardando...":editingId?"Guardar":"Crear"}</button>
            <button type="button" onClick={()=>{setModo("lista");setEditing(null);setForm(formVacio);}} style={s.btnSecondary}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );

  if (modo === "historial" && provSel) return (
    <div>
      <div style={s.pageHeader}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><button onClick={()=>{setModo("lista");setProvSel(null);setHistorial(null);}} style={s.btnSecondary}>← Volver</button><h2 style={s.h2}>Historial - {provSel.nombre}</h2></div>
        <div style={{display:"flex",gap:8}}><button onClick={exportarHistorialExcel} style={s.btnExport}>📥 Excel</button><button onClick={exportarHistorialPDF} style={s.btnExport}>📄 PDF</button></div>
      </div>
      <div style={s.infoBox}><strong>{provSel.nombre}</strong> | NIT: {provSel.nit||"—"}</div>
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <input type="date" value={filtrosHist.desde} onChange={e=>setFiltrosHist({...filtrosHist,desde:e.target.value})} style={s.inputSm}/>
        <input type="date" value={filtrosHist.hasta} onChange={e=>setFiltrosHist({...filtrosHist,hasta:e.target.value})} style={s.inputSm}/>
        <input placeholder="Producto" value={filtrosHist.producto} onChange={e=>setFiltrosHist({...filtrosHist,producto:e.target.value})} style={s.inputSm}/>
        <button onClick={filtrarHistorial} style={s.btnSecondary}>Filtrar</button>
      </div>
      {historial && historial.length===0 ? <p>Sin compras</p> : (
        <table style={s.table}><thead><tr style={s.thead}>{["Fecha","Código","Producto","UM","Cantidad","Precio","Total","Remisión"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>{historial && historial.map(h=>(<tr key={h.id} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
            <td style={s.td}>{new Date(h.fecha).toLocaleDateString("es-CO")}</td><td style={s.td}>{h.codigo}</td><td style={s.td}>{h.producto}</td><td style={s.td}>{h.unidad_medida||"—"}</td>
            <td style={s.td}>{h.cantidad}</td><td style={s.td}>${Number(h.precio_unitario||0).toLocaleString("es-CO")}</td><td style={s.td}>${Number(h.total||0).toLocaleString("es-CO")}</td><td style={s.td}>{h.numero_remision||"—"}</td>
          </tr>))}</tbody></table>
      )}
    </div>
  );

  return (
    <div>
      <div style={s.pageHeader}><h2 style={s.h2}>Proveedores</h2><div style={{display:"flex",gap:8}}><button onClick={exportarDirectorio} style={s.btnExport}>📥 Directorio</button><button onClick={()=>{setModo("form");setEditing(null);setForm(formVacio);}} style={s.btnPrimary}>+ Nuevo</button></div></div>
      <div style={s.metrics}>{[{label:"Total",value:lista.length,color:"info"},{label:"Activos",value:activos,color:"success"},{label:"Inactivos",value:lista.length-activos,color:"secondary"}].map(m=>(<div key={m.label} style={s.metricCard}><p style={s.metricLabel}>{m.label}</p><p style={{...s.metricValue,color:`var(--color-text-${m.color})`}}>{m.value}</p></div>))}</div>
      <div style={s.toolbar}><input placeholder="Buscar..." value={filtro} onChange={e=>{setFiltro(e.target.value);setPage(1);}} style={s.search}/><span>{filtrados.length} proveedores</span></div>
      {lista.length===0 ? <p>No hay proveedores</p> : <>
        <table style={s.table}><thead><tr style={s.thead}>{["Nombre","NIT","Contacto","Teléfono","Email","Dirección","Acciones"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>{paginated.map(p=>(<tr key={p.id} style={s.tr}>
            <td style={s.td}>{p.nombre}{p.activo===0&&<span style={{...s.badge,background:"var(--color-background-danger)",color:"var(--color-text-danger)",marginLeft:8}}>Inactivo</span>}</td>
            <td style={s.td}>{p.nit||"—"}</td><td style={s.td}>{p.contacto||"—"}</td><td style={s.td}>{p.telefono||"—"}</td><td style={s.td}>{p.email||"—"}</td><td style={s.td}>{p.direccion||"—"}</td>
            <td style={s.td}><button onClick={()=>verHistorial(p)} style={s.btnSm}>Historial</button><button onClick={()=>handleEdit(p)} style={s.btnSm}>Editar</button>{p.activo!==0&&<button onClick={()=>handleDesactivar(p.id,p.nombre)} style={{...s.btnSm,color:"var(--color-text-danger)"}}>Desactivar</button>}</td>
          </tr>))}</tbody></table>
        <Pagination current={page} total={filtrados.length} perPage={PER_PAGE} onChange={setPage} />
      </>}
    </div>
  );
}

const s = {
  pageHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"},h2:{margin:0,fontSize:18,fontWeight:500},
  metrics:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:"1.5rem"},
  metricCard:{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,padding:"1rem"},
  metricLabel:{margin:"0 0 6px",fontSize:12,color:"var(--color-text-secondary)"},metricValue:{margin:0,fontSize:26,fontWeight:500},
  toolbar:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"},
  search:{padding:"8px 12px",fontSize:13,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:320},
  card:{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.5rem",marginBottom:"1.5rem",maxWidth:700},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},field:{display:"flex",flexDirection:"column",gap:4,marginBottom:10},
  label:{fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"},input:{padding:"8px 12px",fontSize:14,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:"100%",boxSizing:"border-box"},
  inputSm:{padding:"7px 10px",fontSize:13,borderRadius:6,border:"0.5px solid var(--color-border-secondary)"},
  infoBox:{background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13},
  badge:{padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:500},
  err:{color:"var(--color-text-danger)",fontSize:13,margin:"8px 0",padding:"10px 12px",background:"var(--color-background-danger)",borderRadius:6},
  ok:{color:"var(--color-text-success)",fontSize:13,margin:"8px 0",padding:"10px 12px",background:"var(--color-background-success)",borderRadius:6},
  btnPrimary:{padding:"9px 20px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500},
  btnSecondary:{padding:"9px 16px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,cursor:"pointer",fontSize:13},
  btnExport:{padding:"9px 16px",background:"var(--color-background-success)",color:"var(--color-text-success)",border:"0.5px solid var(--color-border-success)",borderRadius:6,cursor:"pointer",fontSize:13},
  btnSm:{padding:"5px 10px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:4,cursor:"pointer",fontSize:12,marginRight:4},
  table:{width:"100%",borderCollapse:"collapse"},thead:{background:"var(--color-background-secondary)"},
  th:{padding:"10px 12px",textAlign:"left",fontSize:12,fontWeight:500,borderBottom:"0.5px solid var(--color-border-secondary)"},
  tr:{borderBottom:"0.5px solid var(--color-border-tertiary)"},td:{padding:"8px 12px",fontSize:12},
};
