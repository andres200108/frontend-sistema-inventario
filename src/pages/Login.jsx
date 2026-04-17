import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);

      const usuario = await login(email, password);

      // 🔹 Guardar usuario
      localStorage.setItem("user", JSON.stringify(usuario));

      // ✅ REDIRECCIÓN CORRECTA
      navigate("/home");

    } catch (err) {
      console.error("❌ Error login:", err);
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f5f5f5"
    }}>

      <div style={{
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
        background: "red",
        minWidth: "320px"
      }}>

        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#fff" }}>
          🔐 Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div>
            <label style={{ color: "#fff" }}>Email:</label>
            <br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc"
              }}
            />
          </div>

          {/* PASSWORD */}
          <div style={{ marginTop: "15px" }}>
            <label style={{ color: "#fff" }}>Password:</label>
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc"
              }}
            />
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "20px",
              width: "100%",
              padding: "10px",
              background: "#b71c1c",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>

        </form>

        {/* ERROR */}
        {error && (
          <p style={{
            color: "#fff",
            marginTop: "15px",
            textAlign: "center"
          }}>
            {error}
          </p>
        )}

      </div>
    </div>
  );
}

export default Login;
