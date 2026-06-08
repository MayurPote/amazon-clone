import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart/1");
      setCartItems(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}`);
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (quantity < 1) {
        return;
      }

      await api.put("/cart/update", {
        cart_item_id: itemId,
        quantity: quantity
      });

      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
const checkout = async () => {
  try {

    await api.post(
      "/orders/place",
      {
        user_id: 1
      }
    );

    alert(
      "Order Placed Successfully"
    );

    window.location.href =
      "/orders";

  } catch (error) {

    console.error(error);

    alert(
      "Checkout Failed"
    );
  }
};
  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>My Cart</h1>

        <h2>Total: ₹ {total}</h2>

        <button
  onClick={checkout}
  style={{
    padding: "10px",
    marginBottom: "20px"
  }}
>
  Proceed To Checkout
</button>

        {cartItems.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.cart_item_id}
              style={{
                border: "1px solid lightgray",
                padding: "15px",
                marginBottom: "10px"
              }}
            >
              <h3>{item.product_name}</h3>

              <p>Price: ₹ {item.price}</p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "10px"
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

                <span>{item.quantity}</span>

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

              <button
                onClick={() => removeItem(item.cart_item_id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Cart;