import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getUserId } from "../services/auth";

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartStates, setCartStates] = useState({});
  const navigate = useNavigate();

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    const userId = getUserId();
    if (!userId) {
      setError("login");
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/wishlist/${userId}`);
      setWishlistItems(res.data);
    } catch (e) {
      console.error(e);
      setError("failed");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (wishlistId) => {
    await api.delete(`/wishlist/remove/${wishlistId}`).catch(console.error);
    setWishlistItems(prev => prev.filter(i => i.wishlist_id !== wishlistId));
  };

  const addToCart = async (productId, wishlistId) => {
    const userId = getUserId();
    if (!userId) { navigate("/login"); return; }
    setCartStates(s => ({ ...s, [wishlistId]: "adding" }));
    try {
      await api.post("/cart/add", { user_id: userId, product_id: productId, quantity: 1 });
      await api.delete(`/wishlist/remove/${wishlistId}`);
      setCartStates(s => ({ ...s, [wishlistId]: "added" }));
      setTimeout(() => {
        setWishlistItems(prev => prev.filter(i => i.wishlist_id !== wishlistId));
      }, 600);
    } catch (e) {
      console.error(e);
      setCartStates(s => ({ ...s, [wishlistId]: "idle" }));
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ background: "#f0f2f2", minHeight: "100vh", padding: "20px 0 60px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>

          {/* Header */}
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0F1111", margin: "0 0 4px" }}>
              Your Wish List
            </h1>
            {!loading && !error && (
              <p style={{ fontSize: "14px", color: "#565959", margin: 0 }}>
                {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
              <p style={{ color: "#888", fontSize: "16px" }}>Loading your wishlist…</p>
            </div>
          )}

          {/* Not logged in */}
          {!loading && error === "login" && (
            <div style={{ background: "white", borderRadius: "8px", padding: "60px 40px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0F1111", marginBottom: "10px" }}>Sign in to view your Wish List</h2>
              <p style={{ color: "#565959", fontSize: "15px", marginBottom: "24px" }}>Save items you love and find them later.</p>
              <button
                onClick={() => navigate("/login")}
                style={{ background: "#FFD814", border: "1px solid #FCD200", padding: "12px 36px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", marginRight: "12px" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F7CA00"}
                onMouseLeave={e => e.currentTarget.style.background = "#FFD814"}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/")}
                style={{ background: "white", border: "1px solid #d5d9d9", padding: "12px 36px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
              >
                Continue Shopping
              </button>
            </div>
          )}

          {/* Fetch error */}
          {!loading && error === "failed" && (
            <div style={{ background: "white", borderRadius: "8px", padding: "40px", textAlign: "center", color: "#CC0C39" }}>
              Unable to load wishlist. Please try again.
            </div>
          )}

          {/* Empty wishlist */}
          {!loading && !error && wishlistItems.length === 0 && (
            <div style={{ background: "white", borderRadius: "8px", padding: "60px 40px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0F1111", marginBottom: "10px" }}>Your Wish List is empty</h2>
              <p style={{ color: "#565959", fontSize: "15px", marginBottom: "28px" }}>Explore products and save your favourites here.</p>
              <button
                onClick={() => navigate("/")}
                style={{ background: "#FFD814", border: "1px solid #FCD200", padding: "12px 36px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F7CA00"}
                onMouseLeave={e => e.currentTarget.style.background = "#FFD814"}
              >
                Start Shopping →
              </button>
            </div>
          )}

          {/* Wishlist grid */}
          {!loading && !error && wishlistItems.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {wishlistItems.map(item => {
                const cs = cartStates[item.wishlist_id] || "idle";
                return (
                  <div
                    key={item.wishlist_id}
                    style={{ background: "white", borderRadius: "10px", overflow: "hidden", border: "1px solid #e8e8e8", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "box-shadow 0.2s, transform 0.2s", display: "flex", flexDirection: "column" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "none"; }}
                  >
                    {/* Image */}
                    <div
                      onClick={() => navigate(`/product/${item.product_id}`)}
                      style={{ height: "180px", background: "#f7f8f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "14px", cursor: "pointer", position: "relative" }}
                    >
                      {item.image_url
                        ? <img src={item.image_url} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
                        : <span style={{ fontSize: "13px", color: "#bbb", fontWeight: "600" }}>No image</span>
                      }
                      {item.discount_percent > 0 && (
                        <div style={{ position: "absolute", top: "10px", left: "10px", background: "#CC0C39", color: "white", fontSize: "11px", fontWeight: "800", padding: "2px 7px", borderRadius: "3px" }}>
                          -{item.discount_percent}%
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3
                        onClick={() => navigate(`/product/${item.product_id}`)}
                        style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "500", color: "#0F1111", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#C7511F"}
                        onMouseLeave={e => e.currentTarget.style.color = "#0F1111"}
                      >
                        {item.name}
                      </h3>

                      {/* Price */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "18px", fontWeight: "700", color: "#0F1111" }}>₹{Number(item.price).toLocaleString("en-IN")}</span>
                        {item.original_price && item.original_price > item.price && (
                          <span style={{ fontSize: "12px", color: "#888" }}><s>₹{Number(item.original_price).toLocaleString("en-IN")}</s></span>
                        )}
                      </div>

                      {/* Prime */}
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "14px" }}>
                        <span style={{ background: "#232f3e", color: "#FF9900", fontSize: "9px", fontWeight: "900", padding: "2px 5px", borderRadius: "3px", letterSpacing: "1px" }}>prime</span>
                        <span style={{ color: "#007600", fontSize: "12px", fontWeight: "600" }}>FREE Delivery</span>
                      </div>

                      {/* Buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
                        <button
                          onClick={() => addToCart(item.product_id, item.wishlist_id)}
                          disabled={cs !== "idle"}
                          style={{ width: "100%", padding: "9px 0", border: "1px solid", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: cs !== "idle" ? "default" : "pointer", fontFamily: "inherit", background: cs === "added" ? "#067D62" : "#FFD814", borderColor: cs === "added" ? "#067D62" : "#FCD200", color: cs === "added" ? "white" : "#0F1111", transition: "all 0.15s" }}
                        >
                          {cs === "adding" ? "Adding…" : cs === "added" ? "✓ Moved to Cart" : "Add to Cart"}
                        </button>

                        <button
                          onClick={() => removeItem(item.wishlist_id)}
                          style={{ width: "100%", padding: "8px 0", border: "1px solid #d5d9d9", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", background: "white", color: "#CC0C39", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.borderColor = "#CC0C39"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#d5d9d9"; }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default Wishlist;
