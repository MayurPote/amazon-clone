import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getUserId } from "../services/auth";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get(
        `/orders/${getUserId()}`
      );

      setOrders(response.data);
    } catch (error) {
      console.error(error);
    }
  };

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
        <h1>📦 My Orders</h1>

        {orders.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            <h2>No Orders Found</h2>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "white",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "10px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <h2>
                Order #{order.id}
              </h2>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color: "green",
                    fontWeight: "bold"
                  }}
                >
                  {order.status}
                </span>
              </p>

              <p>
                <strong>Total:</strong> ₹
                {order.total_amount.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Orders;