from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=schemas.DashboardSummary)
def summary(db: Session = Depends(get_db), _=Depends(get_current_user)):
    today = datetime.utcnow().date()
    month_start = today.replace(day=1)

    todays_purchases = db.query(func.coalesce(func.sum(models.Purchase.net_payable), 0)).filter(
        func.date(models.Purchase.purchase_date) == today
    ).scalar()

    todays_sales = db.query(func.coalesce(func.sum(models.Sale.total_amount), 0)).filter(
        func.date(models.Sale.sale_date) == today
    ).scalar()

    total_purchase_value = db.query(func.coalesce(func.sum(models.Purchase.net_payable), 0)).scalar()
    total_paid = db.query(func.coalesce(func.sum(models.FarmerPayment.amount), 0)).scalar()

    total_sale_value = db.query(func.coalesce(func.sum(models.Sale.total_amount), 0)).scalar()
    total_collected = db.query(func.coalesce(func.sum(models.MillPayment.amount), 0)).scalar()

    purchased_qty = db.query(func.coalesce(func.sum(models.Purchase.quantity), 0)).filter(
        models.Purchase.status == models.PurchaseStatus.approved
    ).scalar()
    sold_qty = db.query(func.coalesce(func.sum(models.Sale.quantity), 0)).scalar()

    month_purchase_total = db.query(func.coalesce(func.sum(models.Purchase.net_payable), 0)).filter(
        models.Purchase.purchase_date >= month_start
    ).scalar()
    month_sales_total = db.query(func.coalesce(func.sum(models.Sale.total_amount), 0)).filter(
        models.Sale.sale_date >= month_start
    ).scalar()

    return {
        "todays_purchases": float(todays_purchases),
        "todays_sales": float(todays_sales),
        "current_stock_qty": float(purchased_qty) - float(sold_qty),
        "pending_farmer_payments": float(total_purchase_value) - float(total_paid),
        "pending_mill_payments": float(total_sale_value) - float(total_collected),
        "total_farmers": db.query(models.Farmer).filter(models.Farmer.is_active == True).count(),
        "total_mills": db.query(models.Mill).filter(models.Mill.is_active == True).count(),
        "month_purchase_total": float(month_purchase_total),
        "month_sales_total": float(month_sales_total),
    }


@router.get("/trend")
def trend(days: int = 14, db: Session = Depends(get_db), _=Depends(get_current_user)):
    start = datetime.utcnow().date() - timedelta(days=days - 1)
    points = []
    for i in range(days):
        d = start + timedelta(days=i)
        purchases = db.query(func.coalesce(func.sum(models.Purchase.net_payable), 0)).filter(
            func.date(models.Purchase.purchase_date) == d
        ).scalar()
        sales = db.query(func.coalesce(func.sum(models.Sale.total_amount), 0)).filter(
            func.date(models.Sale.sale_date) == d
        ).scalar()
        points.append({"date": d.isoformat(), "purchases": float(purchases), "sales": float(sales)})
    return points


@router.get("/top-farmers")
def top_farmers(limit: int = 5, db: Session = Depends(get_db), _=Depends(get_current_user)):
    rows = (
        db.query(models.Farmer.name, func.sum(models.Purchase.net_payable).label("total"))
        .join(models.Purchase, models.Purchase.farmer_id == models.Farmer.id)
        .group_by(models.Farmer.id)
        .order_by(func.sum(models.Purchase.net_payable).desc())
        .limit(limit)
        .all()
    )
    return [{"name": r[0], "total": float(r[1])} for r in rows]
