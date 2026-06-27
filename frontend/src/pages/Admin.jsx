import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function useDragReorder(items, setItems, onReorder) {
  const dragIdx = useRef(null);
  const onDragStart = (i) => { dragIdx.current = i; };
  const onDragOver  = (e, i) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    dragIdx.current = i;
    setItems(next);
  };
  const onDragEnd = () => { dragIdx.current = null; onReorder(items); };
  return { onDragStart, onDragOver, onDragEnd };
}

const EMPTY_FORM = {
  name: "", description: "", price: "", stock: "",
  original_price: "", discount_percent: "", rating: "", image_url: "",
  is_best_seller: false,
};

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab]           = useState("details"); // "details" | "images"
  const [search, setSearch]     = useState("");
  const [msg, setMsg]           = useState(null);
  const [saving, setSaving]     = useState(false);

  // Details form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [dirty, setDirty] = useState(false);

  // Images tab state
  const [images, setImages]   = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [preview, setPreview]   = useState("");
  const [imgSaving, setImgSaving] = useState(false);

  const { onDragStart, onDragOver, onDragEnd } = useDragReorder(images, setImages, saveOrder);

  useEffect(() => {
    api.get("/products/").then(r => setProducts(r.data)).catch(console.error);
  }, []);

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const selectProduct = async (p) => {
    setSelected(p);
    setForm({
      name:             p.name            ?? "",
      description:      p.description     ?? "",
      price:            p.price           ?? "",
      stock:            p.stock           ?? "",
      original_price:   p.original_price  ?? "",
      discount_percent: p.discount_percent ?? "",
      rating:           p.rating          ?? "",
      image_url:        p.image_url       ?? "",
      is_best_seller:   p.is_best_seller  ?? false,
    });
    setDirty(false);
    setUrlInput("");
    setPreview("");
    await loadImages(p.id);
  };

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setDirty(true);
  };

  const saveDetails = async () => {
    if (!selected || !dirty) return;
    setSaving(true);
    try {
      const payload = {
        name:             form.name             || undefined,
        description:      form.description      || undefined,
        price:            form.price !== ""     ? Number(form.price)            : undefined,
        stock:            form.stock !== ""     ? Number(form.stock)            : undefined,
        original_price:   form.original_price !== "" ? Number(form.original_price) : undefined,
        discount_percent: form.discount_percent !== "" ? Number(form.discount_percent) : undefined,
        rating:           form.rating !== ""    ? Number(form.rating)           : undefined,
        image_url:        form.image_url        || undefined,
        is_best_seller:   form.is_best_seller,
      };
      const res = await api.put(`/products/${selected.id}`, payload);
      // Update products list so sidebar reflects new price/name
      setProducts(prev => prev.map(p => p.id === selected.id ? { ...p, ...res.data } : p));
      setSelected(prev => ({ ...prev, ...res.data }));
      setDirty(false);
      flash("Product updated successfully!");
    } catch (e) {
      console.error(e);
      flash("Failed to save changes", false);
    } finally { setSaving(false); }
  };

  // ── Image helpers ─────────────────────────────────────────────────────────
  const loadImages = async (pid) => {
    try {
      const r = await api.get(`/product-images/${pid}`);
      setImages(r.data);
    } catch { setImages([]); }
  };

  const addImage = async () => {
    if (!urlInput.trim()) return;
    setImgSaving(true);
    try {
      const r = await api.post("/product-images/", { product_id: selected.id, image_url: urlInput.trim() });
      setImages(prev => [...prev, r.data]);
      setUrlInput("");
      setPreview("");
      flash("Image added to database!");
    } catch { flash("Failed to add image", false); }
    finally { setImgSaving(false); }
  };

  const deleteImage = async (id) => {
    await api.delete(`/product-images/${id}`).catch(console.error);
    setImages(prev => prev.filter(i => i.id !== id));
    flash("Image deleted");
  };

  const setPrimary = async (id) => {
    await api.put(`/product-images/set-primary/${id}`).catch(console.error);
    await loadImages(selected.id);
    flash("Set as primary image!");
  };

  async function saveOrder(currentItems) {
    const ids = (currentItems || images).map(i => i.id);
    await api.put("/product-images/reorder", { image_ids: ids }).catch(console.error);
    flash("Order saved!");
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  const inp = (extra = {}) => ({
    padding: "9px 12px", border: "1px solid #d5d9d9", borderRadius: "6px",
    fontSize: "14px", fontFamily: "inherit", outline: "none",
    boxSizing: "border-box", width: "100%", ...extra,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f2" }}>

      {/* Top bar */}
      <div style={{ background: "#131921", padding: "12px 24px", display: "flex", alignItems: "center", gap: "20px" }}>
        <Link to="/" style={{ color: "#FF9900", fontWeight: "900", fontSize: "20px", textDecoration: "none", letterSpacing: "-0.5px" }}>
          amazon<span style={{ color: "rgba(255,153,0,0.6)", fontSize: "12px", marginLeft: "2px" }}>admin</span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Product Manager</span>
        <div style={{ marginLeft: "auto" }}>
          <Link to="/" style={{ color: "white", fontSize: "13px", textDecoration: "none" }}>← Back to store</Link>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{ position: "fixed", top: "72px", right: "24px", zIndex: 9999, background: msg.ok ? "#067D62" : "#CC0C39", color: "white", padding: "12px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", animation: "toastIn 0.25s ease" }}>
          {msg.text}
        </div>
      )}
      <style>{`@keyframes toastIn { from { opacity:0;transform:translateY(-10px); } to { opacity:1;transform:translateY(0); } }`}</style>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 52px)" }}>

        {/* LEFT: product list */}
        <div style={{ background: "white", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f2f2" }}>
            <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "8px", color: "#0F1111" }}>Products ({filtered.length})</div>
            <input
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inp(), fontSize: "13px" }}
            />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.map(p => (
              <div
                key={p.id}
                onClick={() => selectProduct(p)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", cursor: "pointer", background: selected?.id === p.id ? "#fff8ee" : "white", borderLeft: selected?.id === p.id ? "3px solid #FF9900" : "3px solid transparent", borderBottom: "1px solid #f7f8f9", transition: "background 0.1s" }}
                onMouseEnter={e => { if (selected?.id !== p.id) e.currentTarget.style.background = "#f7f8f9"; }}
                onMouseLeave={e => { if (selected?.id !== p.id) e.currentTarget.style.background = "white"; }}
              >
                <img src={p.image_url} alt={p.name} style={{ width: "40px", height: "40px", objectFit: "contain", flexShrink: 0, mixBlendMode: "multiply" }} onError={e => e.currentTarget.style.display = "none"} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0F1111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "1px", display: "flex", gap: "6px" }}>
                    <span>₹{p.price?.toLocaleString("en-IN")}</span>
                    <span>·</span>
                    <span style={{ color: p.stock > 5 ? "#007600" : p.stock > 0 ? "#CC7722" : "#CC0C39" }}>
                      {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT panel */}
        <div style={{ overflowY: "auto" }}>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", color: "#888", gap: "12px" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#565959" }}>Select a product to edit</div>
              <div style={{ fontSize: "13px" }}>Update price, stock, images and more</div>
            </div>
          ) : (
            <div style={{ padding: "24px", maxWidth: "900px" }}>

              {/* Product header */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <img src={selected.image_url} alt={selected.name} style={{ width: "52px", height: "52px", objectFit: "contain", background: "white", borderRadius: "8px", border: "1px solid #e0e0e0", padding: "4px", mixBlendMode: "multiply", flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0F1111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name}</h2>
                  <div style={{ fontSize: "13px", color: "#565959", marginTop: "2px" }}>{selected.category_name} · ID #{selected.id}</div>
                </div>
                <a href={`/product/${selected.id}`} target="_blank" rel="noreferrer" style={{ fontSize: "13px", color: "#007185", textDecoration: "none", flexShrink: 0 }}>View product →</a>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "20px", borderBottom: "2px solid #e8e8e8" }}>
                {[
                  { key: "details", label: "📝 Product Details" },
                  { key: "images",  label: `🖼️ Images (${images.length})` },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    style={{ padding: "10px 20px", background: "none", border: "none", borderBottom: tab === t.key ? "2px solid #FF9900" : "2px solid transparent", marginBottom: "-2px", fontSize: "14px", fontWeight: tab === t.key ? "700" : "500", color: tab === t.key ? "#0F1111" : "#565959", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── TAB: DETAILS ── */}
              {tab === "details" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* Row 1: Name */}
                  <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e0e0e0", padding: "20px" }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "700", color: "#0F1111" }}>Basic Info</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#565959", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Product Name</label>
                        <input value={form.name} onChange={e => handleFormChange("name", e.target.value)} style={inp()} />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#565959", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Description</label>
                        <textarea value={form.description} onChange={e => handleFormChange("description", e.target.value)} rows={4} style={{ ...inp(), resize: "vertical", lineHeight: "1.6" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#565959", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Main Image URL</label>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <input value={form.image_url} onChange={e => handleFormChange("image_url", e.target.value)} placeholder="https://…" style={{ ...inp(), flex: 1 }} />
                          {form.image_url && (
                            <img src={form.image_url} alt="preview" style={{ width: "52px", height: "52px", objectFit: "contain", background: "#f7f8f9", borderRadius: "6px", border: "1px solid #e0e0e0", flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Pricing */}
                  <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e0e0e0", padding: "20px" }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "700", color: "#0F1111" }}>Pricing</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#565959", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Sale Price (₹)</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#565959", fontSize: "14px" }}>₹</span>
                          <input type="number" value={form.price} onChange={e => handleFormChange("price", e.target.value)} style={{ ...inp(), paddingLeft: "26px" }} min={0} />
                        </div>
                        {form.price && <div style={{ fontSize: "11px", color: "#007600", marginTop: "3px" }}>Current: ₹{Number(selected.price).toLocaleString("en-IN")}</div>}
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#565959", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Original / MRP (₹)</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#565959", fontSize: "14px" }}>₹</span>
                          <input type="number" value={form.original_price} onChange={e => handleFormChange("original_price", e.target.value)} placeholder="MRP before discount" style={{ ...inp(), paddingLeft: "26px" }} min={0} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#565959", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Discount (%)</label>
                        <input type="number" value={form.discount_percent} onChange={e => handleFormChange("discount_percent", e.target.value)} placeholder="0–90" style={inp()} min={0} max={90} />
                        {form.price && form.original_price && Number(form.original_price) > 0 && (
                          <div style={{ fontSize: "11px", color: "#CC7722", marginTop: "3px" }}>
                            Auto-calc: {Math.round((1 - form.price / form.original_price) * 100)}% off
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Live price preview */}
                    {(form.price || form.original_price) && (
                      <div style={{ marginTop: "14px", background: "#f7f8f9", borderRadius: "8px", padding: "12px 16px", display: "flex", gap: "20px", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "#565959", fontWeight: "600" }}>Preview:</span>
                        {form.discount_percent > 0 && <span style={{ background: "#CC0C39", color: "white", fontSize: "12px", fontWeight: "800", padding: "2px 7px", borderRadius: "3px" }}>-{form.discount_percent}%</span>}
                        <span style={{ fontSize: "22px", fontWeight: "700", color: "#0F1111" }}>₹{Number(form.price || 0).toLocaleString("en-IN")}</span>
                        {form.original_price && Number(form.original_price) > Number(form.price) && (
                          <span style={{ fontSize: "14px", color: "#888" }}>M.R.P.: <s>₹{Number(form.original_price).toLocaleString("en-IN")}</s></span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Row 3: Inventory + Ratings */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e0e0e0", padding: "20px" }}>
                      <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "700", color: "#0F1111" }}>Inventory</h3>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#565959", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Stock Quantity</label>
                        <input type="number" value={form.stock} onChange={e => handleFormChange("stock", e.target.value)} style={inp()} min={0} />
                        {form.stock !== "" && (
                          <div style={{ marginTop: "8px", fontSize: "13px", fontWeight: "700", color: Number(form.stock) > 5 ? "#007600" : Number(form.stock) > 0 ? "#CC7722" : "#CC0C39" }}>
                            {Number(form.stock) > 5 ? "✓ In Stock" : Number(form.stock) > 0 ? `⚠ Only ${form.stock} left!` : "✕ Out of Stock"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e0e0e0", padding: "20px" }}>
                      <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "700", color: "#0F1111" }}>Ratings & Visibility</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "12px", fontWeight: "700", color: "#565959", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Rating (1–5)</label>
                          <input type="number" value={form.rating} onChange={e => handleFormChange("rating", e.target.value)} step={0.1} min={1} max={5} style={inp()} />
                          {form.rating && (
                            <div style={{ fontSize: "13px", color: "#FF9900", marginTop: "4px" }}>
                              {"★".repeat(Math.round(form.rating))}{"☆".repeat(5 - Math.round(form.rating))} {Number(form.rating).toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "4px" }}>
                          <div
                            onClick={() => handleFormChange("is_best_seller", !form.is_best_seller)}
                            style={{ width: "42px", height: "24px", borderRadius: "12px", background: form.is_best_seller ? "#FF9900" : "#d5d9d9", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                          >
                            <div style={{ position: "absolute", top: "3px", left: form.is_best_seller ? "21px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F1111" }}>#1 Best Seller Badge</div>
                            <div style={{ fontSize: "11px", color: "#565959" }}>{form.is_best_seller ? "Shown on product page" : "Hidden"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", paddingBottom: "12px" }}>
                    <button
                      onClick={saveDetails}
                      disabled={!dirty || saving}
                      style={{ padding: "12px 32px", background: dirty ? "#FFD814" : "#f0f2f2", border: "1px solid", borderColor: dirty ? "#FCD200" : "#d5d9d9", borderRadius: "8px", fontSize: "15px", fontWeight: "800", cursor: dirty ? "pointer" : "not-allowed", color: "#0F1111", fontFamily: "inherit", transition: "all 0.15s" }}
                      onMouseEnter={e => { if (dirty) e.currentTarget.style.background = "#F7CA00"; }}
                      onMouseLeave={e => { if (dirty) e.currentTarget.style.background = "#FFD814"; }}
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    {dirty && (
                      <button
                        onClick={() => { selectProduct(selected); }}
                        style={{ padding: "12px 20px", background: "white", border: "1px solid #d5d9d9", borderRadius: "8px", fontSize: "14px", cursor: "pointer", color: "#565959", fontFamily: "inherit" }}
                      >
                        Discard
                      </button>
                    )}
                    {!dirty && !saving && <span style={{ fontSize: "13px", color: "#888" }}>All changes saved</span>}
                  </div>
                </div>
              )}

              {/* ── TAB: IMAGES ── */}
              {tab === "images" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* Add image */}
                  <div style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "20px" }}>
                    <h3 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: "700", color: "#0F1111" }}>Add Image to Database</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "flex-start" }}>
                      <div>
                        <input value={urlInput} onChange={e => { setUrlInput(e.target.value); setPreview(e.target.value.trim()); }} onKeyDown={e => e.key === "Enter" && addImage()} placeholder="Paste any public image URL…" style={inp()} />
                        <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>Unsplash, Amazon CDN, brand website, etc.</div>
                      </div>
                      <button onClick={addImage} disabled={!urlInput.trim() || imgSaving} style={{ padding: "10px 20px", background: urlInput.trim() ? "#FFD814" : "#f0f2f2", border: "1px solid", borderColor: urlInput.trim() ? "#FCD200" : "#d5d9d9", borderRadius: "6px", fontSize: "14px", fontWeight: "700", cursor: urlInput.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", color: "#0F1111", whiteSpace: "nowrap", marginTop: "1px" }}>
                        {imgSaving ? "Saving…" : "+ Add to DB"}
                      </button>
                    </div>
                    {preview && (
                      <div style={{ marginTop: "12px", display: "flex", gap: "12px", alignItems: "flex-start", background: "#f7f8f9", borderRadius: "8px", padding: "12px" }}>
                        <img src={preview} alt="preview" style={{ width: "72px", height: "72px", objectFit: "contain", background: "white", borderRadius: "6px", border: "1px solid #e0e0e0", flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "700", color: "#0F1111", marginBottom: "3px" }}>Live Preview</div>
                          <div style={{ fontSize: "11px", color: "#565959", wordBreak: "break-all" }}>{preview}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gallery grid */}
                  <div style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                      <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0F1111" }}>Gallery ({images.length} images)</h3>
                      {images.length > 1 && <div style={{ fontSize: "12px", color: "#888" }}>Drag to reorder · First = primary</div>}
                    </div>
                    {images.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px", color: "#888", background: "#f7f8f9", borderRadius: "8px", border: "2px dashed #d5d9d9" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600" }}>No images yet</div>
                        <div style={{ fontSize: "12px", marginTop: "4px" }}>Paste a URL above to add the first image</div>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "12px" }}>
                        {images.map((img, i) => (
                          <div key={img.id} draggable onDragStart={() => onDragStart(i)} onDragOver={e => onDragOver(e, i)} onDragEnd={() => onDragEnd()} style={{ background: "#f7f8f9", borderRadius: "8px", border: i === 0 ? "2px solid #FF9900" : "2px solid #e0e0e0", overflow: "hidden", cursor: "grab", position: "relative" }}>
                            {i === 0 && <div style={{ position: "absolute", top: "7px", left: "7px", background: "#FF9900", color: "#0F1111", fontSize: "9px", fontWeight: "800", padding: "2px 6px", borderRadius: "3px", zIndex: 2 }}>PRIMARY</div>}
                            <div style={{ position: "absolute", top: "7px", right: "7px", background: "rgba(255,255,255,0.85)", borderRadius: "4px", padding: "2px 5px", zIndex: 2, fontSize: "12px", color: "#888", cursor: "grab" }}>⠿</div>
                            <div style={{ position: "absolute", bottom: "42px", left: "7px", background: "rgba(0,0,0,0.55)", color: "white", fontSize: "10px", fontWeight: "700", padding: "2px 5px", borderRadius: "3px", zIndex: 2 }}>#{i + 1}</div>
                            <img src={img.image_url} alt={`Image ${i + 1}`} style={{ width: "100%", height: "150px", objectFit: "contain", background: "white", padding: "8px", boxSizing: "border-box", display: "block", mixBlendMode: "multiply" }} onError={e => { e.currentTarget.style.background = "#f0f2f2"; }} />
                            <div style={{ padding: "7px", display: "flex", gap: "5px" }}>
                              {i !== 0 && <button onClick={() => setPrimary(img.id)} style={{ flex: 1, padding: "5px 0", background: "white", border: "1px solid #d5d9d9", borderRadius: "4px", fontSize: "11px", cursor: "pointer", color: "#007185", fontWeight: "600", fontFamily: "inherit" }}>★ Primary</button>}
                              <button onClick={() => deleteImage(img.id)} style={{ flex: i === 0 ? 1 : "none", padding: "5px 8px", background: "white", border: "1px solid #e0e0e0", borderRadius: "4px", fontSize: "11px", cursor: "pointer", color: "#CC0C39", fontWeight: "600", fontFamily: "inherit" }}>Delete</button>
                            </div>
                          </div>
                        ))}
                        <div onClick={() => document.querySelector("input[placeholder*='Paste']")?.focus()} style={{ background: "#f7f8f9", border: "2px dashed #d5d9d9", borderRadius: "8px", height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#888", gap: "6px", transition: "border-color 0.15s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#FF9900"} onMouseLeave={e => e.currentTarget.style.borderColor = "#d5d9d9"}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                          <span style={{ fontSize: "12px", fontWeight: "600" }}>Add image</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
