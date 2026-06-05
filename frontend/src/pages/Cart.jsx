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
const total = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);
  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>My Cart</h1>
        <h2>Total: ₹ {total}</h2>
        {cartItems.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid lightgray",
                padding: "15px",
                marginBottom: "10px"
              }}
            >
              <h3>{item.product_name}</h3>

<p>Price: ₹ {item.price}</p>

<p>Quantity: {item.quantity}</p>
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