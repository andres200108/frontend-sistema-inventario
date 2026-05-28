import { useState, useEffect } from "react";
import { request } from "../api/api";

const ACCIONES = {
  LOGIN_OK:      { label:"Login",         color:"success" },
  LOGIN_FALLIDO: { label:"Login fallido", color:"danger"  },
  LOGOUT:        { label:"Logout",        color:"warning" },
};

export default function Auditoria() {
  const [logs, setLogs]       = useState([]);
  const [filtro, setFiltro]   = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request("/auditoria","GET").then(setLogs).finally(()=>setLoading(false));
  }, []);

  const filtrados = logs.filter(l =>
    (l.usuario||"").toLowerCase().includes(filtro.toLowerCase()) ||
    (l.accion||"").toLowerCase().includes(filtro.toLowerCase()) ||
    (l.tabla_afectada||"").toLowerCase().includes(filtro.toLowerCase())
  );

  const badge = (accion) => {
    const cfg = ACCIONES[accion];
    const color = cfg?.color || "info";
    return (
      <span style={{
        background:`var(--color-background-${color})`,
        color:`var(--color-text-${color})`,
        border:`0.5px solid var(--color-border-${color})`,
        padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:500
      }}>{cfg?.label || accion}</span>
    );
  };

  return (
    <div>
      <h2 style={s.h2}>Historial de auditoría</h2>

      <div style={s.metrics}>
        {[
          { label:"Total registros", value:logs.length,                                              color:"info"    },
          { label:"Logins exitosos", value:logs.filter(l=>l.accion==="LOGIN_OK").length,             color:"success" },
          { label:"Logins fallidos", value:logs.filter(l=>l.accion==="LOGIN_FALLIDO").length,        color:"danger"  },
          { label:"Otros eventos",   value:logs.filter(l=>!l.accion?.startsWith("LOGIN")).length,    color:"warning" },
        ].map(m=>(
          <div key={m.label} style={s.metricCard}>
            <p style={s.metricLabel}>{m.label}</p>
            <p style={{...s.metricValue, color:`var(--color-text-${m.color})`}}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={s.toolbar}>
        <input placeholder="Filtrar por usuario, acción o tabla..."
          value={filtro} onChange={e=>setFiltro(e.target.value)} style={s.search}/>
        <span style={{fontSize:13,color:"var(--color-text-secondary)"}}>{filtrados.length} registros</span>
      </div>

      {loading ? <p style={{color:"var(--color-text-secondary)",fontSize:13}}>Cargando...</p> : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr style={s.thead}>
              {["Fecha","Usuario","Rol","Acción","Tabla afectada"].map(h=>(
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtrados.map((l,i)=>(
                <tr key={i} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                  <td style={s.td}>{new Date(l.fecha).toLocaleString("es-CO")}</td>
                  <td style={s.td}>
                    <div style={{fontWeight:500}}>{l.usuario||"Sistema"}</div>
                    <div style={{fontSize:12,color:"var(--color-text-tertiary)"}}>{l.email||""}</div>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      background: l.rol==="admin"?"var(--color-background-info)":"var(--color-background-secondary)",
                      color: l.rol==="admin"?"var(--color-text-info)":"var(--color-text-secondary)",
                      padding:"2px 8px",borderRadius:4,fontSize:11
                    }}>{l.rol==="admin"?"Admin":"Auxiliar"}</span>
                  </td>
                  <td style={s.td}>{badge(l.accion)}</td>
                  <td style={s.td}>{l.tabla_afectada||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s = {
  h2:          {margin:"0 0 1.5rem",fontSize:18,fontWeight:500},
  metrics:     {display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.5rem"},
  metricCard:  {background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,padding:"1rem"},
  metricLabel: {margin:"0 0 6px",fontSize:12,color:"var(--color-text-secondary)"},
  metricValue: {margin:0,fontSize:28,fontWeight:500},
  toolbar:     {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",gap:12},
  search:      {padding:"8px 12px",fontSize:13,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:360},
  tableWrap:   {overflowX:"auto"},
  table:       {width:"100%",borderCollapse:"collapse",minWidth:700},
  thead:       {background:"var(--color-background-secondary)"},
  th:          {padding:"10px 12px",textAlign:"left",fontSize:13,fontWeight:500,borderBottom:"0.5px solid var(--color-border-secondary)"},
  td:          {padding:"8px 12px",fontSize:13},
};
