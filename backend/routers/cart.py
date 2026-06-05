from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas

from database import get_db

router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)

@router.post("/add")
def add_to_cart(
    data: schemas.AddToCart,
    db: Session = Depends(get_db)
):

    cart = (
        db.query(models.Cart)
        .filter(models.Cart.user_id == data.user_id)
        .first()
    )

    if not cart:
        cart = models.Cart(
            user_id=data.user_id
        )

        db.add(cart)
        db.commit()
        db.refresh(cart)

    cart_item = models.CartItem(
        cart_id=cart.id,
        product_id=data.product_id,
        quantity=data.quantity
    )

    db.add(cart_item)
    db.commit()

    return {
        "message": "Product added to cart"
    }

@router.get("/{user_id}")
def view_cart(
    user_id: int,
    db: Session = Depends(get_db)
):

    cart = (
        db.query(models.Cart)
        .filter(models.Cart.user_id == user_id)
        .first()
    )

    if not cart:
        return []

    items = (
        db.query(models.CartItem)
        .filter(models.CartItem.cart_id == cart.id)
        .all()
    )

    return items

@router.put("/update")
def update_cart_item(
    data: schemas.UpdateCartItem,
    db: Session = Depends(get_db)
):

    item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.id == data.cart_item_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    item.quantity = data.quantity

    db.commit()

    return {
        "message": "Quantity updated"
    }

@router.delete("/remove/{item_id}")
def remove_item(
    item_id: int,
    db: Session = Depends(get_db)
):

    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Item removed"
    }