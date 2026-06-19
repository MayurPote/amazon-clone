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
def place_order(data: schemas.OrderCreate, db: Session = Depends(get_db)):
    cart = db.query(models.Cart).filter(models.Cart.user_id == data.user_id).first()
    if not cart:
        return {"message": "Cart is empty"}

    cart_items = (
        db.query(models.CartItem)
        .filter(models.CartItem.cart_id == cart.id)
        .all()
    )
    if not cart_items:
        return {"message": "Cart is empty"}

    total = 0
    for item in cart_items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            total += product.price * item.quantity

    order = models.Order(
        user_id=data.user_id,
        total_amount=total,
        status="Placed",
        delivery_address=data.delivery_address,
        payment_method=data.payment_method or "COD"
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for item in cart_items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            order_item = models.OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                price=product.price
            )
            db.add(order_item)

    db.commit()

    # Clear cart
    for item in cart_items:
        db.delete(item)
    db.commit()

    return {"message": "Order placed successfully", "order_id": order.id}


@router.get("/{user_id}")
def get_orders(user_id: int, db: Session = Depends(get_db)):
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == user_id)
        .order_by(models.Order.id.desc())
        .all()
    )

    result = []
    for order in orders:
        order_items = (
            db.query(models.OrderItem)
            .filter(models.OrderItem.order_id == order.id)
            .all()
        )

        items = []
        for oi in order_items:
            product = db.query(models.Product).filter(models.Product.id == oi.product_id).first()
            items.append({
                "product_id": oi.product_id,
                "name": product.name if product else "Unknown",
                "image_url": product.image_url if product else None,
                "price": oi.price,
                "quantity": oi.quantity,
            })

        result.append({
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "delivery_address": order.delivery_address,
            "payment_method": order.payment_method,
            "items": items,
        })

    return result


@router.put("/status/{order_id}")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        return {"message": "Order not found"}
    valid = ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"]
    if status not in valid:
        return {"message": f"Invalid status. Must be one of {valid}"}
    order.status = status
    db.commit()
    return {"message": f"Order {order_id} updated to {status}"}
