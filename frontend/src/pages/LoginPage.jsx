import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import bgPaleteria from "../components/media/BackgoundPaleteria.png";
import paleteriaIcon from "../components/media/paleteriaicon.png";
import { Icon } from "@iconify/react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) return setError("Completa todos los campos.");
    setError("");
    setLoading(true);
    try {
      const user = await login(email, pass);
      const landing = {
        admin: "/reports",
        cajero: "/pos",
        consultor: "/reports",
      };
      navigate(landing[user.role] || "/pos");
    } catch (err) {
      setError(err.response?.data?.error || "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (role) => {
    const creds = {
      admin: ["admin@neveria.mx", "admin123"],
      cajero: ["cajero@neveria.mx", "cajero123"],
      consultor: ["consultor@neveria.mx", "consultor123"],
    };
    const [e, p] = creds[role];
    setEmail(e);
    setPass(p);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgPaleteria})` }}
    >
      {/* Overlay oscuro */}
      {/* <div className="absolute inset-0 bg-navy/80 backdrop-blur-sm" /> */}

      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-16 w-[260px] h-[260px] rounded-full bg-teal/15 blur-[60px] pointer-events-none z-10" />
      <div className="absolute -bottom-10 right-5 w-[180px] h-[180px] rounded-full bg-amber-500/15 blur-[60px] pointer-events-none z-10" />
      <div className="absolute top-16 -left-20 w-80 h-80 rounded-full bg-teal-dark/15 blur-[60px] pointer-events-none z-10" />

      <div className="card slide-up w-full max-w-[420px] px-9 py-10 relative z-10 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <img
              src={paleteriaIcon}
              alt="NeveriaPOS"
              className="w-20 h-20 object-contain"
            />
          </div>

          <h1 className="font-syne text-[28px] font-extrabold text-navy tracking-tight">
            NeveriaPOS
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sistema de Punto de Venta Artesanal
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="text-[13px] font-semibold text-navy block mb-1.5">
              Correo electrónico
            </label>
            <input
              className="input-base"
              type="email"
              placeholder="usuario@neveria.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold text-navy block mb-1.5">
              Contraseña
            </label>
            <input
              className="input-base"
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium">
              <Icon
                icon="mdi:alert-circle-outline"
                className="inline-block mr-1.5 text-lg"
              />
              {error}
            </div>
          )}

          <button
            className="btn-primary mt-1 w-full py-3.5"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Verificando…" : "Iniciar sesión"}
          </button>
        </div>

        {/* Quick access */}
        <div className="mt-7 pt-5 border-t-[1.5px] border-dashed border-teal/20">
          <p className="text-[11px] text-slate-400 text-center mb-2.5 font-semibold tracking-widest">
            ACCESO RÁPIDO — DEMO
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {["admin", "cajero", "consultor"].map((r) => (
              <button
                key={r}
                className="btn-ghost text-xs px-3.5 py-1.5"
                onClick={() => quickFill(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
