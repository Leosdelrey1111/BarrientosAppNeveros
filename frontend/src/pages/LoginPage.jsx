import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) return setError("Completa todos los campos.");
    setError(""); setLoading(true);
    try {
      const user = await login(email, pass);
      // Redirigir según rol
      const landing = { admin: "/reports", cajero: "/pos", consultor: "/reports" };
      navigate(landing[user.role] || "/pos");
    } catch (err) {
      setError(err.response?.data?.error || "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (role) => {
    const creds = { admin: ["admin@neveria.mx","admin123"], cajero: ["cajero@neveria.mx","cajero123"], consultor: ["consultor@neveria.mx","consultor123"] };
    const [e, p] = creds[role];
    setEmail(e); setPass(p);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#0F2D40 0%,#1A3F58 50%,#0F766E 100%)",
      padding: 16, position: "relative", overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      {[
        { top: -80, right: -60, size: 260, color: "#0D9488" },
        { bottom: -40, right: 20, size: 180, color: "#F59E0B" },
        { top: 60, left: -80, size: 320, color: "#0F766E" },
      ].map((b, i) => (
        <div key={i} style={{
          position: "absolute",
          top: b.top, bottom: b.bottom, right: b.right, left: b.left,
          width: b.size, height: b.size,
          borderRadius: "50%", background: `${b.color}22`, filter: "blur(60px)", pointerEvents: "none",
        }} />
      ))}

      <div className="card slide-up" style={{ width: "100%", maxWidth: 420, padding: "40px 36px", position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
            background: "linear-gradient(135deg,#0D9488,#0F766E)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px #0D948844", fontSize: 28,
          }}>🍦</div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: 28, fontWeight: 800, color: "#0F2D40", letterSpacing: "-.02em" }}>
            NeveriaPOS
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>Sistema de Punto de Venta Artesanal</p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0F2D40", display: "block", marginBottom: 6 }}>Correo electrónico</label>
            <input className="input-base" type="email" placeholder="usuario@neveria.mx"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0F2D40", display: "block", marginBottom: 6 }}>Contraseña</label>
            <input className="input-base" type="password" placeholder="••••••••"
              value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>

          {error && (
            <div style={{ background: "#FFE4E6", color: "#BE123C", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn-primary" onClick={handleLogin} disabled={loading}
            style={{ marginTop: 4, width: "100%", padding: "14px" }}>
            {loading ? "Verificando…" : "Iniciar sesión"}
          </button>
        </div>

        {/* Quick access */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1.5px dashed #0D948833" }}>
          <p style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", marginBottom: 10, fontWeight: 600, letterSpacing: ".05em" }}>
            ACCESO RÁPIDO — DEMO
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["admin", "cajero", "consultor"].map(r => (
              <button key={r} className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }}
                onClick={() => quickFill(r)}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
