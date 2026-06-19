import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getUserId } from "../services/auth";

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

  useEffect(() => {
    setProduct(null);
    setRelatedProducts([]);
    setQuantity(1);
    setCartState("idle");
    setBuyingNow(false);
    setReviews([]);
    setReviewSubmitted(false);
    setShowReviewForm(false);
    fetchProduct();
    fetchRelated();
    fetchReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
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

  const addToCart = async () => {
    if (cartState !== "idle") return;
    setCartState("adding");
    try {
      await api.post("/cart/add", { user_id: getUserId(), product_id: product.id, quantity });
      setCartState("added");
      setTimeout(() => setCartState("idle"), 2500);
    } catch (e) {
      console.error(e);
      setCartState("idle");
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
      setTimeout(() => setWishlistAdded(false), 3000);
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
        .pd-tab-img { border: 2px solid transparent; border-radius: 6px; cursor: pointer; overflow: hidden; transition: border-color 0.15s; }
        .pd-tab-img:hover { border-color: #FF9900; }
        .pd-tab-img.active { border-color: #FF9900; }
        .pd-related-card { background: white; border-radius: 8px; padding: 14px; border: 1px solid #e8e8e8; cursor: pointer; transition: box-shadow 0.2s, transform 0.2s; }
        .pd-related-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); transform: translateY(-2px); }
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

            {/* Col 1: Image gallery */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
              {/* Thumbnail strip */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="pd-tab-img active" style={{ width: "58px", height: "58px", padding: "4px", background: "white", border: "2px solid #FF9900", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={product.image_url} alt="thumb" style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
                </div>
              </div>

              {/* Large main image */}
              <div style={{ width: "340px", height: "340px", background: "white", borderRadius: "8px", border: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden" }}>
                {discount >= 15 && (
                  <div style={{ position: "absolute", top: "12px", left: "12px", background: "#CC0C39", color: "white", fontSize: "13px", fontWeight: "800", padding: "4px 10px", borderRadius: "4px" }}>
                    Limited time deal
                  </div>
                )}
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", mixBlendMode: "multiply", transition: "transform 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>

              {/* Add to cart below image (quick) */}
              <div style={{ width: "340px", display: "flex", gap: "8px", marginTop: "8px" }}>
                <button
                  onClick={addToCart}
                  style={{ ...cartBtnStyle, flex: 1, background: cartState === "added" ? "#067D62" : "#FFD814", borderColor: cartState === "added" ? "#067D62" : "#FCD200", color: cartState === "added" ? "white" : "#0F1111" }}
                >
                  {cartState === "adding" ? "Adding…" : cartState === "added" ? "✓ Added" : "Add to Cart"}
                </button>
              </div>
            </div>

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

              {/* Delivery */}
              <div style={{ fontSize: "13px", marginBottom: "12px", lineHeight: "1.6" }}>
                <div style={{ color: "#007600", fontWeight: "700" }}>
                  FREE Delivery <span style={{ color: "#007185" }}>{deliveryDate}</span>
                </div>
                <div style={{ color: "#565959" }}>Order within <span style={{ color: "#CC0C39", fontWeight: "700" }}>11 hrs 52 mins</span></div>
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
