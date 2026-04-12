import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { productService } from "../services";
import { fmt, CATEGORIES } from "../utils/helpers";
import {
  Modal,
  Spinner,
  Alert,
  EmptyState,
  Field,
} from "../components/shared/UI";
import { Icon } from "@iconify/react";

const ALL = ["Todos", ...CATEGORIES];

function ImageUploader({ productId, currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || null);
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
        className={`w-full h-[140px] rounded-xl overflow-hidden border-2 border-dashed border-teal/40 ${uploading ? "cursor-wait" : "cursor-pointer"} bg-[#F0FDFA] flex items-center justify-center relative transition-colors`}
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-teal">
            <div className="text-[32px] mb-1.5">📷</div>
            <p className="text-xs font-semibold">Subir imagen</p>
            <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG o WEBP</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <Spinner size={28} />
          </div>
        )}
        {preview && !uploading && (
          <div className="absolute bottom-2 right-2 bg-teal text-white rounded-lg px-2.5 py-1 text-[11px] font-semibold">
            Cambiar
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

export default function InventoryPage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin");

  const {
    data: products,
    loading,
    refetch,
  } = useFetch(() => productService.getAll());

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Todos");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = (products || []).filter(
    (p) =>
      (cat === "Todos" || p.category === cat) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const lowStock = (products || []).filter((p) => p.is_low_stock);

  const openAdd = () => {
    setForm({
      name: "",
      category: "Paletas",
      price: "",
      stock: "",
      stock_alert: 10,
      emoji: "🍦",
      image_url: null,
    });
    setModal("add");
  };
  const openEdit = (p) => {
    setForm({ ...p });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return setError("El nombre es requerido");
    if (!form.price || form.price <= 0)
      return setError("El precio debe ser mayor a 0");
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        stock_alert: Number(form.stock_alert || 10),
        emoji: form.emoji || "🍦",
      };
      if (modal === "add") {
        await productService.create(payload);
      } else {
        await productService.update(form.id, payload);
      }
      setModal(null);
      refetch();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fade-in p-5 flex flex-col gap-4 h-full overflow-y-auto">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
        <div className="flex gap-2.5 flex-1 min-w-0">
          <input
            className="input-base flex-1 min-w-0 sm:max-w-[260px]"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input-base w-auto min-w-[140px]"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            {ALL.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        {canEdit && (
          <button
            className="btn-primary sm:ml-auto w-full sm:w-auto flex items-center justify-center gap-1.5"
            onClick={openAdd}
          >
            <Icon icon="fluent-mdl2:add-in" className="text-lg" />
            Agregar producto
          </button>
        )}
      </div>

      {/* Alerta stock bajo */}
      {lowStock.length > 0 && (
        <Alert type="warning">
          <div className="flex items-start gap-2">
            <Icon icon="mdi:alert" className="text-lg shrink-0 mt-0.5" />
            <p>
              <strong>{lowStock.length} producto(s) con stock crítico:</strong>{" "}
              {lowStock.map((p) => p.name).join(", ")}
            </p>
          </div>
        </Alert>
      )}

      {/* Grid */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Sin productos"
          description="Agrega el primero con el botón superior"
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className={`card overflow-hidden ${canEdit ? "cursor-pointer" : "cursor-default"}`}
              onClick={() => canEdit && openEdit(p)}
            >
              {/* Imagen */}
              <div className="w-full h-[120px] bg-slate-50 flex items-center justify-center overflow-hidden">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">{p.emoji}</span>
                )}
              </div>
              <div className="px-3.5 py-3">
                <div className="flex justify-between items-start mb-1.5">
                  <p className="font-semibold text-navy text-sm">{p.name}</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ml-1.5 ${
                      p.is_low_stock
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {p.stock} uds
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-1.5">{p.category}</p>
                <p className="font-syne text-teal font-bold text-lg">
                  {fmt(p.price)}
                </p>
                {canEdit && (
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Toca para editar
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal
          title={modal === "add" ? "Agregar producto" : "Editar producto"}
          onClose={() => setModal(null)}
          icon={modal === "add" ? "fluent-mdl2:add-in" : "mdi:pencil"}
        >
          <div className="flex flex-col gap-3">
            {error && <Alert type="error">{error}</Alert>}

            {modal === "edit" && (
              <Field label="Imagen del producto">
                <ImageUploader
                  productId={form.id}
                  currentUrl={form.image_url}
                  onUploaded={(url) => set("image_url", url)}
                />
              </Field>
            )}

            <Field label="Nombre">
              <input
                className="input-base"
                value={form.name || ""}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ej: Paleta de Fresa"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Precio ($)">
                <input
                  className="input-base"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price || ""}
                  onChange={(e) => set("price", e.target.value)}
                />
              </Field>
              <Field label="Stock">
                <input
                  className="input-base"
                  type="number"
                  min="0"
                  value={form.stock || ""}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Alerta mínima">
                <input
                  className="input-base"
                  type="number"
                  min="0"
                  value={form.stock_alert ?? 10}
                  onChange={(e) => set("stock_alert", e.target.value)}
                />
              </Field>
              <Field label="Emoji (fallback)">
                <input
                  className="input-base"
                  value={form.emoji || "🍦"}
                  onChange={(e) => set("emoji", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Categoría">
              <select
                className="input-base"
                value={form.category || "Paletas"}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            {modal === "add" && (
              <p className="text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                💡 Podrás subir la imagen después de crear el producto,
                editándolo.
              </p>
            )}

            <div className="flex gap-2.5 mt-1">
              <button
                className="btn-ghost flex-1"
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary flex-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
