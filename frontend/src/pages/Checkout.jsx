import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getUserId } from "../services/auth";

const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on Delivery", icon: "💵", desc: "Pay when your order arrives" },
  { id: "UPI", label: "UPI / Net Banking", icon: "📱", desc: "Pay via any UPI app" },
  { id: "CARD", label: "Credit / Debit Card", icon: "💳", desc: "Visa, Mastercard, RuPay" },
];

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Chandigarh","Puducherry",
];

function AddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "Maharashtra", pincode: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter 10-digit mobile number";
    if (!form.line1.trim()) e.line1 = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(form);
  };

  const field = (key, label, placeholder, type = "text") => (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#0F1111", marginBottom: "4px" }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "9px 12px", border: `1px solid ${errors[key] ? "#CC0C39" : "#888"}`,
          borderRadius: "4px", fontSize: "14px", outline: "none",
          background: "white", color: "#0F1111",
        }}
        onFocus={e => e.currentTarget.style.borderColor = "#e77600"}
        onBlur={e => e.currentTarget.style.borderColor = errors[key] ? "#CC0C39" : "#888"}
      />
      {errors[key] && <span style={{ fontSize: "12px", color: "#CC0C39" }}>{errors[key]}</span>}
    </div>
  );

  return (
    <div style={{ background: "#f0fbff", border: "1px solid #b0d8f0", borderRadius: "8px", padding: "20px", marginTop: "12px" }}>
      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0F1111", marginBottom: "16px" }}>Add a new address</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div>{field("full_name", "Full name", "Your full name")}</div>
        <div>{field("phone", "Mobile number", "10-digit mobile number")}</div>
      </div>
      {field("line1", "Address (House No., Street)", "House No., Building, Street, Area")}
      {field("line2", "Landmark (optional)", "Nearby landmark")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
        <div>{field("city", "City", "City / Town")}</div>
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#0F1111", marginBottom: "4px" }}>State</label>
          <select
            value={form.state}
            onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #888", borderRadius: "4px", fontSize: "14px", background: "white", color: "#0F1111" }}
          >
            {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>{field("pincode", "Pincode", "6-digit pincode")}</div>
      </div>
      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
        <button
          onClick={handleSubmit}
          style={{ padding: "10px 24px", background: "#FFD814", border: "1px solid #FCD200", borderRadius: "6px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "#F7CA00"}
          onMouseLeave={e => e.currentTarget.style.background = "#FFD814"}
        >
          Use this address
        </button>
        <button
          onClick={onCancel}
          style={{ padding: "10px 24px", background: "white", border: "1px solid #d5d9d9", borderRadius: "6px", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "#0F1111" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const userId = getUserId();

  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=review
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    Promise.all([
      api.get(`/cart/${userId}`),
      api.get(`/addresses/${userId}`),
    ]).then(([cartRes, addrRes]) => {
      setCartItems(cartRes.data);
      const addrs = addrRes.data;
      setAddresses(addrs);
      const def = addrs.find(a => a.is_default);
      if (def) setSelectedAddressId(def.id);
      else if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSaveAddress = async (formData) => {
    try {
      const res = await api.post("/addresses/", { ...formData, user_id: userId });
      const addrRes = await api.get(`/addresses/${userId}`);
      const addrs = addrRes.data;
      setAddresses(addrs);
      setSelectedAddressId(res.data.id || addrs[addrs.length - 1]?.id);
      setShowAddForm(false);
    } catch (e) {
      console.error(e);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = cartItems.reduce((sum, item) => {
    if (item.original_price && item.original_price > item.price) {
      return sum + (item.original_price - item.price) * item.quantity;
    }
    return sum;
  }, 0);
  const delivery = subtotal >= 499 ? 0 : 40;
  const total = subtotal + delivery;

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const addressLabel = selectedAddress
    ? `${selectedAddress.full_name}, ${selectedAddress.line1}${selectedAddress.line2 ? ", " + selectedAddress.line2 : ""}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
    : null;

  const placeOrder = async () => {
    if (!selectedAddress && addresses.length === 0) {
      alert("Please add a delivery address.");
      return;
    }
    setPlacing(true);
    try {
      await api.post("/orders/place", {
        user_id: userId,
        delivery_address: addressLabel,
        payment_method: paymentMethod,
      });
      navigate("/orders?placed=1");
    } catch (e) {
      console.error(e);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!userId) return null;

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: "center", padding: "80px", color: "#888" }}>Loading checkout...</div>
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px" }}>Your cart is empty</h2>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "12px 32px", background: "#FFD814", border: "1px solid #FCD200", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
          >
            Shop now
          </button>
        </div>
      </>
    );
  }

  const STEPS = ["Delivery Address", "Payment", "Review & Place Order"];

  return (
    <>
      <Navbar />
      <div style={{ background: "#f0f2f2", minHeight: "100vh", paddingBottom: "60px" }}>

        {/* Step progress bar */}
        <div style={{ background: "white", borderBottom: "1px solid #e0e0e0", padding: "0 24px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", gap: "0" }}>
            {STEPS.map((s, i) => {
              const num = i + 1;
              const active = step === num;
              const done = step > num;
              return (
                <div
                  key={s}
                  onClick={() => done && setStep(num)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "14px 20px",
                    borderBottom: active ? "3px solid #FF9900" : "3px solid transparent",
                    cursor: done ? "pointer" : "default", transition: "border-color 0.15s",
                  }}
                >
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? "#067D62" : active ? "#FF9900" : "#d5d9d9",
                    color: "white", fontSize: "13px", fontWeight: "700", flexShrink: 0,
                  }}>
                    {done ? "✓" : num}
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: active ? "700" : "500", color: active ? "#0F1111" : done ? "#067D62" : "#888" }}>
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ maxWidth: "1100px", margin: "24px auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>

          {/* LEFT PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* STEP 1 — Address */}
            <div style={{ background: "white", borderRadius: "8px", padding: "24px", border: step === 1 ? "2px solid #FF9900" : "1px solid #e0e0e0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: step === 1 ? "20px" : "0" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: step === 1 ? "#0F1111" : "#888" }}>
                  <span style={{ marginRight: "8px", fontSize: "16px", color: step > 1 ? "#067D62" : step === 1 ? "#FF9900" : "#888" }}>
                    {step > 1 ? "✓" : "1"}
                  </span>
                  Delivery Address
                </h2>
                {step > 1 && (
                  <button
                    onClick={() => setStep(1)}
                    style={{ fontSize: "13px", color: "#007185", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}
                  >
                    Change
                  </button>
                )}
              </div>

              {step === 1 && (
                <>
                  {addresses.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                      {addresses.map(addr => (
                        <label
                          key={addr.id}
                          style={{
                            display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px",
                            border: `1px solid ${selectedAddressId === addr.id ? "#FF9900" : "#d5d9d9"}`,
                            borderRadius: "6px", cursor: "pointer",
                            background: selectedAddressId === addr.id ? "#fffbf0" : "white",
                          }}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            style={{ marginTop: "3px", accentColor: "#FF9900" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "700", fontSize: "14px", color: "#0F1111" }}>
                              {addr.full_name}
                              {addr.is_default && (
                                <span style={{ marginLeft: "8px", fontSize: "11px", background: "#e0f0e0", color: "#067D62", padding: "2px 6px", borderRadius: "3px", fontWeight: "600" }}>
                                  Default
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "13px", color: "#565959", marginTop: "4px", lineHeight: "1.5" }}>
                              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                              {addr.city}, {addr.state} - {addr.pincode}<br />
                              Mobile: {addr.phone}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {showAddForm ? (
                    <AddressForm onSave={handleSaveAddress} onCancel={() => setShowAddForm(false)} />
                  ) : (
                    <button
                      onClick={() => setShowAddForm(true)}
                      style={{ padding: "10px 20px", background: "white", border: "1px dashed #007185", borderRadius: "6px", fontSize: "14px", color: "#007185", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      + Add a new address
                    </button>
                  )}

                  {!showAddForm && (selectedAddressId || addresses.length === 0) && (
                    <button
                      onClick={() => { if (selectedAddressId || addresses.length === 0) setStep(2); }}
                      disabled={addresses.length > 0 && !selectedAddressId}
                      style={{
                        marginTop: "20px", padding: "11px 28px", background: "#FFD814", border: "1px solid #FCD200",
                        borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F7CA00"}
                      onMouseLeave={e => e.currentTarget.style.background = "#FFD814"}
                    >
                      Deliver to this address
                    </button>
                  )}
                </>
              )}

              {step > 1 && selectedAddress && (
                <div style={{ fontSize: "13px", color: "#565959", marginTop: "4px" }}>
                  {selectedAddress.full_name} — {selectedAddress.line1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                </div>
              )}
            </div>

            {/* STEP 2 — Payment */}
            <div style={{ background: "white", borderRadius: "8px", padding: "24px", border: step === 2 ? "2px solid #FF9900" : "1px solid #e0e0e0", opacity: step < 2 ? 0.55 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: step === 2 ? "20px" : "0" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: step === 2 ? "#0F1111" : step > 2 ? "#0F1111" : "#888" }}>
                  <span style={{ marginRight: "8px", color: step > 2 ? "#067D62" : step === 2 ? "#FF9900" : "#888" }}>
                    {step > 2 ? "✓" : "2"}
                  </span>
                  Payment Method
                </h2>
                {step > 2 && (
                  <button
                    onClick={() => setStep(2)}
                    style={{ fontSize: "13px", color: "#007185", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}
                  >
                    Change
                  </button>
                )}
              </div>

              {step === 2 && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    {PAYMENT_METHODS.map(pm => (
                      <label
                        key={pm.id}
                        style={{
                          display: "flex", gap: "12px", alignItems: "center", padding: "14px 16px",
                          border: `1px solid ${paymentMethod === pm.id ? "#FF9900" : "#d5d9d9"}`,
                          borderRadius: "6px", cursor: "pointer",
                          background: paymentMethod === pm.id ? "#fffbf0" : "white",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === pm.id}
                          onChange={() => setPaymentMethod(pm.id)}
                          style={{ accentColor: "#FF9900" }}
                        />
                        <span style={{ fontSize: "20px" }}>{pm.icon}</span>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "14px", color: "#0F1111" }}>{pm.label}</div>
                          <div style={{ fontSize: "12px", color: "#565959" }}>{pm.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    style={{ padding: "11px 28px", background: "#FFD814", border: "1px solid #FCD200", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F7CA00"}
                    onMouseLeave={e => e.currentTarget.style.background = "#FFD814"}
                  >
                    Continue
                  </button>
                </>
              )}

              {step > 2 && (
                <div style={{ fontSize: "13px", color: "#565959", marginTop: "4px" }}>
                  {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}
                </div>
              )}
            </div>

            {/* STEP 3 — Review items */}
            <div style={{ background: "white", borderRadius: "8px", padding: "24px", border: step === 3 ? "2px solid #FF9900" : "1px solid #e0e0e0", opacity: step < 3 ? 0.55 : 1 }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: step === 3 ? "#0F1111" : "#888", marginBottom: step === 3 ? "20px" : "0" }}>
                <span style={{ marginRight: "8px", color: step === 3 ? "#FF9900" : "#888" }}>3</span>
                Review Items
              </h2>

              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {cartItems.map(item => (
                    <div key={item.cart_item_id} style={{ display: "flex", gap: "16px", alignItems: "flex-start", borderBottom: "1px solid #f0f2f2", paddingBottom: "16px" }}>
                      <div style={{ width: "80px", height: "80px", background: "#f7f8f9", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
                          : <span style={{ fontSize: "11px", color: "#ccc" }}>No image</span>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "14px", fontWeight: "500", color: "#0F1111", marginBottom: "4px", lineHeight: "1.4" }}>{item.name}</div>
                        <div style={{ fontSize: "13px", color: "#007600", marginBottom: "4px" }}>In Stock</div>
                        <div style={{ fontSize: "14px", fontWeight: "700" }}>₹{Number(item.price).toLocaleString("en-IN")} × {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: "700", fontSize: "16px", color: "#0F1111", flexShrink: 0 }}>
                        ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    style={{
                      alignSelf: "flex-start", padding: "14px 36px", background: placing ? "#f0d050" : "#FFD814",
                      border: "1px solid #FCD200", borderRadius: "8px", fontSize: "16px", fontWeight: "700",
                      cursor: placing ? "wait" : "pointer", marginTop: "8px",
                    }}
                    onMouseEnter={e => { if (!placing) e.currentTarget.style.background = "#F7CA00"; }}
                    onMouseLeave={e => { if (!placing) e.currentTarget.style.background = "#FFD814"; }}
                  >
                    {placing ? "Placing order…" : "Place your order"}
                  </button>
                  <p style={{ fontSize: "12px", color: "#565959" }}>
                    By placing your order, you agree to Amazon Clone's privacy notice and conditions of use.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR — Order summary */}
          <div style={{ position: "sticky", top: "20px" }}>
            <div style={{ background: "white", borderRadius: "8px", padding: "20px", border: "1px solid #e0e0e0" }}>

              {step === 3 && (
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  style={{
                    width: "100%", padding: "13px", background: placing ? "#f0d050" : "#FFD814",
                    border: "1px solid #FCD200", borderRadius: "8px", fontSize: "15px", fontWeight: "700",
                    cursor: placing ? "wait" : "pointer", marginBottom: "16px",
                  }}
                  onMouseEnter={e => { if (!placing) e.currentTarget.style.background = "#F7CA00"; }}
                  onMouseLeave={e => { if (!placing) e.currentTarget.style.background = "#FFD814"; }}
                >
                  {placing ? "Placing order…" : "Place your order"}
                </button>
              )}

              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0F1111", marginBottom: "16px", borderBottom: "1px solid #f0f2f2", paddingBottom: "12px" }}>
                Order Summary
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "#0F1111" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>₹{Number(subtotal).toLocaleString("en-IN")}</span>
                </div>
                {savings > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#CC0C39" }}>
                    <span>Savings</span>
                    <span>-₹{Number(savings).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Delivery</span>
                  <span style={{ color: delivery === 0 ? "#007600" : "#0F1111" }}>
                    {delivery === 0 ? "FREE" : `₹${delivery}`}
                  </span>
                </div>
                {delivery > 0 && (
                  <div style={{ fontSize: "12px", color: "#565959" }}>
                    Add ₹{Number(499 - subtotal).toLocaleString("en-IN")} more for free delivery
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid #e0e0e0", marginTop: "12px", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "700", color: "#0F1111" }}>
                <span>Order Total</span>
                <span>₹{Number(total).toLocaleString("en-IN")}</span>
              </div>

              {savings > 0 && (
                <div style={{ marginTop: "8px", background: "#e7f5ea", borderRadius: "4px", padding: "8px 12px", fontSize: "13px", color: "#067D62", fontWeight: "600" }}>
                  You save ₹{Number(savings).toLocaleString("en-IN")} on this order!
                </div>
              )}

              <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span style={{ fontSize: "12px", color: "#888" }}>Secure checkout — 128-bit SSL</span>
              </div>

              {selectedAddress && (
                <div style={{ marginTop: "16px", borderTop: "1px solid #f0f2f2", paddingTop: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#888", fontWeight: "600", marginBottom: "4px" }}>DELIVER TO</div>
                  <div style={{ fontSize: "13px", color: "#0F1111", lineHeight: "1.5" }}>
                    <strong>{selectedAddress.full_name}</strong><br />
                    {selectedAddress.line1}<br />
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </div>
                </div>
              )}
            </div>

            {/* Items preview */}
            <div style={{ background: "white", borderRadius: "8px", padding: "16px", border: "1px solid #e0e0e0", marginTop: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#0F1111", marginBottom: "12px" }}>
                Items in your order:
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {cartItems.map(item => (
                  <div key={item.cart_item_id} style={{ width: "52px", height: "52px", background: "#f7f8f9", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", border: "1px solid #e8e8e8" }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
                      : <span style={{ fontSize: "9px", color: "#bbb" }}>img</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
