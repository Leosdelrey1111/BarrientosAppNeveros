import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useFetch } from "../hooks/useFetch";
import { productService, saleService } from "../services";
import { fmt, fmtDate, fmtTime } from "../utils/helpers";
import { Spinner, Alert, EmptyState, Modal } from "../components/shared/UI";
import ProductImage from "../components/shared/ProductImage";
import { Icon } from "@iconify/react";

const CATEGORIES = ["Todos", "Paletas", "Helados", "Sorbetes", "Raspados"];

/* ── Historial de ventas ─────────────────────────────────────────────── */
function SaleHistoryModal({ onClose }) {
  const { data: sales, loading } = useFetch(() =>
    saleService.getAll({ per_page: 30 }),
  );
  const [detail, setDetail] = useState(null);
  const { data: saleDetail, loading: loadingDetail } = useFetch(
    () =>
      detail ? saleService.getOne(detail) : Promise.resolve({ data: null }),
    [detail],
  );

  return (
    <Modal title="Historial de ventas" onClose={onClose} maxWidth={600}>
      {detail ? (
        <div>
          <button
            onClick={() => setDetail(null)}
            className="bg-transparent border-none cursor-pointer text-teal font-semibold text-[13px] mb-4 flex items-center gap-1"
          >
            <Icon icon="mdi:arrow-left" className="text-sm shrink-0" />
            Volver al historial
          </button>

          {loadingDetail ? (
            <Spinner />
          ) : (
            saleDetail?.data && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    ["Venta #", `#${saleDetail.data.id}`],
                    ["Cajero", saleDetail.data.cashier],
                    ["Fecha", fmtDate(saleDetail.data.created_at)],
                    ["Hora", fmtTime(saleDetail.data.created_at)],
                    [
                      "Método",
                      saleDetail.data.payment_method === "efectivo" ? (
                        <span className="inline-flex items-center gap-1">
                          <Icon
                            icon="mdi:cash"
                            className="text-sm shrink-0 text-emerald-500"
                          />
                          Efectivo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Icon
                            icon="mdi:credit-card-outline"
                            className="text-sm shrink-0 text-violet-500"
                          />
                          Tarjeta
                        </span>
                      ),
                    ],
                    ["Cambio", fmt(saleDetail.data.change)],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="bg-slate-50 rounded-[10px] px-3.5 py-2.5"
                    >
                      <p className="text-[11px] text-slate-400 font-semibold mb-0.5">
                        {k}
                      </p>
                      <p className="text-sm font-semibold text-navy">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 rounded-xl overflow-hidden">
                  <div className="px-3.5 py-2.5 border-b border-slate-200">
                    <p className="text-xs font-bold text-navy">Productos</p>
                  </div>
                  {(saleDetail.data.items || []).map((item, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center px-3.5 py-2.5 ${
                        i < saleDetail.data.items.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg shrink-0">
                          {item.product_emoji}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-navy">
                            {item.product_name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {fmt(item.unit_price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="text-[13px] font-bold text-teal shrink-0">
                        {fmt(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center px-4 py-3 bg-navy rounded-xl">
                  <span className="text-slate-400 text-[13px] font-semibold">
                    Total cobrado
                  </span>
                  <span className="text-white font-syne text-[22px] font-extrabold">
                    {fmt(saleDetail.data.total)}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      ) : loading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          {!(sales?.data || sales?.sales || []).length ? (
            <EmptyState icon="🧾" title="Sin ventas aún" />
          ) : (
            (sales?.data || sales?.sales || []).map((s) => (
              <button
                key={s.id}
                onClick={() => setDetail(s.id)}
                className="flex items-center gap-3.5 px-3.5 py-3 bg-slate-50 rounded-xl border-[1.5px] border-transparent cursor-pointer text-left w-full transition-all duration-150 hover:border-teal"
              >
                <div
                  className={`w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center ${
                    s.payment_method === "efectivo"
                      ? "bg-emerald-100"
                      : "bg-violet-100"
                  }`}
                >
                  <Icon
                    icon={
                      s.payment_method === "efectivo"
                        ? "mdi:cash"
                        : "mdi:credit-card-outline"
                    }
                    className={`text-xl ${
                      s.payment_method === "efectivo"
                        ? "text-emerald-600"
                        : "text-violet-600"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-navy">
                    Venta #{s.id}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {fmtDate(s.created_at)} · {fmtTime(s.created_at)} ·{" "}
                    {s.item_count} producto(s) · {s.cashier}
                  </p>
                </div>
                <p className="font-syne text-base font-extrabold text-teal shrink-0">
                  {fmt(s.total)}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </Modal>
  );
}

/* ── Ticket de confirmación ──────────────────────────────────────────── */
function TicketModal({ sale, onClose }) {
  return (
    <Modal title="Venta registrada" onClose={onClose} maxWidth={360}>
      <div className="flex flex-col gap-3">
        <div className="text-center py-2 pb-4">
          <Icon
            icon="mdi:party-popper"
            className="text-5xl text-amber-400 mx-auto mb-2"
          />
          <p className="font-syne text-[28px] font-extrabold text-teal">
            {fmt(sale.total)}
          </p>
          <p className="text-[13px] text-slate-500 mt-1">
            Venta #{sale.id} completada
          </p>
        </div>

        {sale.change > 0 && (
          <div className="bg-emerald-100 rounded-xl px-4 py-3.5 flex justify-between items-center">
            <span className="text-sm text-emerald-800 font-semibold">
              Cambio a entregar
            </span>
            <span className="font-syne text-xl font-extrabold text-emerald-600">
              {fmt(sale.change)}
            </span>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl overflow-hidden">
          {(sale.items || []).map((item, i) => (
            <div
              key={i}
              className={`flex justify-between items-center px-3.5 py-2.5 ${
                i < sale.items.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <span className="text-[13px] text-navy flex items-center gap-1.5">
                <span className="text-sm shrink-0">{item.product_emoji}</span>
                {item.product_name} ×{item.quantity}
              </span>
              <span className="text-[13px] font-semibold text-teal shrink-0">
                {fmt(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        <button className="btn-primary w-full mt-1" onClick={onClose}>
          Nueva venta
        </button>
      </div>
    </Modal>
  );
}

/* ── POSPage principal ───────────────────────────────────────────────── */
export default function POSPage() {
  const { items, addItem, changeQty, removeItem, clearCart, total } = useCart();
  const [cat, setCat] = useState("Todos");
  const [search, setSearch] = useState("");
  const [paid, setPaid] = useState("");
  const [method, setMethod] = useState("efectivo");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [mobileTab, setMobileTab] = useState("catalog");

  const { data: products, loading: loadingProducts } = useFetch(() =>
    productService.getAll({ active: true }),
  );

  const filtered = (products || []).filter(
    (p) =>
      (cat === "Todos" || p.category === cat) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const paidNum = parseFloat(paid) || 0;
  const change = Math.max(0, paidNum - total);

  const validationError = (() => {
    if (items.length === 0) return null;
    if (method === "efectivo" && paidNum <= 0)
      return "Ingresa el monto recibido";
    if (method === "efectivo" && paidNum < total)
      return `Falta ${fmt(total - paidNum)} para completar el pago`;
    const sinStock = items.find((i) => {
      const prod = (products || []).find((p) => p.id === i.id);
      return prod && prod.stock < i.qty;
    });
    if (sinStock) return `Stock insuficiente para "${sinStock.name}"`;
    return null;
  })();

  const canPay =
    items.length > 0 &&
    !validationError &&
    (method === "tarjeta" || paidNum >= total);

  const handleCheckout = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await saleService.create({
        items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
        paid: method === "tarjeta" ? total : paidNum,
        payment_method: method,
      });
      clearCart();
      setPaid("");
      setTicket(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar la venta");
    } finally {
      setLoading(false);
    }
  };

  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── TABS MÓVIL ── */}
      <div className="flex sm:hidden border-b border-slate-100 bg-white shrink-0">
        <button
          onClick={() => setMobileTab("catalog")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            mobileTab === "catalog"
              ? "text-red-300 border-b-2 border-red-300"
              : "text-slate-400"
          }`}
        >
          <Icon icon="mdi:storefront-outline" className="text-lg shrink-0" />
          Catálogo
        </button>
        <button
          onClick={() => setMobileTab("cart")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors relative flex items-center justify-center gap-1.5 ${
            mobileTab === "cart"
              ? "text-red-300 border-b-2 border-red-300"
              : "text-slate-400"
          }`}
        >
          <Icon icon="mdi:cart-outline" className="text-lg shrink-0" />
          Carrito
          {cartCount > 0 && (
            <span className="absolute top-2 right-[calc(50%-28px)] bg-teal text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Catálogo ── */}
        <div
          className={`flex-1 flex flex-col overflow-hidden border-r border-slate-100
            ${mobileTab === "cart" ? "hidden sm:flex" : "flex"}
          `}
        >
          {/* Filtros */}
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2 items-center">
              <input
                className="input-base flex-1 sm:flex-[1_1_120px] sm:max-w-[220px] text-sm"
                placeholder="Buscar producto…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={() => setShowHistory(true)}
                className="shrink-0 px-3 py-[7px] rounded-[10px] border-[1.5px] border-teal/25 bg-teal-light text-teal text-xs font-semibold cursor-pointer hover:border-teal transition-all duration-150 sm:hidden"
              >
                <Icon icon="mdi:history" className="text-lg" />
              </button>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full border-none cursor-pointer text-xs font-medium font-sans transition-all duration-150 whitespace-nowrap shrink-0 ${
                    cat === c
                      ? "bg-teal text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="hidden sm:flex items-center gap-1.5 ml-auto px-3 py-[7px] rounded-[10px] border-[1.5px] border-teal/25 bg-teal-light text-teal text-xs font-semibold cursor-pointer hover:border-teal transition-all duration-150 whitespace-nowrap"
            >
              <Icon icon="mdi:history" className="text-base shrink-0" />
              Historial
            </button>
          </div>

          {/* Grid de productos */}
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 sm:gap-2.5 content-start">
            {loadingProducts ? (
              <div className="col-span-full">
                <Spinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full">
                <EmptyState icon="🔍" title="Sin resultados" />
              </div>
            ) : (
              filtered.map((p) => {
                const inCart = items.find((i) => i.id === p.id);
                const outStock = p.stock === 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (!outStock) addItem(p);
                    }}
                    className={`bg-white text-left rounded-[14px] p-0 overflow-hidden transition-all duration-150 w-full
            ${outStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            ${
              inCart
                ? "border-[1.5px] border-teal shadow-[0_0_0_3px_#0D948822]"
                : "border-[1.5px] border-slate-200 hover:border-slate-300"
            }`}
                  >
                    {/* ── MÓVIL: fila horizontal ── */}
                    <div className="flex sm:hidden items-center gap-0">
                      {/* Imagen cuadrada */}
                      <div className="w-[80px] h-[80px] shrink-0 bg-slate-50 flex items-center justify-center overflow-hidden rounded-l-[13px]">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[38px] leading-none">
                            {p.emoji}
                          </span>
                        )}
                      </div>

                      {/* Divisor */}
                      <div className="w-px h-[80px] bg-slate-100 shrink-0" />

                      {/* Info */}
                      <div className="flex-1 min-w-0 px-3.5 py-2.5 flex flex-col justify-center gap-1">
                        <p className="text-[13px] font-semibold text-navy leading-snug line-clamp-2">
                          {p.name}
                        </p>
                        <p className="font-syne text-teal font-extrabold text-[15px]">
                          {fmt(p.price)}
                        </p>
                        {p.is_low_stock && !outStock && (
                          <p className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 leading-none">
                            <Icon
                              icon="mdi:alert-circle-outline"
                              className="text-[12px] shrink-0"
                            />
                            Poco stock ({p.stock})
                          </p>
                        )}
                        {outStock && (
                          <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 leading-none">
                            <Icon
                              icon="mdi:close-circle-outline"
                              className="text-[12px] shrink-0"
                            />
                            Sin stock
                          </p>
                        )}
                        {inCart && (
                          <p className="text-[11px] text-teal font-bold flex items-center gap-1 leading-none">
                            <Icon
                              icon="mdi:check-circle"
                              className="text-[12px] shrink-0"
                            />
                            En carrito ({inCart.qty})
                          </p>
                        )}
                      </div>

                      {/* Check badge derecho */}
                      {inCart && (
                        <div className="pr-3 shrink-0">
                          <div className="w-5 h-5 rounded-full bg-teal flex items-center justify-center">
                            <Icon
                              icon="mdi:check"
                              className="text-white text-[11px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── DESKTOP: columna vertical — idéntico al original ── */}
                    <div className="hidden sm:block">
                      <div className="w-full h-[100px] overflow-hidden bg-slate-50 flex items-center justify-center">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[40px]">{p.emoji}</span>
                        )}
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-xs font-semibold text-navy leading-tight mb-1">
                          {p.name}
                        </p>
                        <p className="font-syne text-teal font-bold text-[15px]">
                          {fmt(p.price)}
                        </p>
                        {p.is_low_stock && !outStock && (
                          <p className="text-[10px] text-amber-500 mt-0.5 font-semibold flex items-center gap-0.5">
                            <Icon
                              icon="mdi:alert-circle-outline"
                              className="text-xs shrink-0"
                            />
                            Poco stock ({p.stock})
                          </p>
                        )}
                        {outStock && (
                          <p className="text-[10px] text-rose-500 mt-0.5 font-semibold flex items-center gap-0.5">
                            <Icon
                              icon="mdi:close-circle-outline"
                              className="text-xs shrink-0"
                            />
                            Sin stock
                          </p>
                        )}
                        {inCart && (
                          <p className="text-[10px] text-teal mt-0.5 font-bold flex items-center gap-0.5">
                            <Icon
                              icon="mdi:check-circle"
                              className="text-xs shrink-0"
                            />
                            En carrito ({inCart.qty})
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Carrito ── */}
        <div
          className={`w-full sm:w-[310px] flex flex-col bg-white shrink-0
            ${mobileTab === "catalog" ? "hidden sm:flex" : "flex"}
          `}
        >
          {/* Header carrito */}
          <div className="px-4 py-3.5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-syne text-[15px] font-bold text-navy">
              Carrito{" "}
              {items.length > 0 && (
                <span className="text-teal">({cartCount})</span>
              )}
            </h3>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-500 bg-rose-50/20 border-none rounded-lg px-2.5 py-1 cursor-pointer font-semibold hover:bg-rose-50 flex items-center gap-1"
              >
                <Icon icon="mdi:delete-outline" className="text-sm shrink-0" />
                Limpiar
              </button>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-3.5 py-2.5 flex flex-col gap-2">
            {items.length === 0 ? (
              <EmptyState
                icon="🛒"
                title="Carrito vacío"
                description="Toca un producto para agregar"
              />
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-2.5 items-center bg-slate-50 px-3 py-2.5 rounded-xl"
                >
                  <div className="w-11 h-11 rounded-[10px] overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[22px]">{item.emoji}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-navy overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.name}
                    </p>
                    <p className="text-xs text-teal font-bold">
                      {fmt(item.price * item.qty)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="w-[26px] h-[26px] rounded-[7px] border border-slate-200 bg-white cursor-pointer flex items-center justify-center"
                    >
                      <Icon
                        icon="mdi:minus"
                        className="text-sm text-slate-600"
                      />
                    </button>
                    <span className="text-[13px] font-bold text-navy min-w-[20px] text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => changeQty(item.id, +1)}
                      className="w-[26px] h-[26px] rounded-[7px] border border-slate-200 bg-white cursor-pointer flex items-center justify-center"
                    >
                      <Icon
                        icon="mdi:plus"
                        className="text-sm text-slate-600"
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel de pago */}
          <div className="px-4 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t border-slate-100 flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="font-syne text-base font-bold text-navy">
                Total
              </span>
              <span className="font-syne text-2xl font-extrabold text-teal">
                {fmt(total)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {["efectivo", "tarjeta"].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMethod(m);
                    if (m === "tarjeta") setPaid("");
                  }}
                  className={`py-2.5 rounded-[10px] cursor-pointer font-semibold text-[13px] transition-all duration-150 flex items-center justify-center gap-1.5 ${
                    method === m
                      ? "border-2 border-teal bg-teal-light text-teal"
                      : "border-2 border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  <Icon
                    icon={
                      m === "efectivo" ? "mdi:cash" : "mdi:credit-card-outline"
                    }
                    className="text-base shrink-0"
                  />
                  {m === "efectivo" ? "Efectivo" : "Tarjeta"}
                </button>
              ))}
            </div>

            {method === "efectivo" && (
              <input
                className="input-base text-right text-base font-semibold"
                type="number"
                placeholder="Monto recibido"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
              />
            )}

            {method === "efectivo" && paidNum >= total && total > 0 && (
              <div className="bg-emerald-100 rounded-[10px] px-3.5 py-2.5 flex justify-between items-center">
                <span className="text-[13px] text-emerald-800 font-semibold">
                  Cambio
                </span>
                <span className="font-syne text-lg font-extrabold text-emerald-600">
                  {fmt(change)}
                </span>
              </div>
            )}

            {error && <Alert type="error">{error}</Alert>}
            {validationError && items.length > 0 && (
              <Alert type="warning">{validationError}</Alert>
            )}

            <button
              className="btn-primary w-full py-3 sm:py-3.5 text-[15px]"
              onClick={handleCheckout}
              disabled={!canPay || loading}
            >
              {loading
                ? "Procesando…"
                : `Cobrar ${total > 0 ? fmt(total) : ""}`}
            </button>
          </div>
        </div>
      </div>

      {showHistory && (
        <SaleHistoryModal onClose={() => setShowHistory(false)} />
      )}
      {ticket && <TicketModal sale={ticket} onClose={() => setTicket(null)} />}
    </div>
  );
}
