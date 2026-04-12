import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { userService } from "../services";
import { initials, ROLE_COLORS, ROLE_LABELS } from "../utils/helpers";
import { Modal, Spinner, Alert, Field } from "../components/shared/UI";
import { Icon } from "@iconify/react";

const SYSTEM_ITEMS = [
  {
    icon: "fluent:shield-checkmark-16-regular",
    label: "JWT Auth",
    sub: "HMAC-SHA256 · Activo",
  },
  {
    icon: "ant-design:database-outlined",
    label: "MySQL + SQLAlchemy",
    sub: "Migraciones al día",
  },
  {
    icon: "streamline-logos:docker-logo",
    label: "Docker Compose",
    sub: "Backend + Frontend + DB",
  },
  {
    icon: "fluent:cloud-16-regular",
    label: "Railway / Render",
    sub: "CI/CD configurado",
  },
  {
    icon: "fluent:lock-shield-16-regular",
    label: "bcrypt (cost 12)",
    sub: "Contraseñas cifradas",
  },
  {
    icon: "fluent:mail-16-regular",
    label: "Flask-Mail",
    sub: "Reset de contraseña listo",
  },
];

export default function AdminPage() {
  const {
    data: users,
    loading,
    refetch,
  } = useFetch(() => userService.getAll());

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cajero",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    setError("");
    setSaving(true);
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
    <div className="fade-in p-5 flex flex-col gap-5 overflow-y-auto h-full">
      {/* Users */}
      <div className="card px-4 sm:px-6 py-[22px]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-[18px]">
          <h3 className="font-syne text-[15px] font-bold text-teal-600 flex items-center gap-2">
            <Icon icon="lucide:users" className="text-lg" />
            Gestión de Usuarios
          </h3>
          <button
            className="btn-primary flex items-center justify-center gap-1.5 w-full sm:w-auto"
            onClick={() => setModal(true)}
          >
            <Icon icon="icons8:add-user" className="text-lg" />
            Nuevo usuario
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col gap-2.5">
            {(users || []).map((u) => {
              const rc = ROLE_COLORS[u.role] || {};
              return (
                <div
                  key={u.id}
                  className={`flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3.5 rounded-xl ${rc.tag || "bg-slate-50"} ${u.is_active ? "opacity-100" : "opacity-60"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full shrink-0 ${rc.icon} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {initials(u.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy text-sm truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto ml-0 sm:ml-auto">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${rc.chip}`}
                    >
                      {ROLE_LABELS[u.role]}
                    </span>
                    <button
                      onClick={() => toggleActive(u)}
                      className={`px-3 py-1.5 rounded-lg border-none cursor-pointer text-xs font-semibold shrink-0 ml-auto sm:ml-0 ${
                        u.is_active
                          ? "bg-rose-100/20 text-rose-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {u.is_active ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* System status */}
      <div className="card px-4 sm:px-6 py-[22px]">
        <h3 className="font-syne text-[15px] font-bold text-teal-600 mb-4 flex items-center gap-2">
          <Icon icon="fluent:info-16-regular" className="text-lg" />
          Estado del Sistema
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SYSTEM_ITEMS.map((s) => (
            <div
              key={s.label}
              className="bg-slate-100 rounded-xl px-4 py-3.5 flex gap-3 items-center"
            >
              <span className="text-2xl text-red-300 shrink-0">
                <Icon icon={s.icon} />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-navy text-[13px] truncate">
                  {s.label}
                </p>
                <p className="text-[11px] text-emerald-500 font-medium mt-0.5">
                  ✓ {s.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create user modal */}
      {modal && (
        <Modal
          title="Nuevo usuario"
          onClose={() => setModal(false)}
          icon="icons8:add-user"
        >
          <div className="flex flex-col gap-3">
            {error && <Alert type="error">{error}</Alert>}
            <Field label="Nombre completo">
              <input
                className="input-base"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ej: María García"
              />
            </Field>
            <Field label="Correo electrónico">
              <input
                className="input-base"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="usuario@neveria.mx"
              />
            </Field>
            <Field label="Contraseña inicial">
              <input
                className="input-base"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </Field>
            <Field label="Rol">
              <select
                className="input-base"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              >
                <option value="admin">Administrador</option>
                <option value="cajero">Cajero</option>
                <option value="consultor">Consultor</option>
              </select>
            </Field>
            <div className="flex gap-2.5 mt-1">
              <button
                className="btn-ghost flex-1"
                onClick={() => setModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary flex-1"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? "Creando…" : "Crear usuario"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
