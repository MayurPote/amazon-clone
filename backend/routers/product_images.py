from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import models
from database import get_db

router = APIRouter(prefix="/product-images", tags=["Product Images"])


class ImageCreate(BaseModel):
    product_id: int
    image_url: str


class ImageReorder(BaseModel):
    image_ids: List[int]   # ordered list of IDs — index becomes new sort_order


@router.get("/{product_id}")
def get_images(product_id: int, db: Session = Depends(get_db)):
    imgs = (
        db.query(models.ProductImage)
        .filter(models.ProductImage.product_id == product_id)
        .order_by(models.ProductImage.sort_order)
        .all()
    )
    return [{"id": i.id, "image_url": i.image_url, "sort_order": i.sort_order} for i in imgs]


@router.post("/")
def add_image(body: ImageCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == body.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Append at end
    last = (
        db.query(models.ProductImage)
        .filter(models.ProductImage.product_id == body.product_id)
        .order_by(models.ProductImage.sort_order.desc())
        .first()
    )
    next_order = (last.sort_order + 1) if last else 0
    img = models.ProductImage(product_id=body.product_id, image_url=body.image_url, sort_order=next_order)
    db.add(img)
    db.commit()
    db.refresh(img)
    return {"id": img.id, "image_url": img.image_url, "sort_order": img.sort_order}


@router.delete("/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db)):
    img = db.query(models.ProductImage).filter(models.ProductImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    db.delete(img)
    db.commit()
    return {"deleted": image_id}


@router.put("/reorder")
def reorder_images(body: ImageReorder, db: Session = Depends(get_db)):
    for order, img_id in enumerate(body.image_ids):
        db.query(models.ProductImage).filter(models.ProductImage.id == img_id).update({"sort_order": order})
    db.commit()
    return {"reordered": True}


@router.put("/set-primary/{image_id}")
def set_primary(image_id: int, db: Session = Depends(get_db)):
    img = db.query(models.ProductImage).filter(models.ProductImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    # Move this image to sort_order=0, bump others up
    imgs = (
        db.query(models.ProductImage)
        .filter(models.ProductImage.product_id == img.product_id)
        .order_by(models.ProductImage.sort_order)
        .all()
    )
    ids_reordered = [img.id] + [i.id for i in imgs if i.id != img.id]
    for order, iid in enumerate(ids_reordered):
        db.query(models.ProductImage).filter(models.ProductImage.id == iid).update({"sort_order": order})
    db.commit()
    return {"primary_set": image_id}
