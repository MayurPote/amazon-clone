function ProductCard({ product }) {
  return (
    <div
      style={{
        border: "1px solid lightgray",
        padding: "15px",
        width: "250px",
        borderRadius: "5px"
      }}
    >
      <h3>{product.name}</h3>

      <p>{product.description}</p>

      <h4>₹ {product.price}</h4>

      <button>
        Add To Cart
      </button>
    </div>
  );
}

export default ProductCard;