import { useState, useEffect } from "react";
import { getClientes, createCliente, updateCliente, desactivarCliente, getHistorialCliente } from "../services/cliente.service";
import { descargar } from "../api/api";
import Pagination from "../components/Pagination";

const TIPOS = ["natural", "juridica"];
const PER_PAGE = 10;

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filtro, setFiltro] = useState("");
  const [modo, setModo] = useState("lista");
  const [clienteSel, setClienteSel] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [filtrosHist, setFiltrosHist] = useState({ desde: "", hasta: "", producto: "" });
  const [page, setPage] = useState(1);
  
  const [form, setForm] = useState({
    nombre: "", tipo: "natural", identificacion: "",
    direccion: "", telefono: "", email: "", categoria: ""
  });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setClientes(await getClientes()); }
    catch(e) { setError("Error cargando clientes"); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ nombre: "", tipo: "natural", identificacion: "", direccion: "", telefono: "", email: "", categoria: "" });
    setError(""); setSuccess("");
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!form.nombre || !form.identificacion) return setError("Nombre e identificación son obligatorios");
    try {
      await createCliente(form);
      setSuccess("Cliente creado correctamente");
      resetForm(); setModo("lista"); setPage(1); await cargar();
    } catch(e) { setError(e.message || "Error creando cliente"); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!clienteSel) return;
    try {
      await updateCliente(clienteSel.id, form);
      setSuccess("Cliente actualizado correctamente");
      setClienteSel(null); resetForm(); setModo("lista"); setPage(1); await cargar();
    } catch(e) { setError(e.message || "Error actualizando cliente"); }
  };

  const handleDesactivar = async (id) => {
    if (!confirm("¿Desactivar este cliente? No se eliminará su historial.")) return;
    try { await desactivarCliente(id); await cargar(); setSuccess("Cliente desactivado"); }
    catch(e) { setError(e.message); }
  };

  const verHistorial = async (cliente) => {
    setClienteSel(cliente); setModo("historial"); setError("");
    try { const data = await getHistorialCliente(cliente.id, filtrosHist); setHistorial(data.historial); }
    catch(e) { setError("Error cargando historial"); }
  };

  const filtrarHistorial = async () => {
    if (!clienteSel) return;
    try { const data = await getHistorialCliente(clienteSel.id, filtrosHist); setHistorial(data.historial); }
    catch(e) { setError("Error filtrando"); }
  };

  const editarCliente = (cli) => {
    setClienteSel(cli);
    setForm({ nombre: cli.nombre, tipo: cli.tipo, identificacion: cli.identificacion, direccion: cli.direccion || "", telefono: cli.telefono || "", email: cli.email || "", categoria: cli.categoria || "" });
    setModo("editar");
  };

  const exportarDirectorio = () => descargar("/clientes/exportar/directorio/excel", "directorio_clientes.xlsx");

  const exportarHistorialExcel = () => {
    if (!clienteSel) return;
    const params = new URLSearchParams();
    if (filtrosHist.desde) params.append('desde', filtrosHist.desde);
    if (filtrosHist.hasta) params.append('hasta', filtrosHist.hasta);
    if (filtrosHist.producto) params.append('producto', filtrosHist.producto);
    descargar(`/clientes/${clienteSel.id}/historial/excel?${params.toString()}`, `historial_${clienteSel.nombre}.xlsx`);
  };

  const exportarHistorialPDF = () => {
    if (!clienteSel) return;
    const params = new URLSearchParams();
    if (filtrosHist.desde) params.append('desde', filtrosHist.desde);
    if (filtrosHist.hasta) params.append('hasta', filtrosHist.hasta);
    if (filtrosHist.producto) params.append('producto', filtrosHist.producto);
    descargar(`/clientes/${clienteSel.id}/historial/pdf?${params.toString()}`, `historial_${clienteSel.nombre}.pdf`);
  };

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    c.identificacion.toLowerCase().includes(filtro.toLowerCase()) ||
    (c.categoria || "").toLowerCase().includes(filtro.toLowerCase())
  );

  const paginated = filtrados.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const activos = clientes.filter(c => c.activo).length;

  const renderForm = (submitHandler, btnText) => (
    <form onSubmit={submitHandler}>
      <div style={s.grid2}>
        <div style={s.field}><label style={s.label}>Nombre / Razón social *</label><input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} style={s.input} placeholder="Nombre completo"/></div>
        <div style={s.field}><label style={s.label}>Tipo *</label><select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} style={s.input}>{TIPOS.map(t=><option key={t} value={t}>{t==="natural"?"Persona Natural":"Persona Jurídica"}</option>)}</select></div>
        <div style={s.field}><label style={s.label}>Identificación *</label><input value={form.identificacion} onChange={e=>setForm({...form,identificacion:e.target.value})} style={s.input} placeholder="Cédula/NIT"/></div>
        <div style={s.field}><label style={s.label}>Categoría</label><input value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} style={s.input} placeholder="Ej: distribuidor"/></div>
        <div style={s.field}><label style={s.label}>Dirección</label><input value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})} style={s.input} placeholder="Dirección"/></div>
        <div style={s.field}><label style={s.label}>Teléfono</label><input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} style={s.input} placeholder="Teléfono"/></div>
        <div style={s.fieldFull}><label style={s.label}>Correo electrónico</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={s.input} placeholder="correo@ejemplo.com"/></div>
      </div>
      {error && <p style={s.err}>{error}</p>}
      {success && <p style={s.ok}>{success}</p>}
      <div style={{display:"flex",gap:10,marginTop:12}}>
        <button type="button" onClick={()=>{setModo("lista");setClienteSel(null);resetForm();}} style={s.btnSecondary}>Cancelar</button>
        <button type="submit" style={s.btnPrimary}>{btnText}</button>
      </div>
    </form>
  );

  if (modo === "historial" && clienteSel) return (
    <div>
      <div style={s.pageHeader}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>{setModo("lista");setClienteSel(null);setHistorial(null);}} style={s.btnSecondary}>← Volver</button>
          <h2 style={s.h2}>Historial de {clienteSel.nombre}</h2>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={exportarHistorialExcel} style={s.btnExport}>📥 Excel</button>
          <button onClick={exportarHistorialPDF} style={s.btnExport}>📄 PDF</button>
        </div>
      </div>
      <div style={s.infoBox}><strong>{clienteSel.nombre}</strong> | {clienteSel.tipo==="natural"?"Persona Natural":"Persona Jurídica"} | ID: {clienteSel.identificacion} | {clienteSel.categoria||"Sin categoría"}</div>
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <input type="date" value={filtrosHist.desde} onChange={e=>setFiltrosHist({...filtrosHist,desde:e.target.value})} style={s.inputSm}/>
        <input type="date" value={filtrosHist.hasta} onChange={e=>setFiltrosHist({...filtrosHist,hasta:e.target.value})} style={s.inputSm}/>
        <input placeholder="Producto" value={filtrosHist.producto} onChange={e=>setFiltrosHist({...filtrosHist,producto:e.target.value})} style={s.inputSm}/>
        <button onClick={filtrarHistorial} style={s.btnSecondary}>Filtrar</button>
      </div>
      {historial && historial.length===0 ? <p style={{color:"var(--color-text-tertiary)",fontSize:13}}>Sin entregas</p> : (
        <table style={s.table}><thead><tr style={s.thead}>{["Fecha","Código","Producto","UM","Cantidad","Precio unit.","Total","Motivo"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>{historial && historial.map(h=>(<tr key={h.id} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
            <td style={s.td}>{new Date(h.fecha).toLocaleDateString("es-CO")}</td><td style={s.td}>{h.codigo}</td><td style={s.td}>{h.producto}</td><td style={s.td}>{h.unidad_medida||"—"}</td>
            <td style={s.td}>{h.cantidad}</td><td style={s.td}>${Number(h.precio_unitario||0).toLocaleString("es-CO")}</td><td style={s.td}>${(h.cantidad*(h.precio_unitario||0)).toLocaleString("es-CO")}</td><td style={s.td}>{h.motivo||"—"}</td>
          </tr>))}</tbody></table>
      )}
    </div>
  );

  return (
    <div>
      <div style={s.pageHeader}>
        <h2 style={s.h2}>Clientes</h2>
        <div style={{display:"flex",gap:8}}>
          <button onClick={exportarDirectorio} style={s.btnExport}>📥 Directorio Excel</button>
          <button onClick={()=>{setModo("nuevo");resetForm();}} style={s.btnPrimary}>+ Nuevo cliente</button>
        </div>
      </div>
      <div style={s.metrics}>
        {[{ label:"Total", value:clientes.length, color:"info" },{ label:"Activos", value:activos, color:"success" },{ label:"Inactivos", value:clientes.length-activos, color:"secondary" }].map(m=>(
          <div key={m.label} style={s.metricCard}><p style={s.metricLabel}>{m.label}</p><p style={{...s.metricValue,color:`var(--color-text-${m.color})`}}>{m.value}</p></div>
        ))}
      </div>
      {modo==="nuevo" && <div style={s.card}><h3 style={s.h3}>Nuevo cliente</h3>{renderForm(handleCreate, "Crear cliente")}</div>}
      {modo==="editar" && clienteSel && <div style={s.card}><h3 style={s.h3}>Editar: {clienteSel.nombre}</h3>{renderForm(handleUpdate, "Actualizar cliente")}</div>}
      {modo==="lista" && <>
        <div style={s.toolbar}>
          <input placeholder="Buscar..." value={filtro} onChange={e=>{setFiltro(e.target.value);setPage(1);}} style={s.search}/>
          <span style={{fontSize:13,color:"var(--color-text-secondary)"}}>{filtrados.length} clientes</span>
        </div>
        {loading ? <p>Cargando...</p> : paginated.length===0 ? <p>No se encontraron clientes</p> : <>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {paginated.map(c=>(
              <div key={c.id} style={s.cardRow}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <strong style={{fontSize:14}}>{c.nombre}</strong>
                    <span style={{...s.badge,background:c.activo?"var(--color-background-success)":"var(--color-background-danger)",color:c.activo?"var(--color-text-success)":"var(--color-text-danger)"}}>{c.activo?"Activo":"Inactivo"}</span>
                  </div>
                  <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:4}}>{c.tipo==="natural"?"Persona Natural":"Persona Jurídica"} | {c.identificacion} | {c.categoria||"Sin categoría"}</div>
                  <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginTop:2}}>{c.email||"—"} • {c.telefono||"—"} • {c.direccion||"—"}</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>verHistorial(c)} style={s.btnSm}>Historial</button>
                  <button onClick={()=>editarCliente(c)} style={s.btnSm}>Editar</button>
                  {c.activo && <button onClick={()=>handleDesactivar(c.id)} style={{...s.btnSm,color:"var(--color-text-danger)",borderColor:"var(--color-border-danger)"}}>Desactivar</button>}
                </div>
              </div>
            ))}
          </div>
          <Pagination current={page} total={filtrados.length} perPage={PER_PAGE} onChange={setPage} />
        </>}
      </>}
    </div>
  );
}

const s = {
  pageHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"},
  h2:{margin:0,fontSize:18,fontWeight:500},h3:{margin:"0 0 1rem",fontSize:15,fontWeight:500},
  metrics:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:"1.5rem"},
  metricCard:{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,padding:"1rem"},
  metricLabel:{margin:"0 0 6px",fontSize:12,color:"var(--color-text-secondary)"},
  metricValue:{margin:0,fontSize:26,fontWeight:500},
  toolbar:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"},
  search:{padding:"8px 12px",fontSize:13,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:360},
  card:{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.5rem",marginBottom:16,maxWidth:700},
  cardRow:{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,padding:"0.9rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between"},
  badge:{padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:500},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
  field:{display:"flex",flexDirection:"column",gap:4,marginBottom:10},
  fieldFull:{display:"flex",flexDirection:"column",gap:4,marginBottom:10,gridColumn:"span 2"},
  label:{fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"},
  input:{padding:"9px 12px",fontSize:14,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:"100%",boxSizing:"border-box"},
  inputSm:{padding:"7px 10px",fontSize:13,borderRadius:6,border:"0.5px solid var(--color-border-secondary)"},
  infoBox:{background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13},
  table:{width:"100%",borderCollapse:"collapse",marginTop:8},thead:{background:"var(--color-background-secondary)"},
  th:{padding:"10px 12px",textAlign:"left",fontSize:12,fontWeight:500},td:{padding:"8px 12px",fontSize:12},
  err:{color:"var(--color-text-danger)",fontSize:13,margin:"8px 0",padding:"10px 12px",background:"var(--color-background-danger)",borderRadius:6},
  ok:{color:"var(--color-text-success)",fontSize:13,margin:"8px 0",padding:"10px 12px",background:"var(--color-background-success)",borderRadius:6},
  btnPrimary:{padding:"9px 20px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500},
  btnSecondary:{padding:"9px 16px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,cursor:"pointer",fontSize:13},
  btnExport:{padding:"9px 16px",background:"var(--color-background-success)",color:"var(--color-text-success)",border:"0.5px solid var(--color-border-success)",borderRadius:6,cursor:"pointer",fontSize:13},
  btnSm:{padding:"5px 12px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:4,cursor:"pointer",fontSize:12},
};
