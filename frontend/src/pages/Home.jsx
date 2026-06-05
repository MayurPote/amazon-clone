import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

function Home() {

  const products = [
    {
      id: 1,
      name: "iPhone 15",
      description: "Apple Smartphone",
      price: 79999
    },
    {
      id: 2,
      name: "Samsung S24",
      description: "Android Smartphone",
      price: 69999
    },
    {
      id: 3,
      name: "MacBook Air",
      description: "Apple Laptop",
      price: 99999
    }
  ];

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "20px"
        }}
      >
        <h1>Today's Deals</h1>

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px"
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;