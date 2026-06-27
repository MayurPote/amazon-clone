from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(prefix="/addresses", tags=["Addresses"])


@router.get("/{user_id}")
def get_addresses(user_id: int, db: Session = Depends(get_db)):
    addresses = (
        db.query(models.Address)
        .filter(models.Address.user_id == user_id)
        .order_by(models.Address.is_default.desc(), models.Address.id.desc())
        .all()
    )
    return [
        {
            "id": a.id,
            "full_name": a.full_name,
            "phone": a.phone,
            "line1": a.line1,
            "line2": a.line2,
            "city": a.city,
            "state": a.state,
            "pincode": a.pincode,
            "is_default": a.is_default,
        }
        for a in addresses
    ]


@router.post("/")
def add_address(data: schemas.AddressCreate, db: Session = Depends(get_db)):
    existing_count = db.query(models.Address).filter(models.Address.user_id == data.user_id).count()
    addr = models.Address(
        user_id=data.user_id,
        full_name=data.full_name,
        phone=data.phone,
        line1=data.line1,
        line2=data.line2,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        is_default=(existing_count == 0),
    )
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return {"message": "Address added", "id": addr.id}


@router.put("/default/{address_id}")
def set_default(address_id: int, user_id: int, db: Session = Depends(get_db)):
    db.query(models.Address).filter(models.Address.user_id == user_id).update({"is_default": False})
    addr = db.query(models.Address).filter(models.Address.id == address_id).first()
    if not addr:
        return {"message": "Address not found"}
    addr.is_default = True
    db.commit()
    return {"message": "Default address updated"}


@router.delete("/{address_id}")
def delete_address(address_id: int, db: Session = Depends(get_db)):
    addr = db.query(models.Address).filter(models.Address.id == address_id).first()
    if not addr:
        return {"message": "Not found"}
    db.delete(addr)
    db.commit()
    return {"message": "Address deleted"}
