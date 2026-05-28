import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrdenes, cambiarEstado, cancelarOrden } from "../services/orden.service";
import Pagination from "../components/Pagination";

const ESTADO_CONFIG = {
  pendiente:         { label:"Pendiente",       color:"warning"  },
  aprobada:          { label:"Aprobada",        color:"info"     },
  recibida_parcial:  { label:"Recibida parcial",color:"secondary"},
  recibida:          { label:"Recibida",        color:"success"  },
  cerrada:           { label:"Cerrada",         color:"success"  },
  cancelada:         { label:"Cancelada",       color:"danger"   },
};

const PER_PAGE = 8;

export default function Ordenes() {
  const navigate = useNavigate();
  const [ordenes,  setOrdenes]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filtro,   setFiltro]   = useState("");
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [page,     setPage]     = useState(1);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setOrdenes(await getOrdenes()); }
    catch(e) { setError("Error cargando órdenes"); }
    finally { setLoading(false); }
  };

  const handleEstado = async (id, estado) => {
    const labels = { aprobada:"aprobar", cerrada:"cerrar", cancelada:"cancelar" };
    if (!confirm(`¿Deseas ${labels[estado]||"cambiar"} esta orden?`)) return;
    try {
      await cambiarEstado(id, estado);
      setSuccess("Estado actualizado correctamente");
      await cargar();
    } catch(e) { setError(e.message||"Error cambiando estado"); }
  };

  const handleCancelar = async (id) => {
    if (!confirm("¿Cancelar esta orden? Esta acción no se puede deshacer.")) return;
    try { await cancelarOrden(id); setSuccess("Orden cancelada"); await cargar(); }
    catch(e) { setError(e.message||"Error cancelando orden"); }
  };

  const filtradas = ordenes.filter(o =>
    o.numero.toLowerCase().includes(filtro.toLowerCase()) ||
    o.proveedor.toLowerCase().includes(filtro.toLowerCase()) ||
    o.estado.toLowerCase().includes(filtro.toLowerCase())
  );

  const paginated = filtradas.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const stats = {
    total: ordenes.length, pendiente: ordenes.filter(o=>o.estado==="pendiente").length,
    aprobada: ordenes.filter(o=>o.estado==="aprobada").length,
    recibida: ordenes.filter(o=>["recibida","cerrada"].includes(o.estado)).length,
  };

  return (
    <div>
      <div style={s.pageHeader}><h2 style={s.h2}>Órdenes de compra</h2><button onClick={()=>navigate("/ordenes/nueva")} style={s.btnPrimary}>+ Nueva orden</button></div>
      <div style={s.metrics}>
        {[{ label:"Total",value:stats.total,color:"info" },{ label:"Pendientes",value:stats.pendiente,color:"warning" },{ label:"Aprobadas",value:stats.aprobada,color:"info" },{ label:"Recibidas",value:stats.recibida,color:"success" }].map(m=>(
          <div key={m.label} style={{...s.metricCard,borderLeft:`4px solid var(--color-text-${m.color})`}}><p style={s.metricLabel}>{m.label}</p><p style={{...s.metricValue,color:`var(--color-text-${m.color})`}}>{m.value}</p></div>
        ))}
      </div>
      {error&&<p style={s.err}>{error}</p>}{success&&<p style={s.ok}>{success}</p>}
      <div style={s.toolbar}><input placeholder="Buscar por número, proveedor o estado..." value={filtro} onChange={e=>{setFiltro(e.target.value);setPage(1);}} style={s.search}/><span>{filtradas.length} órdenes</span></div>
      {loading?<p>Cargando...</p>:filtradas.length===0?<p>No hay órdenes</p>:<>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {paginated.map(oc=>{
            const cfg=ESTADO_CONFIG[oc.estado]||{};
            return (<div key={oc.id} style={s.card}>
              <div style={s.cardHeader}><div style={{display:"flex",alignItems:"center",gap:12}}><span style={s.numero}>{oc.numero}</span><span style={{background:`var(--color-background-${cfg.color})`,color:`var(--color-text-${cfg.color})`,padding:"2px 10px",borderRadius:4,fontSize:11,fontWeight:500}}>{cfg.label}</span></div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>navigate(`/ordenes/${oc.id}`)} style={s.btnView}>Ver detalle</button>
                {oc.estado==="pendiente"&&<button onClick={()=>handleEstado(oc.id,"aprobada")} style={s.btnAprobar}>Aprobar</button>}
                {oc.estado==="recibida"&&<button onClick={()=>handleEstado(oc.id,"cerrada")} style={s.btnCerrar}>Cerrar</button>}
                {["pendiente","aprobada"].includes(oc.estado)&&<button onClick={()=>handleCancelar(oc.id)} style={s.btnCancelar}>Cancelar</button>}
              </div></div>
              <div style={s.cardBody}><div style={s.infoItem}><span style={s.infoLabel}>Proveedor</span><span style={s.infoValue}>{oc.proveedor}</span></div>
              <div style={s.infoItem}><span style={s.infoLabel}>Fecha</span><span style={s.infoValue}>{new Date(oc.fecha_creacion).toLocaleDateString("es-CO")}</span></div>
              <div style={s.infoItem}><span style={s.infoLabel}>Total</span><span style={{...s.infoValue,fontWeight:500}}>${Number(oc.total_estimado||0).toLocaleString("es-CO")}</span></div>
              <div style={s.infoItem}><span style={s.infoLabel}>Creada por</span><span style={s.infoValue}>{oc.usuario}</span></div></div>
              {oc.observaciones&&<div style={s.obs}><span style={s.infoLabel}>Obs: </span>{oc.observaciones}</div>}
            </div>);
          })}
        </div>
        <Pagination current={page} total={filtradas.length} perPage={PER_PAGE} onChange={setPage} />
      </>}
    </div>
  );
}

const s = {
  pageHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"},h2:{margin:0,fontSize:18,fontWeight:500},
  metrics:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.5rem"},
  metricCard:{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.25rem"},
  metricLabel:{margin:"0 0 6px",fontSize:12,color:"var(--color-text-secondary)"},metricValue:{margin:0,fontSize:26,fontWeight:600},
  toolbar:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",gap:12},
  search:{padding:"8px 12px",fontSize:13,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:360},
  card:{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.25rem"},
  cardHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",paddingBottom:"1rem",borderBottom:"0.5px solid var(--color-border-tertiary)"},
  numero:{fontSize:15,fontWeight:500},cardBody:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12},
  infoItem:{display:"flex",flexDirection:"column",gap:2},infoLabel:{fontSize:11,color:"var(--color-text-tertiary)"},infoValue:{fontSize:13},
  obs:{marginTop:"0.75rem",fontSize:12,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",borderRadius:6,padding:"8px 12px"},
  err:{color:"var(--color-text-danger)",fontSize:13,margin:"0 0 1rem",padding:"10px 12px",background:"var(--color-background-danger)",borderRadius:6},
  ok:{color:"var(--color-text-success)",fontSize:13,margin:"0 0 1rem",padding:"10px 12px",background:"var(--color-background-success)",borderRadius:6},
  btnPrimary:{padding:"9px 20px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500},
  btnView:{padding:"5px 12px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:4,cursor:"pointer",fontSize:12},
  btnAprobar:{padding:"5px 12px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:4,cursor:"pointer",fontSize:12},
  btnCerrar:{padding:"5px 12px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:4,cursor:"pointer",fontSize:12},
  btnCancelar:{padding:"5px 12px",background:"var(--color-background-danger)",color:"var(--color-text-danger)",border:"0.5px solid var(--color-border-danger)",borderRadius:4,cursor:"pointer",fontSize:12},
};
