import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { productService, inventoryService } from "../services";
import { fmt, CATEGORIES } from "../utils/helpers";
import { Modal, Spinner, Alert, EmptyState, Field } from "../components/shared/UI";

const ALL = ["Todos", ...CATEGORIES];

export default function InventoryPage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin");

  const { data: products, loading, refetch } = useFetch(() => inventoryService.getAll());

  const [search,  setSearch]  = useState("");
  const [cat,     setCat]     = useState("Todos");
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const filtered = (products || []).filter(p =>
    (cat === "Todos" || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = (products || []).filter(p => p.is_low_stock);

  const openAdd  = () => { setForm({ name: "", category: "Paletas", price: "", stock: "", stock_alert: 10, emoji: "🍦" }); setModal("add"); };
  const openEdit = (p) => { setForm({ ...p }); setModal("edit"); };

  const handleSave = async () => {
    setError(""); setSaving(true);
    try {
      if (modal === "add") {
        await productService.create({ ...form, price: Number(form.price), stock: Number(form.stock), stock_alert: Number(form.stock_alert) });
      } else {
        await productService.update(form.id, { ...form, price: Number(form.price), stock: Number(form.stock) });
      }
      setModal(null); refetch();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fade-in" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, height: "100%", overflowY: "auto" }}>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <input className="input-base" style={{ maxWidth: 260 }} placeholder="🔍 Buscar…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input-base" style={{ width: "auto", minWidth: 140 }} value={cat} onChange={e => setCat(e.target.value)}>
          {ALL.map(c => <option key={c}>{c}</option>)}
        </select>
        {canEdit && (
          <button className="btn-primary" onClick={openAdd} style={{ marginLeft: "auto" }}>+ Agregar producto</button>
        )}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <Alert type="warning">
          ⚠️ <strong>{lowStock.length} producto(s) con stock crítico:</strong>{" "}
          {lowStock.map(p => `${p.emoji} ${p.name}`).join(", ")}
        </Alert>
      )}

      {/* Grid */}
      {loading
        ? <Spinner />
        : filtered.length === 0
        ? <EmptyState icon="📦" title="Sin productos" description="Agrega el primero con el botón superior" />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14 }}>
            {filtered.map(p => (
              <div key={p.id} className="card" style={{ padding: 16, cursor: canEdit ? "pointer" : "default", transition: "transform .15s" }}
                onClick={() => canEdit && openEdit(p)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 30 }}>{p.emoji}</span>
                  <span style={{
                    padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                    background: p.is_low_stock ? "#FFE4E6" : "#D1FAE5",
                    color:      p.is_low_stock ? "#BE123C" : "#065F46",
                  }}>{p.stock} uds</span>
                </div>
                <p style={{ fontWeight: 600, color: "#0F2D40", fontSize: 14, marginBottom: 3 }}>{p.name}</p>
                <p style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>{p.category}</p>
                <p style={{ fontFamily: "Syne,sans-serif", color: "#0D9488", fontWeight: 700, fontSize: 18 }}>{fmt(p.price)}</p>
                {canEdit && <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>Toca para editar</p>}
              </div>
            ))}
          </div>
        )
      }

      {/* Modal */}
      {modal && (
        <Modal title={modal === "add" ? "Agregar producto" : "Editar producto"} onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {error && <Alert type="error">{error}</Alert>}
            <Field label="Nombre">
              <input className="input-base" value={form.name || ""} onChange={e => set("name", e.target.value)} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Precio ($)">
                <input className="input-base" type="number" value={form.price || ""} onChange={e => set("price", e.target.value)} />
              </Field>
              <Field label="Stock">
                <input className="input-base" type="number" value={form.stock || ""} onChange={e => set("stock", e.target.value)} />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Alerta mínima">
                <input className="input-base" type="number" value={form.stock_alert || 10} onChange={e => set("stock_alert", e.target.value)} />
              </Field>
              <Field label="Emoji">
                <input className="input-base" value={form.emoji || "🍦"} onChange={e => set("emoji", e.target.value)} />
              </Field>
            </div>
            <Field label="Categoría">
              <select className="input-base" value={form.category || "Paletas"} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button className="btn-ghost" onClick={() => setModal(null)} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
