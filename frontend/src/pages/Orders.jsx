import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/1");

      setOrders(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>My Orders</h1>

        {orders.length === 0 ? (
          <p>No Orders Found</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: "1px solid lightgray",
                padding: "15px",
                marginBottom: "10px"
              }}
            >
              <h3>Order #{order.id}</h3>

              <p>
                Total: ₹ {order.total_amount}
              </p>

              <p>
                Status: {order.status}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Orders;