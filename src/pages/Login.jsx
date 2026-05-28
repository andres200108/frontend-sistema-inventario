import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Todos los campos son obligatorios");
    try {
      setLoading(true);
      const usuario = await login(email, password);
      localStorage.setItem("user", JSON.stringify(usuario));
      navigate("/home");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoWrap}>
          <div style={s.logo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-info)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style={s.title}>Sistema de inventarios</h2>
          <p style={s.subtitle}>Inicia sesión para continuar</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Correo electrónico</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="admin@sgi.com" style={s.input} required/>
          </div>
          <div style={s.field}>
            <label style={s.label}>Contraseña</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••" style={s.input} required/>
          </div>
          {error && <div style={s.errorBox}>{error}</div>}
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>
        <p style={s.version}>SGI v1.0 — Uso interno</p>
      </div>
    </div>
  );
}

const s = {
  page:     { display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"var(--color-background-tertiary)" },
  card:     { background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:16, padding:"2.5rem", width:360 },
  logoWrap: { textAlign:"center", marginBottom:"2rem" },
  logo:     { width:48, height:48, background:"var(--color-background-info)", borderRadius:10, display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:"1rem" },
  title:    { margin:"0 0 4px", fontSize:17, fontWeight:500 },
  subtitle: { margin:0, fontSize:13, color:"var(--color-text-secondary)" },
  field:    { marginBottom:"1rem" },
  label:    { display:"block", fontSize:13, fontWeight:500, color:"var(--color-text-secondary)", marginBottom:6 },
  input:    { width:"100%", padding:"9px 12px", fontSize:14, borderRadius:8, border:"0.5px solid var(--color-border-secondary)", boxSizing:"border-box" },
  errorBox: { background:"var(--color-background-danger)", color:"var(--color-text-danger)", padding:"10px 12px", borderRadius:8, fontSize:13, marginBottom:"1rem" },
  btn:      { width:"100%", padding:"10px", background:"var(--color-background-info)", color:"var(--color-text-info)", border:"0.5px solid var(--color-border-info)", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" },
  version:  { textAlign:"center", fontSize:12, color:"var(--color-text-tertiary)", marginTop:"1.5rem", marginBottom:0 },
};
