import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { request, descargar as descargarArchivo } from "../api/api";

const TIPOS = [
  { id:"entradas",     label:"Entradas de almacén",     icon:"📥", desc:"Historial de todos los ingresos de mercancía",       color:"success" },
  { id:"salidas",      label:"Salidas de almacén",      icon:"📤", desc:"Historial de todas las salidas de mercancía",         color:"warning" },
  { id:"inventario",   label:"Valorización de inventario", icon:"📦", desc:"Stock actual con valor económico por producto",    color:"info"    },
  { id:"kardex",       label:"Kardex por producto",     icon:"📋", desc:"Movimientos completos de un producto específico",     color:"danger"  },
  { id:"movimientos",  label:"Movimientos generales",   icon:"⇅",  desc:"Entradas y salidas consolidadas en un solo reporte", color:"secondary"},
];

export default function Reportes() {
  const [searchParams] = useSearchParams();
  const [tipo,       setTipo]       = useState(searchParams.get("tipo") || "entradas");
  const [datos,      setDatos]      = useState([]);
  const [inventario, setInventario] = useState(null);
  const [kardexData, setKardexData] = useState(null);
  const [productos,  setProductos]  = useState([]);
  const [prodSel,    setProdSel]    = useState("");
  const [desde,      setDesde]      = useState("");
  const [hasta,      setHasta]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    request("/reportes/productos-lista","GET").then(setProductos).catch(()=>{});
  }, []);

  useEffect(() => {
    setDatos([]); setInventario(null); setKardexData(null); setError("");
  }, [tipo]);

  const token = localStorage.getItem("token");
  const filtroFecha = desde && hasta ? `?desde=${desde}&hasta=${hasta}` : "";

  const cargarDatos = async () => {
    setLoading(true); setError(""); setDatos([]); setInventario(null); setKardexData(null);
    try {
      if (tipo === "inventario") {
        setInventario(await request("/reportes/inventario","GET"));
      } else if (tipo === "kardex") {
        if (!prodSel) return setError("Selecciona un producto para el kardex");
        setKardexData(await request(`/reportes/kardex/${prodSel}`,"GET"));
      } else {
        setDatos(await request(`/reportes/${tipo}${filtroFecha}`,"GET"));
      }
    } catch(e) { setError(e.message||"Error cargando reporte"); }
    finally { setLoading(false); }
  };


const handleDescargar = async (formato) => {
  const ext      = formato === "excel" ? "xlsx" : "pdf";
  const fechaHoy = new Date().toISOString().split("T")[0];

  if (tipo === "kardex") {
    if (!prodSel) return alert("Selecciona un producto primero");
    const prod = productos.find(p => String(p.id) === String(prodSel));
    await descargarArchivo(
      `/reportes/exportar/kardex/${prodSel}/${formato}`,
      `kardex-${prod?.codigo || prodSel}-${fechaHoy}.${ext}`
    );
  } else if (tipo === "inventario") {
    await descargarArchivo(
      `/reportes/exportar/inventario/${formato}`,
      `inventario-${fechaHoy}.${ext}`
    );
  } else {
    const q = desde && hasta ? `?desde=${desde}&hasta=${hasta}` : "";
    await descargarArchivo(
      `/reportes/exportar/${tipo}/${formato}${q}`,
      `${tipo}-${fechaHoy}.${ext}`
    );
  }
};



  const tipoActual = TIPOS.find(t=>t.id===tipo);

  return (
    <div>
      <h2 style={s.h2}>Reportes</h2>

      <div style={s.tiposGrid}>
        {TIPOS.map(t=>(
          <div key={t.id} onClick={()=>setTipo(t.id)} style={{
            ...s.tipoCard,
            ...(tipo===t.id ? s.tipoCardActive : {}),
          }}>
            <span style={s.tipoIcon}>{t.icon}</span>
            <div>
              <p style={s.tipoLabel}>{t.label}</p>
              <p style={s.tipoDesc}>{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={s.panel}>
        <div style={s.panelHeader}>
          <div>
            <h3 style={{margin:"0 0 2px",fontSize:15,fontWeight:500}}>{tipoActual.label}</h3>
            <p style={{margin:0,fontSize:13,color:"var(--color-text-secondary)"}}>{tipoActual.desc}</p>
          </div>
          <div style={{display:"flex",gap:8}}>
             <button onClick={()=>handleDescargar("excel")} style={s.btnExcel}>Excel</button>
             <button onClick={()=>handleDescargar("pdf")}   style={s.btnPDF}>PDF</button>
          </div>
        </div>

        <div style={s.filtros}>
          {tipo==="kardex" ? (
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <label style={s.label}>Producto:</label>
              <select value={prodSel} onChange={e=>setProdSel(e.target.value)} style={s.input}>
                <option value="">Selecciona un producto...</option>
                {productos.map(p=>(
                  <option key={p.id} value={p.id}>{p.codigo} — {p.nombre}</option>
                ))}
              </select>
            </div>
          ) : tipo!=="inventario" ? (
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <label style={s.label}>Desde:</label>
              <input type="date" value={desde} onChange={e=>setDesde(e.target.value)} style={s.input}/>
              <label style={s.label}>Hasta:</label>
              <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} style={s.input}/>
            </div>
          ) : <div/>}

          <button onClick={cargarDatos} disabled={loading} style={s.btnPrimary}>
            {loading ? "Cargando..." : "Generar reporte"}
          </button>
        </div>

        {error && <p style={s.err}>{error}</p>}

        {/* ── Tabla entradas ── */}
        {tipo==="entradas" && datos.length>0 && (
          <TablaEntradas datos={datos}/>
        )}

        {/* ── Tabla salidas ── */}
        {tipo==="salidas" && datos.length>0 && (
          <TablaSalidas datos={datos}/>
        )}

        {/* ── Tabla movimientos ── */}
        {tipo==="movimientos" && datos.length>0 && (
          <TablaMovimientos datos={datos}/>
        )}

        {/* ── Tabla inventario ── */}
        {tipo==="inventario" && inventario && (
          <TablaInventario data={inventario}/>
        )}

        {/* ── Kardex ── */}
        {tipo==="kardex" && kardexData && (
          <TablaKardex data={kardexData}/>
        )}

        {!loading && datos.length===0 && !inventario && !kardexData && !error && (
          <div style={s.empty}>Configura los filtros y pulsa "Generar reporte"</div>
        )}
      </div>
    </div>
  );
}

function TablaEntradas({ datos }) {
  const total = datos.reduce((a,d)=>a+Number(d.total||0),0);
  return (
    <>
      <div style={sm.resumen}>
        <Metric label="Registros"     value={datos.length}                                          color="info"/>
        <Metric label="Total unidades" value={datos.reduce((a,d)=>a+d.cantidad,0)}                  color="success"/>
        <Metric label="Valor total"   value={`$${total.toLocaleString("es-CO")}`}                   color="warning"/>
      </div>
      <Tabla headers={["Fecha","Código","Producto","UM","Cantidad","Precio unit.","Total","Proveedor","Usuario"]}
        rows={datos.map(d=>[
          new Date(d.fecha).toLocaleDateString("es-CO"),
          d.codigo, d.producto, d.unidad_medida||"—", d.cantidad,
          `$${Number(d.precio_unitario).toLocaleString("es-CO")}`,
          `$${Number(d.total||0).toLocaleString("es-CO")}`,
          d.proveedor||"—", d.usuario
        ])}/>
    </>
  );
}

function TablaSalidas({ datos }) {
  const total = datos.reduce((a,d)=>a+Number(d.total||0),0);
  return (
    <>
      <div style={sm.resumen}>
        <Metric label="Registros"     value={datos.length}                         color="info"/>
        <Metric label="Total unidades" value={datos.reduce((a,d)=>a+d.cantidad,0)} color="warning"/>
        <Metric label="Valor total"   value={`$${total.toLocaleString("es-CO")}`}  color="danger"/>
      </div>
      <Tabla headers={["Fecha","Código","Producto","UM","Cantidad","Precio unit.","Total","Motivo","Usuario"]}
        rows={datos.map(d=>[
          new Date(d.fecha).toLocaleDateString("es-CO"),
          d.codigo, d.producto, d.unidad_medida||"—", d.cantidad,
          `$${Number(d.precio_unitario||0).toLocaleString("es-CO")}`,
          `$${Number(d.total||0).toLocaleString("es-CO")}`,
          d.motivo||"—", d.usuario||"—"
        ])}/>
    </>
  );
}

function TablaMovimientos({ datos }) {
  return (
    <Tabla headers={["Tipo","Fecha","Código","Producto","Cantidad","Precio unit.","Total","Ref.","Usuario"]}
      rows={datos.map(d=>[
        d.tipo, new Date(d.fecha).toLocaleDateString("es-CO"),
        d.codigo, d.producto, d.cantidad,
        `$${Number(d.precio_unitario||0).toLocaleString("es-CO")}`,
        `$${Number(d.total||0).toLocaleString("es-CO")}`,
        d.proveedor||d.motivo||"—", d.usuario||"—"
      ])}
      tipoBadge={0}/>
  );
}

function TablaInventario({ data }) {
  return (
    <>
      <div style={sm.resumen}>
        <Metric label="Productos"       value={data.productos.length}                               color="info"/>
        <Metric label="Valor total"     value={`$${Number(data.valor_total).toLocaleString("es-CO")}`} color="success"/>
        <Metric label="Sin stock"       value={data.productos.filter(p=>p.stock===0).length}        color="danger"/>
        <Metric label="Stock crítico"   value={data.productos.filter(p=>p.stock>0&&p.stock<=5).length} color="warning"/>
      </div>
      <Tabla headers={["Código","Producto","UM","Stock","Precio unit.","Valor total","Proveedor"]}
        rows={data.productos.map(p=>[
          p.codigo, p.nombre, p.unidad_medida||"—", p.stock,
          `$${Number(p.precio_unitario||0).toLocaleString("es-CO")}`,
          `$${Number(p.valor_total||0).toLocaleString("es-CO")}`,
          p.proveedor||"—"
        ])}
        stockCol={3}/>
    </>
  );
}

function TablaKardex({ data }) {
  return (
    <>
      <div style={{background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",borderRadius:8,padding:"12px 16px",marginBottom:16,fontSize:13}}>
        <strong>{data.producto.nombre}</strong> — Código: {data.producto.codigo} | UM: {data.producto.unidad_medida||"—"} | Stock actual: <strong>{data.producto.stock}</strong>
      </div>
      <Tabla headers={["Fecha","Tipo","Cantidad","Precio unit.","Saldo","Referencia"]}
        rows={data.kardex.map(k=>[
          new Date(k.fecha).toLocaleDateString("es-CO"),
          k.tipo, k.cantidad,
          `$${Number(k.precio_unitario||0).toLocaleString("es-CO")}`,
          k.saldo, k.referencia||"—"
        ])}
        tipoBadge={1}/>
    </>
  );
}

function Tabla({ headers, rows, tipoBadge, stockCol }) {
  return (
    <div style={{overflowX:"auto"}}>
      <table style={sm.table}>
        <thead><tr style={sm.thead}>
          {headers.map(h=><th key={h} style={sm.th}>{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={i} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
              {row.map((cell,j)=>(
                <td key={j} style={sm.td}>
                  {j===tipoBadge && typeof cell==="string" ? (
                    <span style={{
                      background: cell==="entrada"?"var(--color-background-success)":cell==="salida"?"var(--color-background-warning)":"transparent",
                      color:      cell==="entrada"?"var(--color-text-success)":cell==="salida"?"var(--color-text-warning)":"inherit",
                      padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:500
                    }}>{cell}</span>
                  ) : j===stockCol ? (
                    <span style={{
                      background: Number(cell)===0?"var(--color-background-danger)":Number(cell)<=5?"var(--color-background-warning)":"var(--color-background-success)",
                      color:      Number(cell)===0?"var(--color-text-danger)":Number(cell)<=5?"var(--color-text-warning)":"var(--color-text-success)",
                      padding:"2px 8px",borderRadius:4,fontSize:12,fontWeight:500
                    }}>{cell}</span>
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,padding:"12px 16px"}}>
      <p style={{margin:"0 0 4px",fontSize:12,color:"var(--color-text-secondary)"}}>{label}</p>
      <p style={{margin:0,fontSize:22,fontWeight:500,color:`var(--color-text-${color})`}}>{value}</p>
    </div>
  );
}

const s = {
  h2:          {margin:"0 0 1.5rem",fontSize:18,fontWeight:500},
  tiposGrid:   {display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:"1.5rem"},
  tipoCard:    {background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"14px",cursor:"pointer",transition:"all 0.15s",display:"flex",alignItems:"flex-start",gap:10},
  tipoCardActive: {border:"1.5px solid var(--color-border-info)",background:"var(--color-background-info)"},
  tipoIcon:    {fontSize:20,flexShrink:0,marginTop:1},
  tipoLabel:   {margin:"0 0 2px",fontSize:13,fontWeight:500},
  tipoDesc:    {margin:0,fontSize:11,color:"var(--color-text-tertiary)",lineHeight:1.4},
  panel:       {background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.5rem"},
  panelHeader: {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.25rem",paddingBottom:"1.25rem",borderBottom:"0.5px solid var(--color-border-tertiary)"},
  filtros:     {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem",gap:12,flexWrap:"wrap"},
  label:       {fontSize:13,fontWeight:500,color:"var(--color-text-secondary)",whiteSpace:"nowrap"},
  input:       {padding:"7px 12px",fontSize:13,borderRadius:6,border:"0.5px solid var(--color-border-secondary)"},
  err:         {color:"var(--color-text-danger)",fontSize:13,margin:"0 0 1rem",padding:"10px 12px",background:"var(--color-background-danger)",borderRadius:6},
  empty:       {textAlign:"center",padding:"3rem",color:"var(--color-text-tertiary)",fontSize:13},
  btnPrimary:  {padding:"8px 20px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500},
  btnExcel:    {padding:"7px 14px",background:"var(--color-background-success)",color:"var(--color-text-success)",border:"0.5px solid var(--color-border-success)",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:500},
  btnPDF:      {padding:"7px 14px",background:"var(--color-background-danger)",color:"var(--color-text-danger)",border:"0.5px solid var(--color-border-danger)",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:500},
};

const sm = {
  resumen: {display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:"1.25rem"},
  table:   {width:"100%",borderCollapse:"collapse",minWidth:700},
  thead:   {background:"var(--color-background-secondary)"},
  th:      {padding:"10px 12px",textAlign:"left",fontSize:12,fontWeight:500,borderBottom:"0.5px solid var(--color-border-secondary)"},
  td:      {padding:"8px 12px",fontSize:12},
};
