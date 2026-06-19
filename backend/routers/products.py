from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

import models
import schemas

from database import get_db

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


def serialize_product(product, db):
    category = (
        db.query(models.Category)
        .filter(models.Category.id == product.category_id)
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
        "category_name": category.name if category else "",
        "is_best_seller": product.is_best_seller,
        "discount_percent": product.discount_percent or 0,
        "original_price": product.original_price,
        "rating": product.rating or 4.5,
        "reviews": product.reviews or 100,
    }


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
        category_id=product.category_id,
        rating=product.rating,
        reviews=product.reviews,
        original_price=product.original_price,
        discount_percent=product.discount_percent,
        is_best_seller=product.is_best_seller,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.get("/")
def get_products(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    bestseller: Optional[bool] = Query(None),
):
    q = db.query(models.Product)
    if search:
        q = q.filter(models.Product.name.ilike(f"%{search}%"))
    if category:
        cat = db.query(models.Category).filter(models.Category.name.ilike(f"%{category}%")).first()
        if cat:
            q = q.filter(models.Product.category_id == cat.id)
    if bestseller:
        q = q.filter(models.Product.is_best_seller == True)
    products = q.all()
    return [serialize_product(p, db) for p in products]


@router.get("/trending")
def get_trending_products(db: Session = Depends(get_db)):
    products = (
        db.query(models.Product)
        .filter(models.Product.is_best_seller == True)
        .limit(10)
        .all()
    )
    if not products:
        products = (
            db.query(models.Product)
            .order_by(models.Product.reviews.desc())
            .limit(10)
            .all()
        )
    return [serialize_product(p, db) for p in products]


@router.get("/related/{product_id}")
def get_related_products(product_id: int, db: Session = Depends(get_db)):
    current = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not current:
        return []
    products = (
        db.query(models.Product)
        .filter(
            models.Product.category_id == current.category_id,
            models.Product.id != product_id
        )
        .limit(6)
        .all()
    )
    return [serialize_product(p, db) for p in products]


@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        return {"message": "Product not found"}
    return serialize_product(product, db)
