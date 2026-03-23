import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useFetch } from "../hooks/useFetch";
import { productService, saleService } from "../services";
import { fmt } from "../utils/helpers";
import { Spinner, Alert, EmptyState } from "../components/shared/UI";

const CATEGORIES = ["Todos", "Paletas", "Helados", "Sorbetes", "Raspados"];

export default function POSPage() {
  const { items, addItem, changeQty, clearCart, total } = useCart();
  const [cat,     setCat]     = useState("Todos");
  const [search,  setSearch]  = useState("");
  const [paid,    setPaid]    = useState("");
  const [method,  setMethod]  = useState("efectivo");
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const { data: products, loading: loadingProducts } = useFetch(
    () => productService.getAll({ active: true })
  );

  const filtered = (products || []).filter(p =>
    (cat === "Todos" || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const paidNum  = parseFloat(paid) || 0;
  const change   = Math.max(0, paidNum - total);
  const canPay   = items.length > 0 && paidNum >= total;

  const handleCheckout = async () => {
    setError(""); setLoading(true);
    try {
      await saleService.create({
        items: items.map(i => ({ product_id: i.id, quantity: i.qty })),
        paid: paidNum,
        payment_method: method,
      });
      setSuccess(true);
      clearCart(); setPaid("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar la venta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

      {/* ── LEFT: Catalog ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid #F1F5F9" }}>
        {/* Filters */}
        <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #F1F5F9", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input className="input-base" style={{ flex: "1 1 150px", maxWidth: 220 }}
            placeholder="🔍 Buscar producto…" value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "6px 12px", borderRadius: 99, border: "none", cursor: "pointer",
                background: cat === c ? "#0D9488" : "#F1F5F9",
                color: cat === c ? "#fff" : "#64748B",
                fontSize: 12, fontWeight: 500, transition: "all .15s",
                fontFamily: "DM Sans,sans-serif",
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, alignContent: "start" }}>
          {loadingProducts
            ? <div style={{ gridColumn: "1/-1" }}><Spinner /></div>
            : filtered.length === 0
            ? <div style={{ gridColumn: "1/-1" }}><EmptyState icon="🔍" title="Sin resultados" /></div>
            : filtered.map(p => {
                const inCart = items.find(i => i.id === p.id);
                return (
                  <button key={p.id} onClick={() => addItem(p)} style={{
                    background: "#fff", textAlign: "left",
                    border: `1.5px solid ${inCart ? "#0D9488" : "#E2E8F0"}`,
                    borderRadius: 14, padding: "14px 12px", cursor: "pointer",
                    transition: "all .15s",
                    boxShadow: inCart ? "0 0 0 2px #0D948833" : "none",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{p.emoji}</div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0F2D40", lineHeight: 1.3, marginBottom: 4 }}>{p.name}</p>
                    <p style={{ fontFamily: "Syne,sans-serif", color: "#0D9488", fontWeight: 700, fontSize: 16 }}>{fmt(p.price)}</p>
                    {p.is_low_stock && <p style={{ fontSize: 10, color: "#F43F5E", marginTop: 3 }}>⚠️ Poco stock ({p.stock})</p>}
                  </button>
                );
              })
          }
        </div>
      </div>

      {/* ── RIGHT: Cart ── */}
      <div style={{ width: 300, display: "flex", flexDirection: "column", background: "#fff", flexShrink: 0 }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #F1F5F9" }}>
          <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: 16, fontWeight: 700, color: "#0F2D40" }}>
            🛒 Carrito {items.length > 0 && <span style={{ color: "#0D9488" }}>({items.reduce((s, i) => s + i.qty, 0)})</span>}
          </h3>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          {items.length === 0
            ? <EmptyState icon="🛒" title="Carrito vacío" description="Toca un producto para agregar" />
            : items.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 8, alignItems: "center", background: "#F8FAFC", padding: "10px 12px", borderRadius: 10 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#0F2D40", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: "#0D9488", fontWeight: 600 }}>{fmt(item.price * item.qty)}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <button onClick={() => changeQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 14 }}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0F2D40", minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => changeQty(item.id, +1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 14 }}>+</button>
                  </div>
                </div>
              ))
          }
        </div>

        {/* Payment panel */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: 10 }}>
          {error   && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">✅ Venta registrada correctamente</Alert>}

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Subtotal</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(total)}</span>
          </div>
          <div style={{ height: 1, background: "#F1F5F9" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "Syne,sans-serif", fontSize: 17, fontWeight: 700, color: "#0F2D40" }}>Total</span>
            <span style={{ fontFamily: "Syne,sans-serif", fontSize: 22, fontWeight: 800, color: "#0D9488" }}>{fmt(total)}</span>
          </div>

          {/* Method */}
          <select className="input-base" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="efectivo">💵 Efectivo</option>
            <option value="tarjeta">💳 Tarjeta</option>
          </select>

          <input className="input-base" type="number" placeholder="💵 Monto recibido"
            value={paid} onChange={e => setPaid(e.target.value)}
            style={{ textAlign: "right", fontSize: 16, fontWeight: 600 }} />

          {paidNum > 0 && (
            <div style={{ background: "#D1FAE5", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#065F46", fontWeight: 600 }}>Cambio</span>
              <span style={{ fontFamily: "Syne,sans-serif", fontSize: 18, fontWeight: 700, color: "#059669" }}>{fmt(change)}</span>
            </div>
          )}

          <button className="btn-primary" onClick={handleCheckout}
            disabled={!canPay || loading}
            style={{ width: "100%", padding: "13px" }}>
            {loading ? "Procesando…" : "Cobrar"}
          </button>

          {items.length > 0 && (
            <button className="btn-ghost" onClick={clearCart}
              style={{ width: "100%", color: "#F43F5E", borderColor: "#F43F5E44" }}>
              Limpiar carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
