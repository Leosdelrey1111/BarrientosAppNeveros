import { Icon } from "@iconify/react";

/* ── Modal ──────────────────────────────────────────────────────────── */
export function Modal({ title, icon, onClose, children, maxWidth = 420 }) {
  return (
    <div
      className="modal-overlay fixed inset-0 bg-[#0F2D40]/50 backdrop-blur-[4px] flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="card slide-up w-full overflow-hidden"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="relative px-6 py-5 flex items-center gap-3">
          {icon && (
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-red-300 to-pink-200 backdrop-blur-sm text-white text-lg shrink-0">
              <Icon icon={icon} />
            </span>
          )}
          <h3 className="font-syne font-bold text-[17px] text-teal tracking-tight leading-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg bg-red-300 hover:bg-red-400 text-white/70 hover:text-white transition-colors cursor-pointer border-none"
          >
            <Icon icon="mdi:close" className="text-lg" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-7">{children}</div>
      </div>
    </div>
  );
}

/* ── Spinner ────────────────────────────────────────────────────────── */
export function Spinner({ size = 40 }) {
  return (
    <div className="flex justify-center items-center p-10">
      <div
        className="rounded-full border-[3px] border-teal-600/10 border-t-teal-600 animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

/* ── EmptyState ─────────────────────────────────────────────────────── */
export function EmptyState({
  icon = "📭",
  title = "Sin datos",
  description = "",
}) {
  return (
    <div className="text-center py-12 px-6 text-slate-500">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="font-semibold text-base text-navy mb-1.5">{title}</p>
      {description && <p className="text-[13px]">{description}</p>}
    </div>
  );
}

/* ── Alert banner ───────────────────────────────────────────────────── */
const ALERT_STYLES = {
  error: "bg-rose-100 text-rose-800 border-rose-400/25",
  warning: "bg-amber-100 text-amber-900 border-amber-500/30",
  success: "bg-emerald-100 text-emerald-900 border-emerald-500/30",
  info: "bg-sky-100 text-sky-900 border-sky-500/30",
};

export function Alert({ type = "info", children }) {
  return (
    <div
      className={`border-[1.5px] rounded-xl py-3 px-4 text-[13px] font-medium ${ALERT_STYLES[type] || ALERT_STYLES.info}`}
    >
      {children}
    </div>
  );
}

/* ── FormField wrapper ──────────────────────────────────────────────── */
export function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-navy block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
