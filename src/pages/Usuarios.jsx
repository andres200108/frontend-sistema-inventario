import { useState, useEffect } from "react";
import { getUsuarios, createUsuario, updateUsuario, toggleUsuario, resetPassword } from "../services/usuario.service";

const formVacio = { nombre:"", email:"", password:"", rol:"auxiliar" };

export default function Usuarios() {
  const [lista, setLista]       = useState([]);
  const [form, setForm]         = useState(formVacio);
  const [editingId, setEditing] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [newPass, setNewPass]   = useState({});

  useEffect(() => { cargar(); }, []);
  const cargar = async () => { try { setLista(await getUsuarios()); } catch(e) {} };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!form.nombre || !form.email) return setError("Nombre y email son obligatorios");
    if (!editingId && !form.password) return setError("La contraseña es obligatoria");
    try {
      setLoading(true);
      if (editingId) { await updateUsuario(editingId, form); setSuccess("Usuario actualizado"); }
      else           { await createUsuario(form); setSuccess("Usuario creado correctamente"); }
      setForm(formVacio); setEditing(null); await cargar();
    } catch(e) { setError(e.message || "Error guardando usuario"); }
    finally { setLoading(false); }
  };

  const handleToggle = async (u) => {
    try { await toggleUsuario(u.id, u.activo ? 0 : 1); await cargar(); }
    catch(e) { setError("Error cambiando estado"); }
  };

  const handleResetPass = async (id) => {
    const pass = newPass[id];
    if (!pass || pass.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    try { await resetPassword(id, pass); setSuccess("Contraseña actualizada"); setNewPass({}); }
    catch(e) { setError("Error actualizando contraseña"); }
  };

  return (
    <div>
      <h2 style={s.h2}>Gestión de usuarios</h2>
      <div style={s.card}>
        <h3 style={s.h3}>{editingId ? "Editar usuario" : "Nuevo usuario"}</h3>
        <form onSubmit={handleSubmit}>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Nombre *</label>
              <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Nombre completo" style={s.input}/>
            </div>
            <div style={s.field}>
              <label style={s.label}>Email *</label>
              <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="correo@ejemplo.com" style={s.input}/>
            </div>
            {!editingId && (
              <div style={s.field}>
                <label style={s.label}>Contraseña *</label>
                <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Mínimo 6 caracteres" style={s.input}/>
              </div>
            )}
            <div style={s.field}>
              <label style={s.label}>Rol</label>
              <select value={form.rol} onChange={e=>setForm({...form,rol:e.target.value})} style={s.input}>
                <option value="auxiliar">Auxiliar logístico</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          {error   && <p style={s.err}>{error}</p>}
          {success && <p style={s.ok}>{success}</p>}
          <div style={{display:"flex",gap:10,marginTop:12}}>
            <button type="submit" disabled={loading} style={s.btnPrimary}>
              {loading ? "Guardando..." : editingId ? "Guardar cambios" : "Crear usuario"}
            </button>
            {editingId && <button type="button" onClick={()=>{setEditing(null);setForm(formVacio);}} style={s.btnSecondary}>Cancelar</button>}
          </div>
        </form>
      </div>

      <h3 style={s.h3}>Usuarios registrados ({lista.length})</h3>
      {lista.length === 0 ? <p style={{color:"var(--color-text-tertiary)",fontSize:13}}>No hay usuarios</p> : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {lista.map(u => (
            <div key={u.id} style={s.userCard}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:15,fontWeight:500}}>{u.nombre}</span>
                    <span style={{
                      background: u.rol==="admin" ? "var(--color-background-info)" : "var(--color-background-secondary)",
                      color: u.rol==="admin" ? "var(--color-text-info)" : "var(--color-text-secondary)",
                      padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:500
                    }}>{u.rol==="admin"?"Administrador":"Auxiliar logístico"}</span>
                    <span style={{
                      background: u.activo ? "var(--color-background-success)" : "var(--color-background-danger)",
                      color: u.activo ? "var(--color-text-success)" : "var(--color-text-danger)",
                      padding:"2px 8px",borderRadius:4,fontSize:11
                    }}>{u.activo?"Activo":"Inactivo"}</span>
                  </div>
                  <p style={{margin:0,fontSize:13,color:"var(--color-text-secondary)"}}>{u.email}</p>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <button onClick={()=>{setEditing(u.id);setForm({nombre:u.nombre,email:u.email,password:"",rol:u.rol});window.scrollTo(0,0);}} style={s.btnEdit}>Editar</button>
                  <button onClick={()=>handleToggle(u)} style={u.activo?s.btnDel:s.btnPrimary}>
                    {u.activo?"Desactivar":"Activar"}
                  </button>
                </div>
              </div>
              <div style={{marginTop:12,display:"flex",gap:8,alignItems:"center"}}>
                <input type="password" placeholder="Nueva contraseña" value={newPass[u.id]||""}
                  onChange={e=>setNewPass({...newPass,[u.id]:e.target.value})}
                  style={{...s.input,width:220,fontSize:12,padding:"6px 10px"}}/>
                <button onClick={()=>handleResetPass(u.id)} style={{...s.btnSecondary,padding:"6px 12px",fontSize:12}}>
                  Restablecer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  h2: {margin:"0 0 1.5rem",fontSize:18,fontWeight:500},
  h3: {margin:"0 0 1rem",fontSize:15,fontWeight:500},
  card: {background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.5rem",marginBottom:"1.5rem"},
  userCard: {background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"1.25rem"},
  grid2: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
  field: {display:"flex",flexDirection:"column",gap:4},
  label: {fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"},
  input: {padding:"8px 12px",fontSize:14,borderRadius:6,border:"0.5px solid var(--color-border-secondary)",width:"100%",boxSizing:"border-box"},
  err: {color:"var(--color-text-danger)",fontSize:13,margin:"8px 0"},
  ok:  {color:"var(--color-text-success)",fontSize:13,margin:"8px 0"},
  btnPrimary:   {padding:"8px 16px",background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500},
  btnSecondary: {padding:"8px 16px",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,cursor:"pointer",fontSize:13},
  btnEdit: {padding:"4px 10px",background:"var(--color-background-warning)",color:"var(--color-text-warning)",border:"0.5px solid var(--color-border-warning)",borderRadius:4,cursor:"pointer",fontSize:12},
  btnDel:  {padding:"4px 10px",background:"var(--color-background-danger)",color:"var(--color-text-danger)",border:"0.5px solid var(--color-border-danger)",borderRadius:4,cursor:"pointer",fontSize:12},
};
