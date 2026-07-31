from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/farmers", tags=["farmers"])


def generate_code(db: Session) -> str:
    count = db.query(models.Farmer).count() + 1
    return f"FRM{count:05d}"


def _farmer_dict(farmer):
    """Convert farmer ORM object to dict with variety name."""
    d = farmer.__dict__.copy()
    d.pop("_sa_instance_state", None)
    d["produce_variety_name"] = farmer.produce_variety.name_en if farmer.produce_variety else None
    return d


@router.get("")
def list_farmers(
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Farmer)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(models.Farmer.name.ilike(like), models.Farmer.mobile.ilike(like), models.Farmer.code.ilike(like)))
    if is_active is not None:
        q = q.filter(models.Farmer.is_active == is_active)
    farmers = q.order_by(models.Farmer.id.desc()).offset(skip).limit(limit).all()
    return [_farmer_dict(f) for f in farmers]


@router.get("/{farmer_id}")
def get_farmer(farmer_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    farmer = db.query(models.Farmer).get(farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return _farmer_dict(farmer)


@router.post("")
def create_farmer(payload: schemas.FarmerCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    farmer = models.Farmer(**payload.model_dump(), code=generate_code(db))
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    return _farmer_dict(farmer)


@router.put("/{farmer_id}", response_model=schemas.FarmerOut)
def update_farmer(farmer_id: int, payload: schemas.FarmerUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    farmer = db.query(models.Farmer).get(farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(farmer, key, value)
    db.commit()
    db.refresh(farmer)
    return farmer


@router.delete("/{farmer_id}")
def delete_farmer(farmer_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    farmer = db.query(models.Farmer).get(farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    farmer.is_active = False
    db.commit()
    return {"ok": True, "message": "Farmer deactivated"}


@router.get("/{farmer_id}/ledger")
def farmer_ledger(farmer_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    farmer = db.query(models.Farmer).get(farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    purchases = db.query(models.Purchase).filter(models.Purchase.farmer_id == farmer_id).all()
    payments = db.query(models.FarmerPayment).filter(models.FarmerPayment.farmer_id == farmer_id).all()
    total_purchase = sum(p.net_payable for p in purchases)
    total_paid = sum(p.amount for p in payments)
    return {
        "farmer_id": farmer_id,
        "total_purchase_value": total_purchase,
        "total_paid": total_paid,
        "outstanding": total_purchase - total_paid,
        "purchases": [{"id": p.id, "purchase_no": p.purchase_no, "net_payable": p.net_payable, "date": p.purchase_date} for p in purchases],
        "payments": [{"id": p.id, "amount": p.amount, "date": p.payment_date, "mode": p.payment_mode} for p in payments],
    }
