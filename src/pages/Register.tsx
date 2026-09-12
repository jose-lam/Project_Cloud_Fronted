import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { RegistrarClientePayload } from "../types";

type FormField = keyof RegistrarClientePayload;

export default function Register() {
  const { register, loading } = useAuth();
  const [form, setForm] = useState<RegistrarClientePayload>({
    nombre: "",
    email: "",
    password: "",
    direccion: "",
    telefono: "",
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  function set(field: FormField) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Crea tu cuenta</h1>
        <p className="subtitle">Regístrate para guardar tus pedidos y agilizar el pago.</p>
        <div className="auth-banner">
          El módulo de clientes (MS2) aún no está implementado por el equipo. Tus datos se guardan
          únicamente en este navegador, de forma simulada.
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="nombre">Nombre completo</label>
            <input id="nombre" required value={form.nombre} onChange={set("nombre")} />
          </div>
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" required value={form.email} onChange={set("email")} />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" required minLength={4} value={form.password} onChange={set("password")} />
          </div>
          <div className="field">
            <label htmlFor="direccion">Dirección</label>
            <input id="direccion" value={form.direccion} onChange={set("direccion")} placeholder="Opcional" />
          </div>
          <div className="field">
            <label htmlFor="telefono">Teléfono</label>
            <input id="telefono" value={form.telefono} onChange={set("telefono")} placeholder="Opcional" />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/ingresar">Ingresa</Link>
        </p>
      </div>
    </div>
  );
}
