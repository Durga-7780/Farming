from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/sales", tags=["sales"])


def generate_sale_no(db: Session) -> str:
    today = datetime.utcnow().strftime("%Y%m%d")
    count = db.query(models.Sale).count() + 1
    return f"SAL-{today}-{count:05d}"


def to_out(s: models.Sale) -> dict:
    return {
        "id": s.id,
        "sale_no": s.sale_no,
        "mill_id": s.mill_id,
        "produce_variety_id": s.produce_variety_id,
        "quantity": s.quantity,
        "rate_per_unit": s.rate_per_unit,
        "total_amount": s.total_amount,
        "invoice_number": s.invoice_number,
        "vehicle_number": s.vehicle_number,
        "sale_date": s.sale_date,
        "notes": s.notes,
        "mill_name": s.mill.name if s.mill else None,
        "produce_variety_name": s.produce_variety.name_en if s.produce_variety else None,
    }


@router.get("", response_model=List[schemas.SaleOut])
def list_sales(
    mill_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Sale)
    if mill_id:
        q = q.filter(models.Sale.mill_id == mill_id)
    rows = q.order_by(models.Sale.id.desc()).offset(skip).limit(limit).all()
    return [to_out(s) for s in rows]


@router.post("", response_model=schemas.SaleOut)
def create_sale(payload: schemas.SaleCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    total = round(payload.quantity * payload.rate_per_unit, 2)
    sale = models.Sale(sale_no=generate_sale_no(db), total_amount=total, **payload.model_dump())
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return to_out(sale)


@router.delete("/{sale_id}")
def delete_sale(sale_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    sale = db.query(models.Sale).get(sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    db.delete(sale)
    db.commit()
    return {"ok": True}
