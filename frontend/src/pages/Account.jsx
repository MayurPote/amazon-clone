import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getUserId } from "../services/auth";
import { useToast } from "../context/ToastContext";

const TILES = [
  { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#565959" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, title: "Your Orders", sub: "Track, return or buy again", to: "/orders" },
  { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#565959" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, title: "Login & Security", sub: "Edit name, email or password", to: "/account#security" },
  { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#565959" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: "Your Addresses", sub: "Edit addresses for orders", to: "/account#addresses" },
  { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#565959" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, title: "Your Wish List", sub: "View and manage your Wish List", to: "/wishlist" },
  { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#565959" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>, title: "Your Cart", sub: "View items in your cart", to: "/cart" },
  { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#565959" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, title: "Prime", sub: "View benefits and payment settings", to: "/account#prime" },
];

export default function Account() {
  const navigate = useNavigate();
  const { show } = useToast();
  const userId = getUserId();

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [section, setSection] = useState("home"); // home | security | addresses
  const [editName, setEditName] = useState("");
  const [addingAddr, setAddingAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "Maharashtra", pincode: "" });

  const INDIA_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Puducherry"];

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    // Decode token for basic info
    try {
      const payload = JSON.parse(atob(localStorage.getItem("token").split(".")[1]));
      setUser({ id: payload.user_id, email: payload.email });
      setEditName(payload.email?.split("@")[0] || "User");
    } catch {}
    api.get(`/addresses/${userId}`).then(r => setAddresses(r.data)).catch(() => {});
    api.get(`/orders/${userId}`).then(r => setOrders(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "addresses" || hash === "security") setSection(hash);
  }, []);

  const saveAddress = async () => {
    if (!addrForm.full_name || !addrForm.phone || !addrForm.line1 || !addrForm.city || !addrForm.pincode) {
      show("Please fill all required fields", "error"); return;
    }
    try {
      await api.post("/addresses/", { ...addrForm, user_id: userId });
      const res = await api.get(`/addresses/${userId}`);
      setAddresses(res.data);
      setAddingAddr(false);
      setAddrForm({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "Maharashtra", pincode: "" });
      show("Address saved!");
    } catch { show("Failed to save address", "error"); }
  };

  const deleteAddress = async (id) => {
    await api.delete(`/addresses/${id}`).catch(() => {});
    setAddresses(a => a.filter(x => x.id !== id));
    show("Address removed");
  };

  const setDefault = async (id) => {
    await api.put(`/addresses/default/${id}?user_id=${userId}`).catch(() => {});
    const res = await api.get(`/addresses/${userId}`);
    setAddresses(res.data);
    show("Default address updated!");
  };

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid #888", borderRadius: "4px", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

  return (
    <>
      <Navbar />
      <div style={{ background: "#f0f2f2", minHeight: "100vh", paddingBottom: "60px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 24px 0" }}>

          {/* Breadcrumb */}
          <div style={{ fontSize: "13px", color: "#565959", marginBottom: "16px" }}>
            <Link to="/" style={{ color: "#007185" }}>Home</Link> › Account
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: "400", color: "#0F1111", margin: "0 0 24px" }}>Your Account</h1>

          {section === "home" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "16px" }}>
              {TILES.map(tile => (
                <div
                  key={tile.title}
                  onClick={() => {
                    if (tile.to.includes("#")) { setSection(tile.to.split("#")[1]); }
                    else navigate(tile.to);
                  }}
                  style={{ background: "white", border: "1px solid #d5d9d9", borderRadius: "8px", padding: "20px", display: "flex", gap: "16px", cursor: "pointer", transition: "box-shadow 0.15s", alignItems: "flex-start" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                >
                  <div style={{ flexShrink: 0, marginTop: "2px" }}>{tile.icon}</div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#0F1111", marginBottom: "4px" }}>{tile.title}</div>
                    <div style={{ fontSize: "13px", color: "#565959", lineHeight: "1.4" }}>{tile.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security section */}
          {section === "security" && (
            <div style={{ maxWidth: "660px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <button onClick={() => setSection("home")} style={{ background: "none", border: "none", color: "#007185", cursor: "pointer", fontSize: "13px" }}>← Back</button>
                <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Login & Security</h2>
              </div>
              <div style={{ background: "white", border: "1px solid #d5d9d9", borderRadius: "8px", overflow: "hidden" }}>
                {[
                  { label: "Name", value: editName, hint: "Displayed on your account" },
                  { label: "Email", value: user?.email || "", hint: "Used to sign in" },
                  { label: "Password", value: "••••••••••", hint: "Last changed recently" },
                  { label: "Mobile number", value: "Not added", hint: "For delivery notifications" },
                ].map((row, i) => (
                  <div key={row.label} style={{ padding: "20px 24px", borderBottom: i < 3 ? "1px solid #f0f2f2" : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#565959", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{row.label}</div>
                      <div style={{ fontSize: "15px", color: "#0F1111", fontWeight: "500" }}>{row.value}</div>
                      <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{row.hint}</div>
                    </div>
                    <button
                      style={{ padding: "8px 16px", background: "#f0f2f2", border: "1px solid #d5d9d9", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", color: "#0F1111" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#e0e2e2"}
                      onMouseLeave={e => e.currentTarget.style.background = "#f0f2f2"}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>

              {/* Account stats */}
              <div style={{ background: "white", border: "1px solid #d5d9d9", borderRadius: "8px", padding: "20px 24px", marginTop: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 16px" }}>Account Overview</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", textAlign: "center" }}>
                  {[
                    { label: "Orders", value: orders.length },
                    { label: "Addresses", value: addresses.length },
                    { label: "Wish List items", value: "—" },
                  ].map(s => (
                    <div key={s.label} style={{ padding: "16px", background: "#f7f8f9", borderRadius: "6px" }}>
                      <div style={{ fontSize: "28px", fontWeight: "800", color: "#FF9900" }}>{s.value}</div>
                      <div style={{ fontSize: "13px", color: "#565959", marginTop: "4px" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Addresses section */}
          {section === "addresses" && (
            <div style={{ maxWidth: "760px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={() => setSection("home")} style={{ background: "none", border: "none", color: "#007185", cursor: "pointer", fontSize: "13px" }}>← Back</button>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Your Addresses</h2>
                </div>
                <button
                  onClick={() => setAddingAddr(true)}
                  style={{ padding: "9px 20px", background: "#FFD814", border: "1px solid #FCD200", borderRadius: "6px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
                >
                  + Add address
                </button>
              </div>

              {/* Add address form */}
              {addingAddr && (
                <div style={{ background: "#f0f8ff", border: "1px solid #b0d8f0", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700" }}>Add a new address</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Full name *</label>
                      <input style={inputStyle} value={addrForm.full_name} onChange={e => setAddrForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full name" />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Mobile *</label>
                      <input style={inputStyle} value={addrForm.phone} onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit number" />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Address *</label>
                      <input style={inputStyle} value={addrForm.line1} onChange={e => setAddrForm(f => ({ ...f, line1: e.target.value }))} placeholder="House No., Building, Street" />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <input style={inputStyle} value={addrForm.line2} onChange={e => setAddrForm(f => ({ ...f, line2: e.target.value }))} placeholder="Landmark (optional)" />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>City *</label>
                      <input style={inputStyle} value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Pincode *</label>
                      <input style={inputStyle} value={addrForm.pincode} onChange={e => setAddrForm(f => ({ ...f, pincode: e.target.value }))} placeholder="6-digit pincode" maxLength={6} />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>State</label>
                      <select style={{ ...inputStyle }} value={addrForm.state} onChange={e => setAddrForm(f => ({ ...f, state: e.target.value }))}>
                        {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                    <button onClick={saveAddress} style={{ padding: "10px 24px", background: "#FFD814", border: "1px solid #FCD200", borderRadius: "6px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>Save address</button>
                    <button onClick={() => setAddingAddr(false)} style={{ padding: "10px 20px", background: "white", border: "1px solid #d5d9d9", borderRadius: "6px", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Address list */}
              {addresses.length === 0 && !addingAddr && (
                <div style={{ background: "white", border: "1px solid #d5d9d9", borderRadius: "8px", padding: "40px", textAlign: "center", color: "#565959" }}>
                  No saved addresses yet. Add one to speed up checkout.
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {addresses.map(addr => (
                  <div key={addr.id} style={{ background: "white", border: `2px solid ${addr.is_default ? "#FF9900" : "#d5d9d9"}`, borderRadius: "8px", padding: "18px" }}>
                    {addr.is_default && (
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#FF9900", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Default address</div>
                    )}
                    <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>{addr.full_name}</div>
                    <div style={{ fontSize: "13px", color: "#565959", lineHeight: "1.6" }}>
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                      {addr.city}, {addr.state} - {addr.pincode}<br />
                      India<br />
                      Phone: {addr.phone}
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                      {!addr.is_default && (
                        <button onClick={() => setDefault(addr.id)} style={{ fontSize: "13px", color: "#007185", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Set as Default</button>
                      )}
                      <button onClick={() => deleteAddress(addr.id)} style={{ fontSize: "13px", color: "#CC0C39", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
