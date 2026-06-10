import { useNavigate } from "react-router-dom";

function ProductCard({
  product,
  addToCart
}) {

  const navigate = useNavigate();
  console.log(product);
  return (
    <div
      style={{
        backgroundColor: "white",
        width: "250px",
        borderRadius: "10px",
        padding: "15px",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.15)",
        transition: "0.3s"
      }}
    >
      <img
       src={product.image_url}
        alt={product.name}
        onClick={() =>
          navigate(`/product/${product.id}`)
        }
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      />

      <h3
        onClick={() =>
          navigate(`/product/${product.id}`)
        }
        style={{
          cursor: "pointer"
        }}
      >
        {product.name}
      </h3>

      <p
        style={{
          color: "#555"
        }}
      >
        {product.description}
      </p>

      <h2
        style={{
          color: "#B12704"
        }}
      >
        ₹ {product.price}
      </h2>

      <button
        onClick={() =>
          addToCart(product.id)
        }
        style={{
          width: "100%",
          backgroundColor: "#FFD814",
          border: "none",
          padding: "10px",
          borderRadius: "20px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Add To Cart
      </button>
    </div>
  );
}

export default ProductCard;