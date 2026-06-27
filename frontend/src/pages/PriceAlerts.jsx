import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getUserId } from "../services/auth";

function PriceAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) { navigate("/login"); return; }
    fetchAlerts(userId);
  }, []);

  const fetchAlerts = async (userId) => {
    setLoading(true);
    try {
      const res = await api.get(`/price-tracker/alerts/${userId}`);
      setAlerts(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const deleteAlert = async (alertId) => {
    try {
      await api.delete(`/price-tracker/alerts/${alertId}`);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (e) { console.error(e); }
  };

  const triggered = alerts.filter(a => a.is_triggered);
  const active    = alerts.filter(a => !a.is_triggered);

  return (
    <>
      <Navbar />
      <div style={{ background: "#f0f2f2", minHeight: "100vh", padding: "28px 0 60px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0F1111", margin: 0 }}>Price Alerts</h1>
              <p style={{ fontSize: "14px", color: "#565959", marginTop: "4px" }}>
                We'll notify you here when a tracked product hits your target price.
              </p>
            </div>
            <Link to="/" style={{ fontSize: "13px", color: "#007185", textDecoration: "none", fontWeight: "600" }}>
              ← Continue Shopping
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#888" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
              <p>Loading your price alerts…</p>
            </div>
          ) : alerts.length === 0 ? (
            <div style={{ background: "white", borderRadius: "12px", padding: "60px 40px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔔</div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#0F1111", marginBottom: "8px" }}>No Price Alerts Yet</div>
              <p style={{ fontSize: "14px", color: "#565959", maxWidth: "380px", margin: "0 auto 24px" }}>
                Visit any product page and click "Track Price" to set a target price. We'll alert you right here when it drops.
              </p>
              <Link
                to="/"
                style={{ display: "inline-block", padding: "11px 28px", background: "#FFD814", borderRadius: "20px", fontSize: "15px", fontWeight: "700", color: "#0F1111", textDecoration: "none" }}
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <>
              {/* Triggered alerts banner */}
              {triggered.length > 0 && (
                <div style={{ background: "linear-gradient(135deg, #067D62 0%, #0a9670 100%)", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ fontSize: "36px" }}>🎉</div>
                  <div>
                    <div style={{ color: "white", fontSize: "18px", fontWeight: "700", marginBottom: "2px" }}>
                      Price Dropped on {triggered.length} item{triggered.length > 1 ? "s" : ""}!
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px" }}>
                      Your target price has been reached. Grab them before the deal ends!
                    </div>
                  </div>
                </div>
              )}

              {/* Alert cards */}
              {[...triggered, ...active].map(alert => {
                const saving = alert.target_price - alert.current_price;
                const dropNeeded = alert.current_price - alert.target_price;
                const pct = Math.round(((alert.current_price - alert.target_price) / alert.current_price) * 100);

                return (
                  <div
                    key={alert.id}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "16px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      border: alert.is_triggered ? "2px solid #067D62" : "1px solid #e8e8e8",
                      display: "flex",
                      gap: "20px",
                      alignItems: "center",
                    }}
                  >
                    {/* Product image */}
                    <div
                      onClick={() => navigate(`/product/${alert.product_id}`)}
                      style={{ width: "80px", height: "80px", flexShrink: 0, cursor: "pointer", background: "#f7f7f7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
                    >
                      <img
                        src={alert.product_image}
                        alt={alert.product_name}
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
                        onError={e => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                        <div
                          onClick={() => navigate(`/product/${alert.product_id}`)}
                          style={{ fontSize: "15px", fontWeight: "600", color: "#0F1111", lineHeight: "1.4", cursor: "pointer", flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#C45500"}
                          onMouseLeave={e => e.currentTarget.style.color = "#0F1111"}
                        >
                          {alert.product_name}
                        </div>
                        {alert.is_triggered && (
                          <span style={{ flexShrink: 0, background: "#067D62", color: "white", fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "12px", letterSpacing: "0.3px" }}>
                            PRICE DROPPED!
                          </span>
                        )}
                      </div>

                      {/* Price comparison */}
                      <div style={{ display: "flex", gap: "24px", marginBottom: "10px", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: "11px", color: "#565959", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Current Price</div>
                          <div style={{ fontSize: "20px", fontWeight: "700", color: alert.is_triggered ? "#067D62" : "#0F1111" }}>
                            ₹{alert.current_price.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", color: "#888", fontSize: "20px" }}>→</div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#565959", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Your Target</div>
                          <div style={{ fontSize: "20px", fontWeight: "700", color: "#007185" }}>
                            ₹{alert.target_price.toLocaleString("en-IN")}
                          </div>
                        </div>
                        {alert.is_triggered ? (
                          <div>
                            <div style={{ fontSize: "11px", color: "#565959", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.4px" }}>You Save</div>
                            <div style={{ fontSize: "20px", fontWeight: "700", color: "#CC7722" }}>
                              ₹{Math.abs(saving).toLocaleString("en-IN")}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: "11px", color: "#565959", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Still Needs to Drop</div>
                            <div style={{ fontSize: "20px", fontWeight: "700", color: "#CC0C39" }}>
                              ₹{dropNeeded.toLocaleString("en-IN")} ({pct}%)
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      {!alert.is_triggered && (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "11px", color: "#565959" }}>Target ₹{alert.target_price.toLocaleString("en-IN")}</span>
                            <span style={{ fontSize: "11px", color: "#565959" }}>Current ₹{alert.current_price.toLocaleString("en-IN")}</span>
                          </div>
                          <div style={{ height: "6px", background: "#f0f2f2", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.max(5, 100 - pct)}%`, background: "linear-gradient(90deg, #067D62, #FF9900)", borderRadius: "3px", transition: "width 0.5s" }} />
                          </div>
                          <div style={{ fontSize: "11px", color: "#565959", marginTop: "3px" }}>
                            {100 - pct}% of the way to your target
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                      {alert.is_triggered && (
                        <button
                          onClick={() => navigate(`/product/${alert.product_id}`)}
                          style={{ padding: "10px 18px", background: "#FFD814", border: "1px solid #FCD200", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", color: "#0F1111", whiteSpace: "nowrap" }}
                        >
                          Buy Now
                        </button>
                      )}
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        style={{ padding: "8px 18px", background: "white", border: "1px solid #d5d9d9", borderRadius: "20px", fontSize: "13px", cursor: "pointer", color: "#CC0C39", fontWeight: "600", whiteSpace: "nowrap" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#CC0C39"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#d5d9d9"}
                      >
                        Remove Alert
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default PriceAlerts;
