/** Formatea número como moneda MXN */
export const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);

/** Formatea fecha ISO a fecha legible */
export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });

/** Formatea fecha ISO a hora */
export const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

/** Abrevia un nombre a iniciales (máx 2 chars) */
export const initials = (name = "") =>
  name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

/** Colores por rol */
export const ROLE_COLORS = {
  admin:     { bg: "#0D948822", text: "#0D9488" },
  cajero:    { bg: "#F59E0B22", text: "#B45309" },
  consultor: { bg: "#64748B22", text: "#475569" },
};

export const ROLE_LABELS = {
  admin:     "Administrador",
  cajero:    "Cajero",
  consultor: "Consultor",
};

export const CATEGORIES = ["Paletas", "Helados", "Sorbetes", "Raspados"];
