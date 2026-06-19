import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUserId } from "../services/auth";

function TrendingCard({ product, rank, addToCart }) {
  const navigate = useNavigate();

  const rating = product.rating || 4.5;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  const addToWishlist = async () => {
    try {
      await api.post("/wishlist/add", {
        user_id: getUserId(),
        product_id: product.id
      });
      alert("Added To Wishlist ❤️");
    } catch (error) {
      alert("Failed to add to wishlist");
    }
  };

  return (
    <div
      style={{
        width: "196px",
        flexShrink: 0,
        backgroundColor: "white",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #DDD",
        transition: "box-shadow 0.2s, transform 0.18s",
        position: "relative",
        display: "flex",
        flexDirection: "column"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.15)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Rank badge */}
      <div style={{
        position: "absolute",
        top: "8px",
        left: "8px",
        backgroundColor: "#232f3e",
        color: "#FF9900",
        padding: "2px 9px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: "700",
        zIndex: 2,
        letterSpacing: "0.3px"
      }}>
        #{rank}
      </div>

      {/* Discount badge */}
      {product.discount_percent > 0 && (
        <div style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          backgroundColor: "#CC0C39",
          color: "white",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: "700",
          zIndex: 2
        }}>
          -{product.discount_percent}%
        </div>
      )}

      {/* Best seller ribbon */}
      {product.is_best_seller && (
        <div style={{
          position: "absolute",
          top: "32px",
          left: "0",
          backgroundColor: "#c45500",
          color: "white",
          padding: "2px 8px",
          fontSize: "10px",
          fontWeight: "700",
          zIndex: 2,
          borderRadius: "0 4px 4px 0"
        }}>
          Best Seller
        </div>
      )}

      {/* Image */}
      <img
        src={product.image_url}
        alt={product.name}
        onClick={() => navigate(`/product/${product.id}`)}
        style={{
          width: "100%",
          height: "196px",
          objectFit: "cover",
          display: "block",
          cursor: "pointer"
        }}
      />

      {/* Card body */}
      <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Star rating */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
          <span style={{ color: "#FF9900", fontSize: "13px", lineHeight: 1 }}>
            {"★".repeat(fullStars)}
            {hasHalf ? "½" : ""}
            {"☆".repeat(5 - fullStars - (hasHalf ? 1 : 0))}
          </span>
          <span style={{ color: "#007185", fontSize: "11px" }}>
            ({product.reviews || 125})
          </span>
        </div>

        {/* Product name — 2-line clamp */}
        <div
          onClick={() => navigate(`/product/${product.id}`)}
          style={{
            fontSize: "13px",
            fontWeight: "500",
            color: "#0F1111",
            marginBottom: "8px",
            lineHeight: "1.4",
            maxHeight: "36px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            cursor: "pointer"
          }}
        >
          {product.name}
        </div>

        {/* Price */}
        <div style={{ marginBottom: "6px" }}>
          <span style={{ fontSize: "17px", fontWeight: "700", color: "#B12704" }}>
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          {product.original_price && (
            <span style={{ color: "#565959", fontSize: "12px", marginLeft: "6px", textDecoration: "line-through" }}>
              ₹{Number(product.original_price).toLocaleString("en-IN")}
            </span>
          )}
          {product.discount_percent > 0 && (
            <div style={{ color: "#CC7722", fontSize: "12px", fontWeight: "600", marginTop: "1px" }}>
              Save {product.discount_percent}%
            </div>
          )}
        </div>

        {/* FREE delivery */}
        <div style={{ fontSize: "12px", color: "#007600", marginBottom: "10px", flex: 1 }}>
          <span style={{ fontWeight: "600" }}>FREE</span> Delivery
        </div>

        {/* Buttons */}
        <button
          onClick={() => addToCart(product.id)}
          style={{
            width: "100%",
            backgroundColor: "#FFD814",
            border: "1px solid #FCD200",
            borderRadius: "20px",
            padding: "6px 0",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            color: "#0F1111",
            marginBottom: "6px",
            transition: "background-color 0.1s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F7CA00"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FFD814"}
        >
          Add to cart
        </button>
        <button
          onClick={addToWishlist}
          style={{
            width: "100%",
            backgroundColor: "#FFA41C",
            border: "1px solid #FF8F00",
            borderRadius: "20px",
            padding: "6px 0",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            color: "#0F1111",
            transition: "background-color 0.1s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FA8900"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FFA41C"}
        >
          ♡ Wishlist
        </button>
      </div>
    </div>
  );
}

export default TrendingCard;
