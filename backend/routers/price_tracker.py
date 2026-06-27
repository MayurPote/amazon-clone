from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models
from database import get_db

router = APIRouter(prefix="/price-tracker", tags=["Price Tracker"])


class AlertCreate(BaseModel):
    user_id: int
    product_id: int
    target_price: float


@router.get("/history/{product_id}")
def get_price_history(product_id: int, db: Session = Depends(get_db)):
    history = (
        db.query(models.PriceHistory)
        .filter(models.PriceHistory.product_id == product_id)
        .order_by(models.PriceHistory.recorded_at)
        .all()
    )
    return [{"price": h.price, "date": h.recorded_at.isoformat()} for h in history]


@router.get("/alerts/{user_id}")
def get_alerts(user_id: int, db: Session = Depends(get_db)):
    alerts = (
        db.query(models.PriceAlert)
        .filter(models.PriceAlert.user_id == user_id, models.PriceAlert.is_active == True)
        .all()
    )
    result = []
    for alert in alerts:
        product = db.query(models.Product).filter(models.Product.id == alert.product_id).first()
        if product:
            result.append({
                "id": alert.id,
                "product_id": alert.product_id,
                "product_name": product.name,
                "product_image": product.image_url,
                "current_price": product.price,
                "target_price": alert.target_price,
                "is_triggered": product.price <= alert.target_price,
                "created_at": alert.created_at.isoformat() if alert.created_at else None,
            })
    return result


@router.get("/check/{user_id}")
def check_triggered_alerts(user_id: int, db: Session = Depends(get_db)):
    alerts = (
        db.query(models.PriceAlert)
        .filter(models.PriceAlert.user_id == user_id, models.PriceAlert.is_active == True)
        .all()
    )
    triggered = []
    for alert in alerts:
        product = db.query(models.Product).filter(models.Product.id == alert.product_id).first()
        if product and product.price <= alert.target_price:
            triggered.append({
                "alert_id": alert.id,
                "product_id": product.id,
                "product_name": product.name,
                "product_image": product.image_url,
                "current_price": product.price,
                "target_price": alert.target_price,
            })
    return triggered


@router.post("/alerts/")
def create_alert(body: AlertCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(models.PriceAlert)
        .filter(
            models.PriceAlert.user_id == body.user_id,
            models.PriceAlert.product_id == body.product_id,
            models.PriceAlert.is_active == True,
        )
        .first()
    )
    if existing:
        existing.target_price = body.target_price
        db.commit()
        return {"id": existing.id, "updated": True}

    alert = models.PriceAlert(
        user_id=body.user_id,
        product_id=body.product_id,
        target_price=body.target_price,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {"id": alert.id, "created": True}


@router.delete("/alerts/{alert_id}")
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(models.PriceAlert).filter(models.PriceAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"deleted": alert_id}
