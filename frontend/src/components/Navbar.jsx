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
        backgroundColor: "#131921",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        color: "white"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "25px"
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#ff9900"
          }}
        >
          Amazon Clone
        </h2>

        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Home
        </Link>

        <Link
          to="/cart"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Cart
        </Link>

        <Link
          to="/orders"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Orders
        </Link>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "0 30px"
        }}
      >
        <input
          type="text"
          placeholder="Search Amazon"
          style={{
            width: "60%",
            padding: "10px",
            border: "none",
            borderRadius: "4px"
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}
      >
        {!token ? (
          <>
            <Link
              to="/login"
              style={{
                color: "white",
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              Login
            </Link>

            <Link
              to="/register"
              style={{
                color: "white",
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={logout}
            style={{
              backgroundColor: "#ff9900",
              border: "none",
              padding: "8px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;