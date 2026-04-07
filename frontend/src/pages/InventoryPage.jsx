import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { productService } from "../services";
import { fmt, CATEGORIES } from "../utils/helpers";
import { Modal, Spinner, Alert, EmptyState, Field } from "../components/shared/UI";

const ALL = ["Todos", ...CATEGORIES];

function ImageUploader({ productId, currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(currentUrl || null);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = await productService.uploadImage(productId, file);
      onUploaded(res.data.image_url);
    } catch (err) {
      alert(err.response?.data?.error || "Error al subir imagen");
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current.click()}
        style={{
          width: "100%", height: 140, borderRadius: 12, overflow: "hidden",
          border: "2px dashed #0D948866", cursor: uploading ? "wait" : "pointer",
          background: "#F0FDFA", display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", transition: "border-color .15s",
        }}
      >
        {preview
          ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ textAlign: "center", color: "#0D9488" }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>📷</div>
              <p style={{ fontSize: 12, fontWeight: 600 }}>Subir imagen</p>
              <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>JPG, PNG o WEBP</p>
            </div>
        }
        {uploading && (
          <div style={{ position: "absolute", inset: 0, background: "#fff9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Spinner size={28} />
          </div>
        )}
        {preview && !uploading && (
          <div style={{ position: "absolute", bottom: 8, right: 8, background: "#0D9488", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>
            Cambiar
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

export default function InventoryPage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin");

  const { data: products, loading, refetch } = useFetch(() => productService.getAll());

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

  const openAdd  = () => { setForm({ name: "", category: "Paletas", price: "", stock: "", stock_alert: 10, emoji: "🍦", image_url: null }); setModal("add"); };
  const openEdit = (p) => { setForm({ ...p }); setModal("edit"); };

  const handleSave = async () => {
    if (!form.name?.trim())    return setError("El nombre es requerido");
    if (!form.price || form.price <= 0) return setError("El precio debe ser mayor a 0");
    setError(""); setSaving(true);
    try {
      const payload = { name: form.name.trim(), category: form.category, price: Number(form.price), stock: Number(form.stock || 0), stock_alert: Number(form.stock_alert || 10), emoji: form.emoji || "🍦" };
      if (modal === "add") {
        await productService.create(payload);
      } else {
        await productService.update(form.id, payload);
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
        <input className="input-base" style={{ maxWidth: 260 }} placeholder="Buscar…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input-base" style={{ width: "auto", minWidth: 140 }} value={cat} onChange={e => setCat(e.target.value)}>
          {ALL.map(c => <option key={c}>{c}</option>)}
        </select>
        {canEdit && (
          <button className="btn-primary" onClick={openAdd} style={{ marginLeft: "auto" }}>+ Agregar producto</button>
        )}
      </div>

      {/* Alerta stock bajo */}
      {lowStock.length > 0 && (
        <Alert type="warning">
          ⚠️ <strong>{lowStock.length} producto(s) con stock crítico:</strong>{" "}
          {lowStock.map(p => p.name).join(", ")}
        </Alert>
      )}

      {/* Grid */}
      {loading
        ? <Spinner />
        : filtered.length === 0
        ? <EmptyState icon="📦" title="Sin productos" description="Agrega el primero con el botón superior" />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
            {filtered.map(p => (
              <div key={p.id} className="card" style={{ overflow: "hidden", cursor: canEdit ? "pointer" : "default" }}
                onClick={() => canEdit && openEdit(p)}>
                {/* Imagen */}
                <div style={{ width: "100%", height: 120, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 48 }}>{p.emoji}</span>
                  }
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <p style={{ fontWeight: 600, color: "#0F2D40", fontSize: 14 }}>{p.name}</p>
                    <span style={{
                      padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 6,
                      background: p.is_low_stock ? "#FFE4E6" : "#D1FAE5",
                      color:      p.is_low_stock ? "#BE123C" : "#065F46",
                    }}>{p.stock} uds</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>{p.category}</p>
                  <p style={{ fontFamily: "Syne,sans-serif", color: "#0D9488", fontWeight: 700, fontSize: 18 }}>{fmt(p.price)}</p>
                  {canEdit && <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>Toca para editar</p>}
                </div>
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

            {/* Upload imagen — solo en edición (necesitamos el ID) */}
            {modal === "edit" && (
              <Field label="Imagen del producto">
                <ImageUploader
                  productId={form.id}
                  currentUrl={form.image_url}
                  onUploaded={url => set("image_url", url)}
                />
              </Field>
            )}

            <Field label="Nombre">
              <input className="input-base" value={form.name || ""} onChange={e => set("name", e.target.value)} placeholder="Ej: Paleta de Fresa" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Precio ($)">
                <input className="input-base" type="number" min="0.01" step="0.01" value={form.price || ""} onChange={e => set("price", e.target.value)} />
              </Field>
              <Field label="Stock">
                <input className="input-base" type="number" min="0" value={form.stock || ""} onChange={e => set("stock", e.target.value)} />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Alerta mínima">
                <input className="input-base" type="number" min="0" value={form.stock_alert ?? 10} onChange={e => set("stock_alert", e.target.value)} />
              </Field>
              <Field label="Emoji (fallback)">
                <input className="input-base" value={form.emoji || "🍦"} onChange={e => set("emoji", e.target.value)} />
              </Field>
            </div>
            <Field label="Categoría">
              <select className="input-base" value={form.category || "Paletas"} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>

            {modal === "add" && (
              <p style={{ fontSize: 11, color: "#94A3B8", background: "#F8FAFC", borderRadius: 8, padding: "8px 12px" }}>
                💡 Podrás subir la imagen después de crear el producto, editándolo.
              </p>
            )}

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
