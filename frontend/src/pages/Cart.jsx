import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getUserId } from "../services/auth";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get(`/cart/${getUserId()}`);
      setCartItems(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const removeItem = async (itemId) => {
    await api.delete(`/cart/remove/${itemId}`).catch(console.error);
    setCartItems(prev => prev.filter(i => i.cart_item_id !== itemId));
  };

  const updateQuantity = async (itemId, qty) => {
    if (qty < 1) { removeItem(itemId); return; }
    await api.put("/cart/update", { cart_item_id: itemId, quantity: qty }).catch(console.error);
    setCartItems(prev => prev.map(i => i.cart_item_id === itemId ? { ...i, quantity: qty } : i));
  };

  const checkout = () => {
    const userId = getUserId();
    if (!userId) { navigate("/login"); return; }
    navigate("/checkout");
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const delivery = subtotal >= 499 ? 0 : 40;
  const savings = cartItems.reduce((sum, i) => {
    const saved = i.original_price ? (i.original_price - i.price) * i.quantity : 0;
    return sum + saved;
  }, 0);

  return (
    <>
      <style>{`
        .ct-qty-btn { width: 30px; height: 30px; border: 1px solid #aaa; background: linear-gradient(to bottom, #f7f8f8, #e7e9ec); border-radius: 4px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: inherit; transition: background 0.15s; }
        .ct-qty-btn:hover { background: linear-gradient(to bottom, #e7e9ec, #d5d9d9); border-color: #888; }
        .ct-link-btn { background: none; border: none; color: #007185; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; padding: 0; transition: color 0.1s; }
        .ct-link-btn:hover { color: #C7511F; text-decoration: underline; }
        .ct-link-btn.danger { color: #CC0C39; }
        .ct-link-btn.danger:hover { color: #8b0000; }
      `}</style>

      <Navbar />

      <div style={{ background: "#f0f2f2", minHeight: "100vh", padding: "20px 0 60px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>

          <h1 style={{ fontSize: "28px", fontWeight: "400", color: "#0F1111", margin: "0 0 20px", paddingBottom: "16px", borderBottom: "1px solid #ddd" }}>
            Shopping Cart
          </h1>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ color: "#888", fontSize: "16px" }}>Loading your cart…</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div style={{ background: "white", borderRadius: "8px", padding: "60px 40px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0F1111", marginBottom: "10px" }}>Your Amazon Cart is empty</h2>
              <p style={{ color: "#565959", fontSize: "15px", marginBottom: "28px" }}>Shop today's deals and add items to your cart.</p>
              <button
                onClick={() => navigate("/")}
                style={{ background: "#FFD814", border: "1px solid #FCD200", padding: "12px 36px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F7CA00"}
                onMouseLeave={e => e.currentTarget.style.background = "#FFD814"}
              >
                Continue Shopping →
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>

              {/* ── Left: Cart items ── */}
              <div style={{ background: "white", borderRadius: "8px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

                {/* Column header */}
                <div style={{ textAlign: "right", color: "#565959", fontSize: "14px", borderBottom: "1px solid #ddd", paddingBottom: "10px", marginBottom: "4px" }}>
                  Price
                </div>

                {cartItems.map((item, idx) => (
                  <div
                    key={item.cart_item_id}
                    style={{ display: "flex", gap: "20px", padding: "20px 0", borderBottom: idx < cartItems.length - 1 ? "1px solid #f0f2f2" : "none" }}
                  >
                    {/* Image */}
                    <div
                      onClick={() => navigate(`/product/${item.product_id}`)}
                      style={{ flexShrink: 0, width: "120px", height: "120px", background: "#f7f8f9", borderRadius: "8px", overflow: "hidden", border: "1px solid #e8e8e8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}
                    >
                      {item.image_url
                        ? <img src={item.image_url} alt={item.product_name} style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
                        : <span style={{ fontSize: "13px", color: "#bbb", fontWeight: "600" }}>No image</span>
                      }
                    </div>

                    {/* Info + controls */}
                    <div style={{ flex: 1 }}>
                      <h3
                        onClick={() => navigate(`/product/${item.product_id}`)}
                        style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "400", color: "#0F1111", lineHeight: "1.4", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#C7511F"}
                        onMouseLeave={e => e.currentTarget.style.color = "#0F1111"}
                      >
                        {item.product_name}
                      </h3>

                      <div style={{ color: "#007600", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>In Stock</div>

                      {/* Prime */}
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "12px" }}>
                        <span style={{ background: "#232f3e", color: "#FF9900", fontSize: "10px", fontWeight: "900", padding: "2px 6px", borderRadius: "3px", letterSpacing: "1px" }}>prime</span>
                        <span style={{ color: "#007600", fontSize: "12px", fontWeight: "600" }}>FREE Delivery</span>
                      </div>

                      {/* Quantity stepper + actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f0f2f2", border: "1px solid #d5d9d9", borderRadius: "6px", padding: "4px 10px" }}>
                          <button className="ct-qty-btn" style={{ border: "none", background: "none", fontSize: "18px", width: "24px", height: "24px" }}
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}>−</button>
                          <span style={{ fontSize: "15px", fontWeight: "700", minWidth: "24px", textAlign: "center" }}>{item.quantity}</span>
                          <button className="ct-qty-btn" style={{ border: "none", background: "none", fontSize: "18px", width: "24px", height: "24px" }}
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}>+</button>
                        </div>

                        <span style={{ color: "#ddd" }}>|</span>
                        <button className="ct-link-btn danger" onClick={() => removeItem(item.cart_item_id)}>Delete</button>
                        <span style={{ color: "#ddd" }}>|</span>
                        <button className="ct-link-btn" onClick={() => navigate(`/product/${item.product_id}`)}>View item</button>
                        <span style={{ color: "#ddd" }}>|</span>
                        <button className="ct-link-btn">Save for later</button>
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ flexShrink: 0, textAlign: "right", minWidth: "90px" }}>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#0F1111" }}>
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                      {item.quantity > 1 && (
                        <div style={{ fontSize: "12px", color: "#565959", marginTop: "3px" }}>
                          (₹{Number(item.price).toLocaleString("en-IN")} each)
                        </div>
                      )}
                      {item.discount_percent > 0 && (
                        <div style={{ fontSize: "12px", color: "#CC7722", fontWeight: "700", marginTop: "3px" }}>
                          -{item.discount_percent}% off
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Bottom subtotal row */}
                <div style={{ paddingTop: "16px", textAlign: "right", fontSize: "16px", color: "#0F1111" }}>
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}):&nbsp;
                  <strong style={{ fontSize: "20px" }}>₹{subtotal.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              {/* ── Right: Order Summary ── */}
              <div style={{ background: "white", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", position: "sticky", top: "16px" }}>

                {delivery === 0 && (
                  <div style={{ background: "#e7f5e7", border: "1px solid #cce5cc", borderRadius: "6px", padding: "10px 12px", fontSize: "13px", color: "#007600", fontWeight: "600", marginBottom: "16px" }}>
                    ✓ Your order qualifies for <strong>FREE Delivery</strong>
                  </div>
                )}

                <div style={{ fontSize: "18px", color: "#0F1111", marginBottom: "12px", lineHeight: "1.5" }}>
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}):
                  <div style={{ fontSize: "22px", fontWeight: "800" }}>₹{subtotal.toLocaleString("en-IN")}</div>
                </div>

                <div style={{ borderTop: "1px solid #f0f2f2", paddingTop: "12px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {savings > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span style={{ color: "#565959" }}>Savings</span>
                      <span style={{ color: "#CC7722", fontWeight: "700" }}>-₹{Math.round(savings).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "#565959" }}>Delivery</span>
                    <span style={{ color: delivery === 0 ? "#007600" : "#0F1111", fontWeight: "600" }}>
                      {delivery === 0 ? "FREE" : `₹${delivery}`}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "800", paddingTop: "8px", borderTop: "1px solid #f0f2f2" }}>
                    <span>Order Total</span>
                    <span>₹{(subtotal + delivery).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  onClick={checkout}
                  style={{ width: "100%", background: "#FFD814", border: "1px solid #FCD200", borderRadius: "20px", padding: "11px 0", fontSize: "15px", fontWeight: "700", cursor: "pointer", color: "#0F1111", fontFamily: "inherit", marginBottom: "10px", transition: "all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F7CA00"}
                  onMouseLeave={e => e.currentTarget.style.background = "#FFD814"}
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate("/")}
                  style={{ width: "100%", background: "white", border: "1px solid #d5d9d9", borderRadius: "20px", padding: "10px 0", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "#0F1111", fontFamily: "inherit", transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#888"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#d5d9d9"}
                >
                  Continue Shopping
                </button>

                <div style={{ marginTop: "16px", padding: "12px", background: "#f7f8f9", borderRadius: "6px", fontSize: "12px", color: "#555", lineHeight: "1.6" }}>
                  <strong>Safe & Secure</strong> · Easy 30-day returns · FREE delivery on eligible orders
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Cart;
