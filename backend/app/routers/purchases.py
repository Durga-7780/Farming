from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/purchases", tags=["purchases"])


def generate_purchase_no(db: Session) -> str:
    today = datetime.utcnow().strftime("%Y%m%d")
    count = db.query(models.Purchase).count() + 1
    return f"PUR-{today}-{count:05d}"


def compute_amounts(payload) -> dict:
    gross = round(payload.quantity * payload.rate_per_unit, 2)
    net = round(gross + payload.additional_charges - payload.commission_amount - payload.discount, 2)
    return {"gross_amount": gross, "net_payable": net}


def to_out(p: models.Purchase) -> dict:
    return {
        "id": p.id,
        "purchase_no": p.purchase_no,
        "farmer_id": p.farmer_id,
        "produce_variety_id": p.produce_variety_id,
        "vehicle_id": p.vehicle_id,
        "driver_id": p.driver_id,
        "quantity": p.quantity,
        "weight_kg": p.weight_kg,
        "rate_per_unit": p.rate_per_unit,
        "quality_grade": p.quality_grade,
        "commission_amount": p.commission_amount,
        "additional_charges": p.additional_charges,
        "discount": p.discount,
        "gross_amount": p.gross_amount,
        "net_payable": p.net_payable,
        "status": p.status.value if hasattr(p.status, "value") else p.status,
        "purchase_date": p.purchase_date,
        "notes": p.notes,
        "farmer_name": p.farmer.name if p.farmer else None,
        "produce_variety_name": p.produce_variety.name_en if p.produce_variety else None,
    }


@router.get("", response_model=List[schemas.PurchaseOut])
def list_purchases(
    farmer_id: Optional[int] = None,
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Purchase)
    if farmer_id:
        q = q.filter(models.Purchase.farmer_id == farmer_id)
    if status:
        q = q.filter(models.Purchase.status == status)
    if date_from:
        q = q.filter(models.Purchase.purchase_date >= date_from)
    if date_to:
        q = q.filter(models.Purchase.purchase_date <= date_to)
    rows = q.order_by(models.Purchase.id.desc()).offset(skip).limit(limit).all()
    return [to_out(p) for p in rows]


@router.post("", response_model=schemas.PurchaseOut)
def create_purchase(payload: schemas.PurchaseCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    amounts = compute_amounts(payload)
    purchase = models.Purchase(
        purchase_no=generate_purchase_no(db),
        **payload.model_dump(),
        **amounts,
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return to_out(purchase)


@router.put("/{purchase_id}", response_model=schemas.PurchaseOut)
def update_purchase(purchase_id: int, payload: schemas.PurchaseUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    purchase = db.query(models.Purchase).get(purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(purchase, key, value)
    purchase.gross_amount = round(purchase.quantity * purchase.rate_per_unit, 2)
    purchase.net_payable = round(
        purchase.gross_amount + purchase.additional_charges - purchase.commission_amount - purchase.discount, 2
    )
    db.commit()
    db.refresh(purchase)
    return to_out(purchase)


@router.post("/{purchase_id}/approve", response_model=schemas.PurchaseOut)
def approve_purchase(purchase_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    purchase = db.query(models.Purchase).get(purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    purchase.status = models.PurchaseStatus.approved
    db.commit()
    db.refresh(purchase)
    return to_out(purchase)


@router.delete("/{purchase_id}")
def cancel_purchase(purchase_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    purchase = db.query(models.Purchase).get(purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    purchase.status = models.PurchaseStatus.cancelled
    db.commit()
    return {"ok": True, "message": "Purchase cancelled"}
