import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import TrendingCard from "../components/TrendingCard";
import api from "../services/api";

const HERO_SLIDES = [
  {
    bg: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    tag: "MEGA SALE",
    headline: "Up to 70% OFF",
    sub: "Electronics, Fashion, Home & More — deals refreshed every hour",
    cta: "Shop Now",
    accent: "#FF9900",
  },
  {
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    tag: "FLASH DEALS",
    headline: "New Arrivals Daily",
    sub: "Fresh drops every morning — grab them before they're gone",
    cta: "Explore Deals",
    accent: "#4FC3F7",
  },
  {
    bg: "linear-gradient(135deg, #2d1b69 0%, #553c9a 50%, #11998e 100%)",
    tag: "BEST VALUE",
    headline: "Top Brands, Best Prices",
    sub: "Authentic products from verified sellers, shipped fast",
    cta: "Browse Brands",
    accent: "#A5F3FC",
  },
];

const VALUE_PROPS = [
  ["Free Delivery", "On orders above ₹499"],
  ["Easy Returns", "30-day hassle-free returns"],
  ["Secure Payment", "100% protected checkout"],
  ["24/7 Support", "Always here to help"],
];

const FOOTER_COLS = [
  ["Get to Know Us", ["About Us", "Careers", "Press Releases"]],
  ["Make Money with Us", ["Sell on Amazon", "Become an Affiliate", "Advertise"]],
  ["Payment Products", ["Amazon Pay", "Amazon Pay UPI", "Business Card"]],
  ["Let Us Help You", ["Your Account", "Returns Centre", "Track Package", "Help"]],
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");
  const [timeLeft, setTimeLeft] = useState(3600 * 5);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [heroSlide, setHeroSlide] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const recentRef = useRef(null);

  const trendingRef = useRef(null);

  // Sync state from URL query params whenever they change
  useEffect(() => {
    const cat  = searchParams.get("category");
    const q    = searchParams.get("search");
    const sort = searchParams.get("sort");
    const bs   = searchParams.get("bestsellers");

    setSelectedCategory(cat || "All");
    setSearchTerm(q || "");

    if (sort === "discount") setSortOption("discount");
    else if (bs === "true")  setSortOption("bestsellers");
    else if (!sort && !bs)   setSortOption("default");

    // Scroll to deals section if a filter is active
    if (cat || q || sort || bs) {
      setTimeout(() => {
        document.getElementById("deals-section")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [searchParams]);

  const scrollTrending = (dir) => {
    trendingRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  useEffect(() => {
    Promise.all([
      api.get("/products/").then(r => setProducts(r.data)).catch(console.error),
      api.get("/products/trending").then(r => setTrendingProducts(r.data)).catch(console.error),
    ]);
    // Load recently viewed from localStorage
    try {
      const rv = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
      setRecentlyViewed(rv);
    } catch {}
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroSlide(p => (p + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const addToCart = (product) => console.log("Add to cart:", product);

  const categories = ["All", ...new Set(products.map(p => p.category_name))];

  const filteredProducts = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === "All" || p.category_name === selectedCategory;
      const matchBS = sortOption === "bestsellers" ? p.is_best_seller : true;
      return matchSearch && matchCat && matchBS;
    })
    .sort((a, b) => {
      if (sortOption === "low")      return a.price - b.price;
      if (sortOption === "high")     return b.price - a.price;
      if (sortOption === "name")     return a.name.localeCompare(b.name);
      if (sortOption === "discount") return (b.discount_percent || 0) - (a.discount_percent || 0);
      return 0;
    });

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const slide = HERO_SLIDES[heroSlide];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes countPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .trending-scroll::-webkit-scrollbar { display: none; }
        .hp-pill:hover  { background: #FF9900 !important; color: white !important; transform: translateY(-1px); }
        .hp-search:focus { outline: none; box-shadow: 0 0 0 3px rgba(255,153,0,0.25); border-color: #FF9900 !important; }
        .hp-sort:focus   { outline: none; border-color: #FF9900 !important; }
        .hp-cta:hover    { filter: brightness(1.1); transform: scale(1.04); }
        .hp-arrow-btn:hover { background: rgba(255,255,255,0.25) !important; }
        .hp-scroll-arrow:hover { background: #f7f8f8 !important; }
        .hp-footer-link:hover  { color: #FF9900 !important; }
        .hp-value-card:hover   { background: rgba(255,255,255,0.06) !important; }
        .hp-dot { transition: all 0.35s ease; cursor: pointer; }
        .hp-card-hover:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.13) !important; transform: translateY(-2px); }
      `}</style>

      <Navbar />

      {/* ── Hero Carousel ── */}
      <div style={{ position: "relative", height: "460px", overflow: "hidden", background: slide.bg, transition: "background 1s ease" }}>
        {/* Decorative orbs */}
        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", right: "-150px", top: "-150px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "350px", height: "350px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", left: "-80px", bottom: "-80px", pointerEvents: "none" }} />

        {/* Slide content */}
        <div
          key={heroSlide}
          style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", animation: "fadeUp 0.6s ease-out" }}
        >
          <div style={{ display: "inline-block", background: slide.accent, color: "#0F1111", padding: "6px 22px", borderRadius: "24px", fontSize: "12px", fontWeight: "800", marginBottom: "22px", letterSpacing: "1.5px", boxShadow: `0 4px 16px rgba(0,0,0,0.2)` }}>
            {slide.tag}
          </div>
          <h1 style={{ color: "white", fontSize: "clamp(44px, 7vw, 82px)", fontWeight: "900", margin: "0 0 18px", lineHeight: 1.05, textShadow: "0 4px 24px rgba(0,0,0,0.35)", letterSpacing: "-1px" }}>
            {slide.headline}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "clamp(15px, 2vw, 19px)", margin: "0 0 36px", fontWeight: "400", maxWidth: "560px", lineHeight: 1.6 }}>
            {slide.sub}
          </p>
          <button
            className="hp-cta"
            onClick={() => document.getElementById("deals-section")?.scrollIntoView({ behavior: "smooth" })}
            style={{ background: slide.accent, color: "#0F1111", border: "none", padding: "15px 44px", borderRadius: "32px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 8px 28px rgba(0,0,0,0.28)", letterSpacing: "0.3px" }}
          >
            {slide.cta} →
          </button>
        </div>

        {/* Prev / Next arrows */}
        {[[-1, "left", "‹"], [1, "right", "›"]].map(([dir, side, ch]) => (
          <button
            key={side}
            className="hp-arrow-btn"
            onClick={() => setHeroSlide(p => (p + dir + HERO_SLIDES.length) % HERO_SLIDES.length)}
            style={{ position: "absolute", [side]: "24px", top: "50%", transform: "translateY(-50%)", width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.25)", color: "white", fontSize: "26px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", zIndex: 3, transition: "background 0.2s" }}
          >
            {ch}
          </button>
        ))}

        {/* Dot indicators */}
        <div style={{ position: "absolute", bottom: "22px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 3 }}>
          {HERO_SLIDES.map((_, i) => (
            <div
              key={i}
              className="hp-dot"
              onClick={() => setHeroSlide(i)}
              style={{ width: i === heroSlide ? "28px" : "8px", height: "8px", borderRadius: "4px", background: i === heroSlide ? slide.accent : "rgba(255,255,255,0.35)" }}
            />
          ))}
        </div>
      </div>

      {/* ── Value Props Bar ── */}
      <div style={{ background: "#232f3e" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {VALUE_PROPS.map(([title, sub]) => (
            <div
              key={title}
              className="hp-value-card"
              style={{ display: "flex", alignItems: "center", gap: "14px", padding: "18px 24px", borderRight: "1px solid rgba(255,255,255,0.07)", transition: "background 0.2s", cursor: "default" }}
            >
              <div>
                <div style={{ color: "white", fontWeight: "700", fontSize: "13px" }}>{title}</div>
                <div style={{ color: "#9aabb8", fontSize: "12px", marginTop: "2px" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Page Body ── */}
      <div style={{ background: "#f0f2f2" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>

          {/* ── Category Quick Links ── */}
          <div style={{ paddingTop: "28px" }}>
            <div style={{ background: "white", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 1px 5px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "700", color: "#0F1111", letterSpacing: "0.2px" }}>
                Shop by Category
              </h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className="hp-pill"
                    onClick={() => {
                      setSelectedCategory(cat);
                      document.getElementById("deals-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    style={{ padding: "8px 20px", border: "none", borderRadius: "22px", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.18s", background: selectedCategory === cat ? "#FF9900" : "#EAEDED", color: selectedCategory === cat ? "white" : "#333" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Trending Products ── */}
          <div style={{ paddingTop: "20px" }}>
            <div style={{ background: "white", borderRadius: "10px", padding: "20px 24px 26px", boxShadow: "0 1px 5px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "14px", borderBottom: "3px solid #FF9900", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0F1111" }}>Trending Products</h2>
                  <span style={{ background: "#CC0C39", color: "white", fontSize: "10px", padding: "2px 9px", borderRadius: "12px", fontWeight: "800", letterSpacing: "0.8px" }}>HOT</span>
                </div>
                <a
                  href="#deals-section"
                  style={{ color: "#007185", fontSize: "13px", fontWeight: "600" }}
                  onMouseEnter={e => e.target.style.textDecoration = "underline"}
                  onMouseLeave={e => e.target.style.textDecoration = "none"}
                >
                  See all →
                </a>
              </div>

              <div style={{ position: "relative" }}>
                {([-1, "‹"], [1, "›"]) && null}
                <button
                  className="hp-scroll-arrow"
                  onClick={() => scrollTrending(-1)}
                  style={{ position: "absolute", left: "-14px", top: "50%", transform: "translateY(-50%)", zIndex: 10, width: "36px", height: "36px", borderRadius: "50%", background: "white", border: "1px solid #d5d9d9", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F1111", padding: 0, transition: "background 0.15s" }}
                >
                  ‹
                </button>
                <div
                  ref={trendingRef}
                  className="trending-scroll"
                  style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "4px", msOverflowStyle: "none" }}
                >
                  {trendingProducts.length === 0 ? (
                    <p style={{ color: "#888", fontSize: "14px", padding: "40px 0" }}>Loading trending products…</p>
                  ) : (
                    trendingProducts.map((product, i) => (
                      <TrendingCard key={product.id} product={product} rank={i + 1} addToCart={addToCart} />
                    ))
                  )}
                </div>
                <button
                  className="hp-scroll-arrow"
                  onClick={() => scrollTrending(1)}
                  style={{ position: "absolute", right: "-14px", top: "50%", transform: "translateY(-50%)", zIndex: 10, width: "36px", height: "36px", borderRadius: "50%", background: "white", border: "1px solid #d5d9d9", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F1111", padding: 0, transition: "background 0.15s" }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* ── Deal of the Day ── */}
          <div style={{ paddingTop: "20px" }}>
            <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)", borderRadius: "14px", padding: "36px 44px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "28px", boxShadow: "0 8px 32px rgba(0,0,0,0.22)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(255,153,0,0.05)", right: "-80px", top: "-80px", pointerEvents: "none" }} />

              <div style={{ zIndex: 1, flex: 1, minWidth: "260px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,153,0,0.15)", border: "1px solid rgba(255,153,0,0.35)", padding: "5px 16px", borderRadius: "22px", marginBottom: "16px" }}>
                  <span style={{ color: "#FF9900", fontSize: "12px", fontWeight: "800", letterSpacing: "1.2px" }}>DEAL OF THE DAY</span>
                </div>
                <h1 style={{ color: "white", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "900", margin: "0 0 6px", lineHeight: 1.15 }}>MacBook Air M4</h1>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", margin: "0 0 20px" }}>Supercharged by M4 chip · Stunning Liquid Retina Display</p>

                <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
                  <span style={{ color: "#FF9900", fontSize: "38px", fontWeight: "900", lineHeight: 1 }}>₹1,29,999</span>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "18px", textDecoration: "line-through" }}>₹1,49,999</span>
                  <span style={{ background: "#CC0C39", color: "white", padding: "3px 12px", borderRadius: "5px", fontSize: "13px", fontWeight: "800" }}>SAVE ₹20K</span>
                </div>

                {/* Countdown */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)", borderRadius: "12px", padding: "14px 22px", marginBottom: "28px", backdropFilter: "blur(10px)", flexWrap: "wrap" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: "600" }}>Ends in</span>
                  {[[pad(hours), "HRS"], [pad(minutes), "MIN"], [pad(seconds), "SEC"]].map(([val, label], i) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {i > 0 && <span style={{ color: "#FF9900", fontWeight: "900", fontSize: "22px", lineHeight: 1 }}>:</span>}
                      <div style={{ textAlign: "center", animation: "countPulse 1s ease-in-out infinite" }}>
                        <div style={{ color: "white", fontSize: "28px", fontWeight: "900", lineHeight: 1 }}>{val}</div>
                        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", marginTop: "4px", letterSpacing: "1px" }}>{label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    className="hp-cta"
                    style={{ background: "#FF9900", color: "#0F1111", border: "none", padding: "13px 38px", borderRadius: "30px", fontSize: "15px", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 6px 22px rgba(255,153,0,0.35)" }}
                  >
                    Grab Deal →
                  </button>
                  <button style={{ background: "transparent", color: "rgba(255,255,255,0.75)", border: "1.5px solid rgba(255,255,255,0.22)", padding: "13px 28px", borderRadius: "30px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
                    View Details
                  </button>
                </div>
              </div>

              {/* Right side illustration */}
              <div style={{ zIndex: 1, textAlign: "center", flexShrink: 0 }}>
                <div style={{ width: "200px", height: "164px", background: "rgba(255,255,255,0.04)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,153,0,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                  {["Silver", "Space Gray", "Midnight"].map(c => (
                    <span key={c} style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.07)", padding: "3px 9px", borderRadius: "10px" }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Recently Viewed ── */}
          {recentlyViewed.length > 0 && (
            <div style={{ paddingTop: "20px" }}>
              <div style={{ background: "white", borderRadius: "10px", padding: "20px 24px 26px", boxShadow: "0 1px 5px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "14px", borderBottom: "3px solid #232f3e", marginBottom: "20px" }}>
                  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0F1111" }}>Recently Viewed</h2>
                  <button
                    onClick={() => { localStorage.removeItem("recently_viewed"); setRecentlyViewed([]); }}
                    style={{ background: "none", border: "none", color: "#007185", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Clear history
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => recentRef.current?.scrollBy({ left: -260, behavior: "smooth" })}
                    style={{ position: "absolute", left: "-14px", top: "50%", transform: "translateY(-50%)", zIndex: 10, width: "36px", height: "36px", borderRadius: "50%", background: "white", border: "1px solid #d5d9d9", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F1111", padding: 0 }}
                  >‹</button>
                  <div ref={recentRef} style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "4px", msOverflowStyle: "none", scrollbarWidth: "none" }}>
                    {recentlyViewed.map(product => (
                      <div
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        style={{ flexShrink: 0, width: "150px", cursor: "pointer", padding: "12px", border: "1px solid #e8e8e8", borderRadius: "8px", transition: "box-shadow 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                      >
                        <div style={{ height: "120px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                          <img src={product.image_url} alt={product.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
                        </div>
                        <div style={{ fontSize: "12px", color: "#0F1111", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "4px" }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F1111" }}>₹{product.price?.toLocaleString("en-IN")}</div>
                        {product.discount_percent > 0 && (
                          <div style={{ fontSize: "11px", color: "#CC0C39", fontWeight: "700" }}>-{product.discount_percent}% off</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => recentRef.current?.scrollBy({ left: 260, behavior: "smooth" })}
                    style={{ position: "absolute", right: "-14px", top: "50%", transform: "translateY(-50%)", zIndex: 10, width: "36px", height: "36px", borderRadius: "50%", background: "white", border: "1px solid #d5d9d9", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", cursor: "pointer", fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F1111", padding: 0 }}
                  >›</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Today's Deals ── */}
          <div id="deals-section" style={{ paddingTop: "32px", paddingBottom: "48px" }}>

            {/* Active category banner */}
            {selectedCategory !== "All" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff8f0", border: "1px solid #FFD814", borderRadius: "10px", padding: "12px 20px", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div>
                    <span style={{ fontSize: "18px", fontWeight: "800", color: "#0F1111" }}>{selectedCategory}</span>
                    <span style={{ fontSize: "14px", color: "#565959", marginLeft: "8px" }}>— {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/")}
                  style={{ background: "none", border: "1px solid #d5d9d9", borderRadius: "20px", padding: "6px 14px", fontSize: "13px", color: "#565959", cursor: "pointer", fontWeight: "600", fontFamily: "inherit" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#888"; e.currentTarget.style.color = "#0F1111"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#d5d9d9"; e.currentTarget.style.color = "#565959"; }}
                >
                  ✕ All categories
                </button>
              </div>
            )}

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#0F1111", letterSpacing: "-0.5px" }}>
                  {selectedCategory === "All" ? "Today's Deals" : selectedCategory}
                </h2>
                <p style={{ margin: "5px 0 0", fontSize: "14px", color: "#565959" }}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                  {searchTerm && <span> matching "<strong>{searchTerm}</strong>"</span>}
                </p>
              </div>
              <select
                className="hp-sort"
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "1.5px solid #d5d9d9", background: "white", fontSize: "14px", color: "#0F1111", cursor: "pointer", fontWeight: "600", transition: "border-color 0.2s", appearance: "none", paddingRight: "36px", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                <option value="default">Sort: Featured</option>
                <option value="discount">Best Discount</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* Search bar */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#999", display: "flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </span>
              <input
                className="hp-search"
                type="text"
                placeholder="Search products, brands and more…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "13px 18px 13px 50px", borderRadius: "10px", border: "1.5px solid #d5d9d9", fontSize: "15px", background: "white", transition: "all 0.2s", color: "#0F1111" }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#888", lineHeight: 1 }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Category chips */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className="hp-pill"
                  onClick={() => navigate(cat === "All" ? "/" : `/?category=${encodeURIComponent(cat)}`)}
                  style={{ padding: "8px 18px", border: "none", borderRadius: "22px", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.18s", background: selectedCategory === cat ? "#FF9900" : "white", color: selectedCategory === cat ? "white" : "#333", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product grid or empty state */}
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>
                <p style={{ fontSize: "20px", fontWeight: "700", color: "#333", marginBottom: "8px" }}>No products found</p>
                <p style={{ fontSize: "14px" }}>Try a different search term or category</p>
                <button
                  onClick={() => navigate("/")}
                  style={{ marginTop: "20px", background: "#FF9900", color: "#0F1111", border: "none", padding: "10px 28px", borderRadius: "22px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
                {filteredProducts.map(product => (
                  <div key={product.id} className="hp-card-hover" style={{ transition: "all 0.2s", borderRadius: "10px" }}>
                    <ProductCard product={product} addToCart={addToCart} minimal={true} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "#131921" }}>
        {/* Back to top */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ background: "#37475A", color: "white", textAlign: "center", padding: "14px", fontSize: "13px", fontWeight: "600", cursor: "pointer", letterSpacing: "0.3px" }}
          onMouseEnter={e => e.currentTarget.style.background = "#485769"}
          onMouseLeave={e => e.currentTarget.style.background = "#37475A"}
        >
          ↑ Back to top
        </div>

        {/* Footer links */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "32px", marginBottom: "32px" }}>
            {FOOTER_COLS.map(([heading, links]) => (
              <div key={heading}>
                <h4 style={{ color: "white", fontWeight: "700", marginBottom: "14px", fontSize: "14px" }}>{heading}</h4>
                {links.map(l => (
                  <div key={l} style={{ marginBottom: "8px" }}>
                    <a
                      href="#"
                      className="hp-footer-link"
                      style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", transition: "color 0.15s" }}
                    >
                      {l}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.09)", paddingTop: "22px", textAlign: "center" }}>
            <div style={{ color: "#FF9900", fontWeight: "900", fontSize: "22px", marginBottom: "8px", letterSpacing: "0.5px" }}>
              amazon clone
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
              © 2025 Amazon Clone · Built with React + FastAPI
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;
