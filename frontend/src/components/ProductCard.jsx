function ProductCard({ product, addToCart }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "15px",
        width: "250px",
        borderRadius: "8px",
        backgroundColor: "white"
      }}
    >
      <img
        src="https://via.placeholder.com/200"
        alt={product.name}
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover"
        }}
      />

      <h3>{product.name}</h3>

      <p>{product.description}</p>

      <h4>₹ {product.price}</h4>

      <button onClick={() => addToCart(product.id)}>
       Add To Cart
     </button>
    </div>
  );
}

export default ProductCard;