import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useFetch } from "../hooks/useFetch";
import { productService, saleService } from "../services";
import { fmt, fmtDate, fmtTime } from "../utils/helpers";
import { Spinner, Alert, EmptyState, Modal } from "../components/shared/UI";
import ProductImage from "../components/shared/ProductImage";

const CATEGORIES = ["Todos", "Paletas", "Helados", "Sorbetes", "Raspados"];

/* ── Historial de ventas ─────────────────────────────────────────────── */
function SaleHistoryModal({ onClose }) {
  const { data: sales, loading } = useFetch(() => saleService.getAll({ per_page: 30 }));
  const [detail, setDetail] = useState(null);
  const { data: saleDetail, loading: loadingDetail } = useFetch(
    () => detail ? saleService.getOne(detail) : Promise.resolve({ data: null }),
    [detail]
  );

  return (
    <Modal title="Historial de ventas" onClose={onClose} maxWidth={600}>
      {detail ? (
        <div>
          <button onClick={() => setDetail(null)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#0D9488", fontWeight: 600, fontSize: 13, marginBottom: 16,
            display: "flex", alignItems: "center", gap: 4,
          }}>← Volver al historial</button>

          {loadingDetail ? <Spinner /> : saleDetail?.data && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Venta #",      `#${saleDetail.data.id}`],
                  ["Cajero",       saleDetail.data.cashier],
                  ["Fecha",        fmtDate(saleDetail.data.created_at)],
                  ["Hora",         fmtTime(saleDetail.data.created_at)],
                  ["Método",       saleDetail.data.payment_method === "efectivo" ? "💵 Efectivo" : "💳 Tarjeta"],
                  ["Cambio",       fmt(saleDetail.data.change)],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 14px" }}>
                    <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 2 }}>{k}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F2D40" }}>{v}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: "#F8FAFC", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #E2E8F0" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#0F2D40" }}>Productos</p>
                </div>
                {(saleDetail.data.items || []).map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", borderBottom: i < saleDetail.data.items.length - 1 ? "1px solid #F1F5F9" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{item.product_emoji}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F2D40" }}>{item.product_name}</p>
                        <p style={{ fontSize: 11, color: "#94A3B8" }}>{fmt(item.unit_price)} × {item.quantity}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0D9488" }}>{fmt(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#0F2D40", borderRadius: 12 }}>
                <span style={{ color: "#94A3B8", fontSize: 13, fontWeight: 600 }}>Total cobrado</span>
                <span style={{ color: "#fff", fontFamily: "Syne,sans-serif", fontSize: 22, fontWeight: 800 }}>{fmt(saleDetail.data.total)}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        loading ? <Spinner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto" }}>
            {!(sales?.data || sales?.sales || []).length
              ? <EmptyState icon="🧾" title="Sin ventas aún" />
              : (sales?.data || sales?.sales || []).map(s => (
                <button key={s.id} onClick={() => setDetail(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", background: "#F8FAFC", borderRadius: 12,
                  border: "1.5px solid transparent", cursor: "pointer", textAlign: "left",
                  transition: "all .15s", width: "100%",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#0D9488"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: s.payment_method === "efectivo" ? "#D1FAE5" : "#EDE9FE",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>
                    {s.payment_method === "efectivo" ? "💵" : "💳"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0F2D40" }}>Venta #{s.id}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8" }}>
                      {fmtDate(s.created_at)} · {fmtTime(s.created_at)} · {s.item_count} producto(s) · {s.cashier}
                    </p>
                  </div>
                  <p style={{ fontFamily: "Syne,sans-serif", fontSize: 16, fontWeight: 800, color: "#0D9488", flexShrink: 0 }}>
                    {fmt(s.total)}
                  </p>
                </button>
              ))
            }
          </div>
        )
      )}
    </Modal>
  );
}

/* ── Ticket de confirmación ──────────────────────────────────────────── */
function TicketModal({ sale, onClose }) {
  return (
    <Modal title="✅ Venta registrada" onClose={onClose} maxWidth={360}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <p style={{ fontFamily: "Syne,sans-serif", fontSize: 28, fontWeight: 800, color: "#0D9488" }}>
            {fmt(sale.total)}
          </p>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Venta #{sale.id} completada</p>
        </div>

        {sale.change > 0 && (
          <div style={{ background: "#D1FAE5", borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: "#065F46", fontWeight: 600 }}>Cambio a entregar</span>
            <span style={{ fontFamily: "Syne,sans-serif", fontSize: 20, fontWeight: 800, color: "#059669" }}>{fmt(sale.change)}</span>
          </div>
        )}

        <div style={{ background: "#F8FAFC", borderRadius: 12, overflow: "hidden" }}>
          {(sale.items || []).map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "9px 14px", borderBottom: i < sale.items.length - 1 ? "1px solid #F1F5F9" : "none",
            }}>
              <span style={{ fontSize: 13, color: "#0F2D40" }}>{item.product_emoji} {item.product_name} ×{item.quantity}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0D9488" }}>{fmt(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onClose} style={{ width: "100%", marginTop: 4 }}>
          Nueva venta
        </button>
      </div>
    </Modal>
  );
}

/* ── POSPage principal ───────────────────────────────────────────────── */
export default function POSPage() {
  const { items, addItem, changeQty, removeItem, clearCart, total } = useCart();
  const [cat,         setCat]         = useState("Todos");
  const [search,      setSearch]      = useState("");
  const [paid,        setPaid]        = useState("");
  const [method,      setMethod]      = useState("efectivo");
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [ticket,      setTicket]      = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const { data: products, loading: loadingProducts } = useFetch(
    () => productService.getAll({ active: true })
  );

  const filtered = (products || []).filter(p =>
    (cat === "Todos" || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const paidNum = parseFloat(paid) || 0;
  const change  = Math.max(0, paidNum - total);

  // Validaciones
  const validationError = (() => {
    if (items.length === 0) return null;
    if (method === "efectivo" && paidNum <= 0) return "Ingresa el monto recibido";
    if (method === "efectivo" && paidNum < total) return `Falta ${fmt(total - paidNum)} para completar el pago`;
    const sinStock = items.find(i => {
      const prod = (products || []).find(p => p.id === i.id);
      return prod && prod.stock < i.qty;
    });
    if (sinStock) return `Stock insuficiente para "${sinStock.name}"`;
    return null;
  })();

  const canPay = items.length > 0 && !validationError && (method === "tarjeta" || paidNum >= total);

  const handleCheckout = async () => {
    setError(""); setLoading(true);
    try {
      const res = await saleService.create({
        items: items.map(i => ({ product_id: i.id, quantity: i.qty })),
        paid: method === "tarjeta" ? total : paidNum,
        payment_method: method,
      });
      clearCart(); setPaid("");
      setTicket(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar la venta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

      {/* ── LEFT: Catálogo ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid #F1F5F9" }}>

        {/* Filtros */}
        <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #F1F5F9", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input className="input-base" style={{ flex: "1 1 150px", maxWidth: 220 }}
            placeholder="Buscar producto…" value={search} onChange={e => setSearch(e.target.value)} />
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
          <button onClick={() => setShowHistory(true)} style={{
            marginLeft: "auto", padding: "7px 14px", borderRadius: 10,
            border: "1.5px solid #0D948844", background: "#F0FDFA",
            color: "#0D9488", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            🧾 Historial
          </button>
        </div>

        {/* Grid de productos */}
        <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10, alignContent: "start" }}>
          {loadingProducts
            ? <div style={{ gridColumn: "1/-1" }}><Spinner /></div>
            : filtered.length === 0
            ? <div style={{ gridColumn: "1/-1" }}><EmptyState icon="🔍" title="Sin resultados" /></div>
            : filtered.map(p => {
                const inCart  = items.find(i => i.id === p.id);
                const outStock = p.stock === 0;
                return (
                  <button key={p.id} onClick={() => !outStock && addItem(p)} style={{
                    background: "#fff", textAlign: "left",
                    border: `1.5px solid ${inCart ? "#0D9488" : "#E2E8F0"}`,
                    borderRadius: 14, padding: 0, cursor: outStock ? "not-allowed" : "pointer",
                    transition: "all .15s", overflow: "hidden",
                    boxShadow: inCart ? "0 0 0 3px #0D948822" : "none",
                    opacity: outStock ? 0.5 : 1,
                  }}>
                    {/* Imagen */}
                    <div style={{ width: "100%", height: 100, overflow: "hidden", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: 40 }}>{p.emoji}</span>
                      }
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#0F2D40", lineHeight: 1.3, marginBottom: 4 }}>{p.name}</p>
                      <p style={{ fontFamily: "Syne,sans-serif", color: "#0D9488", fontWeight: 700, fontSize: 15 }}>{fmt(p.price)}</p>
                      {p.is_low_stock && !outStock && <p style={{ fontSize: 10, color: "#F59E0B", marginTop: 3, fontWeight: 600 }}>⚠️ Poco stock ({p.stock})</p>}
                      {outStock && <p style={{ fontSize: 10, color: "#F43F5E", marginTop: 3, fontWeight: 600 }}>Sin stock</p>}
                      {inCart && <p style={{ fontSize: 10, color: "#0D9488", marginTop: 3, fontWeight: 700 }}>✓ En carrito ({inCart.qty})</p>}
                    </div>
                  </button>
                );
              })
          }
        </div>
      </div>

      {/* ── RIGHT: Carrito ── */}
      <div style={{ width: 310, display: "flex", flexDirection: "column", background: "#fff", flexShrink: 0 }}>

        {/* Header carrito */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: 15, fontWeight: 700, color: "#0F2D40" }}>
            Carrito {items.length > 0 && <span style={{ color: "#0D9488" }}>({items.reduce((s, i) => s + i.qty, 0)})</span>}
          </h3>
          {items.length > 0 && (
            <button onClick={clearCart} style={{ fontSize: 11, color: "#F43F5E", background: "#FFE4E633", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>
              Limpiar
            </button>
          )}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          {items.length === 0
            ? <EmptyState icon="🛒" title="Carrito vacío" description="Toca un producto para agregar" />
            : items.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center", background: "#F8FAFC", padding: "10px 12px", borderRadius: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 22 }}>{item.emoji}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#0F2D40", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: "#0D9488", fontWeight: 700 }}>{fmt(item.price * item.qty)}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={() => changeQty(item.id, -1)} style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0F2D40", minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => changeQty(item.id, +1)} style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                </div>
              ))
          }
        </div>

        {/* Panel de pago */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Resumen */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "Syne,sans-serif", fontSize: 16, fontWeight: 700, color: "#0F2D40" }}>Total</span>
            <span style={{ fontFamily: "Syne,sans-serif", fontSize: 24, fontWeight: 800, color: "#0D9488" }}>{fmt(total)}</span>
          </div>

          {/* Método de pago */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["efectivo", "tarjeta"].map(m => (
              <button key={m} onClick={() => { setMethod(m); if (m === "tarjeta") setPaid(""); }} style={{
                padding: "9px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13,
                border: `2px solid ${method === m ? "#0D9488" : "#E2E8F0"}`,
                background: method === m ? "#F0FDFA" : "#fff",
                color: method === m ? "#0D9488" : "#64748B",
                transition: "all .15s",
              }}>
                {m === "efectivo" ? "💵 Efectivo" : "💳 Tarjeta"}
              </button>
            ))}
          </div>

          {/* Monto recibido (solo efectivo) */}
          {method === "efectivo" && (
            <input className="input-base" type="number" placeholder="Monto recibido"
              value={paid} onChange={e => setPaid(e.target.value)}
              style={{ textAlign: "right", fontSize: 16, fontWeight: 600 }} />
          )}

          {/* Cambio */}
          {method === "efectivo" && paidNum >= total && total > 0 && (
            <div style={{ background: "#D1FAE5", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#065F46", fontWeight: 600 }}>Cambio</span>
              <span style={{ fontFamily: "Syne,sans-serif", fontSize: 18, fontWeight: 800, color: "#059669" }}>{fmt(change)}</span>
            </div>
          )}

          {/* Validación */}
          {error && <Alert type="error">{error}</Alert>}
          {validationError && items.length > 0 && (
            <Alert type="warning">{validationError}</Alert>
          )}

          <button className="btn-primary" onClick={handleCheckout}
            disabled={!canPay || loading}
            style={{ width: "100%", padding: "13px", fontSize: 15 }}>
            {loading ? "Procesando…" : `Cobrar ${total > 0 ? fmt(total) : ""}`}
          </button>
        </div>
      </div>

      {/* Modales */}
      {showHistory && <SaleHistoryModal onClose={() => setShowHistory(false)} />}
      {ticket      && <TicketModal sale={ticket} onClose={() => setTicket(null)} />}
    </div>
  );
}
