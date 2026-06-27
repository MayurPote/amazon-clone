from fastapi import FastAPI

from routers import users
from routers import categories
from routers import products
from routers import cart
from routers import orders
from routers import wishlist
from routers import reviews
from routers import addresses
from routers import product_images
from routers import price_tracker
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(wishlist.router)
app.include_router(reviews.router)
app.include_router(addresses.router)
app.include_router(product_images.router)
app.include_router(price_tracker.router)

@app.get("/")
def home():
    return {
        "message": "Amazon Clone API Running"
    }