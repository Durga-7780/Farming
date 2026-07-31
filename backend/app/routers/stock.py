from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/stock", tags=["stock"])


@router.get("/live")
def live_stock(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Stock per produce variety = approved purchases quantity - sold quantity."""
    varieties = db.query(models.ProduceVariety).filter(models.ProduceVariety.is_active == True).all()
    result = []
    for v in varieties:
        purchased = (
            db.query(func.coalesce(func.sum(models.Purchase.quantity), 0))
            .filter(
                models.Purchase.produce_variety_id == v.id,
                models.Purchase.status == models.PurchaseStatus.approved,
            )
            .scalar()
        )
        sold = (
            db.query(func.coalesce(func.sum(models.Sale.quantity), 0))
            .filter(models.Sale.produce_variety_id == v.id)
            .scalar()
        )
        result.append({
            "variety_id": v.id,
            "variety_name": v.name_en,
            "unit": v.unit,
            "purchased": float(purchased),
            "sold": float(sold),
            "available": float(purchased) - float(sold),
        })
    return result


@router.get("/ledger/{variety_id}")
def stock_ledger(variety_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    purchases = (
        db.query(models.Purchase)
        .filter(models.Purchase.produce_variety_id == variety_id, models.Purchase.status == models.PurchaseStatus.approved)
        .order_by(models.Purchase.purchase_date)
        .all()
    )
    sales = (
        db.query(models.Sale)
        .filter(models.Sale.produce_variety_id == variety_id)
        .order_by(models.Sale.sale_date)
        .all()
    )
    entries = [
        {"type": "in", "date": p.purchase_date, "qty": p.quantity, "ref": p.purchase_no} for p in purchases
    ] + [
        {"type": "out", "date": s.sale_date, "qty": s.quantity, "ref": s.sale_no} for s in sales
    ]
    entries.sort(key=lambda e: e["date"])
    running = 0
    for e in entries:
        running += e["qty"] if e["type"] == "in" else -e["qty"]
        e["balance"] = running
    return entries
