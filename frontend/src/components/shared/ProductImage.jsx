export default function ProductImage({
  src,
  emoji = "🍦",
  alt = "",
  size = 56,
  radius = 12,
}) {
  return src ? (
    <img
      src={src}
      alt={alt}
      className="object-cover shrink-0 bg-slate-100"
      style={{ width: size, height: size, borderRadius: radius }}
      onError={(e) => {
        e.target.style.display = "none";
        e.target.nextSibling.style.display = "flex";
      }}
    />
  ) : (
    <div
      className="shrink-0 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: size * 0.45,
      }}
    >
      {emoji}
    </div>
  );
}
