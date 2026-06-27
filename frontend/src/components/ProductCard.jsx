import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUserId } from "../services/auth";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const deliveryDate = tomorrow.toLocaleDateString("en-IN", {
  weekday: "short", day: "numeric", month: "short",
});

/* Pixel-accurate star rating using overlay clip trick */
function Stars({ rating = 4.5 }) {
  const pct = Math.min(100, Math.max(0, (rating / 5) * 100));
  return (
    <div style={{ position: "relative", display: "inline-block", fontSize: "16px", lineHeight: 1, letterSpacing: "2px" }}>
      <span style={{ color: "#DDD" }}>★★★★★</span>
      <span style={{ position: "absolute", top: 0, left: 0, overflow: "hidden", width: `${pct}%`, color: "#FF9900", whiteSpace: "nowrap" }}>
        ★★★★★
      </span>
    </div>
  );
}

function ProductCard({ product, addToCart, compact = false, minimal = false }) {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [cartState, setCartState] = useState("idle"); // idle | adding | added
  const [hovered, setHovered] = useState(false);

  const discountPct  = product.discount_percent  || 0;
  const originalPrice = product.original_price   || null;
  const rating        = product.rating            || 4.5;
  const reviews       = product.reviews           || 125;
  const isLimitedDeal = discountPct >= 15;
  const savedAmount   = originalPrice ? Math.round(originalPrice - product.price) : 0;

  const handleWishlist = async () => {
    try {
      await api.post("/wishlist/add", { user_id: getUserId(), product_id: product.id });
      setWishlisted(true);
      setTimeout(() => setWishlisted(false), 2500);
    } catch {
      alert("Failed to add to wishlist");
    }
  };

  const handleCart = () => {
    if (cartState !== "idle") return;
    setCartState("adding");
    addToCart(product.id);
    setTimeout(() => setCartState("added"), 500);
    setTimeout(() => setCartState("idle"), 2200);
  };

  const handleBuyNow = () => {
    addToCart(product.id);
    setTimeout(() => navigate("/cart"), 300);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxShadow: hovered
          ? "0 4px 20px rgba(0,0,0,0.18), 0 1px 6px rgba(0,0,0,0.10)"
          : "0 2px 5px rgba(15,17,17,0.09)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.22s ease, transform 0.22s ease",
        position: "relative",
      }}
    >
      {/* ── Limited-time deal banner ── */}
      {isLimitedDeal && (
        <div style={{
          background: "#CC0C39", color: "white",
          fontSize: "12px", fontWeight: "700",
          padding: "5px 14px",
        }}>
          Limited time deal
        </div>
      )}

      {/* ── Image area ── */}
      <div style={{
        position: "relative",
        background: "#FFFFFF",
        padding: "20px 16px 12px",
        overflow: "hidden",
      }}>
        {/* Product image — contain so the full product shows */}
        <img
          src={product.image_url}
          alt={product.name}
          onClick={() => navigate(`/product/${product.id}`)}
          style={{
            width: "100%",
            height: compact ? "150px" : "200px",
            objectFit: "contain",
            display: "block",
            cursor: "pointer",
            mixBlendMode: "multiply",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        />

        {/* Best-seller ribbon */}
        {product.is_best_seller && (
          <div style={{
            position: "absolute", top: "14px", left: 0,
            background: "#c45500", color: "white",
            fontSize: "11px", fontWeight: "700",
            padding: "4px 10px 4px 8px",
            borderRadius: "0 4px 4px 0",
            boxShadow: "2px 2px 6px rgba(0,0,0,0.18)",
          }}>
            #1 Best Seller
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          title={wishlisted ? "In Wish List" : "Add to Wish List"}
          style={{
            position: "absolute", top: "10px", right: "10px",
            width: "36px", height: "36px", borderRadius: "50%",
            background: wishlisted ? "#ff4081" : "rgba(255,255,255,0.92)",
            border: wishlisted ? "none" : "1px solid #e8e8e8",
            cursor: "pointer",
            fontSize: "17px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.16)",
            transition: "all 0.2s",
            color: wishlisted ? "white" : "#999",
          }}
          onMouseEnter={e => {
            if (!wishlisted) {
              e.currentTarget.style.color = "#cc1f4a";
              e.currentTarget.style.transform = "scale(1.14)";
              e.currentTarget.style.borderColor = "#cc1f4a";
            }
          }}
          onMouseLeave={e => {
            if (!wishlisted) {
              e.currentTarget.style.color = "#999";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.borderColor = "#e8e8e8";
            }
          }}
        >
          {wishlisted ? "♥" : "♡"}
        </button>

        {/* Discount badge (only when no limited deal banner) */}
        {!isLimitedDeal && discountPct > 0 && (
          <div style={{
            position: "absolute", bottom: "10px", left: "10px",
            background: "#CC0C39", color: "white",
            fontSize: "12px", fontWeight: "800",
            padding: "3px 8px", borderRadius: "4px",
          }}>
            -{discountPct}%
          </div>
        )}
      </div>

      {/* Thin divider */}
      <div style={{ height: "1px", background: "#f0f2f2" }} />

      {/* ── Content ── */}
      <div style={{
        padding: "12px 14px 16px",
        display: "flex", flexDirection: "column", flex: 1, gap: "5px",
      }}>

        {/* Category */}
        {product.category_name && (
          <span style={{
            fontSize: "10px", color: "#007185", fontWeight: "700",
            textTransform: "uppercase", letterSpacing: "0.7px",
          }}>
            {product.category_name}
          </span>
        )}

        {/* Product name — turns orange on hover like Amazon */}
        <h3
          onClick={() => navigate(`/product/${product.id}`)}
          style={{
            cursor: "pointer", margin: 0,
            fontSize: "14px", fontWeight: "500", lineHeight: "1.5",
            color: "#0F1111",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#C7511F"}
          onMouseLeave={e => e.currentTarget.style.color = "#0F1111"}
        >
          {product.name}
        </h3>

        {/* Star rating */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Stars rating={rating} />
          <span style={{ fontSize: "13px", color: "#FF9900", fontWeight: "700" }}>{rating}</span>
          <span style={{ color: "#007185", fontSize: "13px" }}>({reviews.toLocaleString()})</span>
        </div>

        {/* Prime badge + free delivery */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <span style={{
            background: "#232f3e", color: "#FF9900",
            fontSize: "10px", fontWeight: "900",
            padding: "2px 6px", borderRadius: "3px", letterSpacing: "1px",
          }}>
            prime
          </span>
          <span style={{ fontSize: "12px", color: "#007600", fontWeight: "600" }}>
            FREE Delivery
          </span>
        </div>

        {/* ── Price block ── */}
        <div style={{ marginTop: "4px" }}>
          {/* Discount % + final price on one line */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "7px", flexWrap: "wrap" }}>
            {discountPct > 0 && (
              <span style={{
                background: "#CC0C39", color: "white",
                fontSize: "12px", fontWeight: "800",
                padding: "1px 7px", borderRadius: "4px",
                alignSelf: "center",
              }}>
                -{discountPct}%
              </span>
            )}
            <span style={{ fontSize: "13px", color: "#0F1111" }}>₹</span>
            <span style={{ fontSize: "24px", fontWeight: "900", color: "#0F1111", lineHeight: 1 }}>
              {Number(product.price).toLocaleString("en-IN")}
            </span>
          </div>

          {/* MRP strikethrough */}
          {originalPrice && (
            <div style={{ fontSize: "13px", color: "#565959", marginTop: "2px" }}>
              M.R.P.:{" "}
              <span style={{ textDecoration: "line-through" }}>
                ₹{Number(originalPrice).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* Savings */}
          {savedAmount > 0 && (
            <div style={{ fontSize: "13px", color: "#CC7722", fontWeight: "700", marginTop: "1px" }}>
              You save ₹{savedAmount.toLocaleString("en-IN")} ({discountPct}%)
            </div>
          )}

          <div style={{ fontSize: "11px", color: "#878787", marginTop: "2px" }}>
            Inclusive of all taxes
          </div>
        </div>

        {/* Stock + delivery date */}
        <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {product.stock != null && product.stock <= 5 ? (
            <span style={{ fontSize: "13px", color: "#CC0C39", fontWeight: "700" }}>
              Only {product.stock} left in stock — order soon.
            </span>
          ) : (
            <span style={{ fontSize: "13px", color: "#007600", fontWeight: "700" }}>In Stock</span>
          )}
          <span style={{ fontSize: "12px", color: "#565959" }}>
            <span style={{ color: "#007600", fontWeight: "700" }}>FREE</span> delivery {deliveryDate}
          </span>
        </div>

        {/* Push buttons to bottom */}
        <div style={{ flex: 1 }} />

        {/* ── Add to Cart ── */}
        <button
          onClick={handleCart}
          style={{
            width: "100%",
            background: cartState === "added" ? "#067D62" : "#FFD814",
            border: cartState === "added" ? "1px solid #067D62" : "1px solid #FCD200",
            borderRadius: "20px",
            padding: "9px 0",
            fontSize: "14px",
            fontWeight: "700",
            cursor: cartState !== "idle" ? "default" : "pointer",
            color: cartState === "added" ? "white" : "#0F1111",
            fontFamily: "inherit",
            marginBottom: "8px",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}
          onMouseEnter={e => {
            if (cartState === "idle") {
              e.currentTarget.style.background = "#F7CA00";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.14)";
            }
          }}
          onMouseLeave={e => {
            if (cartState === "idle") {
              e.currentTarget.style.background = "#FFD814";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
        >
          {cartState === "added"
            ? "✓ Added to Cart"
            : cartState === "adding"
            ? "Adding…"
            : "Add to Cart"}
        </button>

        {/* ── Buy Now ── */}
        <button
          onClick={handleBuyNow}
          style={{
            width: "100%",
            background: "#FF9900",
            border: "1px solid #FF8F00",
            borderRadius: "20px",
            padding: "9px 0",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            color: "#0F1111",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#FA8900";
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.14)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#FF9900";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
