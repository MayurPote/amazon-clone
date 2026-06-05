import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

function Home() {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products/");
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };
const addToCart = async (productId) => {
  try {
    await api.post("/cart/add", {
      user_id: 1,
      product_id: productId,
      quantity: 1
    });

    alert("Product added to cart");
  } catch (error) {
    console.error(error);
    alert("Failed to add product");
  }
};
  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>Today's Deals</h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            marginTop: "20px"
          }}
        >
          {products.map((product) => (
            <ProductCard
     key={product.id}
     product={product}
     addToCart={addToCart}
/>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;