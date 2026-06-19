import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getUserId } from "../services/auth";

const STAGES = ["Order Placed", "Packed", "Shipped", "Delivered"];

const STATUS_COLOR = {
  Placed:    "#007600",
  Packed:    "#007185",
  Shipped:   "#C7511F",
  Delivered: "#007600",
  Cancelled: "#CC0C39",
};

function TrackBar({ status }) {
  const map = { Placed: 0, Packed: 1, Shipped: 2, Delivered: 3 };
  const cur = map[status] ?? 0;
  if (status === "Cancelled") return null;
  return (
    <div style={{ display: "flex", alignItems: "center", margin: "16px 0 4px" }}>
      {STAGES.map((s, i) => {
        const done = cur > i;
        const active = cur === i;
        const isLast = i === STAGES.length - 1;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: isLast ? "none" : 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                background: done || active ? "#FF9900" : "#d5d9d9",
                border: `3px solid ${done || active ? "#FF9900" : "#d5d9d9"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: "11px", fontWeight: active ? "700" : "400", color: active ? "#0F1111" : "#565959", whiteSpace: "nowrap" }}>
                {s}
              </span>
            </div>
            {!isLast && (
              <div style={{ flex: 1, height: "3px", background: cur > i ? "#FF9900" : "#d5d9d9", margin: "-14px 4px 0", minWidth: "20px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const PERIOD_FILTERS = [
  { key: "all", label: "All Orders" },
  { key: "30", label: "Past 30 days" },
  { key: "90", label: "Past 3 months" },
  { key: String(new Date().getFullYear()), label: String(new Date().getFullYear()) },
  { key: String(new Date().getFullYear() - 1), label: String(new Date().getFullYear() - 1) },
];

function filterByPeriod(orders, period) {
  if (period === "all") return orders;
  const now = Date.now();
  if (period === "30") return orders.filter(o => o.created_at && now - new Date(o.created_at) < 30 * 86400000);
  if (period === "90") return orders.filter(o => o.created_at && now - new Date(o.created_at) < 90 * 86400000);
  return orders.filter(o => o.created_at && new Date(o.created_at).getFullYear() === Number(period));
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchParams] = useSearchParams();
  const justPlaced = searchParams.get("placed") === "1";
  const navigate = useNavigate();

  useEffect(() => {
    const uid = getUserId();
    if (!uid) { navigate("/login"); return; }
    api.get(`/orders/${uid}`)
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const periodFiltered = filterByPeriod(orders, period);
  const displayOrders = search
    ? periodFiltered.filter(o =>
        String(o.id).includes(search) ||
        o.items?.some(i => i.name?.toLowerCase().includes(search.toLowerCase()))
      )
    : periodFiltered;

  const fmtDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };
  const shortDate = (iso) => {
    if (!iso) return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };
  const deliveryDate = (iso) => {
    const base = iso ? new Date(iso) : new Date();
    base.setDate(base.getDate() + 5);
    return base.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  };

  const statusHeadline = (order) => {
    switch (order.status) {
      case "Delivered": return `Delivered ${fmtDate(order.created_at)}`;
      case "Shipped":   return `Out for delivery — arriving ${deliveryDate(order.created_at)}`;
      case "Packed":    return `Arriving ${deliveryDate(order.created_at)}`;
      case "Cancelled": return "Order cancelled";
      default:          return `Arriving ${deliveryDate(order.created_at)}`;
    }
  };

  return (
    <>
      <style>{`
        .ord-period-tab { padding: 8px 14px; font-size: 14px; font-weight: 400; color: #0F1111; background: none; border: 1px solid #d5d9d9; border-right: none; cursor: pointer; font-family: inherit; transition: background 0.15s; white-space: nowrap; }
        .ord-period-tab:first-child { border-radius: 8px 0 0 8px; }
        .ord-period-tab:last-child { border-radius: 0 8px 8px 0; border-right: 1px solid #d5d9d9; }
        .ord-period-tab:hover { background: #f0f2f2; }
        .ord-period-tab.active { background: #232f3e; color: white; border-color: #232f3e; }
        .ord-action-btn { padding: 8px 16px; font-size: 13px; font-weight: 400; color: #0F1111; background: #f0f2f2; border: 1px solid #d5d9d9; border-radius: 8px; cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap; }
        .ord-action-btn:hover { background: #e7e9ec; border-color: #adb1b8; }
        .ord-card { background: white; border: 1px solid #d5d9d9; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
        .ord-buy-again { padding: 8px 16px; font-size: 13px; font-weight: 700; color: #0F1111; background: #FFD814; border: 1px solid #FCD200; border-radius: 8px; cursor: pointer; font-family: inherit; transition: background 0.15s; white-space: nowrap; }
        .ord-buy-again:hover { background: #F7CA00; }
      `}</style>

      <Navbar />

      <div style={{ background: "#f0f2f2", minHeight: "100vh", paddingBottom: "60px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px 24px 0" }}>

          {/* Success banner */}
          {justPlaced && (
            <div style={{ background: "#ddffdd", border: "1px solid #007600", borderRadius: "4px", padding: "14px 18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <div>
                <span style={{ fontWeight: "700", color: "#007600", fontSize: "14px" }}>Order placed, thank you!</span>
                <span style={{ color: "#007600", fontSize: "14px" }}> Confirmation will be sent to your email.</span>
              </div>
            </div>
          )}

          {/* Page title + search row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "400", color: "#0F1111", margin: 0 }}>Your Orders</h1>

            {/* Search bar */}
            <div style={{ display: "flex", gap: "0" }}>
              <input
                type="text"
                placeholder="Search all orders"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setSearch(searchInput)}
                style={{ padding: "9px 14px", border: "1px solid #888", borderRight: "none", borderRadius: "4px 0 0 4px", fontSize: "13px", width: "240px", fontFamily: "inherit", outline: "none" }}
              />
              <button
                onClick={() => setSearch(searchInput)}
                style={{ padding: "9px 16px", background: "#FFD814", border: "1px solid #FCD200", borderRadius: "0 4px 4px 0", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}
              >
                Search Orders
              </button>
              {search && (
                <button
                  onClick={() => { setSearch(""); setSearchInput(""); }}
                  style={{ marginLeft: "8px", padding: "9px 12px", background: "white", border: "1px solid #d5d9d9", borderRadius: "4px", cursor: "pointer", fontSize: "13px", color: "#007185" }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Period filter tabs */}
          <div style={{ display: "flex", marginBottom: "16px", flexWrap: "wrap", gap: "0" }}>
            {PERIOD_FILTERS.map(f => (
              <button
                key={f.key}
                className={`ord-period-tab${period === f.key ? " active" : ""}`}
                onClick={() => setPeriod(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Order count */}
          {!loading && (
            <p style={{ fontSize: "14px", color: "#565959", margin: "0 0 12px" }}>
              {displayOrders.length} {displayOrders.length === 1 ? "order" : "orders"} placed in
              {period === "all" ? " all time" : period === "30" ? " past 30 days" : period === "90" ? " past 3 months" : ` ${period}`}
            </p>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ background: "white", border: "1px solid #d5d9d9", borderRadius: "8px", padding: "60px", textAlign: "center" }}>
              <p style={{ color: "#565959", fontSize: "15px", margin: 0 }}>Loading your orders…</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && displayOrders.length === 0 && (
            <div style={{ background: "white", border: "1px solid #d5d9d9", borderRadius: "8px", padding: "60px 40px", textAlign: "center" }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#d5d9d9" strokeWidth="1.5" style={{ marginBottom: "16px" }}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0F1111", margin: "0 0 8px" }}>
                {search ? `No orders found for "${search}"` : "No orders found"}
              </h2>
              <p style={{ fontSize: "14px", color: "#565959", margin: "0 0 24px" }}>
                {search ? "Try a different search term." : "You have not placed any orders yet."}
              </p>
              <button
                onClick={() => navigate("/")}
                style={{ padding: "10px 28px", background: "#FFD814", border: "1px solid #FCD200", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F7CA00"}
                onMouseLeave={e => e.currentTarget.style.background = "#FFD814"}
              >
                Continue Shopping
              </button>
            </div>
          )}

          {/* Order cards */}
          {displayOrders.map(order => {
            const statusColor = STATUS_COLOR[order.status] || "#007600";
            const payLabel = order.payment_method === "COD" ? "Cash on Delivery" : order.payment_method === "UPI" ? "UPI / Net Banking" : order.payment_method === "CARD" ? "Credit / Debit Card" : order.payment_method || "COD";

            return (
              <div key={order.id} className="ord-card">

                {/* Card header — same grey bar Amazon uses */}
                <div style={{ background: "#f7f8f9", padding: "12px 18px", borderBottom: "1px solid #d5d9d9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#565959", textTransform: "uppercase", letterSpacing: "0.6px" }}>Order Placed</div>
                      <div style={{ fontSize: "13px", color: "#0F1111", marginTop: "3px" }}>{shortDate(order.created_at)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#565959", textTransform: "uppercase", letterSpacing: "0.6px" }}>Total</div>
                      <div style={{ fontSize: "13px", color: "#0F1111", marginTop: "3px", fontWeight: "700" }}>
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#565959", textTransform: "uppercase", letterSpacing: "0.6px" }}>Payment</div>
                      <div style={{ fontSize: "13px", color: "#0F1111", marginTop: "3px" }}>{payLabel}</div>
                    </div>
                    {order.delivery_address && (
                      <div style={{ maxWidth: "220px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#565959", textTransform: "uppercase", letterSpacing: "0.6px" }}>Ship To</div>
                        <div style={{ fontSize: "13px", color: "#007185", marginTop: "3px", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {order.delivery_address.split(",")[0]}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#565959" }}>
                      ORDER # <span style={{ color: "#007185", fontWeight: "600" }}>{String(order.id).padStart(6, "0")}</span>
                    </div>
                    <button
                      onClick={() => {}}
                      style={{ marginTop: "4px", fontSize: "12px", color: "#007185", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                    >
                      View order details
                    </button>
                    {" | "}
                    <button
                      onClick={() => {}}
                      style={{ marginTop: "4px", fontSize: "12px", color: "#007185", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                    >
                      Invoice
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

                    {/* Left: status + items */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                      {/* Status headline */}
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{ fontSize: "18px", fontWeight: "700", color: statusColor, marginBottom: "2px" }}>
                          {statusHeadline(order)}
                        </div>
                        {order.status !== "Cancelled" && order.status !== "Delivered" && (
                          <div style={{ fontSize: "13px", color: "#565959" }}>
                            Package will be handed to carrier soon
                          </div>
                        )}
                      </div>

                      {/* Tracker bar */}
                      <TrackBar status={order.status} />

                      {/* Items */}
                      {order.items && order.items.length > 0 && (
                        <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              style={{ display: "flex", gap: "14px", alignItems: "center" }}
                            >
                              {/* Product image */}
                              <div
                                onClick={() => item.product_id && navigate(`/product/${item.product_id}`)}
                                style={{ width: "100px", height: "100px", flexShrink: 0, background: "#f7f8f9", border: "1px solid #e8e8e8", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", padding: "6px", cursor: item.product_id ? "pointer" : "default" }}
                              >
                                {item.image_url
                                  ? <img src={item.image_url} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
                                  : <span style={{ fontSize: "10px", color: "#ccc" }}>No image</span>
                                }
                              </div>

                              {/* Item details */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  onClick={() => item.product_id && navigate(`/product/${item.product_id}`)}
                                  style={{ fontSize: "14px", color: "#007185", marginBottom: "4px", cursor: item.product_id ? "pointer" : "default", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                                  onMouseEnter={e => { if (item.product_id) e.currentTarget.style.color = "#C7511F"; e.currentTarget.style.textDecoration = "underline"; }}
                                  onMouseLeave={e => { e.currentTarget.style.color = "#007185"; e.currentTarget.style.textDecoration = "none"; }}
                                >
                                  {item.name}
                                </div>
                                <div style={{ fontSize: "13px", color: "#565959", marginBottom: "4px" }}>
                                  Qty: {item.quantity}
                                </div>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F1111" }}>
                                  ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                                </div>
                                {order.status === "Delivered" && (
                                  <button
                                    onClick={() => item.product_id && navigate(`/product/${item.product_id}#reviews`)}
                                    style={{ marginTop: "6px", fontSize: "12px", color: "#007185", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                                  >
                                    Write a product review
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: action buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0, minWidth: "160px" }}>
                      {order.status !== "Cancelled" && (
                        <button
                          className="ord-action-btn"
                          style={{ width: "100%", textAlign: "center" }}
                        >
                          Track Package
                        </button>
                      )}
                      {order.items && order.items[0]?.product_id && (
                        <button
                          className="ord-buy-again"
                          style={{ width: "100%", textAlign: "center" }}
                          onClick={async () => {
                            const uid = getUserId();
                            if (!uid) { navigate("/login"); return; }
                            await api.post("/cart/add", { user_id: uid, product_id: order.items[0].product_id, quantity: 1 }).catch(console.error);
                            navigate("/cart");
                          }}
                        >
                          Buy it again
                        </button>
                      )}
                      <button
                        className="ord-action-btn"
                        style={{ width: "100%", textAlign: "center" }}
                        onClick={() => order.items?.[0]?.product_id && navigate(`/product/${order.items[0].product_id}`)}
                      >
                        View your item
                      </button>
                      {order.status === "Delivered" && (
                        <button className="ord-action-btn" style={{ width: "100%", textAlign: "center" }}>
                          Return or Replace
                        </button>
                      )}
                      {!["Delivered", "Cancelled"].includes(order.status) && (
                        <button
                          className="ord-action-btn"
                          style={{ width: "100%", textAlign: "center", color: "#CC0C39" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#8b0000"}
                          onMouseLeave={e => e.currentTarget.style.color = "#CC0C39"}
                        >
                          Cancel order
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </>
  );
}
