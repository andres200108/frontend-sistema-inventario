import { useState, useEffect } from "react";
import { request } from "../api/api";
import Pagination from "../components/Pagination";

const PER_PAGE = 15;

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);

  useEffect(() => {
    request("/productos","GET").then(setProductos).finally(()=>setLoading(false));
  }, []);

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.codigo||"").toLowerCase().includes(filtro.toLowerCase()) ||
    (p.proveedor||"").toLowerCase().includes(filtro.toLowerCase())
  );

  const paginated  = filtrados.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const total      = productos.length;
  const sinStock   = productos.filter(p=>p.stock===0).length;
  const critico    = productos.filter(p=>p.stock>0&&p.stock<=5).length;
  const disponible = productos.filter(p=>p.stock>5).length;
  const valorTotal = productos.reduce((acc,p)=>acc+(p.stock*(p.precio||0)),0);

  return (
    <div>
      <h2 style={s.h2}>Consulta de inventario</h2>

      <div style={s.metrics}>
        {[
          {label:"Total productos", value:total,      color:"var(--color-text-info)", bg:"var(--color-background-info)"},
          {label:"Disponibles",     value:disponible, color:"var(--color-text-success)", bg:"var(--color-background-success)"},
          {label:"Stock crítico",   value:critico,    color:"var(--color-text-warning)", bg:"var(--color-background-warning)"},
          {label:"Sin stock",       value:sinStock,   color:"var(--color-text-danger)", bg:"var(--color-background-danger)"},
        ].map(m=>(
          <div key={m.label} style={{...s.metricCard, borderLeft: `4px solid ${m.color}`}}>
            <p style={s.metricLabel}>{m.label}</p>
            <p style={{...s.metricValue,color:m.color}}>{m.value}</p>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div style={s.valorBox}>
          <span>Valor total del inventario:</span>
          <strong>${valorTotal.toLocaleString("es-CO")}</strong>
        </div>
      )}

      <div style={s.toolbar}>
        <input placeholder="Buscar por nombre, código o proveedor..."
          value={filtro} onChange={e=>{setFiltro(e.target.value);setPage(1);}} style={s.search}/>
        <span style={{fontSize:13,color:"var(--color-text-secondary)"}}>{filtrados.length} productos</span>
      </div>

      {loading ? <p style={{color:"var(--color-text-secondary)",fontSize:13}}>Cargando...</p> : (
        <>
          <table style={s.table}>
            <thead><tr style={s.thead}>
              {["Código","Nombre","Unidad","Stock","Precio unit.","Valor total","Proveedor"].map(h=>(
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {paginated.map(p=>(
                <tr key={p.id} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                  <td style={s.td}>{p.codigo||"—"}</td>
                  <td style={s.td}>{p.nombre}</td>
                  <td style={s.td}>{p.unidad_medida||"—"}</td>
                  <td style={s.td}>
                    <span style={{
                      background: p.stock===0?"var(--color-background-danger)":p.stock<=5?"var(--color-background-warning)":"var(--color-background-success)",
                      color: p.stock===0?"var(--color-text-danger)":p.stock<=5?"var(--color-text-warning)":"var(--color-text-success)",
                      padding:"2px 8px",borderRadius:4,fontSize:12,fontWeight:500
                    }}>{p.stock}</span>
                  </td>
                  <td style={s.td}>${Number(p.precio||0).toLocaleString("es-CO")}</td>
                  <td style={s.td}>${(p.stock*(p.precio||0)).toLocaleString("es-CO")}</td>
                  <td style={s.td}>{p.proveedor||"—"}</td>
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
  h2:          {margin:"0 0 1.5rem",fontSize:18,fontWeight:500},
  metrics:     {display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1rem"},
  metricCard:  {background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.25rem"},
  metricLabel: {margin:"0 0 6px",fontSize:12,color:"var(--color-text-secondary)"},
  metricValue: {margin:0,fontSize:28,fontWeight:600},
  valorBox:    {background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",borderRadius:8,padding:"12px 16px",marginBottom:"1.5rem",display:"flex",justifyContent:"space-between",fontSize:14},
  toolbar:     {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",gap:12},
  search:      {padding:"8px 12px",fontSize:13,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:360},
  table:       {width:"100%",borderCollapse:"collapse"},
  thead:       {background:"var(--color-background-secondary)"},
  th:          {padding:"10px 12px",textAlign:"left",fontSize:13,fontWeight:500,borderBottom:"0.5px solid var(--color-border-secondary)"},
  td:          {padding:"8px 12px",fontSize:13},
};
