import { useState, useEffect } from "react";
import { request } from "../api/api";

export default function Perfil() {
  const [perfil, setPerfil]     = useState(null);
  const [form, setForm]         = useState({ nombre:"", email:"" });
  const [passForm, setPassForm] = useState({ actual:"", nueva:"", confirmar:"" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [passError, setPassError]   = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  useEffect(() => {
    request("/perfil","GET").then(data => {
      setPerfil(data);
      setForm({ nombre:data.nombre, email:data.email });
    });
  }, []);

  const handlePerfil = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      setLoading(true);
      await request("/perfil","PUT", form);
      setSuccess("Perfil actualizado correctamente");
      const updated = JSON.parse(localStorage.getItem("user")||"{}");
      localStorage.setItem("user", JSON.stringify({...updated, nombre:form.nombre, email:form.email}));
    } catch(e) { setError(e.message||"Error actualizando perfil"); }
    finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault(); setPassError(""); setPassSuccess("");
    if (passForm.nueva !== passForm.confirmar) return setPassError("Las contraseñas no coinciden");
    if (passForm.nueva.length < 6) return setPassError("Mínimo 6 caracteres");
    try {
      setLoading(true);
      await request("/perfil/password","PATCH",{ actual:passForm.actual, nueva:passForm.nueva });
      setPassSuccess("Contraseña actualizada correctamente");
      setPassForm({ actual:"", nueva:"", confirmar:"" });
    } catch(e) { setPassError(e.message||"Error actualizando contraseña"); }
    finally { setLoading(false); }
  };

  if (!perfil) return <p style={{color:"var(--color-text-secondary)",padding:"2rem"}}>Cargando perfil...</p>;

  const iniciales = perfil.nombre.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase();

  return (
    <div style={{maxWidth:600}}>
      <h2 style={s.h2}>Mi perfil</h2>

      <div style={s.profileCard}>
        <div style={s.avatar}>{iniciales}</div>
        <div>
          <p style={{margin:"0 0 4px",fontSize:16,fontWeight:500}}>{perfil.nombre}</p>
          <p style={{margin:"0 0 8px",fontSize:13,color:"var(--color-text-secondary)"}}>{perfil.email}</p>
          <div style={{display:"flex",gap:8}}>
            <span style={{
              background:"var(--color-background-info)",color:"var(--color-text-info)",
              border:"0.5px solid var(--color-border-info)",
              padding:"2px 10px",borderRadius:4,fontSize:12,fontWeight:500
            }}>{perfil.rol==="admin"?"Administrador":"Auxiliar logístico"}</span>
            <span style={{
              background:"var(--color-background-success)",color:"var(--color-text-success)",
              border:"0.5px solid var(--color-border-success)",
              padding:"2px 10px",borderRadius:4,fontSize:12
            }}>Activo</span>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <h3 style={s.h3}>Datos personales</h3>
        <form onSubmit={handlePerfil}>
          <div style={s.field}>
            <label style={s.label}>Nombre completo</label>
            <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}
              placeholder="Tu nombre" style={s.input}/>
          </div>
          <div style={s.field}>
            <label style={s.label}>Correo electrónico</label>
            <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
              placeholder="tu@email.com" style={s.input}/>
          </div>
          <div style={s.field}>
            <label style={s.label}>Miembro desde</label>
            <input value={new Date(perfil.created_at).toLocaleDateString("es-CO")}
              style={{...s.input,background:"var(--color-background-secondary)"}} disabled/>
          </div>
          {error   && <p style={s.err}>{error}</p>}
          {success && <p style={s.ok}>{success}</p>}
          <button type="submit" disabled={loading} style={s.btnPrimary}>
            {loading?"Guardando...":"Guardar cambios"}
          </button>
        </form>
      </div>

      <div style={s.card}>
        <h3 style={s.h3}>Cambiar contraseña</h3>
        <form onSubmit={handlePassword}>
          <div style={s.field}>
            <label style={s.label}>Contraseña actual</label>
            <input type="password" value={passForm.actual}
              onChange={e=>setPassForm({...passForm,actual:e.target.value})}
              placeholder="••••••••" style={s.input}/>
          </div>
          <div style={s.field}>
            <label style={s.label}>Nueva contraseña</label>
            <input type="password" value={passForm.nueva}
              onChange={e=>setPassForm({...passForm,nueva:e.target.value})}
              placeholder="Mínimo 6 caracteres" style={s.input}/>
          </div>
          <div style={s.field}>
            <label style={s.label}>Confirmar nueva contraseña</label>
            <input type="password" value={passForm.confirmar}
              onChange={e=>setPassForm({...passForm,confirmar:e.target.value})}
              placeholder="Repite la contraseña" style={s.input}/>
          </div>
          {passError   && <p style={s.err}>{passError}</p>}
          {passSuccess && <p style={s.ok}>{passSuccess}</p>}
          <button type="submit" disabled={loading} style={s.btnPrimary}>
            {loading?"Actualizando...":"Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  h2:          {margin:"0 0 1.5rem",fontSize:18,fontWeight:500},
  h3:          {margin:"0 0 1.25rem",fontSize:15,fontWeight:500},
  profileCard: {background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.5rem",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:"1.5rem"},
  avatar:      {width:64,height:64,borderRadius:"50%",background:"var(--color-background-info)",color:"var(--color-text-info)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:500,flexShrink:0},
  card:        {background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.5rem",marginBottom:"1.5rem"},
  field:       {display:"flex",flexDirection:"column",gap:4,marginBottom:16},
  label:       {fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"},
  input:       {padding:"9px 12px",fontSize:14,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:"100%"},
  err:         {color:"var(--color-text-danger)",fontSize:13,margin:"0 0 12px",padding:"10px 12px",background:"var(--color-background-danger)",borderRadius:6},
  ok:          {color:"var(--color-text-success)",fontSize:13,margin:"0 0 12px",padding:"10px 12px",background:"var(--color-background-success)",borderRadius:6},
  btnPrimary:  {padding:"9px 20px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500},
};
