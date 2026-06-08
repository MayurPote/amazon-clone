import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");

    alert("Logged Out Successfully");

    navigate("/login");
  };

  return (
    <div
      style={{
        backgroundColor: "#232f3e",
        padding: "15px",
        display: "flex",
        gap: "20px"
      }}
    >
      <Link
        to="/"
        style={{
          color: "white",
          textDecoration: "none"
        }}
      >
        Home
      </Link>

      <Link
        to="/cart"
        style={{
          color: "white",
          textDecoration: "none"
        }}
      >
        Cart
      </Link>

      <Link
  to="/orders"
  style={{
    color: "white",
    textDecoration: "none"
  }}
>
  Orders
</Link>

      {!token ? (
        <>
          <Link
            to="/login"
            style={{
              color: "white",
              textDecoration: "none"
            }}
          >
            Login
          </Link>

          <Link
            to="/register"
            style={{
              color: "white",
              textDecoration: "none"
            }}
          >
            Register
          </Link>
        </>
      ) : (
        <button onClick={logout}>
          Logout
        </button>
      )}
    </div>
  );
}

export default Navbar;