from fastapi import FastAPI

from routers import users
from routers import categories
from routers import products

from database import engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users.router)
app.include_router(categories.router)
app.include_router(products.router)

@app.get("/")
def home():
    return {
        "message": "Amazon Clone API Running"
    }