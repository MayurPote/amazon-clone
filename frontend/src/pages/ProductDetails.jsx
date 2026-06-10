    import { useEffect, useState } from "react";
    import { useParams } from "react-router-dom";
    import Navbar from "../components/Navbar";
    import api from "../services/api";
    import { getUserId } from "../services/auth";

    function ProductDetails() {

    const { id } = useParams();

    const [product, setProduct] =
        useState(null);

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {

        try {

        const response =
            await api.get(`/products/${id}`);

        setProduct(response.data);

        } catch (error) {

        console.error(error);
        }
    };

    const addToCart = async () => {

        try {

        await api.post("/cart/add", {
            user_id: getUserId(),
            product_id: product.id,
            quantity: 1
        });

        alert("Product added to cart");

        } catch (error) {

        console.error(error);
        }
    };

    if (!product) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
        <Navbar />

        <div
            style={{
            padding: "30px",
            maxWidth: "1000px",
            margin: "auto",
            background: "white",
            marginTop: "20px",
            borderRadius: "10px",
            boxShadow:
                "0 2px 8px rgba(0,0,0,0.1)"
            }}
        >
            <img
            src={product.image_url}
            alt={product.name}
            style={{
                width: "300px",
                display: "block",
                marginBottom: "20px"
            }}
            />

            <h1>{product.name}</h1>

            <h2
            style={{
                color: "#B12704"
            }}
            >
            ₹ {product.price}
            </h2>

            <p>
            {product.description}
            </p>

            <button
            onClick={addToCart}
            style={{
                background: "#FFD814",
                border: "none",
                padding: "12px 20px",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "bold"
            }}
            >
            Add To Cart
            </button>
        </div>
        </>
    );
    }

    export default ProductDetails;