from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas

from database import get_db

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

@router.post("/")
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db)
):
    new_category = models.Category(
        name=category.name
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


@router.get("/")
def get_categories(
    db: Session = Depends(get_db)
):
    return db.query(
        models.Category
    ).all()