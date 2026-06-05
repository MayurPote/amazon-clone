function Navbar() {
  return (
    <nav
      style={{
        background: "#131921",
        color: "white",
        padding: "15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <h2>Amazon Clone</h2>

      <input
        type="text"
        placeholder="Search Amazon"
        style={{
          width: "400px",
          padding: "8px"
        }}
      />

      <div>
        Cart 🛒
      </div>
    </nav>
  );
}

export default Navbar;