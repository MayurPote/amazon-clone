import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

// ── Drag-to-reorder helpers ─────────────────────────────────────────────────
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

export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts]   = useState([]);
  const [selected, setSelected]   = useState(null);   // selected product
  const [images, setImages]       = useState([]);
  const [urlInput, setUrlInput]   = useState("");
  const [preview, setPreview]     = useState("");      // live URL preview
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [msg, setMsg]             = useState(null);    // { text, ok }

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
    setUrlInput("");
    setPreview("");
    await loadImages(p.id);
  };

  const loadImages = async (pid) => {
    try {
      const r = await api.get(`/product-images/${pid}`);
      setImages(r.data);
    } catch { setImages([]); }
  };

  const addImage = async () => {
    if (!urlInput.trim()) return;
    setSaving(true);
    try {
      const r = await api.post("/product-images/", { product_id: selected.id, image_url: urlInput.trim() });
      setImages(prev => [...prev, r.data]);
      setUrlInput("");
      setPreview("");
      flash("Image added to database!");
    } catch { flash("Failed to add image", false); }
    finally { setSaving(false); }
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

  const inputStyle = {
    width: "100%", padding: "9px 12px", border: "1px solid #d5d9d9",
    borderRadius: "6px", fontSize: "14px", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f2" }}>

      {/* Top bar */}
      <div style={{ background: "#131921", padding: "12px 24px", display: "flex", alignItems: "center", gap: "20px" }}>
        <Link to="/" style={{ color: "#FF9900", fontWeight: "900", fontSize: "20px", textDecoration: "none", letterSpacing: "-0.5px" }}>
          amazon<span style={{ color: "rgba(255,153,0,0.6)", fontSize: "12px", marginLeft: "2px" }}>admin</span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Product Image Manager</span>
        <div style={{ marginLeft: "auto" }}>
          <Link to="/" style={{ color: "white", fontSize: "13px", textDecoration: "none" }}>← Back to store</Link>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{
          position: "fixed", top: "72px", right: "24px", zIndex: 9999,
          background: msg.ok ? "#067D62" : "#CC0C39", color: "white",
          padding: "12px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)", animation: "toastIn 0.25s ease",
        }}>
          {msg.text}
        </div>
      )}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", minHeight: "calc(100vh - 52px)" }}>

        {/* LEFT: product list */}
        <div style={{ background: "white", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #f0f2f2" }}>
            <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "10px", color: "#0F1111" }}>
              Products ({filtered.length})
            </div>
            <input
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle }}
            />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.map(p => (
              <div
                key={p.id}
                onClick={() => selectProduct(p)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", cursor: "pointer",
                  background: selected?.id === p.id ? "#fff8ee" : "white",
                  borderLeft: selected?.id === p.id ? "3px solid #FF9900" : "3px solid transparent",
                  borderBottom: "1px solid #f7f8f9",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { if (selected?.id !== p.id) e.currentTarget.style.background = "#f7f8f9"; }}
                onMouseLeave={e => { if (selected?.id !== p.id) e.currentTarget.style.background = "white"; }}
              >
                <img
                  src={p.image_url}
                  alt={p.name}
                  style={{ width: "44px", height: "44px", objectFit: "contain", flexShrink: 0, mixBlendMode: "multiply" }}
                  onError={e => e.currentTarget.style.display = "none"}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0F1111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    {p.category_name} · ₹{p.price?.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: image manager */}
        <div style={{ padding: "24px", overflowY: "auto" }}>

          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", color: "#888" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px" }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#565959" }}>Select a product to manage its images</div>
              <div style={{ fontSize: "13px", marginTop: "6px" }}>All changes save directly to the database</div>
            </div>
          ) : (
            <div style={{ maxWidth: "860px" }}>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <img src={selected.image_url} alt={selected.name} style={{ width: "56px", height: "56px", objectFit: "contain", background: "white", borderRadius: "8px", border: "1px solid #e0e0e0", padding: "4px", mixBlendMode: "multiply" }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#0F1111" }}>{selected.name}</h2>
                  <div style={{ fontSize: "13px", color: "#565959", marginTop: "2px" }}>
                    {selected.category_name} · {images.length} image{images.length !== 1 ? "s" : ""} in database
                  </div>
                </div>
                <a href={`/product/${selected.id}`} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", fontSize: "13px", color: "#007185" }}>
                  View product →
                </a>
              </div>

              {/* Add image section */}
              <div style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: "#0F1111" }}>
                  Add Image to Database
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "flex-start" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#565959", display: "block", marginBottom: "6px" }}>
                      Image URL
                    </label>
                    <input
                      value={urlInput}
                      onChange={e => { setUrlInput(e.target.value); setPreview(e.target.value.trim()); }}
                      onKeyDown={e => e.key === "Enter" && addImage()}
                      placeholder="https://images.unsplash.com/photo-… or any image URL"
                      style={{ ...inputStyle }}
                    />
                    <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                      Paste any public image URL — Unsplash, Amazon CDN, brand website, etc.
                    </div>
                  </div>
                  <button
                    onClick={addImage}
                    disabled={!urlInput.trim() || saving}
                    style={{
                      marginTop: "22px", padding: "10px 22px",
                      background: urlInput.trim() ? "#FFD814" : "#f0f2f2",
                      border: "1px solid", borderColor: urlInput.trim() ? "#FCD200" : "#d5d9d9",
                      borderRadius: "6px", fontSize: "14px", fontWeight: "700",
                      cursor: urlInput.trim() ? "pointer" : "not-allowed", fontFamily: "inherit",
                      color: "#0F1111", whiteSpace: "nowrap",
                    }}
                  >
                    {saving ? "Saving…" : "+ Add to DB"}
                  </button>
                </div>

                {/* Live URL preview */}
                {preview && (
                  <div style={{ marginTop: "14px", display: "flex", gap: "14px", alignItems: "flex-start", background: "#f7f8f9", borderRadius: "8px", padding: "12px" }}>
                    <img
                      src={preview}
                      alt="preview"
                      style={{ width: "80px", height: "80px", objectFit: "contain", background: "white", borderRadius: "6px", border: "1px solid #e0e0e0", flexShrink: 0 }}
                      onError={e => { e.currentTarget.style.display = "none"; }}
                      onLoad={e => { e.currentTarget.style.display = "block"; }}
                    />
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#0F1111", marginBottom: "4px" }}>Live Preview</div>
                      <div style={{ fontSize: "11px", color: "#565959", wordBreak: "break-all" }}>{preview}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current images */}
              <div style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0F1111" }}>
                    Gallery Images ({images.length})
                  </h3>
                  {images.length > 1 && (
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      Drag to reorder · First image = primary
                    </div>
                  )}
                </div>

                {images.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#888", background: "#f7f8f9", borderRadius: "8px", border: "2px dashed #d5d9d9" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "10px" }}>
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>No images yet</div>
                    <div style={{ fontSize: "12px", marginTop: "4px" }}>Paste a URL above to add the first image</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px" }}>
                    {images.map((img, i) => (
                      <div
                        key={img.id}
                        draggable
                        onDragStart={() => onDragStart(i)}
                        onDragOver={e => onDragOver(e, i)}
                        onDragEnd={() => onDragEnd()}
                        style={{
                          background: "#f7f8f9", borderRadius: "8px",
                          border: i === 0 ? "2px solid #FF9900" : "2px solid #e0e0e0",
                          overflow: "hidden", cursor: "grab", position: "relative",
                          transition: "border-color 0.15s",
                        }}
                      >
                        {/* Primary badge */}
                        {i === 0 && (
                          <div style={{ position: "absolute", top: "8px", left: "8px", background: "#FF9900", color: "#0F1111", fontSize: "9px", fontWeight: "800", padding: "2px 7px", borderRadius: "3px", zIndex: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Primary
                          </div>
                        )}

                        {/* Drag handle */}
                        <div style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(255,255,255,0.85)", borderRadius: "4px", padding: "3px 5px", zIndex: 2, fontSize: "12px", color: "#888", cursor: "grab" }}>
                          ⠿
                        </div>

                        {/* Image number */}
                        <div style={{ position: "absolute", bottom: "44px", left: "8px", background: "rgba(0,0,0,0.55)", color: "white", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "3px", zIndex: 2 }}>
                          #{i + 1}
                        </div>

                        <img
                          src={img.image_url}
                          alt={`Image ${i + 1}`}
                          style={{ width: "100%", height: "160px", objectFit: "contain", background: "white", padding: "8px", boxSizing: "border-box", display: "block", mixBlendMode: "multiply" }}
                          onError={e => { e.currentTarget.style.background = "#f0f2f2"; e.currentTarget.alt = "Image not found"; }}
                        />

                        {/* Actions */}
                        <div style={{ padding: "8px", display: "flex", gap: "6px" }}>
                          {i !== 0 && (
                            <button
                              onClick={() => setPrimary(img.id)}
                              style={{ flex: 1, padding: "5px 0", background: "white", border: "1px solid #d5d9d9", borderRadius: "4px", fontSize: "11px", cursor: "pointer", color: "#007185", fontWeight: "600", fontFamily: "inherit" }}
                              title="Set as primary image"
                            >
                              ★ Primary
                            </button>
                          )}
                          <button
                            onClick={() => deleteImage(img.id)}
                            style={{ flex: i === 0 ? 1 : "none", padding: "5px 10px", background: "white", border: "1px solid #e0e0e0", borderRadius: "4px", fontSize: "11px", cursor: "pointer", color: "#CC0C39", fontWeight: "600", fontFamily: "inherit" }}
                            title="Delete from database"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add placeholder */}
                    <div
                      onClick={() => document.querySelector("input[placeholder*='Paste']")?.focus()}
                      style={{ background: "#f7f8f9", border: "2px dashed #d5d9d9", borderRadius: "8px", height: "212px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#888", gap: "8px", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#FF9900"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#d5d9d9"}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      <span style={{ fontSize: "12px", fontWeight: "600" }}>Add image</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
