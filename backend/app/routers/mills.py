from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/mills", tags=["mills"])


def generate_code(db: Session) -> str:
    count = db.query(models.Mill).count() + 1
    return f"MIL{count:05d}"


@router.get("", response_model=List[schemas.MillOut])
def list_mills(
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Mill)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(models.Mill.name.ilike(like), models.Mill.mobile.ilike(like), models.Mill.code.ilike(like)))
    if is_active is not None:
        q = q.filter(models.Mill.is_active == is_active)
    return q.order_by(models.Mill.id.desc()).offset(skip).limit(limit).all()


@router.get("/{mill_id}", response_model=schemas.MillOut)
def get_mill(mill_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    mill = db.query(models.Mill).get(mill_id)
    if not mill:
        raise HTTPException(status_code=404, detail="Mill not found")
    return mill


@router.post("", response_model=schemas.MillOut)
def create_mill(payload: schemas.MillCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    mill = models.Mill(**payload.model_dump(), code=generate_code(db))
    db.add(mill)
    db.commit()
    db.refresh(mill)
    return mill


@router.put("/{mill_id}", response_model=schemas.MillOut)
def update_mill(mill_id: int, payload: schemas.MillUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    mill = db.query(models.Mill).get(mill_id)
    if not mill:
        raise HTTPException(status_code=404, detail="Mill not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(mill, key, value)
    db.commit()
    db.refresh(mill)
    return mill


@router.delete("/{mill_id}")
def delete_mill(mill_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    mill = db.query(models.Mill).get(mill_id)
    if not mill:
        raise HTTPException(status_code=404, detail="Mill not found")
    mill.is_active = False
    db.commit()
    return {"ok": True, "message": "Mill deactivated"}


@router.get("/{mill_id}/ledger")
def mill_ledger(mill_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    mill = db.query(models.Mill).get(mill_id)
    if not mill:
        raise HTTPException(status_code=404, detail="Mill not found")
    sales = db.query(models.Sale).filter(models.Sale.mill_id == mill_id).all()
    payments = db.query(models.MillPayment).filter(models.MillPayment.mill_id == mill_id).all()
    total_sale = sum(s.total_amount for s in sales)
    total_collected = sum(p.amount for p in payments)
    return {
        "mill_id": mill_id,
        "total_sale_value": total_sale,
        "total_collected": total_collected,
        "outstanding": total_sale - total_collected,
        "sales": [{"id": s.id, "sale_no": s.sale_no, "total_amount": s.total_amount, "date": s.sale_date} for s in sales],
        "payments": [{"id": p.id, "amount": p.amount, "date": p.payment_date} for p in payments],
    }
