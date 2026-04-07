export default function ProductImage({ src, emoji = "🍦", alt = "", size = 56, radius = 12 }) {
  return src ? (
    <img
      src={src}
      alt={alt}
      style={{
        width: size, height: size, borderRadius: radius,
        objectFit: "cover", flexShrink: 0,
        background: "#F1F5F9",
      }}
      onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.45,
    }}>
      {emoji}
    </div>
  );
}
