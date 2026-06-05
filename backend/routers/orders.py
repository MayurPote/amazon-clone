from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas

from database import get_db

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

@router.post("/place")
def place_order(
    data: schemas.CreateOrder,
    db: Session = Depends(get_db)
):
    cart = (
        db.query(models.Cart)
        .filter(models.Cart.user_id == data.user_id)
        .first()
    )

    if not cart:
        raise HTTPException(
            status_code=404,
            detail="Cart not found"
        )

    cart_items = (
        db.query(models.CartItem)
        .filter(models.CartItem.cart_id == cart.id)
        .all()
    )

    if not cart_items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    total = 0

    for item in cart_items:
        product = (
            db.query(models.Product)
            .filter(models.Product.id == item.product_id)
            .first()
        )

        total += product.price * item.quantity

    order = models.Order(
        user_id=data.user_id,
        total_amount=total
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    for item in cart_items:

        product = (
            db.query(models.Product)
            .filter(models.Product.id == item.product_id)
            .first()
        )

        order_item = models.OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        )

        db.add(order_item)

    db.commit()

    for item in cart_items:
        db.delete(item)

    db.commit()

    return {
        "message": "Order placed successfully",
        "order_id": order.id,
        "total_amount": total
    }

@router.get("/{user_id}")
def get_orders(
    user_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(models.Order)
        .filter(models.Order.user_id == user_id)
        .all()
    )