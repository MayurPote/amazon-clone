import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Orders() {

  const [orders, setOrders] =
    useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {

    try {

      const response =
        await api.get("/orders/1");

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

        {orders.map((order) => (

          <div
            key={order.id}
            style={{
              border:
                "1px solid lightgray",
              padding: "15px",
              marginBottom: "20px"
            }}
          >

            <h3>
              Order #{order.id}
            </h3>

            <p>
              Status:
              {" "}
              {order.status}
            </p>

            <p>
              Total:
              ₹ {order.total_amount}
            </p>

            <hr />

            {order.products.map(
              (product, index) => (
                <div key={index}>
                  <p>
                    {product.name}
                  </p>

                  <p>
                    Qty:
                    {" "}
                    {product.quantity}
                  </p>

                  <p>
                    ₹ {product.price}
                  </p>

                  <hr />
                </div>
              )
            )}

          </div>
        ))}
      </div>
    </>
  );
}

export default Orders;