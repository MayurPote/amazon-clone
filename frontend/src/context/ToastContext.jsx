import { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  const dismiss = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  const ICONS = {
    success: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    error:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    info:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    cart:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  };

  const BG = { success: "#067D62", error: "#CC0C39", info: "#232f3e", cart: "#007185" };

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {/* Toast container */}
      <div style={{ position: "fixed", bottom: "28px", left: "28px", zIndex: 99999, display: "flex", flexDirection: "column", gap: "10px", pointerEvents: "none" }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: BG[t.type] || BG.success, color: "white",
              padding: "12px 16px 12px 14px", borderRadius: "8px",
              fontSize: "14px", fontWeight: "600", fontFamily: "inherit",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              pointerEvents: "all", cursor: "pointer",
              animation: "toastIn 0.25s ease",
              minWidth: "220px", maxWidth: "340px",
            }}
            onClick={() => dismiss(t.id)}
          >
            <span style={{ flexShrink: 0 }}>{ICONS[t.type] || ICONS.success}</span>
            <span style={{ flex: 1, lineHeight: "1.3" }}>{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
