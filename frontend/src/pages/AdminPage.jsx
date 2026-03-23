import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { userService } from "../services";
import { initials, ROLE_COLORS, ROLE_LABELS } from "../utils/helpers";
import { Modal, Spinner, Alert, Field } from "../components/shared/UI";

const SYSTEM_ITEMS = [
  { icon: "🔐", label: "JWT Auth",         sub: "HMAC-SHA256 · Activo"      },
  { icon: "🗄️", label: "MySQL + SQLAlchemy", sub: "Migraciones al día"       },
  { icon: "🐳", label: "Docker Compose",    sub: "Backend + Frontend + DB"   },
  { icon: "☁️", label: "Railway / Render",  sub: "CI/CD configurado"         },
  { icon: "🔒", label: "bcrypt (cost 12)",  sub: "Contraseñas cifradas"       },
  { icon: "📧", label: "Flask-Mail",        sub: "Reset de contraseña listo"  },
];

export default function AdminPage() {
  const { data: users, loading, refetch } = useFetch(() => userService.getAll());

  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState({ name: "", email: "", password: "", role: "cajero" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    setError(""); setSaving(true);
    try {
      await userService.create(form);
      setModal(false);
      setForm({ name: "", email: "", password: "", role: "cajero" });
      refetch();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear usuario");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user) => {
    try {
      await userService.update(user.id, { is_active: !user.is_active });
      refetch();
    } catch (_) {}
  };

  return (
    <div className="fade-in" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", height: "100%" }}>

      {/* Users */}
      <div className="card" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: 15, fontWeight: 700, color: "#0F2D40" }}>
            👥 Gestión de Usuarios
          </h3>
          <button className="btn-primary" onClick={() => setModal(true)}>+ Nuevo usuario</button>
        </div>

        {loading
          ? <Spinner />
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(users || []).map(u => {
                const rc = ROLE_COLORS[u.role] || {};
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#F8FAFC", borderRadius: 12, opacity: u.is_active ? 1 : .6 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg,#0D9488,#0F766E)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 14,
                    }}>{initials(u.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: "#0F2D40", fontSize: 14 }}>{u.name}</p>
                      <p style={{ fontSize: 12, color: "#64748B" }}>{u.email}</p>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: rc.bg, color: rc.text, flexShrink: 0 }}>
                      {ROLE_LABELS[u.role]}
                    </span>
                    <button onClick={() => toggleActive(u)} style={{
                      padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                      background: u.is_active ? "#FFE4E633" : "#D1FAE5",
                      color:      u.is_active ? "#BE123C"   : "#065F46",
                      flexShrink: 0,
                    }}>
                      {u.is_active ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>

      {/* System status */}
      <div className="card" style={{ padding: "22px 24px" }}>
        <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: 15, fontWeight: 700, color: "#0F2D40", marginBottom: 16 }}>
          ⚙️ Estado del Sistema
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
          {SYSTEM_ITEMS.map(s => (
            <div key={s.label} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div>
                <p style={{ fontWeight: 600, color: "#0F2D40", fontSize: 13 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: "#10B981", fontWeight: 500, marginTop: 2 }}>✓ {s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create user modal */}
      {modal && (
        <Modal title="Nuevo usuario" onClose={() => setModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {error && <Alert type="error">{error}</Alert>}
            <Field label="Nombre completo">
              <input className="input-base" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ej: María García" />
            </Field>
            <Field label="Correo electrónico">
              <input className="input-base" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="usuario@neveria.mx" />
            </Field>
            <Field label="Contraseña inicial">
              <input className="input-base" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Mínimo 6 caracteres" />
            </Field>
            <Field label="Rol">
              <select className="input-base" value={form.role} onChange={e => set("role", e.target.value)}>
                <option value="admin">Administrador</option>
                <option value="cajero">Cajero</option>
                <option value="consultor">Consultor</option>
              </select>
            </Field>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button className="btn-ghost" onClick={() => setModal(false)} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate} disabled={saving} style={{ flex: 1 }}>
                {saving ? "Creando…" : "Crear usuario"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
