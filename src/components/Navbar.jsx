import { useNavigate } from "react-router-dom";

export default function Navbar({ open, setOpen }) {
  const navigate = useNavigate();
  const usuario  = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => { localStorage.clear(); navigate("/"); };

  return (
    <nav style={s.nav}>
      <div style={s.left}>
        <button onClick={()=>setOpen(!open)} style={s.burger}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span style={s.brand}>Sistema de gestión de inventarios</span>
      </div>
      <div style={s.right}>
        <div onClick={()=>navigate("/perfil")} style={s.userBtn}>
          <div style={s.avatar}>
            {(usuario.nombre||"U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={s.userName}>{usuario.nombre||"Usuario"}</p>
            <p style={s.userRole}>{usuario.rol==="admin"?"Administrador":"Auxiliar logístico"}</p>
          </div>
        </div>
        <button onClick={logout} style={s.logoutBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Salir
        </button>
      </div>
    </nav>
  );
}

const s = {
  nav:      {position:"fixed",top:0,left:0,right:0,height:52,background:"#FFFFFF",borderBottom:"0.5px solid var(--color-border-tertiary)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1.25rem",zIndex:1000,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
  left:     {display:"flex",alignItems:"center",gap:12},
  right:    {display:"flex",alignItems:"center",gap:12},
  burger:   {background:"none",border:"none",padding:"6px",cursor:"pointer",color:"var(--color-text-secondary)",borderRadius:6,display:"flex",alignItems:"center"},
  brand:    {fontSize:14,fontWeight:500,color:"var(--color-text-primary)"},
  userBtn:  {display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 8px",borderRadius:8,transition:"background 0.15s"},
  avatar:   {width:32,height:32,borderRadius:"50%",background:"var(--color-background-info)",color:"var(--color-text-info)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:500},
  userName: {margin:0,fontSize:13,fontWeight:500,color:"var(--color-text-primary)"},
  userRole: {margin:0,fontSize:11,color:"var(--color-text-tertiary)"},
  logoutBtn:{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",fontSize:12,color:"var(--color-text-secondary)",cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-secondary)"},
};
