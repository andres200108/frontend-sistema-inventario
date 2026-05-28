import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrden, cambiarEstado, cancelarOrden } from "../services/orden.service";

const ESTADO_CONFIG = {
  pendiente:        { label:"Pendiente",        color:"warning" },
  aprobada:         { label:"Aprobada",         color:"info"    },
  recibida_parcial: { label:"Recibida parcial", color:"warning" },
  recibida:         { label:"Recibida",         color:"success" },
  cerrada:          { label:"Cerrada",          color:"success" },
  cancelada:        { label:"Cancelada",        color:"danger"  },
};

export default function DetalleOrden() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oc,      setOc]      = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { cargar(); }, [id]);

  const cargar = async () => {
    try { setOc(await getOrden(id)); }
    catch(e) { setError("Error cargando orden"); }
    finally { setLoading(false); }
  };

  const handleEstado = async (estado) => {
    const labels = { aprobada:"aprobar", cerrada:"cerrar" };
    if (!confirm(`¿Deseas ${labels[estado]||"cambiar"} esta orden?`)) return;
    try {
      await cambiarEstado(id, estado);
      setSuccess("Estado actualizado");
      await cargar();
    } catch(e) { setError(e.message||"Error"); }
  };

  const handleCancelar = async () => {
    if (!confirm("¿Cancelar esta orden?")) return;
    try {
      await cancelarOrden(id);
      navigate("/ordenes");
    } catch(e) { setError(e.message||"Error cancelando"); }
  };

  if (loading) return <p style={{color:"var(--color-text-secondary)",padding:"2rem"}}>Cargando...</p>;
  if (!oc)     return <p style={{color:"var(--color-text-danger)",padding:"2rem"}}>{error}</p>;

  const cfg = ESTADO_CONFIG[oc.estado] || {};
  const total = oc.detalles.reduce((acc,d)=>acc+(d.cantidad_pedida*d.precio_unitario),0);

  return (
    <div>
      <div style={s.pageHeader}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>navigate("/ordenes")} style={s.btnBack}>← Volver</button>
          <h2 style={s.h2}>{oc.numero}</h2>
          <span style={{
            background:`var(--color-background-${cfg.color})`,
            color:`var(--color-text-${cfg.color})`,
            border:`0.5px solid var(--color-border-${cfg.color})`,
            padding:"3px 12px",borderRadius:4,fontSize:12,fontWeight:500
          }}>{cfg.label}</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          {oc.estado==="pendiente"       && <button onClick={()=>handleEstado("aprobada")} style={s.btnAprobar}>Aprobar orden</button>}
          {/* BOTÓN RECIBIR MERCADO ELIMINADO - Ahora se hace desde Entradas */}
          {oc.estado==="recibida"        && <button onClick={()=>handleEstado("cerrada")} style={s.btnCerrar}>Cerrar orden</button>}
          {["pendiente","aprobada"].includes(oc.estado) && <button onClick={handleCancelar} style={s.btnCancelar}>Cancelar</button>}
        </div>
      </div>

      {error   && <p style={s.err}>{error}</p>}
      {success && <p style={s.ok}>{success}</p>}

      <div style={s.grid2}>
        <div style={s.card}>
          <h3 style={s.h3}>Información general</h3>
          {[
            ["Proveedor",      oc.proveedor],
            ["Creada por",     oc.usuario],
            ["Fecha creación", new Date(oc.fecha_creacion).toLocaleString("es-CO")],
            ["Fecha aprobación", oc.fecha_aprobacion ? new Date(oc.fecha_aprobacion).toLocaleString("es-CO") : "—"],
            ["Fecha recepción",  oc.fecha_recepcion  ? new Date(oc.fecha_recepcion).toLocaleString("es-CO")  : "—"],
          ].map(([label,value])=>(
            <div key={label} style={s.infoRow}>
              <span style={s.infoLabel}>{label}</span>
              <span style={s.infoValue}>{value}</span>
            </div>
          ))}
        </div>
        <div style={s.card}>
          <h3 style={s.h3}>Resumen financiero</h3>
          <div style={s.totalBox}>
            <p style={{margin:"0 0 4px",fontSize:12,color:"var(--color-text-secondary)"}}>Total estimado</p>
            <p style={{margin:0,fontSize:28,fontWeight:500,color:"var(--color-text-info)"}}>
              ${total.toLocaleString("es-CO")}
            </p>
          </div>
          {oc.observaciones && (
            <div style={{marginTop:12,padding:"10px 12px",background:"var(--color-background-secondary)",borderRadius:6,fontSize:13}}>
              <strong>Observaciones:</strong> {oc.observaciones}
            </div>
          )}
        </div>
      </div>

      <div style={s.card}>
        <h3 style={s.h3}>Productos de la orden</h3>
        <table style={s.table}>
          <thead><tr style={s.thead}>
            {["Código","Producto","UM","Cant. pedida","Cant. recibida","Pendiente","Precio unit.","Subtotal","Estado"].map(h=>(
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {oc.detalles.map(d=>{
              const pendiente = d.cantidad_pedida - d.cantidad_recibida;
              const completo  = pendiente === 0;
              return (
                <tr key={d.id} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                  <td style={s.td}>{d.codigo}</td>
                  <td style={s.td}>{d.producto}</td>
                  <td style={s.td}>{d.unidad_medida||"—"}</td>
                  <td style={s.td}>{d.cantidad_pedida}</td>
                  <td style={s.td}>{d.cantidad_recibida}</td>
                  <td style={s.td}>
                    <span style={{
                      background: completo?"var(--color-background-success)":"var(--color-background-warning)",
                      color:      completo?"var(--color-text-success)":"var(--color-text-warning)",
                      padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:500
                    }}>{pendiente}</span>
                  </td>
                  <td style={s.td}>${Number(d.precio_unitario||0).toLocaleString("es-CO")}</td>
                  <td style={s.td}>${(d.cantidad_pedida*d.precio_unitario).toLocaleString("es-CO")}</td>
                  <td style={s.td}>
                    <span style={{
                      background: completo?"var(--color-background-success)":"var(--color-background-warning)",
                      color:      completo?"var(--color-text-success)":"var(--color-text-warning)",
                      padding:"2px 6px",borderRadius:4,fontSize:11
                    }}>{completo?"Completo":"Pendiente"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  pageHeader:  {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"},
  h2:          {margin:0,fontSize:18,fontWeight:500},
  h3:          {margin:"0 0 1rem",fontSize:15,fontWeight:500},
  grid2:       {display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16},
  card:        {background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.5rem",marginBottom:16},
  infoRow:     {display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:13},
  infoLabel:   {color:"var(--color-text-secondary)"},
  infoValue:   {fontWeight:500},
  totalBox:    {background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",borderRadius:8,padding:"1rem"},
  table:       {width:"100%",borderCollapse:"collapse"},
  thead:       {background:"var(--color-background-secondary)"},
  th:          {padding:"10px 12px",textAlign:"left",fontSize:12,fontWeight:500,borderBottom:"0.5px solid var(--color-border-secondary)"},
  td:          {padding:"8px 12px",fontSize:12},
  err:         {color:"var(--color-text-danger)",fontSize:13,margin:"0 0 1rem",padding:"10px 12px",background:"var(--color-background-danger)",borderRadius:6},
  ok:          {color:"var(--color-text-success)",fontSize:13,margin:"0 0 1rem",padding:"10px 12px",background:"var(--color-background-success)",borderRadius:6},
  btnBack:     {padding:"6px 14px",background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,cursor:"pointer",fontSize:13},
  btnAprobar:  {padding:"8px 16px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500},
  btnCerrar:   {padding:"8px 16px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,cursor:"pointer",fontSize:13},
  btnCancelar: {padding:"8px 16px",background:"var(--color-background-danger)",color:"var(--color-text-danger)",border:"0.5px solid var(--color-border-danger)",borderRadius:6,cursor:"pointer",fontSize:13},
};
