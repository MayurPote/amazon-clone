import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import api from "../services/api";
import { getUserId } from "../services/auth";

function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

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
        user_id: getUserId(),
        product_id: productId,
        quantity: 1
      });

      alert("Product added to cart");

    } catch (error) {

      console.error(error);

      alert("Failed to add product");
    }
  };

  const categories = [
    "All",
    ...new Set(
      products.map(
        (product) => product.category_name
      )
    )
  ];

  const filteredProducts = products.filter(
    (product) => {

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesCategory =
        selectedCategory === "All" ||
        product.category_name ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  return (
    <>
      <Navbar />
      <div
  style={{
    height: "300px",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1542291026-7eec264c27ff')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    marginBottom: "20px"
  }}
></div>

      <div style={{ padding: "20px" }}>
        <h1>Today's Deals</h1>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px"
          }}
        >
          <input
            type="text"
            placeholder="Search Products..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            style={{
              width: "300px",
              padding: "10px"
            }}
          />

          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value
              )
            }
            style={{
              padding: "10px"
            }}
          >
            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>
        </div>

        <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(250px,1fr))",
    gap: "20px",
    marginTop: "20px"
  }}
>
          {filteredProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
              />
            )
          )}
        </div>
      </div>
    </>
  );
}

export default Home;