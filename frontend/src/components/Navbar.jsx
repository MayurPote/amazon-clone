import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { getUserId } from "../services/auth";

const NAV_LINKS = [
  { label: "Today's Deals",  to: "/?sort=discount" },
  { label: "Electronics",    to: "/?category=Electronics" },
  { label: "Fashion",        to: "/?category=Fashion" },
  { label: "Home & Kitchen", to: "/?category=Home & Kitchen" },
  { label: "Sports",         to: "/?category=Sports" },
  { label: "Books",          to: "/?category=Books" },
  { label: "Best Sellers",   to: "/?bestsellers=true" },
];

function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCat = searchParams.get("category") || "";
  const token = localStorage.getItem("token");
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCat, setSearchCat] = useState("All");

  const doSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (searchCat && searchCat !== "All") params.set("category", searchCat);
    navigate(`/?${params.toString()}`);
  };

  useEffect(() => {
    if (token) fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const res = await api.get(`/cart/${getUserId()}`);
      setCartCount(res.data.length);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const hoverOn = (e, extra = {}) => {
    e.currentTarget.style.border = "1px solid white";
    Object.assign(e.currentTarget.style, extra);
  };
  const hoverOff = (e, extra = {}) => {
    e.currentTarget.style.border = "1px solid transparent";
    Object.assign(e.currentTarget.style, extra);
  };

  return (
    <>
      <style>{`
        .nb-link { color: white; text-decoration: none; padding: 6px 10px; font-size: 13px; font-weight: 500; border-radius: 4px; border: 1px solid transparent; white-space: nowrap; transition: border-color 0.15s; }
        .nb-link:hover { border-color: white !important; }
        .nb-top-block { padding: 5px 9px; border: 1px solid transparent; border-radius: 3px; cursor: pointer; text-decoration: none; transition: border-color 0.15s; display: flex; flex-direction: column; justify-content: center; }
        .nb-top-block:hover { border-color: white !important; }
        .nb-top-block .sub { color: #ccc; font-size: 11px; line-height: 1.3; }
        .nb-top-block .main { color: white; font-size: 13px; font-weight: 700; line-height: 1.3; }
        .nb-search-btn:hover { background: #e68a00 !important; }
        .nb-cat-bar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Row 1: Main bar ── */}
      <div style={{ background: "#131921", padding: "8px 16px", display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Logo */}
        <Link to="/" className="nb-top-block" style={{ flexShrink: 0, textDecoration: "none" }}>
          <span style={{ color: "#FF9900", fontSize: "22px", fontWeight: "900", letterSpacing: "-0.5px", lineHeight: 1 }}>amazon</span>
          <span style={{ color: "white", fontSize: "9px", fontWeight: "700", textAlign: "center", letterSpacing: "1.5px", textTransform: "uppercase" }}>clone</span>
        </Link>

        {/* Deliver to */}
        <div className="nb-top-block" style={{ flexShrink: 0 }}>
          <span className="sub">Deliver to</span>
          <span className="main">India</span>
        </div>

        {/* Search bar */}
        <div style={{ flex: 1, display: "flex", height: "42px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 0 0 3px #FF9900" }}>
          <select
            value={searchCat}
            onChange={e => setSearchCat(e.target.value)}
            style={{ padding: "0 8px", background: "#f0f2f2", border: "none", fontSize: "12px", color: "#333", cursor: "pointer", borderRight: "1px solid #cdcdcd", outline: "none", minWidth: "90px", fontFamily: "inherit" }}
          >
            <option value="All">All</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home & Kitchen">Home</option>
            <option value="Sports">Sports</option>
            <option value="Books">Books</option>
          </select>
          <input
            type="text"
            placeholder="Search products, brands and more…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") doSearch(); }}
            style={{ flex: 1, padding: "0 14px", border: "none", fontSize: "14px", outline: "none", color: "#0F1111", fontFamily: "inherit" }}
          />
          <button
            className="nb-search-btn"
            onClick={doSearch}
            style={{ background: "#FF9900", border: "none", padding: "0 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s", flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F1111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </div>

        {/* Account */}
        <div
          className="nb-top-block"
          style={{ flexShrink: 0 }}
          onClick={() => !token && navigate("/login")}
        >
          <span className="sub">{token ? "Hello, User" : "Hello, sign in"}</span>
          <span className="main">Account &amp; Lists ▾</span>
        </div>

        {/* Orders */}
        <Link to="/orders" className="nb-top-block" style={{ flexShrink: 0, textDecoration: "none" }}>
          <span className="sub">Returns</span>
          <span className="main">&amp; Orders</span>
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: "6px", padding: "5px 9px", border: "1px solid transparent", borderRadius: "3px", transition: "border-color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "white"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
        >
          <div style={{ position: "relative" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: "-6px", right: "-8px", background: "#FF9900", color: "#0F1111", fontSize: "11px", fontWeight: "900", minWidth: "18px", height: "18px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </div>
          <span style={{ color: "white", fontSize: "13px", fontWeight: "700" }}>Cart</span>
        </Link>

        {/* Auth buttons */}
        {token ? (
          <button
            onClick={logout}
            style={{ background: "#FF9900", color: "#0F1111", border: "none", padding: "9px 18px", borderRadius: "7px", cursor: "pointer", fontWeight: "800", fontSize: "13px", flexShrink: 0, transition: "background 0.15s", fontFamily: "inherit" }}
            onMouseEnter={e => e.currentTarget.style.background = "#e68a00"}
            onMouseLeave={e => e.currentTarget.style.background = "#FF9900"}
          >
            Logout
          </button>
        ) : (
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <Link
              to="/login"
              style={{ color: "white", textDecoration: "none", fontSize: "13px", fontWeight: "700", padding: "8px 14px", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: "7px", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "white"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              style={{ color: "#0F1111", textDecoration: "none", fontSize: "13px", fontWeight: "800", padding: "8px 16px", background: "#FF9900", borderRadius: "7px", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#e68a00"}
              onMouseLeave={e => e.currentTarget.style.background = "#FF9900"}
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {/* ── Row 2: Category nav bar ── */}
      <div
        className="nb-cat-bar"
        style={{ background: "#232f3e", padding: "0 16px", display: "flex", alignItems: "center", gap: "2px", overflowX: "auto", msOverflowStyle: "none" }}
      >
        {/* All menu */}
        <div
          className="nb-link"
          style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "700", marginRight: "6px", padding: "10px 12px" }}
        >
          <span style={{ fontSize: "15px" }}>☰</span> All
        </div>

        {NAV_LINKS.map(link => {
          const linkCat = new URLSearchParams(link.to.split("?")[1] || "").get("category") || "";
          const isActive = linkCat && linkCat === activeCat;
          return (
            <Link
              key={link.label}
              to={link.to}
              className="nb-link"
              style={{ padding: "10px 10px", borderBottom: isActive ? "2px solid #FF9900" : "2px solid transparent", color: isActive ? "#FF9900" : "white" }}
            >
              {link.label}
            </Link>
          );
        })}

        {/* Wishlist pushed to end */}
        <Link
          to="/wishlist"
          className="nb-link"
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", color: "#FF9900", fontWeight: "700", padding: "10px 12px" }}
        >
          Wish List
        </Link>
      </div>
    </>
  );
}

export default Navbar;
