import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getUserId } from "../services/auth";
import { useToast } from "../context/ToastContext";

function Stars({ rating = 4.5, reviews = 0 }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ position: "relative", display: "inline-block", fontSize: "22px", lineHeight: 1 }}>
        <span style={{ color: "#ddd", userSelect: "none" }}>★★★★★</span>
        <span style={{ position: "absolute", top: 0, left: 0, overflow: "hidden", width: `${pct}%`, color: "#FF9900", whiteSpace: "nowrap", userSelect: "none" }}>★★★★★</span>
      </div>
      <span style={{ fontSize: "14px", color: "#007185", cursor: "default" }}>{reviews.toLocaleString("en-IN")} ratings</span>
    </div>
  );
}


function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cartState, setCartState] = useState("idle");
  const [buyingNow, setBuyingNow] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Pincode checker
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);

  // Price tracker
  const [priceHistory, setPriceHistory] = useState([]);
  const [buyScore, setBuyScore] = useState(null);
  const [alertTarget, setAlertTarget] = useState("");
  const [alertState, setAlertState] = useState("idle"); // idle | saving | saved
  const [existingAlert, setExistingAlert] = useState(null);

  // Gallery — images come from the API (product.images[])
  const [selectedView, setSelectedView] = useState(0);

  // Image zoom
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageBoxRef = useRef(null);

  useEffect(() => {
    setProduct(null);
    setRelatedProducts([]);
    setQuantity(1);
    setCartState("idle");
    setBuyingNow(false);
    setSelectedView(0);
    setZoom(false);
    setReviews([]);
    setReviewSubmitted(false);
    setShowReviewForm(false);
    setPincode("");
    setPincodeResult(null);
    setPriceHistory([]);
    setBuyScore(null);
    setAlertState("idle");
    setExistingAlert(null);
    fetchProduct();
    fetchRelated();
    fetchReviews();
    fetchPriceHistory();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
      // Save to recently viewed
      try {
        const key = "recently_viewed";
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        const filtered = prev.filter(p => p.id !== res.data.id);
        const updated = [res.data, ...filtered].slice(0, 8);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch {}
    } catch (e) { console.error(e); }
  };

  const fetchPriceHistory = async () => {
    try {
      const res = await api.get(`/price-tracker/history/${id}`);
      const history = res.data;
      setPriceHistory(history);
      if (history.length > 0) {
        const prices = history.map(h => h.price);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const min90 = Math.min(...prices);
        const max90 = Math.max(...prices);
        setBuyScore({ avg, min90, max90 });
      }
      // Check if user has an alert for this product
      const userId = getUserId();
      if (userId) {
        try {
          const ar = await api.get(`/price-tracker/alerts/${userId}`);
          const found = ar.data.find(a => a.product_id === Number(id));
          if (found) { setExistingAlert(found); setAlertTarget(String(found.target_price)); }
        } catch {}
      }
    } catch (e) { console.error(e); }
  };

  const fetchRelated = async () => {
    try {
      const res = await api.get(`/products/related/${id}`);
      setRelatedProducts(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (e) { console.error(e); }
  };

  const submitReview = async () => {
    const userId = getUserId();
    if (!userId) { navigate("/login"); return; }
    if (!reviewForm.title.trim() || !reviewForm.body.trim()) return;
    setReviewSubmitting(true);
    try {
      await api.post("/reviews/", { user_id: userId, product_id: Number(id), ...reviewForm });
      setReviewSubmitted(true);
      setShowReviewForm(false);
      await fetchReviews();
    } catch (e) { console.error(e); }
    finally { setReviewSubmitting(false); }
  };

  const markHelpful = async (reviewId) => {
    try {
      const res = await api.post(`/reviews/helpful/${reviewId}`);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful_count: res.data.helpful_count } : r));
    } catch (e) { console.error(e); }
  };

  const checkPincode = async () => {
    if (pincode.length !== 6) { setPincodeResult({ ok: false, msg: "Enter a valid 6-digit pincode" }); return; }
    setPincodeChecking(true);
    setPincodeResult(null);
    await new Promise(r => setTimeout(r, 600));
    const valid = /^[1-9][0-9]{5}$/.test(pincode);
    const days = Math.floor(Math.random() * 3) + 2;
    const date = new Date();
    date.setDate(date.getDate() + days);
    const label = date.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
    setPincodeResult(valid ? { ok: true, msg: `Delivery by ${label} · FREE delivery` } : { ok: false, msg: "Delivery not available at this pincode" });
    setPincodeChecking(false);
  };

  const addToCart = async () => {
    if (cartState !== "idle") return;
    const userId = getUserId();
    if (!userId) { navigate("/login"); return; }
    setCartState("adding");
    try {
      await api.post("/cart/add", { user_id: userId, product_id: product.id, quantity });
      setCartState("added");
      show(`${product.name.substring(0, 40)}… added to cart`, "cart");
      setTimeout(() => setCartState("idle"), 2500);
    } catch (e) {
      console.error(e);
      setCartState("idle");
      show("Failed to add to cart", "error");
    }
  };

  const buyNow = async () => {
    const userId = getUserId();
    if (!userId) { navigate("/login"); return; }
    if (buyingNow) return;
    setBuyingNow(true);
    try {
      await api.post("/cart/add", { user_id: userId, product_id: product.id, quantity });
      navigate("/checkout");
    } catch (e) {
      console.error(e);
      setBuyingNow(false);
    }
  };

  const addToWishlist = async () => {
    const userId = getUserId();
    if (!userId) { navigate("/login"); return; }
    try {
      await api.post("/wishlist/add", { user_id: userId, product_id: product.id });
      setWishlistAdded(true);
      show("Added to Wish List", "success");
      setTimeout(() => setWishlistAdded(false), 3000);
    } catch (e) {
      console.error(e);
      show("Failed to add to Wish List", "error");
    }
  };

  const saveAlert = async () => {
    const userId = getUserId();
    if (!userId) { navigate("/login"); return; }
    const target = parseFloat(alertTarget);
    if (!target || target <= 0) return;
    setAlertState("saving");
    try {
      const res = await api.post("/price-tracker/alerts/", { user_id: userId, product_id: Number(id), target_price: target });
      setAlertState("saved");
      setExistingAlert({ id: res.data.id, target_price: target, product_id: Number(id) });
    } catch (e) { console.error(e); setAlertState("idle"); }
  };

  const deleteAlert = async () => {
    if (!existingAlert) return;
    try {
      await api.delete(`/price-tracker/alerts/${existingAlert.id}`);
      setExistingAlert(null);
      setAlertState("idle");
      setAlertTarget("");
    } catch (e) { console.error(e); }
  };

  if (!product) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <p style={{ color: "#888", fontSize: "16px" }}>Loading product…</p>
        </div>
      </>
    );
  }

  const discount = product.discount_percent || 0;
  const originalPrice = product.original_price || (discount ? Math.round(product.price / (1 - discount / 100)) : null);
  const savedAmount = originalPrice ? Math.round(originalPrice - product.price) : 0;
  const deliveryDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
  })();

  const cartBtnStyle = {
    width: "100%",
    padding: "12px 0",
    borderRadius: "20px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
    border: "1px solid",
    transition: "all 0.15s",
  };

  return (
    <>
      <style>{`
        .pd-related-card { background: white; border-radius: 8px; padding: 14px; border: 1px solid #e8e8e8; cursor: pointer; transition: box-shadow 0.2s, transform 0.2s; }
        .pd-related-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); transform: translateY(-2px); }
        @keyframes imgFadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <Navbar />

      <div style={{ background: "#f0f2f2", minHeight: "100vh", padding: "12px 0 60px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>

          {/* Breadcrumb */}
          <div style={{ fontSize: "13px", color: "#565959", marginBottom: "12px", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/" style={{ color: "#007185", textDecoration: "none" }}>Home</Link>
            <span>›</span>
            {product.category_name && <>
              <span style={{ color: "#007185", cursor: "pointer" }}>{product.category_name}</span>
              <span>›</span>
            </>}
            <span style={{ color: "#0F1111", fontWeight: "500" }}>{product.name.length > 50 ? product.name.substring(0, 50) + "…" : product.name}</span>
          </div>

          {/* Main 3-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 280px", gap: "24px", alignItems: "start" }}>

            {/* Col 1: Image gallery — real images from API */}
            {(() => {
              const images = (product.images && product.images.length > 0)
                ? product.images
                : [product.image_url];
              const activeImg = images[selectedView] || images[0];
              return (
                <div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>

                    {/* Vertical thumbnail strip */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px", width: "68px" }}>
                      {images.map((url, i) => (
                        <div
                          key={i}
                          onClick={() => { setSelectedView(i); setZoom(false); }}
                          style={{
                            width: "64px", height: "64px",
                            border: `2px solid ${selectedView === i ? "#FF9900" : "#d5d9d9"}`,
                            borderRadius: "6px", background: "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", overflow: "hidden", padding: "4px",
                            boxSizing: "border-box", transition: "border-color 0.15s",
                            flexShrink: 0,
                          }}
                          onMouseEnter={e => { if (selectedView !== i) e.currentTarget.style.borderColor = "#FF9900"; }}
                          onMouseLeave={e => { if (selectedView !== i) e.currentTarget.style.borderColor = "#d5d9d9"; }}
                        >
                          <img
                            src={url}
                            alt={`View ${i + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
                            onError={e => { e.currentTarget.src = product.image_url; }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Main image with zoom */}
                    <div
                      ref={imageBoxRef}
                      style={{
                        width: "400px", height: "400px", background: "white",
                        borderRadius: "8px", border: "1px solid #e8e8e8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "20px", position: "relative", overflow: "hidden",
                        cursor: "crosshair", flexShrink: 0,
                      }}
                      onMouseEnter={() => setZoom(true)}
                      onMouseLeave={() => setZoom(false)}
                      onMouseMove={e => {
                        const rect = imageBoxRef.current.getBoundingClientRect();
                        setZoomPos({
                          x: ((e.clientX - rect.left) / rect.width) * 100,
                          y: ((e.clientY - rect.top) / rect.height) * 100,
                        });
                      }}
                    >
                      {/* Deal badge */}
                      {discount >= 15 && (
                        <div style={{ position: "absolute", top: "12px", left: "12px", background: "#CC0C39", color: "white", fontSize: "12px", fontWeight: "800", padding: "3px 9px", borderRadius: "4px", zIndex: 3 }}>
                          Limited time deal
                        </div>
                      )}

                      {/* Image counter */}
                      <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.5)", color: "white", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "10px", zIndex: 3 }}>
                        {selectedView + 1} / {images.length}
                      </div>

                      {/* Zoom tip */}
                      {!zoom && (
                        <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.45)", color: "white", fontSize: "10px", padding: "3px 10px", borderRadius: "10px", zIndex: 3, whiteSpace: "nowrap", pointerEvents: "none" }}>
                          Hover to zoom
                        </div>
                      )}

                      {/* Zoom lens overlay */}
                      {zoom && (
                        <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
                          <div style={{
                            width: "100%", height: "100%",
                            backgroundImage: `url(${activeImg})`,
                            backgroundSize: "280%",
                            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                            backgroundRepeat: "no-repeat",
                            mixBlendMode: "multiply",
                          }} />
                        </div>
                      )}

                      {/* Main image — key triggers fade transition on image change */}
                      <img
                        key={activeImg}
                        src={activeImg}
                        alt={product.name}
                        style={{
                          maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
                          mixBlendMode: "multiply",
                          opacity: zoom ? 0 : 1,
                          transition: "opacity 0.15s",
                          animation: "imgFadeIn 0.3s ease",
                        }}
                        onError={e => { e.currentTarget.src = product.image_url; }}
                      />

                      {/* Prev / Next arrows */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedView(v => (v - 1 + images.length) % images.length); setZoom(false); }}
                            style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", zIndex: 5, width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "1px solid #d5d9d9", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", color: "#0F1111" }}
                            onMouseEnter={e => e.currentTarget.style.background = "white"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.92)"}
                          >‹</button>
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedView(v => (v + 1) % images.length); setZoom(false); }}
                            style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", zIndex: 5, width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "1px solid #d5d9d9", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", color: "#0F1111" }}
                            onMouseEnter={e => e.currentTarget.style.background = "white"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.92)"}
                          >›</button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Dot strip */}
                  {images.length > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "12px", marginLeft: "78px" }}>
                      {images.map((_, i) => (
                        <div
                          key={i}
                          onClick={() => { setSelectedView(i); setZoom(false); }}
                          style={{ width: i === selectedView ? "22px" : "8px", height: "8px", borderRadius: "4px", background: i === selectedView ? "#FF9900" : "#d5d9d9", cursor: "pointer", transition: "all 0.25s ease" }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Quick add to cart */}
                  <div style={{ marginTop: "14px", marginLeft: "78px", width: "400px" }}>
                    <button
                      onClick={addToCart}
                      style={{ ...cartBtnStyle, width: "100%", background: cartState === "added" ? "#067D62" : "#FFD814", borderColor: cartState === "added" ? "#067D62" : "#FCD200", color: cartState === "added" ? "white" : "#0F1111" }}
                    >
                      {cartState === "adding" ? "Adding…" : cartState === "added" ? "✓ Added to Cart" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Col 2: Product info */}
            <div style={{ background: "white", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

              {/* Category chip */}
              {product.category_name && (
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ background: "#f0f2f2", color: "#565959", fontSize: "12px", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>
                    {product.category_name}
                  </span>
                </div>
              )}

              {/* Best seller ribbon */}
              {product.is_best_seller && (
                <div style={{ display: "inline-block", background: "#CC7722", color: "white", fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "4px", marginBottom: "10px" }}>
                  #1 Best Seller
                </div>
              )}

              {/* Product title */}
              <h1 style={{ fontSize: "22px", fontWeight: "500", color: "#0F1111", lineHeight: "1.4", margin: "0 0 12px" }}>
                {product.name}
              </h1>

              {/* Brand */}
              <div style={{ fontSize: "14px", color: "#565959", marginBottom: "10px" }}>
                Brand: <span style={{ color: "#007185", fontWeight: "600" }}>GenericBrand</span>
              </div>

              {/* Star rating */}
              <div style={{ marginBottom: "12px" }}>
                <Stars rating={product.rating || 4.5} reviews={product.reviews || 0} />
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #e8e8e8", margin: "16px 0" }} />

              {/* Price block */}
              <div style={{ marginBottom: "16px" }}>
                {discount > 0 && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ background: "#CC0C39", color: "white", fontSize: "14px", fontWeight: "800", padding: "2px 8px", borderRadius: "4px" }}>-{discount}%</span>
                    <span style={{ fontSize: "30px", fontWeight: "700", color: "#0F1111" }}>
                      <span style={{ fontSize: "16px", verticalAlign: "super" }}>₹</span>
                      {product.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                {!discount && (
                  <div style={{ fontSize: "30px", fontWeight: "700", color: "#0F1111", marginBottom: "4px" }}>
                    <span style={{ fontSize: "16px", verticalAlign: "super" }}>₹</span>
                    {product.price.toLocaleString("en-IN")}
                  </div>
                )}
                {originalPrice && originalPrice > product.price && (
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px", color: "#565959" }}>
                      M.R.P.: <s style={{ color: "#888" }}>₹{originalPrice.toLocaleString("en-IN")}</s>
                    </span>
                    {savedAmount > 0 && (
                      <span style={{ fontSize: "14px", color: "#CC7722", fontWeight: "700" }}>
                        Save ₹{savedAmount.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                )}
                <div style={{ fontSize: "13px", color: "#565959" }}>Inclusive of all taxes</div>
              </div>

              {/* Prime + delivery */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ background: "#232f3e", color: "#FF9900", fontSize: "11px", fontWeight: "900", padding: "3px 8px", borderRadius: "3px", letterSpacing: "1px" }}>prime</span>
                <span style={{ color: "#007600", fontSize: "14px", fontWeight: "600" }}>FREE Delivery</span>
                <span style={{ color: "#0F1111", fontSize: "14px" }}>by <strong>{deliveryDate}</strong></span>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #e8e8e8", margin: "16px 0" }} />

              {/* Description */}
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "10px", color: "#0F1111" }}>About this item</h3>
                <p style={{ fontSize: "14px", color: "#0F1111", lineHeight: "1.7", margin: 0 }}>
                  {product.description || "A premium quality product designed to meet your everyday needs. Crafted with care and built to last, this product combines functionality with style."}
                </p>

                {/* Feature bullets */}
                <ul style={{ margin: "14px 0 0", paddingLeft: "20px", color: "#0F1111", fontSize: "14px", lineHeight: "2" }}>
                  <li>High-quality materials and craftsmanship</li>
                  <li>Easy to use and maintain</li>
                  <li>Designed for everyday use</li>
                  {product.stock <= 5 && <li style={{ color: "#CC0C39", fontWeight: "700" }}>Only {product.stock} left in stock — order soon</li>}
                </ul>
              </div>
            </div>

            {/* Col 3: Sticky Buy Box */}
            <div style={{ background: "white", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", position: "sticky", top: "16px" }}>

              {/* Price in buy box */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "26px", fontWeight: "700", color: "#0F1111" }}>
                  <span style={{ fontSize: "14px", verticalAlign: "super" }}>₹</span>
                  {product.price.toLocaleString("en-IN")}
                </div>
                {originalPrice && originalPrice > product.price && (
                  <div style={{ fontSize: "13px", color: "#565959" }}>
                    M.R.P.: <s>₹{originalPrice.toLocaleString("en-IN")}</s>
                    {discount > 0 && <span style={{ color: "#CC7722", fontWeight: "700", marginLeft: "6px" }}>({discount}% off)</span>}
                  </div>
                )}
              </div>

              {/* Buy Timing Score */}
              {buyScore && (() => {
                const prices = priceHistory.map(h => h.price);
                const below = prices.filter(p => p <= product.price).length;
                const pct = (below / prices.length) * 100;
                let label, color, bg, icon;
                if (pct <= 15)      { label = "Excellent Deal"; color = "#067D62"; bg = "#e7f5ea"; icon = "🔥"; }
                else if (pct <= 35) { label = "Good Deal";       color = "#007600"; bg = "#eafaea"; icon = "✓"; }
                else if (pct <= 60) { label = "Fair Price";      color = "#CC7722"; bg = "#fdf3e0"; icon = "~"; }
                else if (pct <= 80) { label = "Above Average";   color = "#C45500"; bg = "#fdf0e0"; icon = "↑"; }
                else                { label = "High Price";      color = "#CC0C39"; bg = "#fde8e8"; icon = "⚠"; }
                return (
                  <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: "8px", padding: "8px 12px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "800", color }}>{label}</div>
                      <div style={{ fontSize: "11px", color: "#565959" }}>
                        Cheaper than {Math.round(100 - pct)}% of prices in last 90 days
                      </div>
                    </div>
                    <a href="#price-tracker" style={{ marginLeft: "auto", fontSize: "11px", color: "#007185", textDecoration: "none", whiteSpace: "nowrap" }}>View chart ↓</a>
                  </div>
                );
              })()}

              {/* Delivery */}
              <div style={{ fontSize: "13px", marginBottom: "12px", lineHeight: "1.6" }}>
                <div style={{ color: "#007600", fontWeight: "700" }}>
                  FREE Delivery <span style={{ color: "#007185" }}>{deliveryDate}</span>
                </div>
                <div style={{ color: "#565959" }}>Order within <span style={{ color: "#CC0C39", fontWeight: "700" }}>11 hrs 52 mins</span></div>
              </div>

              {/* Pincode delivery checker */}
              <div style={{ marginBottom: "14px", borderTop: "1px solid #f0f2f2", paddingTop: "12px" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#0F1111", marginBottom: "6px" }}>Deliver to</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="text"
                    placeholder="Enter pincode"
                    value={pincode}
                    maxLength={6}
                    onChange={e => { setPincode(e.target.value.replace(/\D/g, "")); setPincodeResult(null); }}
                    onKeyDown={e => e.key === "Enter" && checkPincode()}
                    style={{ flex: 1, padding: "7px 10px", border: "1px solid #d5d9d9", borderRadius: "4px", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
                  />
                  <button
                    onClick={checkPincode}
                    style={{ padding: "7px 14px", background: "white", border: "1px solid #007185", borderRadius: "4px", color: "#007185", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {pincodeChecking ? "…" : "Check"}
                  </button>
                </div>
                {pincodeResult && (
                  <div style={{ marginTop: "6px", fontSize: "12px", fontWeight: "600", color: pincodeResult.ok ? "#007600" : "#CC0C39" }}>
                    {pincodeResult.ok ? "✓ " : "✕ "}{pincodeResult.msg}
                  </div>
                )}
              </div>

              {/* Stock */}
              <div style={{ marginBottom: "14px", fontWeight: "700", fontSize: "16px" }}>
                {product.stock > 5
                  ? <span style={{ color: "#007600" }}>In Stock</span>
                  : product.stock > 0
                    ? <span style={{ color: "#CC7722" }}>Only {product.stock} left in stock!</span>
                    : <span style={{ color: "#CC0C39" }}>Out of Stock</span>
                }
              </div>

              {/* Quantity */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#0F1111" }}>Qty:</label>
                <select
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  style={{ border: "1px solid #d5d9d9", borderRadius: "6px", padding: "6px 10px", fontSize: "14px", fontFamily: "inherit", background: "linear-gradient(to bottom, #f7f8f8, #e7e9ec)", cursor: "pointer" }}
                >
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  style={{ ...cartBtnStyle, background: cartState === "added" ? "#067D62" : "#FFD814", borderColor: cartState === "added" ? "#067D62" : "#FCD200", color: cartState === "added" ? "white" : "#0F1111" }}
                >
                  {cartState === "adding" ? "Adding…" : cartState === "added" ? "✓ Added to Cart" : "Add to Cart"}
                </button>

                <button
                  onClick={buyNow}
                  disabled={product.stock === 0 || buyingNow}
                  style={{ ...cartBtnStyle, background: buyingNow ? "#e68900" : "#FF9900", borderColor: "#FF9900", color: "white", opacity: buyingNow ? 0.85 : 1 }}
                  onMouseEnter={e => { if (!buyingNow) e.currentTarget.style.background = "#e68900"; }}
                  onMouseLeave={e => { if (!buyingNow) e.currentTarget.style.background = "#FF9900"; }}
                >
                  {buyingNow ? "Going to checkout…" : "Buy Now"}
                </button>

                <button
                  onClick={addToWishlist}
                  style={{ ...cartBtnStyle, background: wishlistAdded ? "#ffeef8" : "white", borderColor: wishlistAdded ? "#ff4081" : "#d5d9d9", color: wishlistAdded ? "#CC0C39" : "#0F1111" }}
                  onMouseEnter={e => { if (!wishlistAdded) { e.currentTarget.style.borderColor = "#888"; } }}
                  onMouseLeave={e => { if (!wishlistAdded) { e.currentTarget.style.borderColor = "#d5d9d9"; } }}
                >
                  {wishlistAdded ? "Added to Wish List" : "Add to Wish List"}
                </button>
              </div>

              {/* Security / Sold by */}
              <div style={{ borderTop: "1px solid #f0f2f2", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "12px", color: "#565959" }}>Secure transaction</div>
                <div style={{ fontSize: "12px", color: "#565959" }}>Ships from: <span style={{ color: "#007185" }}>Amazon</span></div>
                <div style={{ fontSize: "12px", color: "#565959" }}>Sold by: <span style={{ color: "#007185" }}>Amazon.in</span></div>
                <div style={{ fontSize: "12px", color: "#007600", fontWeight: "600", marginTop: "4px" }}>30-day return eligible</div>
              </div>
            </div>

          </div>

          {/* Customers also bought */}
          {relatedProducts.length > 0 && (
            <div style={{ marginTop: "32px", background: "white", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 20px", color: "#0F1111" }}>Customers also bought</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
                {relatedProducts.map(item => (
                  <div key={item.id} className="pd-related-card" onClick={() => navigate(`/product/${item.id}`)}>
                    <div style={{ height: "150px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
                      />
                    </div>
                    <div style={{ fontSize: "13px", color: "#0F1111", fontWeight: "400", lineHeight: "1.4", marginBottom: "6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                      {item.discount_percent > 0 && (
                        <span style={{ background: "#CC0C39", color: "white", fontSize: "11px", fontWeight: "800", padding: "1px 5px", borderRadius: "3px" }}>-{item.discount_percent}%</span>
                      )}
                      <span style={{ fontSize: "16px", fontWeight: "700", color: "#0F1111" }}>₹{item.price.toLocaleString("en-IN")}</span>
                    </div>
                    {item.rating && (
                      <div style={{ fontSize: "12px", color: "#FF9900", marginTop: "4px" }}>{"★".repeat(Math.round(item.rating))} <span style={{ color: "#565959" }}>({item.reviews})</span></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Smart Price Tracker ── */}
          {priceHistory.length > 0 && buyScore && (() => {
            const prices = priceHistory.map(h => h.price);
            const below = prices.filter(p => p <= product.price).length;
            const pct = (below / prices.length) * 100;
            let scoreLabel, scoreColor, scoreBg, scoreIcon, scoreMsg;
            if (pct <= 15)      { scoreLabel = "Excellent Deal 🔥"; scoreColor = "#067D62"; scoreBg = "#e7f5ea"; scoreIcon = "🔥"; scoreMsg = "This is one of the lowest prices in the last 90 days!"; }
            else if (pct <= 35) { scoreLabel = "Good Deal";         scoreColor = "#007600"; scoreBg = "#eafaea"; scoreIcon = "✓";  scoreMsg = "Price is below average — a solid time to buy."; }
            else if (pct <= 60) { scoreLabel = "Fair Price";        scoreColor = "#CC7722"; scoreBg = "#fdf3e0"; scoreIcon = "~";  scoreMsg = "Price is near the average. No urgency either way."; }
            else if (pct <= 80) { scoreLabel = "Above Average";     scoreColor = "#C45500"; scoreBg = "#fdf0e0"; scoreIcon = "↑";  scoreMsg = "Price is a bit high. Consider waiting for a deal."; }
            else                { scoreLabel = "High Price";        scoreColor = "#CC0C39"; scoreBg = "#fde8e8"; scoreIcon = "⚠";  scoreMsg = "Near the 90-day high. Recommended to set an alert."; }

            // SVG chart
            const W = 800, H = 110, PL = 12, PR = 12, PT = 14, PB = 22;
            const chartW = W - PL - PR, chartH = H - PT - PB;
            const minP = Math.min(...prices) * 0.97;
            const maxP = Math.max(...prices) * 1.03;
            const toX = i => PL + (i / (prices.length - 1)) * chartW;
            const toY = p => PT + (1 - (p - minP) / (maxP - minP)) * chartH;
            const linePoints = prices.map((p, i) => `${toX(i)},${toY(p)}`).join(" ");
            const areaPoints = `${toX(0)},${H - PB} ${linePoints} ${toX(prices.length - 1)},${H - PB}`;
            const curY = toY(product.price);
            const minY = toY(buyScore.min90);
            const minX = toX(prices.indexOf(buyScore.min90));
            const targetVal = existingAlert ? existingAlert.target_price : null;
            const targetY = targetVal ? toY(targetVal) : null;

            const fmt = n => `₹${Number(n).toLocaleString("en-IN")}`;

            return (
              <div id="price-tracker" style={{ marginTop: "32px", background: "white", borderRadius: "8px", padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>📈</span>
                    <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0F1111", margin: 0 }}>Smart Price Tracker</h2>
                    <span style={{ fontSize: "11px", background: "#232f3e", color: "#FF9900", padding: "2px 8px", borderRadius: "10px", fontWeight: "700", letterSpacing: "0.5px" }}>90-DAY HISTORY</span>
                  </div>
                  <a href="/price-alerts" style={{ fontSize: "13px", color: "#007185", textDecoration: "none", fontWeight: "600" }}>View all alerts →</a>
                </div>

                {/* Score + Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ background: scoreBg, border: `1.5px solid ${scoreColor}40`, borderRadius: "10px", padding: "14px 16px" }}>
                    <div style={{ fontSize: "11px", color: "#565959", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Buy Timing</div>
                    <div style={{ fontSize: "15px", fontWeight: "800", color: scoreColor, marginBottom: "4px" }}>{scoreLabel}</div>
                    <div style={{ fontSize: "11px", color: "#565959", lineHeight: "1.4" }}>{scoreMsg}</div>
                  </div>
                  <div style={{ background: "#f7f8f9", borderRadius: "10px", padding: "14px 16px", border: "1px solid #e8e8e8" }}>
                    <div style={{ fontSize: "11px", color: "#565959", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>90-Day Low</div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#067D62" }}>{fmt(buyScore.min90)}</div>
                    <div style={{ fontSize: "11px", color: "#067D62" }}>↓ {Math.round(((product.price - buyScore.min90) / product.price) * 100)}% below current</div>
                  </div>
                  <div style={{ background: "#f7f8f9", borderRadius: "10px", padding: "14px 16px", border: "1px solid #e8e8e8" }}>
                    <div style={{ fontSize: "11px", color: "#565959", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>90-Day Average</div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#0F1111" }}>{fmt(Math.round(buyScore.avg))}</div>
                    <div style={{ fontSize: "11px", color: product.price <= buyScore.avg ? "#067D62" : "#CC0C39" }}>
                      {product.price <= buyScore.avg ? `↓ ${Math.round(((buyScore.avg - product.price) / buyScore.avg) * 100)}% below avg` : `↑ ${Math.round(((product.price - buyScore.avg) / buyScore.avg) * 100)}% above avg`}
                    </div>
                  </div>
                  <div style={{ background: "#f7f8f9", borderRadius: "10px", padding: "14px 16px", border: "1px solid #e8e8e8" }}>
                    <div style={{ fontSize: "11px", color: "#565959", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>90-Day High</div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#CC0C39" }}>{fmt(buyScore.max90)}</div>
                    <div style={{ fontSize: "11px", color: "#565959" }}>Current is {Math.round(((buyScore.max90 - product.price) / buyScore.max90) * 100)}% below peak</div>
                  </div>
                </div>

                {/* SVG Chart */}
                <div style={{ background: "#f9f9fb", borderRadius: "10px", padding: "16px 16px 8px", marginBottom: "20px", border: "1px solid #ebebeb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#565959" }}>90 days ago</span>
                    <span style={{ fontSize: "11px", color: "#565959" }}>45 days ago</span>
                    <span style={{ fontSize: "11px", color: "#007185", fontWeight: "700" }}>Today · {fmt(product.price)}</span>
                  </div>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible", display: "block" }}>
                    <defs>
                      <linearGradient id="ptGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF9900" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#FF9900" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id="ptGradGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#007185" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#007185" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <polygon points={areaPoints} fill="url(#ptGrad)" />

                    {/* Line */}
                    <polyline points={linePoints} fill="none" stroke="#FF9900" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

                    {/* Average line */}
                    <line x1={PL} y1={toY(buyScore.avg)} x2={W - PR} y2={toY(buyScore.avg)} stroke="#888" strokeWidth="1" strokeDasharray="3 4" />
                    <text x={W - PR + 4} y={toY(buyScore.avg) + 4} fontSize="9" fill="#888">avg</text>

                    {/* Target price line */}
                    {targetY && targetVal < maxP && targetVal > minP && (
                      <>
                        <line x1={PL} y1={targetY} x2={W - PR} y2={targetY} stroke="#007185" strokeWidth="1.5" strokeDasharray="5 4" />
                        <text x={W - PR + 4} y={targetY + 4} fontSize="9" fill="#007185">target</text>
                      </>
                    )}

                    {/* 90-day low dot */}
                    <circle cx={minX} cy={minY} r={5} fill="#067D62" stroke="white" strokeWidth="2" />
                    <text x={minX} y={minY - 9} fontSize="9" fill="#067D62" textAnchor="middle">Low</text>

                    {/* Current price dot */}
                    <circle cx={toX(prices.length - 1)} cy={curY} r={6} fill="#FF9900" stroke="white" strokeWidth="2.5" />
                  </svg>

                  <div style={{ display: "flex", gap: "20px", marginTop: "8px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "12px", height: "3px", background: "#FF9900", borderRadius: "2px" }} />
                      <span style={{ fontSize: "11px", color: "#565959" }}>Price history</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "12px", height: "2px", background: "#888", borderRadius: "2px", borderTop: "1px dashed #888" }} />
                      <span style={{ fontSize: "11px", color: "#565959" }}>90-day average</span>
                    </div>
                    {targetVal && (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: "12px", height: "2px", background: "#007185", borderRadius: "2px", borderTop: "1px dashed #007185" }} />
                        <span style={{ fontSize: "11px", color: "#565959" }}>Your target</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "10px", height: "10px", background: "#067D62", borderRadius: "50%", border: "2px solid white", boxShadow: "0 0 0 1px #067D62" }} />
                      <span style={{ fontSize: "11px", color: "#565959" }}>90-day low</span>
                    </div>
                  </div>
                </div>

                {/* Alert form */}
                <div style={{ background: existingAlert ? "#e7f5ea" : "#f0f7ff", borderRadius: "10px", padding: "16px 20px", border: `1px solid ${existingAlert ? "#067D62" : "#007185"}30` }}>
                  {existingAlert ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "18px" }}>🔔</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#067D62", marginBottom: "2px" }}>
                          Price Alert Active — Target: {fmt(existingAlert.target_price)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#565959" }}>
                          {product.price <= existingAlert.target_price
                            ? "✓ Your target is already reached! Click Buy Now above."
                            : `Needs to drop ${fmt(product.price - existingAlert.target_price)} more (${Math.round(((product.price - existingAlert.target_price) / product.price) * 100)}%).`}
                        </div>
                      </div>
                      <button
                        onClick={deleteAlert}
                        style={{ padding: "8px 16px", background: "white", border: "1px solid #d5d9d9", borderRadius: "20px", fontSize: "13px", cursor: "pointer", color: "#CC0C39", fontWeight: "600", flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#CC0C39"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#d5d9d9"}
                      >
                        Remove Alert
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F1111", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>🔔</span> Set a Price Alert — Be notified when price drops
                      </div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #007185", borderRadius: "8px", overflow: "hidden", background: "white" }}>
                          <span style={{ padding: "0 10px", color: "#565959", fontSize: "15px", background: "#f7f8f9", borderRight: "1px solid #e8e8e8", lineHeight: "38px" }}>₹</span>
                          <input
                            type="number"
                            placeholder={`e.g. ${Math.round(buyScore.min90)}`}
                            value={alertTarget}
                            onChange={e => setAlertTarget(e.target.value)}
                            style={{ width: "120px", padding: "8px 12px", border: "none", outline: "none", fontSize: "15px", fontFamily: "inherit" }}
                          />
                        </div>
                        <button
                          onClick={saveAlert}
                          disabled={alertState === "saving" || !alertTarget}
                          style={{ padding: "10px 22px", background: alertState === "saved" ? "#067D62" : "#FFD814", border: "none", borderRadius: "20px", fontSize: "14px", fontWeight: "700", cursor: "pointer", color: alertState === "saved" ? "white" : "#0F1111", transition: "all 0.2s" }}
                        >
                          {alertState === "saving" ? "Saving…" : alertState === "saved" ? "✓ Alert Set!" : "Set Alert"}
                        </button>
                        <button
                          onClick={() => setAlertTarget(String(Math.round(buyScore.min90)))}
                          style={{ padding: "10px 16px", background: "white", border: "1px solid #007185", borderRadius: "20px", fontSize: "13px", cursor: "pointer", color: "#007185", fontWeight: "600" }}
                          title="Use 90-day lowest price as target"
                        >
                          Use 90-day low ({fmt(buyScore.min90)})
                        </button>
                      </div>
                      <div style={{ fontSize: "12px", color: "#565959", marginTop: "8px" }}>
                        Suggested alert: {fmt(Math.round(buyScore.avg * 0.9))} (10% below average) · You can check all your alerts at <a href="/price-alerts" style={{ color: "#007185" }}>Price Alerts</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Customer Reviews */}
          <div style={{ marginTop: "32px", background: "white", borderRadius: "8px", padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 24px", color: "#0F1111", borderBottom: "1px solid #f0f2f2", paddingBottom: "16px" }}>
              Customer Reviews
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "40px", alignItems: "start" }}>

              {/* Left: Rating summary */}
              <div>
                {/* Overall rating */}
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "64px", fontWeight: "700", color: "#0F1111", lineHeight: 1 }}>
                    {product.rating ? Number(product.rating).toFixed(1) : "4.5"}
                  </div>
                  <div style={{ fontSize: "22px", color: "#FF9900", margin: "4px 0" }}>
                    {"★".repeat(Math.round(product.rating || 4.5))}{"☆".repeat(5 - Math.round(product.rating || 4.5))}
                  </div>
                  <div style={{ fontSize: "13px", color: "#565959" }}>out of 5</div>
                </div>

                {/* Distribution bars */}
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: "#007185", width: "36px", flexShrink: 0, cursor: "default" }}>{star} star</span>
                      <div style={{ flex: 1, height: "10px", background: "#e8e8e8", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "#FF9900", borderRadius: "5px", transition: "width 0.3s" }} />
                      </div>
                      <span style={{ fontSize: "12px", color: "#007185", width: "28px", flexShrink: 0, textAlign: "right" }}>
                        {Math.round(pct)}%
                      </span>
                    </div>
                  );
                })}

                {/* Write review button */}
                <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f0f2f2" }}>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F1111", marginBottom: "8px" }}>Review this product</div>
                  <div style={{ fontSize: "13px", color: "#565959", marginBottom: "12px" }}>Share your thoughts with other customers</div>
                  {reviewSubmitted ? (
                    <div style={{ background: "#e7f5ea", borderRadius: "6px", padding: "10px 14px", fontSize: "13px", color: "#067D62", fontWeight: "600" }}>
                      Your review was submitted!
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReviewForm(f => !f)}
                      style={{ width: "100%", padding: "9px 0", background: "white", border: "1px solid #d5d9d9", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer", color: "#0F1111" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#888"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#d5d9d9"}
                    >
                      Write a customer review
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Reviews list + form */}
              <div>
                {/* Write review form */}
                {showReviewForm && !reviewSubmitted && (
                  <div style={{ background: "#fafafa", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "20px", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#0F1111" }}>Write your review</h3>

                    {/* Star picker */}
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0F1111", display: "block", marginBottom: "6px" }}>Overall rating</label>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <span
                            key={s}
                            onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                            style={{ fontSize: "28px", cursor: "pointer", color: s <= reviewForm.rating ? "#FF9900" : "#ddd", transition: "color 0.1s" }}
                          >★</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0F1111", display: "block", marginBottom: "4px" }}>Review title</label>
                      <input
                        type="text"
                        placeholder="What's most important to know?"
                        value={reviewForm.title}
                        onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                        style={{ width: "100%", padding: "9px 12px", border: "1px solid #888", borderRadius: "4px", fontSize: "14px", outline: "none" }}
                        onFocus={e => e.currentTarget.style.borderColor = "#e77600"}
                        onBlur={e => e.currentTarget.style.borderColor = "#888"}
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0F1111", display: "block", marginBottom: "4px" }}>Your review</label>
                      <textarea
                        placeholder="What did you like or dislike? What did you use this product for?"
                        value={reviewForm.body}
                        onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                        rows={4}
                        style={{ width: "100%", padding: "9px 12px", border: "1px solid #888", borderRadius: "4px", fontSize: "14px", resize: "vertical", outline: "none", lineHeight: "1.5" }}
                        onFocus={e => e.currentTarget.style.borderColor = "#e77600"}
                        onBlur={e => e.currentTarget.style.borderColor = "#888"}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={submitReview}
                        disabled={reviewSubmitting || !reviewForm.title.trim() || !reviewForm.body.trim()}
                        style={{ padding: "10px 24px", background: "#FFD814", border: "1px solid #FCD200", borderRadius: "6px", fontSize: "14px", fontWeight: "700", cursor: reviewSubmitting ? "wait" : "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F7CA00"}
                        onMouseLeave={e => e.currentTarget.style.background = "#FFD814"}
                      >
                        {reviewSubmitting ? "Submitting…" : "Submit review"}
                      </button>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        style={{ padding: "10px 20px", background: "white", border: "1px solid #d5d9d9", borderRadius: "6px", fontSize: "14px", cursor: "pointer", color: "#0F1111" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews list */}
                {reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#888" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>★</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#0F1111", marginBottom: "6px" }}>No reviews yet</div>
                    <div style={{ fontSize: "14px" }}>Be the first to review this product</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {reviews.map(review => (
                      <div key={review.id} style={{ borderBottom: "1px solid #f0f2f2", paddingBottom: "20px" }}>
                        {/* Reviewer */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#232f3e", color: "#FF9900", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", flexShrink: 0 }}>
                            {review.user_name ? review.user_name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F1111" }}>{review.user_name}</div>
                            <div style={{ fontSize: "12px", color: "#565959" }}>
                              {review.created_at ? new Date(review.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : ""}
                            </div>
                          </div>
                          <div style={{ marginLeft: "auto", background: "#e7f5e7", color: "#067D62", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "3px" }}>
                            Verified Purchase
                          </div>
                        </div>

                        {/* Stars + title */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ color: "#FF9900", fontSize: "16px" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                          <span style={{ fontSize: "15px", fontWeight: "700", color: "#0F1111" }}>{review.title}</span>
                        </div>

                        {/* Body */}
                        <p style={{ fontSize: "14px", color: "#0F1111", lineHeight: "1.6", margin: "0 0 12px" }}>{review.body}</p>

                        {/* Helpful */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "13px", color: "#565959" }}>
                            {review.helpful_count > 0 ? `${review.helpful_count} people found this helpful` : ""}
                          </span>
                          <button
                            onClick={() => markHelpful(review.id)}
                            style={{ fontSize: "13px", color: "#007185", background: "white", border: "1px solid #d5d9d9", borderRadius: "4px", padding: "4px 12px", cursor: "pointer", fontFamily: "inherit" }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "#888"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#d5d9d9"}
                          >
                            Helpful
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default ProductDetails;
