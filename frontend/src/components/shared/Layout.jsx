import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { initials, ROLE_COLORS, ROLE_LABELS } from "../../utils/helpers";
import paleteriaIcon from "../media/paleteriaicon.png";
import SidebarButton from "./SidebarButton";
import { Icon } from "@iconify/react";

const NAV_ITEMS = [
  {
    to: "/pos",
    icon: "mdi:cart-outline",
    label: "Punto de Venta",
    roles: ["admin", "cajero"],
  },
  {
    to: "/inventory",
    icon: "mdi:package-variant",
    label: "Inventario",
    roles: ["admin", "cajero", "consultor"],
  },
  {
    to: "/reports",
    icon: "mdi:chart-bar",
    label: "Reportes",
    roles: ["admin", "consultor"],
  },
  {
    to: "/admin",
    icon: "mdi:cog-outline",
    label: "Administración",
    roles: ["admin"],
  },
];

export function Sidebar({
  collapsed,
  onToggle,
  isMobile,
  mobileOpen,
  onMobileClose,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const roleStyle = ROLE_COLORS[user?.role] || {};
  const visible = NAV_ITEMS.filter((n) => n.roles.includes(user?.role));

  const inner = (
    <aside
      className={`h-full bg-gradient-to-br from-red-300 to-teal-200 flex flex-col shrink-0 overflow-hidden ${
        isMobile
          ? "w-[260px]"
          : `transition-[width] duration-[250ms] ease-[cubic-bezier(.22,1,.36,1)] ${
              collapsed ? "w-[70px]" : "w-60"
            }`
      }`}
    >
      {/* Logo */}
      <div
        className={`flex flex-col items-center px-3 pt-5 pb-4 ${collapsed && !isMobile ? "" : "border-b border-white/10 mb-2"}`}
      >
        <div
          className={`rounded-2xl shrink-0  flex items-center justify-center transition-all duration-200 ${
            collapsed && !isMobile
              ? "w-[38px] h-[38px] rounded-[10px]"
              : isMobile
                ? "w-14 h-14 mb-2"
                : "w-[72px] h-[72px] mb-3"
          }`}
        >
          <img
            src={paleteriaIcon}
            alt="NeveriaPOS"
            className={`object-contain transition-all duration-200 ${
              collapsed && !isMobile
                ? "w-6 h-6"
                : isMobile
                  ? "w-14 h-14"
                  : "w-18 h-18"
            }`}
          />
        </div>

        {(!collapsed || isMobile) && (
          <div className="text-center">
            <div
              className={`text-white font-syne font-bold ${isMobile ? "text-base" : "text-lg"}`}
            >
              NeveriaPOS
            </div>
            <div className="text-teal-700 text-[11px]">Artesanal · v1.0</div>
          </div>
        )}

        {/* Cerrar móvil */}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="absolute top-3 right-3 bg-transparent border-none text-white/60 text-xl cursor-pointer hover:text-white/90 transition-colors"
          >
            <Icon icon="mdi:close" />
          </button>
        )}
      </div>

      {/* User card */}
      {(!collapsed || isMobile) && user && (
        <div className={`mx-3 mb-3.5 ${roleStyle.tag} rounded-xl p-3`}>
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[13px] ${roleStyle.icon}`}
            >
              {initials(user.name)}
            </div>
            <div className="overflow-hidden flex-1">
              <div
                className={`text-white font-semibold text-[13px] whitespace-nowrap overflow-hidden text-ellipsis ${roleStyle.textcolor}`}
              >
                {user.name}
              </div>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${roleStyle.chip}`}
              >
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {visible.map((n) => (
          <SidebarButton
            key={n.to}
            to={n.to}
            icon={n.icon}
            label={n.label}
            color="teal"
            collapsed={collapsed}
            isMobile={isMobile}
            onClick={isMobile ? onMobileClose : undefined}
          />
        ))}
      </nav>

      {/* Logout + collapse */}
      <div className="p-3 flex flex-col gap-2">
        <SidebarButton
          icon="mdi:logout"
          label="Cerrar sesión"
          color="rose"
          collapsed={collapsed}
          isMobile={isMobile}
          onClick={handleLogout}
        />
        {!isMobile && (
          <SidebarButton
            icon={collapsed ? "mdi:chevron-right" : "mdi:chevron-left"}
            label="Colapsar"
            color="slate"
            collapsed={collapsed}
            isMobile={isMobile}
            onClick={onToggle}
          />
        )}
      </div>
    </aside>
  );

  if (isMobile)
    return (
      <>
        {mobileOpen && (
          <div
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/50 z-[49]"
          />
        )}
        <div
          className={`fixed top-0 h-full z-50 transition-[left] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
            mobileOpen ? "left-0" : "-left-[270px]"
          }`}
        >
          {inner}
        </div>
      </>
    );

  return inner;

  return inner;
}

export function Topbar({ title, onMenuClick, isMobile }) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-5 gap-3.5 shadow-[0_1px_8px_rgba(0,0,0,.05)] shrink-0">
      {isMobile && (
        <button
          onClick={onMenuClick}
          className="bg-transparent border-none text-[22px] cursor-pointer text-navy"
        >
          <Icon icon="mdi:menu" />
        </button>
      )}
      <div>
        <h1 className="font-syne font-bold text-lg text-navy tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-slate-500 mt-px">
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        <span
          className={`bg-emerald-100 text-emerald-600 py-1 px-3 rounded-full text-xs font-semibold items-center gap-1.5 ${
            isMobile ? "hidden" : "flex"
          }`}
        >
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
          En línea
        </span>
      </div>
    </header>
  );
}
