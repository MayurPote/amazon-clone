from fastapi import FastAPI

from routers import users
from routers import categories
from routers import products
from routers import cart
from routers import orders
from fastapi.middleware.cors import CORSMiddleware
from routers import orders

from database import engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
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

@app.get("/")
def home():
    return {
        "message": "Amazon Clone API Running"
    }