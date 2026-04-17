import { useState } from "react";
import { createUser } from "../services/user.service";

/**
 * 👤 Componente: Crear usuarios (solo admin)
 */
function Users() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createUser(form);
      setMessage("✅ Usuario creado correctamente");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

    } catch (error) {
      console.error(error);
      setMessage("❌ Error creando usuario");
    }
  };

  return (
    <div>
      <h2>👤 Crear Usuario</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">Usuario</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Crear</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Users;
