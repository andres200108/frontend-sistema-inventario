import { useState } from "react";
import { searchProducts } from "../services/product.service";

export default function Products() {
  const [query, setQuery]       = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return setError("Escribe algo para buscar");
    try {
      setLoading(true); setError(""); setSearched(true);
      setProducts(await searchProducts(query));
    } catch(e) { setError("Error en la búsqueda"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h2 style={s.h2}>Búsqueda de productos</h2>
      <div style={s.searchBox}>
        <input value={query} onChange={e=>setQuery(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleSearch()}
          placeholder="Buscar por código, nombre o proveedor..."
          style={s.input}/>
        <button onClick={handleSearch} disabled={loading} style={s.btn}>
          {loading?"Buscando...":"Buscar"}
        </button>
      </div>
      {error && <p style={s.err}>{error}</p>}
      {searched && products.length===0 && !loading && (
        <div style={s.empty}>No se encontraron productos para "{query}"</div>
      )}
      {products.length>0 && (
        <>
          <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:"1rem"}}>{products.length} resultado(s)</p>
          <table style={s.table}>
            <thead><tr style={s.thead}>
              {["Código","Nombre","Unidad","Stock","Precio unit.","Valor total","Proveedor"].map(h=>(
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {products.map(p=>(
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
                  <td style={s.td}>${Number(p.total||0).toLocaleString("es-CO")}</td>
                  <td style={s.td}>{p.proveedor||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const s = {
  h2:        {margin:"0 0 1.5rem",fontSize:18,fontWeight:500},
  searchBox: {display:"flex",gap:8,marginBottom:"1.5rem",maxWidth:560},
  input:     {flex:1,padding:"9px 12px",fontSize:14,borderRadius:6,border:"0.5px solid var(--color-border-secondary)"},
  btn:       {padding:"9px 20px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500,whiteSpace:"nowrap"},
  err:       {color:"var(--color-text-danger)",fontSize:13,marginBottom:"1rem"},
  empty:     {background:"var(--color-background-secondary)",borderRadius:8,padding:"1.5rem",textAlign:"center",fontSize:13,color:"var(--color-text-secondary)"},
  table:     {width:"100%",borderCollapse:"collapse"},
  thead:     {background:"var(--color-background-secondary)"},
  th:        {padding:"10px 12px",textAlign:"left",fontSize:13,fontWeight:500,borderBottom:"0.5px solid var(--color-border-secondary)"},
  td:        {padding:"8px 12px",fontSize:13},
};
