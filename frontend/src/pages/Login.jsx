import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function FloatInput({ label, type = "text", value, onChange, suffix, prefix }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div style={{ position: "relative", marginBottom: "20px" }}>
      <label style={{
        position: "absolute",
        left: prefix ? "62px" : "16px",
        top: lifted ? "9px" : "50%",
        transform: lifted ? "none" : "translateY(-50%)",
        fontSize: lifted ? "10px" : "14px",
        fontWeight: lifted ? "700" : "400",
        color: focused ? "#a78bfa" : "rgba(255,255,255,0.4)",
        letterSpacing: lifted ? "0.6px" : "0",
        textTransform: lifted ? "uppercase" : "none",
        transition: "all 0.2s ease",
        pointerEvents: "none",
        zIndex: 1,
      }}>
        {label}
      </label>

      {prefix && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: "54px", display: "flex", alignItems: "center", justifyContent: "center",
          borderRight: `1px solid ${focused ? "#7c3aed" : "rgba(255,255,255,0.1)"}`,
          color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: "600",
          transition: "border-color 0.2s",
          zIndex: 1,
        }}>
          {prefix}
        </div>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        style={{
          width: "100%",
          padding: lifted ? "22px 16px 8px" : "15px 16px",
          paddingLeft: prefix ? "62px" : "16px",
          paddingRight: suffix ? "50px" : "16px",
          background: focused ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
          border: `1.5px solid ${focused ? "#7c3aed" : "rgba(255,255,255,0.12)"}`,
          borderRadius: "12px",
          color: "white",
          fontSize: "15px",
          outline: "none",
          boxSizing: "border-box",
          transition: "all 0.2s ease",
          fontFamily: "inherit",
        }}
      />

      {suffix && (
        <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}>
          {suffix}
        </div>
      )}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [loginTab, setLoginTab]   = useState("email");   // "email" | "mobile"
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [mobile, setMobile]       = useState("");
  const [otp, setOtp]             = useState("");
  const [otpSent, setOtpSent]     = useState(false);
  const [otpTimer, setOtpTimer]   = useState(0);
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError]         = useState("");
  const [shakeKey, setShakeKey]   = useState(0);

  const triggerError = (msg) => {
    setError(msg);
    setShakeKey(k => k + 1);
  };

  const sendOtp = async () => {
    if (mobile.length !== 10) { triggerError("Enter a valid 10-digit mobile number."); return; }
    setSendingOtp(true);
    setError("");
    await new Promise(r => setTimeout(r, 1200));
    setSendingOtp(false);
    setOtpSent(true);
    // countdown 30s
    let t = 30;
    setOtpTimer(t);
    const iv = setInterval(() => {
      t -= 1;
      setOtpTimer(t);
      if (t <= 0) clearInterval(iv);
    }, 1000);
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setError("");
    if (loginTab === "mobile") {
      if (!otpSent)          { triggerError("Please send OTP first."); return; }
      if (otp.length !== 6)  { triggerError("Enter the 6-digit OTP."); return; }
      // Simulate OTP verification (UI demo — wire up real backend when ready)
      setLoading(true);
      await new Promise(r => setTimeout(r, 1000));
      setLoading(false);
      triggerError("Mobile OTP login coming soon. Please use Email login.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/users/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      navigate("/");
    } catch {
      triggerError("Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const eyeBtn = (
    <button type="button" onClick={() => setShowPass(s => !s)}
      style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", color:"rgba(255,255,255,0.4)", lineHeight:1 }} tabIndex={-1}>
      {showPass ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-60px) scale(1.12)} 66%{transform:translate(-20px,30px) scale(0.92)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,40px) scale(1.08)} 66%{transform:translate(30px,-20px) scale(0.95)} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-40px) scale(1.1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-10px)} 30%{transform:translateX(10px)} 45%{transform:translateX(-8px)} 60%{transform:translateX(8px)} 75%{transform:translateX(-4px)} 90%{transform:translateX(4px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes otpSlide { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .login-submit:hover:not(:disabled){transform:translateY(-2px)!important;box-shadow:0 14px 36px rgba(124,58,237,0.55)!important}
        .login-submit:active:not(:disabled){transform:translateY(0)!important}
        .tab-pill:hover{background:rgba(255,255,255,0.08)!important}
        .otp-digit:focus{border-color:#7c3aed!important;background:rgba(255,255,255,0.1)!important}
      `}</style>

      {/* Background blobs */}
      <div style={{position:"absolute",top:"-15%",left:"-12%",width:"550px",height:"550px",borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.28) 0%,transparent 70%)",animation:"blob1 9s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-20%",right:"-10%",width:"650px",height:"650px",borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)",animation:"blob2 12s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"40%",left:"55%",width:"350px",height:"350px",borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,0.15) 0%,transparent 70%)",animation:"blob3 7s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.05) 1px,transparent 1px)",backgroundSize:"32px 32px",pointerEvents:"none"}}/>

      {/* Card */}
      <div style={{
        width:"100%", maxWidth:"420px", margin:"24px",
        background:"rgba(255,255,255,0.06)",
        backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
        borderRadius:"24px", border:"1px solid rgba(255,255,255,0.11)",
        padding:"44px 40px 36px",
        boxShadow:"0 40px 100px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.1)",
        animation:"fadeUp 0.55s ease", position:"relative", zIndex:10,
      }}>

        {/* Brand — Amazon Clone style */}
        <div style={{textAlign:"center", marginBottom:"28px"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
            <div style={{width:"36px",height:"36px",background:"linear-gradient(135deg,#7c3aed,#6366f1)",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(124,58,237,0.45)"}}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <div style={{lineHeight:1}}>
              <span style={{fontSize:"22px",fontWeight:"900",color:"#FF9900",letterSpacing:"-0.5px"}}>amazon</span>
              <span style={{fontSize:"22px",fontWeight:"900",color:"white",letterSpacing:"-0.5px"}}> clone</span>
            </div>
          </div>
          <p style={{color:"rgba(255,255,255,0.38)",fontSize:"13px",margin:0}}>Sign in to your account</p>
        </div>

        {/* Login method tabs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"24px",background:"rgba(255,255,255,0.04)",borderRadius:"12px",padding:"5px"}}>
          {[
            { key:"email",  label:"📧 Email" },
            { key:"mobile", label:"📱 Mobile" },
          ].map(t => (
            <button key={t.key} type="button" className="tab-pill"
              onClick={() => { setLoginTab(t.key); setError(""); setOtpSent(false); setOtp(""); }}
              style={{
                padding:"10px", border:"none", borderRadius:"8px", cursor:"pointer",
                fontFamily:"inherit", fontSize:"13px", fontWeight:"700",
                transition:"all 0.2s",
                background: loginTab === t.key ? "rgba(124,58,237,0.6)" : "transparent",
                color: loginTab === t.key ? "white" : "rgba(255,255,255,0.45)",
                boxShadow: loginTab === t.key ? "0 2px 10px rgba(124,58,237,0.35)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div key={shakeKey} style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"10px",padding:"11px 14px",marginBottom:"18px",color:"#fca5a5",fontSize:"13px",display:"flex",alignItems:"center",gap:"8px",animation:"shake 0.5s ease"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={loginUser}>

          {/* ── EMAIL TAB ── */}
          {loginTab === "email" && (
            <>
              <FloatInput label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <FloatInput label="Password" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} suffix={eyeBtn} />
              <div style={{textAlign:"right",marginTop:"-12px",marginBottom:"24px"}}>
                <span style={{color:"#a78bfa",fontSize:"13px",cursor:"pointer",fontWeight:"600"}}
                  onMouseEnter={e=>e.target.style.color="#c4b5fd"}
                  onMouseLeave={e=>e.target.style.color="#a78bfa"}>
                  Forgot password?
                </span>
              </div>
            </>
          )}

          {/* ── MOBILE TAB ── */}
          {loginTab === "mobile" && (
            <div style={{animation:"otpSlide 0.3s ease"}}>
              <FloatInput
                label="Mobile number"
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value.replace(/\D/g,"").slice(0,10))}
                prefix="+91"
              />

              {/* Send OTP button */}
              {!otpSent ? (
                <button type="button" onClick={sendOtp} disabled={sendingOtp || mobile.length !== 10}
                  style={{
                    width:"100%", padding:"13px", marginBottom:"20px",
                    background: mobile.length === 10 ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${mobile.length === 10 ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius:"12px", color: mobile.length === 10 ? "#c4b5fd" : "rgba(255,255,255,0.25)",
                    fontSize:"14px", fontWeight:"700", cursor: mobile.length === 10 ? "pointer" : "not-allowed",
                    fontFamily:"inherit", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                  }}>
                  {sendingOtp ? (
                    <><div style={{width:"15px",height:"15px",border:"2px solid rgba(196,181,250,0.3)",borderTopColor:"#c4b5fd",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/> Sending OTP…</>
                  ) : "Send OTP →"}
                </button>
              ) : (
                <div style={{animation:"otpSlide 0.3s ease",marginBottom:"20px"}}>
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,0.45)",marginBottom:"12px",textAlign:"center"}}>
                    OTP sent to <span style={{color:"#a78bfa",fontWeight:"700"}}>+91 {mobile}</span>
                  </div>

                  {/* 6-box OTP input */}
                  <div style={{display:"flex",gap:"8px",justifyContent:"center",marginBottom:"12px"}}>
                    {Array.from({length:6}).map((_,i) => (
                      <input
                        key={i}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[i] || ""}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/,"");
                          const arr = otp.split("");
                          arr[i] = val;
                          setOtp(arr.join("").slice(0,6));
                          if (val && e.target.nextSibling) e.target.nextSibling.focus();
                        }}
                        onKeyDown={e => {
                          if (e.key === "Backspace" && !otp[i] && e.target.previousSibling)
                            e.target.previousSibling.focus();
                        }}
                        className="otp-digit"
                        style={{
                          width:"42px", height:"50px", textAlign:"center",
                          fontSize:"20px", fontWeight:"700", color:"white",
                          background:"rgba(255,255,255,0.06)",
                          border:"1.5px solid rgba(255,255,255,0.15)",
                          borderRadius:"10px", outline:"none",
                          fontFamily:"inherit", transition:"all 0.15s",
                        }}
                      />
                    ))}
                  </div>

                  {/* Resend */}
                  <div style={{textAlign:"center",fontSize:"12px",color:"rgba(255,255,255,0.35)"}}>
                    {otpTimer > 0 ? (
                      <>Resend OTP in <span style={{color:"#a78bfa",fontWeight:"700"}}>{otpTimer}s</span></>
                    ) : (
                      <span style={{color:"#a78bfa",fontWeight:"700",cursor:"pointer"}} onClick={sendOtp}>Resend OTP</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} className="login-submit"
            style={{
              width:"100%", padding:"15px",
              background: loading ? "rgba(124,58,237,0.6)" : "linear-gradient(135deg,#7c3aed 0%,#6366f1 100%)",
              border:"none", borderRadius:"12px", color:"white",
              fontSize:"15px", fontWeight:"700",
              cursor: loading ? "wait" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
              transition:"all 0.25s ease", fontFamily:"inherit",
              boxShadow:"0 8px 28px rgba(124,58,237,0.42)", letterSpacing:"0.2px",
            }}>
            {loading ? (
              <><div style={{width:"18px",height:"18px",border:"2.5px solid rgba(255,255,255,0.25)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}}/> Signing in…</>
            ) : (
              <>
                {loginTab === "mobile" ? "Verify & Sign in" : "Sign in"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",margin:"24px 0 20px"}}>
          <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.08)"}}/>
          <span style={{color:"rgba(255,255,255,0.22)",fontSize:"11px",letterSpacing:"0.5px"}}>OR SIGN IN WITH</span>
          <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.08)"}}/>
        </div>

        {/* Google only */}
        <button type="button"
          style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"12px",color:"rgba(255,255,255,0.7)",fontSize:"14px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",fontFamily:"inherit",marginBottom:"24px",transition:"all 0.2s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.borderColor="rgba(255,255,255,0.25)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"}}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Register */}
        <div style={{textAlign:"center",color:"rgba(255,255,255,0.35)",fontSize:"14px"}}>
          New to Amazon Clone?{" "}
          <Link to="/register" style={{color:"#a78bfa",fontWeight:"700",textDecoration:"none"}}
            onMouseEnter={e=>e.target.style.color="#c4b5fd"}
            onMouseLeave={e=>e.target.style.color="#a78bfa"}>
            Create account →
          </Link>
        </div>

      </div>
    </div>
  );
}
