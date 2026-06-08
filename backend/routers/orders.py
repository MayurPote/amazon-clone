from fastapi import APIRouter, Depends
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
    data: schemas.OrderCreate,
    db: Session = Depends(get_db)
):

    cart = (
        db.query(models.Cart)
        .filter(
            models.Cart.user_id == data.user_id
        )
        .first()
    )

    if not cart:
        return {
            "message": "Cart is empty"
        }

    cart_items = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.cart_id == cart.id
        )
        .all()
    )

    total = 0

    for item in cart_items:

        product = (
            db.query(models.Product)
            .filter(
                models.Product.id == item.product_id
            )
            .first()
        )

        total += (
            product.price * item.quantity
        )

    order = models.Order(
        user_id=data.user_id,
        total_amount=total,
        status="Placed"
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    # Clear cart after order placement
    for item in cart_items:
        db.delete(item)

    db.commit()

    return {
        "message": "Order placed successfully",
        "order_id": order.id
    }


@router.get("/{user_id}")
def get_orders(
    user_id: int,
    db: Session = Depends(get_db)
):

    return (
        db.query(models.Order)
        .filter(
            models.Order.user_id == user_id
        )
        .all()
    )