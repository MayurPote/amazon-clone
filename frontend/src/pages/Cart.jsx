import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getUserId } from "../services/auth";

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get(
        `/cart/${getUserId()}`
      );

      setCartItems(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(
        `/cart/remove/${itemId}`
      );

      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const updateQuantity = async (
    itemId,
    quantity
  ) => {
    if (quantity < 1) return;

    try {
      await api.put("/cart/update", {
        cart_item_id: itemId,
        quantity: quantity
      });

      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const checkout = async () => {
    try {
      const response = await api.post(
        "/orders/place",
        {
          user_id: getUserId()
        }
      );

      alert(response.data.message);

      fetchCart();
    } catch (error) {
      console.error(error);

      alert("Checkout Failed");
    }
  };

  const total = cartItems.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "30px",
          maxWidth: "1200px",
          margin: "auto"
        }}
      >
        <h1>🛒 Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            <h2>Your Cart is Empty</h2>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <div
                key={item.cart_item_id}
                style={{
                  background: "white",
                  padding: "20px",
                  marginBottom: "15px",
                  borderRadius: "10px",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.1)",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h2>
                    {item.product_name}
                  </h2>

                  <p>
                    Price:
                    <strong>
                      {" "}
                      ₹{item.price}
                    </strong>
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "10px"
                    }}
                  >
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.cart_item_id,
                          item.quantity - 1
                        )
                      }
                    >
                      -
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.cart_item_id,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() =>
                    removeItem(
                      item.cart_item_id
                    )
                  }
                  style={{
                    background:
                      "#dc3545",
                    color: "white",
                    border: "none",
                    padding:
                      "10px 15px",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              </div>
            ))}

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "10px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.1)",
                marginTop: "20px"
              }}
            >
              <h2>
                Total: ₹
                {total.toLocaleString()}
              </h2>

              <button
                onClick={checkout}
                style={{
                  background:
                    "#ff9900",
                  color: "white",
                  border: "none",
                  padding:
                    "12px 25px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Proceed To Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;