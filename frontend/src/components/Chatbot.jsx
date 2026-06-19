import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUserId } from "../services/auth";

// ── Tiny star renderer ──────────────────────────────────────────────
function MiniStars({ rating = 4.5 }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <div style={{ position: "relative", display: "inline-block", fontSize: "13px", lineHeight: 1 }}>
      <span style={{ color: "#ddd" }}>★★★★★</span>
      <span style={{ position: "absolute", top: 0, left: 0, overflow: "hidden", width: `${pct}%`, color: "#FF9900", whiteSpace: "nowrap" }}>★★★★★</span>
    </div>
  );
}

// ── Intent detection ────────────────────────────────────────────────
const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Sports", "Books", "Home"];

function detectIntent(text) {
  const t = text.toLowerCase().trim();

  if (/^(hi|hello|hey|hii|helo|namaste|good\s*(morning|evening|afternoon))/.test(t))
    return { type: "greeting" };

  if (/(help|what can you|what do you|how to use|guide|assist)/.test(t))
    return { type: "help" };

  if (/(track|where.*order|order.*status|my order|check order|order.*track|delivery status)/.test(t))
    return { type: "track_order", query: t };

  if (/(show.*orders?|list.*orders?|my orders?|past orders?|order history)/.test(t))
    return { type: "show_orders" };

  if (/(cart|basket|bag|added items?)/.test(t))
    return { type: "cart" };

  if (/(wish\s*list|wishlist|saved items?)/.test(t))
    return { type: "wishlist" };

  if (/(best\s*seller|trending|popular|top\s*product)/.test(t))
    return { type: "bestsellers" };

  if (/(deal|discount|offer|sale|cheap)/.test(t))
    return { type: "deals" };

  for (const cat of CATEGORIES) {
    if (t.includes(cat.toLowerCase())) {
      return { type: "category", category: cat };
    }
  }

  const searchKeywords = /(search|find|show|look.*for|want|buy|get|need|looking for|do you have|suggest|recommend)/;
  if (searchKeywords.test(t)) {
    const query = t
      .replace(/^(can you |please |could you |i want to |i need |i am looking for |i'm looking for )/g, "")
      .replace(/(search for|find me|show me|looking for|want to buy|want a|need a|get me|suggest|recommend)\s*/g, "")
      .replace(/(product|item|something)s?\s*/g, "")
      .trim();
    return { type: "search_product", query: query || t };
  }

  // If it looks like a plain product name (at least 2 chars, no question marks)
  if (t.length > 2 && !t.includes("?") && !/^(yes|no|ok|okay|thanks|thank you|bye|exit)$/.test(t)) {
    return { type: "search_product", query: t };
  }

  return { type: "unknown", text };
}

// ── Bot response engine ─────────────────────────────────────────────
async function getBotResponse(input, navigate) {
  const intent = detectIntent(input);

  switch (intent.type) {
    case "greeting":
      return {
        text: "Hello! I'm your Amazon shopping assistant. I can help you:\n• Search for products\n• Track your orders\n• Browse categories\n\nWhat are you looking for?",
        chips: ["Search products", "Track my order", "Show deals", "Electronics"],
      };

    case "help":
      return {
        text: "Here's what I can do for you:\n\n🔍 Search — \"find me a laptop\"\n📦 Track orders — \"where is my order\"\n🛍️ Browse — \"show electronics\"\n💰 Deals — \"show discounts\"\n⭐ Popular — \"best sellers\"",
        chips: ["Find laptop", "Track order", "Show Electronics", "Best sellers"],
      };

    case "cart":
      navigate("/cart");
      return { text: "Taking you to your cart!" };

    case "wishlist":
      navigate("/wishlist");
      return { text: "Opening your Wish List..." };

    case "show_orders":
      navigate("/orders");
      return { text: "Here are your orders!" };

    case "bestsellers": {
      const res = await api.get("/products/?bestseller=true").catch(() => ({ data: [] }));
      const products = (res.data || []).filter(p => p.is_best_seller).slice(0, 4);
      if (products.length === 0) {
        const all = await api.get("/products/").catch(() => ({ data: [] }));
        const top = (all.data || []).slice(0, 4);
        return { text: "Here are some popular products:", products: top };
      }
      return { text: "Here are our best sellers:", products };
    }

    case "deals": {
      const res = await api.get("/products/").catch(() => ({ data: [] }));
      const deals = (res.data || []).filter(p => p.discount_percent > 0).sort((a, b) => b.discount_percent - a.discount_percent).slice(0, 4);
      if (deals.length === 0) return { text: "No active deals right now. Check back soon!" };
      return { text: "Hot deals right now:", products: deals };
    }

    case "category": {
      navigate(`/?category=${intent.category}`);
      return { text: `Showing all ${intent.category} products!`, chips: ["Search in this category", "Show deals", "Best sellers"] };
    }

    case "track_order": {
      const uid = getUserId();
      if (!uid) return { text: "Please log in first to track your orders.", chips: ["Go to login"] };
      const res = await api.get(`/orders/${uid}`).catch(() => ({ data: [] }));
      const orders = res.data || [];
      if (orders.length === 0) return { text: "You don't have any orders yet.", chips: ["Start shopping"] };
      const latest = orders[0];
      const statusEmoji = { Placed: "✅", Packed: "📦", Shipped: "🚚", Delivered: "🎉", Cancelled: "❌" };
      const eta = (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }); })();
      return {
        text: `Your latest order #${String(latest.id).padStart(6, "0")}:\n${statusEmoji[latest.status] || "📦"} Status: ${latest.status}\n💰 Total: ₹${Number(latest.total_amount).toLocaleString("en-IN")}\n🚚 Est. Delivery: ${eta}`,
        orders: orders.slice(0, 3),
        chips: ["View all orders", "Track another"],
      };
    }

    case "search_product": {
      if (!intent.query || intent.query.length < 2)
        return { text: "What product are you looking for?", chips: ["Laptop", "Phone", "Shoes", "Books"] };
      const res = await api.get(`/products/?search=${encodeURIComponent(intent.query)}`).catch(() => ({ data: [] }));
      const products = (res.data || []).slice(0, 4);
      if (products.length === 0)
        return { text: `No products found for "${intent.query}". Try a different search?`, chips: ["Electronics", "Fashion", "Home & Kitchen"] };
      return { text: `Found ${res.data.length} results for "${intent.query}":`, products };
    }

    default:
      return {
        text: "I'm not sure about that. Try asking me to search for a product or track your order!",
        chips: ["Search products", "Track my order", "Show deals"],
      };
  }
}

// ── ProductCard inside chat ─────────────────────────────────────────
function ChatProductCard({ product, navigate }) {
  const discount = product.discount_percent || 0;
  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      style={{ display: "flex", gap: "10px", padding: "10px", background: "white", border: "1px solid #e8e8e8", borderRadius: "6px", cursor: "pointer", transition: "box-shadow 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ width: "60px", height: "60px", flexShrink: 0, background: "#f7f8f9", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
          : <span style={{ fontSize: "9px", color: "#ccc" }}>img</span>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "12px", color: "#0F1111", fontWeight: "500", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "3px" }}>
          {product.name}
        </div>
        <MiniStars rating={product.rating} />
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "3px" }}>
          {discount > 0 && <span style={{ fontSize: "11px", background: "#CC0C39", color: "white", padding: "1px 4px", borderRadius: "2px", fontWeight: "700" }}>-{discount}%</span>}
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#0F1111" }}>₹{Number(product.price).toLocaleString("en-IN")}</span>
          {product.original_price && product.original_price > product.price && (
            <span style={{ fontSize: "11px", color: "#888" }}><s>₹{Number(product.original_price).toLocaleString("en-IN")}</s></span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Order mini-card inside chat ─────────────────────────────────────
function ChatOrderCard({ order, navigate }) {
  const STATUS_COLOR = { Placed: "#007600", Packed: "#007185", Shipped: "#C7511F", Delivered: "#007600", Cancelled: "#CC0C39" };
  const color = STATUS_COLOR[order.status] || "#007600";
  const firstItem = order.items?.[0];
  return (
    <div
      onClick={() => navigate("/orders")}
      style={{ display: "flex", gap: "10px", padding: "10px", background: "white", border: "1px solid #e8e8e8", borderRadius: "6px", cursor: "pointer", transition: "box-shadow 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {firstItem?.image_url && (
        <div style={{ width: "48px", height: "48px", flexShrink: 0, background: "#f7f8f9", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
          <img src={firstItem.image_url} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color, marginBottom: "2px" }}>{order.status}</div>
        <div style={{ fontSize: "11px", color: "#565959" }}>Order #{String(order.id).padStart(6, "0")}</div>
        <div style={{ fontSize: "12px", fontWeight: "700", color: "#0F1111", marginTop: "2px" }}>₹{Number(order.total_amount).toLocaleString("en-IN")}</div>
      </div>
    </div>
  );
}

// ── Typing indicator ────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "10px 14px", background: "#f0f2f2", borderRadius: "12px 12px 12px 2px", alignSelf: "flex-start", maxWidth: "80px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#888", animation: `typingBounce 1.2s ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

// ── Main Chatbot Component ──────────────────────────────────────────
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm your Amazon assistant. I can help you search products or track orders.",
      chips: ["Search products", "Track my order", "Show deals", "Best sellers"],
    }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const addMessage = (msg) => setMessages(prev => [...prev, msg]);

  const handleSend = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;
    setInput("");

    // Special chip actions
    if (trimmed === "Go to login") { navigate("/login"); return; }
    if (trimmed === "View all orders") { navigate("/orders"); return; }
    if (trimmed === "Start shopping") { navigate("/"); return; }

    addMessage({ from: "user", text: trimmed });
    setTyping(true);

    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    try {
      const response = await getBotResponse(trimmed, navigate);
      setTyping(false);
      addMessage({ from: "bot", ...response });
      if (!open) setUnread(u => u + 1);
    } catch (e) {
      setTyping(false);
      addMessage({ from: "bot", text: "Sorry, something went wrong. Please try again." });
    }
  };

  return (
    <>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badgePop {
          0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); }
        }
        .chat-input:focus { outline: none; border-color: #FF9900 !important; }
        .chat-chip { padding: 6px 12px; background: white; border: 1px solid #d5d9d9; border-radius: 16px; font-size: 12px; color: #007185; cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap; }
        .chat-chip:hover { background: #f0f8ff; border-color: #007185; }
        .chat-send:hover { background: #F7CA00 !important; }
      `}</style>

      {/* Floating toggle button */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: "28px", right: "28px", zIndex: 9999,
          width: "56px", height: "56px", borderRadius: "50%",
          background: "#FF9900", boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
          userSelect: "none",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)"; }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {/* Unread badge */}
        {!open && unread > 0 && (
          <div style={{ position: "absolute", top: "-4px", right: "-4px", background: "#CC0C39", color: "white", borderRadius: "50%", width: "20px", height: "20px", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", animation: "badgePop 0.3s ease" }}>
            {unread}
          </div>
        )}
      </div>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: "96px", right: "28px", zIndex: 9998,
          width: "360px", height: "540px",
          background: "white", borderRadius: "12px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "chatSlideUp 0.22s ease",
          fontFamily: "'DM Sans', Arial, sans-serif",
        }}>

          {/* Header */}
          <div style={{ background: "#131921", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#FF9900", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>Amazon Assistant</div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4CAF50" }} />
                <span style={{ color: "#aaa", fontSize: "11px" }}>Online — here to help</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", display: "flex", padding: "4px" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.from === "user" ? "flex-end" : "flex-start", gap: "6px" }}>

                {/* Bubble */}
                {msg.text && (
                  <div style={{
                    maxWidth: "82%",
                    padding: "10px 13px",
                    borderRadius: msg.from === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                    background: msg.from === "user" ? "#232f3e" : "#f0f2f2",
                    color: msg.from === "user" ? "white" : "#0F1111",
                    fontSize: "13px", lineHeight: "1.5",
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                  }}>
                    {msg.text}
                  </div>
                )}

                {/* Product cards */}
                {msg.products && msg.products.length > 0 && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {msg.products.map(p => <ChatProductCard key={p.id} product={p} navigate={navigate} />)}
                    <button
                      onClick={() => navigate(`/?search=${encodeURIComponent(msg.products[0]?.name?.split(" ")[0] || "")}`)}
                      style={{ fontSize: "12px", color: "#007185", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "2px 0", textDecoration: "underline" }}
                    >
                      See all results →
                    </button>
                  </div>
                )}

                {/* Order cards */}
                {msg.orders && msg.orders.length > 0 && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {msg.orders.map(o => <ChatOrderCard key={o.id} order={o} navigate={navigate} />)}
                  </div>
                )}

                {/* Suggestion chips */}
                {msg.chips && msg.chips.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "100%" }}>
                    {msg.chips.map(chip => (
                      <button key={chip} className="chat-chip" onClick={() => handleSend(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && <TypingDots />}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{ borderTop: "1px solid #e8e8e8", padding: "12px 12px", display: "flex", gap: "8px", flexShrink: 0, background: "white" }}>
            <input
              ref={inputRef}
              className="chat-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask me anything…"
              style={{ flex: 1, padding: "9px 12px", border: "1px solid #d5d9d9", borderRadius: "20px", fontSize: "13px", fontFamily: "inherit", background: "#fafafa" }}
            />
            <button
              className="chat-send"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              style={{
                width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                background: input.trim() ? "#FFD814" : "#f0f2f2",
                border: "none", cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#0F1111" : "#aaa"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

        </div>
      )}
    </>
  );
}
