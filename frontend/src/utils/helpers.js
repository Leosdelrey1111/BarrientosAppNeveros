/** Formatea número como moneda MXN */
export const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    n ?? 0,
  );

/** Formatea fecha ISO a fecha legible */
export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/** Formatea fecha ISO a hora */
export const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

/** Abrevia un nombre a iniciales (máx 2 chars) */
export const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** Colores por rol */
export const ROLE_COLORS = {
  admin: {
    chip: "bg-teal-500/20 text-teal-600",
    icon: "bg-gradient-to-br from-blue-400 to-teal-400",
    tag: "bg-teal-100/50",
    textcolor: "text-teal-800",
  },
  cajero: {
    chip: "bg-amber-500/20 text-amber-700",
    icon: "bg-gradient-to-br from-amber-300 to-red-300",
    tag: "bg-amber-100/50",
    textcolor: "text-amber-800",
  },
  consultor: {
    chip: "bg-indigo-500/20 text-indigo-600",
    icon: "bg-gradient-to-br from-indigo-300 to-fuchsia-300",
    tag: "bg-indigo-200/50",
    textcolor: "text-indigo-800",
  },
};

export const ROLE_LABELS = {
  admin: "Administrador",
  cajero: "Cajero",
  consultor: "Consultor",
};

export const CATEGORIES = ["Paletas", "Helados", "Sorbetes", "Raspados"];
