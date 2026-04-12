/* ── Modal ──────────────────────────────────────────────────────────── */
export function Modal({ title, onClose, children, maxWidth = 420 }) {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,45,64,.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        className="card slide-up"
        style={{ width: "100%", maxWidth, padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontFamily: "Syne,sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#0F2D40",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "#94A3B8",
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Spinner ────────────────────────────────────────────────────────── */
export function Spinner({ size = 40 }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `3px solid #0D948820`,
          borderTop: `3px solid #0D9488`,
          animation: "spin .7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
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
    <div
      style={{ textAlign: "center", padding: "48px 24px", color: "#64748B" }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p
        style={{
          fontWeight: 600,
          fontSize: 16,
          color: "#0F2D40",
          marginBottom: 6,
        }}
      >
        {title}
      </p>
      {description && <p style={{ fontSize: 13 }}>{description}</p>}
    </div>
  );
}

/* ── Alert banner ───────────────────────────────────────────────────── */
export function Alert({ type = "info", children }) {
  const styles = {
    error: { bg: "#FFE4E6", color: "#BE123C", border: "#F43F5E44" },
    warning: { bg: "#FEF3C7", color: "#92400E", border: "#F59E0B55" },
    success: { bg: "#D1FAE5", color: "#065F46", border: "#10B98155" },
    info: { bg: "#E0F2FE", color: "#075985", border: "#0EA5E955" },
  };
  const s = styles[type] || styles.info;
  return (
    <div
      style={{
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        borderRadius: 12,
        padding: "12px 16px",
        color: s.color,
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

/* ── FormField wrapper ──────────────────────────────────────────────── */
export function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#0F2D40",
          display: "block",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
