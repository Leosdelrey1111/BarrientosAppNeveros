import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";

const PALETTES = {
  teal: {
    base: "text-teal-700",
    active: "bg-teal-500/15 text-teal-700 border-l-teal font-semibold",
    hover: "hover:bg-teal-500/10 hover:text-teal-800",
  },
  rose: {
    base: "text-rose-400",
    active: "bg-rose-500/15 text-rose-400 font-semibold",
    hover: "hover:bg-rose-500/15 hover:text-rose-600",
  },
  amber: {
    base: "text-amber-300",
    active: "bg-amber-500/15 text-amber-300 border-l-amber-400 font-semibold",
    hover: "hover:bg-amber-500/10 hover:text-amber-300",
  },
  slate: {
    base: "text-zinc-600",
    active: "bg-zinc-500/15 text-zinc-600 border-l-zinc-500 font-semibold",
    hover: "hover:bg-zinc-500/20 hover:text-zinc-700",
  },
};

/**
 * SidebarButton — botón reutilizable para sidebar.
 *
 * @param {string}  to         - Ruta (si se pasa, renderiza NavLink)
 * @param {string}  icon       - Nombre de icono Iconify (ej. "mdi:cart-outline")
 * @param {string}  label      - Texto del botón
 * @param {string}  color      - Clave de paleta: "teal" | "rose" | "amber" | "slate"
 * @param {boolean} collapsed  - Sidebar colapsado
 * @param {boolean} isMobile   - Vista móvil
 * @param {Function} onClick   - Handler click (para botones de acción)
 * @param {string}  className  - Clases extra
 */
export default function SidebarButton({
  to,
  icon,
  label,
  color = "teal",
  collapsed = false,
  isMobile = false,
  onClick,
  className = "",
}) {
  const palette = PALETTES[color] || PALETTES.teal;
  const isCompact = collapsed && !isMobile;

  const baseClasses = [
    "flex items-center gap-3 rounded-xl no-underline transition-all duration-150 border-l-[3px] border-transparent cursor-pointer",
    isCompact ? "justify-center py-3 px-0" : "justify-start py-2.5 px-3.5",
    palette.base,
    palette.hover,
    className,
  ].join(" ");

  const activeClasses = [
    "flex items-center gap-3 rounded-xl no-underline transition-all duration-150 border-l-[3px] cursor-pointer",
    isCompact ? "justify-center py-3 px-0" : "justify-start py-2.5 px-3.5",
    palette.active,
    className,
  ].join(" ");

  const content = (
    <>
      <Icon icon={icon} className="text-lg shrink-0" />
      {!isCompact && <span className="whitespace-nowrap text-sm">{label}</span>}
    </>
  );

  if (to) {
    return (
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => (isActive ? activeClasses : baseClasses)}
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} border-none bg-transparent`}
    >
      {content}
    </button>
  );
}
