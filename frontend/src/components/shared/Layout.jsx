import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { initials, ROLE_COLORS, ROLE_LABELS } from "../../utils/helpers";

const NAV_ITEMS = [
  { to: "/pos",       icon: "🛒", label: "Punto de Venta", roles: ["admin", "cajero"] },
  { to: "/inventory", icon: "📦", label: "Inventario",     roles: ["admin", "cajero", "consultor"] },
  { to: "/reports",   icon: "📊", label: "Reportes",       roles: ["admin", "consultor"] },
  { to: "/admin",     icon: "⚙️",  label: "Administración", roles: ["admin"] },
];

export function Sidebar({ collapsed, onToggle, isMobile, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const roleStyle = ROLE_COLORS[user?.role] || {};
  const visible   = NAV_ITEMS.filter(n => n.roles.includes(user?.role));

  const inner = (
    <aside style={{
      width: isMobile ? 260 : collapsed ? 70 : 240,
      height: "100%",
      background: "#0F2D40",
      display: "flex",
      flexDirection: "column",
      transition: isMobile ? "none" : "width .25s cubic-bezier(.22,1,.36,1)",
      flexShrink: 0,
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 12, minHeight: 70 }}>
        <div style={{
          minWidth: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg,#0D9488,#0F766E)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px #0D948844", fontSize: 20,
        }}>🍦</div>
        {(!collapsed || isMobile) && (
          <div>
            <div style={{ color: "#fff", fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 17 }}>NeveriaPOS</div>
            <div style={{ color: "#CCFBF166", fontSize: 11 }}>Artesanal · v1.0</div>
          </div>
        )}
        {isMobile && (
          <button onClick={onMobileClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff9", fontSize: 20, cursor: "pointer" }}>✕</button>
        )}
      </div>

      {/* User card */}
      {(!collapsed || isMobile) && user && (
        <div style={{ margin: "0 12px 14px", background: "#1A3F58", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#0D9488,#0F766E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 13,
            }}>{initials(user.name)}</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <span style={{ display: "inline-block", marginTop: 3, padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: roleStyle.bg, color: roleStyle.text }}>
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 8px", display: "flex", flexDirection: "column", gap: 3 }}>
        {visible.map(n => (
          <NavLink key={n.to} to={n.to} onClick={isMobile ? onMobileClose : undefined}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center",
              gap: 12, padding: collapsed && !isMobile ? "12px 0" : "10px 14px",
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",
              borderRadius: 12, textDecoration: "none",
              background: isActive ? "#0D948822" : "transparent",
              color: isActive ? "#CCFBF1" : "#ffffff77",
              fontWeight: isActive ? 600 : 400, fontSize: 14,
              transition: "all .15s",
              borderLeft: isActive ? "3px solid #0D9488" : "3px solid transparent",
            })}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
            {(!collapsed || isMobile) && <span style={{ whiteSpace: "nowrap" }}>{n.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout + collapse */}
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={handleLogout} style={{
          background: "#F43F5E18", color: "#F43F5E", border: "none",
          padding: collapsed && !isMobile ? "10px 0" : "10px 14px",
          borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
          justifyContent: collapsed && !isMobile ? "center" : "flex-start",
          transition: "all .15s",
        }}>
          <span>🚪</span>
          {(!collapsed || isMobile) && "Cerrar sesión"}
        </button>
        {!isMobile && (
          <button onClick={onToggle} style={{
            background: "transparent", color: "#ffffff44",
            border: "1px solid #ffffff18", padding: "8px",
            borderRadius: 10, cursor: "pointer", fontSize: 12, transition: "all .15s",
          }}>
            {collapsed ? "→" : "← Colapsar"}
          </button>
        )}
      </div>
    </aside>
  );

  if (isMobile) return (
    <>
      {mobileOpen && (
        <div onClick={onMobileClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 49 }} />
      )}
      <div style={{
        position: "fixed", top: 0, left: mobileOpen ? 0 : -270,
        height: "100%", zIndex: 50, transition: "left .28s cubic-bezier(.22,1,.36,1)",
      }}>
        {inner}
      </div>
    </>
  );

  return inner;
}

export function Topbar({ title, onMenuClick, isMobile }) {
  return (
    <header style={{
      height: 64, background: "#fff",
      borderBottom: "1px solid #F1F5F9",
      display: "flex", alignItems: "center",
      padding: "0 20px", gap: 14,
      boxShadow: "0 1px 8px rgba(0,0,0,.05)",
      flexShrink: 0,
    }}>
      {isMobile && (
        <button onClick={onMenuClick} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#0F2D40" }}>
          ☰
        </button>
      )}
      <div>
        <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 18, color: "#0F2D40", letterSpacing: "-.01em" }}>{title}</h1>
        <p style={{ fontSize: 12, color: "#64748B", marginTop: 1 }}>
          {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          background: "#D1FAE5", color: "#059669", padding: "4px 12px",
          borderRadius: 99, fontSize: 12, fontWeight: 600,
          display: isMobile ? "none" : "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ width: 6, height: 6, background: "#10B981", borderRadius: "50%", display: "inline-block" }} />
          En línea
        </span>
      </div>
    </header>
  );
}
