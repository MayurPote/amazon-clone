import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>Today's Deals</h1>

        <input
          type="text"
          placeholder="Search Products..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          style={{
            width: "300px",
            padding: "10px",
            marginBottom: "20px"
          }}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px"
          }}
        >
          {filteredProducts.map((product) => (
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