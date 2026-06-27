from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/{product_id}")
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(models.Review)
        .filter(models.Review.product_id == product_id)
        .order_by(models.Review.id.desc())
        .all()
    )
    result = []
    for r in reviews:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "user_id": r.user_id,
            "user_name": user.name if user else "User",
            "product_id": r.product_id,
            "rating": r.rating,
            "title": r.title,
            "body": r.body,
            "helpful_count": r.helpful_count,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return result


@router.post("/")
def add_review(data: schemas.ReviewCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(models.Review)
        .filter(models.Review.user_id == data.user_id, models.Review.product_id == data.product_id)
        .first()
    )
    if existing:
        existing.rating = data.rating
        existing.title = data.title
        existing.body = data.body
        db.commit()
        return {"message": "Review updated", "id": existing.id}

    review = models.Review(
        user_id=data.user_id,
        product_id=data.product_id,
        rating=data.rating,
        title=data.title,
        body=data.body,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return {"message": "Review added", "id": review.id}


@router.post("/helpful/{review_id}")
def mark_helpful(review_id: int, db: Session = Depends(get_db)):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        return {"message": "Review not found"}
    review.helpful_count = (review.helpful_count or 0) + 1
    db.commit()
    return {"helpful_count": review.helpful_count}
