from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas

from database import get_db

router = APIRouter(
    prefix="/wishlist",
    tags=["Wishlist"]
)

@router.post("/add")
def add_to_wishlist(
    wishlist: schemas.WishlistCreate,
    db: Session = Depends(get_db)
):
    item = models.Wishlist(
        user_id=wishlist.user_id,
        product_id=wishlist.product_id
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


@router.get("/{user_id}")
def get_wishlist(
    user_id: int,
    db: Session = Depends(get_db)
):
    items = (
        db.query(
            models.Wishlist,
            models.Product
        )
        .join(
            models.Product,
            models.Wishlist.product_id == models.Product.id
        )
        .filter(
            models.Wishlist.user_id == user_id
        )
        .all()
    )

    result = []

    for wishlist, product in items:
        result.append({
            "wishlist_id": wishlist.id,
            "product_id": product.id,
            "name": product.name,
            "price": product.price,
            "original_price": product.original_price,
            "discount_percent": product.discount_percent or 0,
            "image_url": product.image_url,
        })

    return result


@router.delete("/remove/{wishlist_id}")
def remove_from_wishlist(
    wishlist_id: int,
    db: Session = Depends(get_db)
):
    item = (
        db.query(models.Wishlist)
        .filter(
            models.Wishlist.id == wishlist_id
        )
        .first()
    )

    if item:
        db.delete(item)
        db.commit()

    return {
        "message": "Removed"
    }