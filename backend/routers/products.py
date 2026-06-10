from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas

from database import get_db

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post("/")
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):

    new_product = models.Product(
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        image_url=product.image_url,
        category_id=product.category_id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@router.get("/")
def get_products(
    db: Session = Depends(get_db)
):

    products = (
        db.query(models.Product)
        .all()
    )

    result = []

    for product in products:

        category = (
            db.query(models.Category)
            .filter(
                models.Category.id ==
                product.category_id
            )
            .first()
        )

        result.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "category_id": product.category_id,
            "image_url": product.image_url,
            "category_name": category.name
            if category else ""
        })

    return result


@router.get("/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = (
        db.query(models.Product)
        .filter(
            models.Product.id == product_id
        )
        .first()
    )

    if not product:
        return {
            "message": "Product not found"
        }

    category = (
        db.query(models.Category)
        .filter(
            models.Category.id ==
            product.category_id
        )
        .first()
    )

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "stock": product.stock,
        "category_id": product.category_id,
        "image_url": product.image_url,
        "category_name": category.name
        if category else ""
    }