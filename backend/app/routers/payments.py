from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


# ---- Farmer Payments ----
@router.get("/farmer", response_model=List[schemas.FarmerPaymentOut])
def list_farmer_payments(farmer_id: Optional[int] = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(models.FarmerPayment)
    if farmer_id:
        q = q.filter(models.FarmerPayment.farmer_id == farmer_id)
    rows = q.order_by(models.FarmerPayment.id.desc()).all()
    return [
        {**r.__dict__, "farmer_name": r.farmer.name if r.farmer else None}
        for r in rows
    ]


@router.post("/farmer", response_model=schemas.FarmerPaymentOut)
def create_farmer_payment(payload: schemas.FarmerPaymentCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    payment = models.FarmerPayment(**payload.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return {**payment.__dict__, "farmer_name": payment.farmer.name if payment.farmer else None}


@router.patch("/farmer/{payment_id}", response_model=schemas.FarmerPaymentOut)
def update_farmer_payment(payment_id: int, payload: schemas.FarmerPaymentUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    payment = db.query(models.FarmerPayment).get(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Not found")
    
    if payload.amount is not None: payment.amount = payload.amount
    if payload.payment_type is not None: payment.payment_type = payload.payment_type
    if payload.payment_mode is not None: payment.payment_mode = payload.payment_mode
    if payload.reference_no is not None: payment.reference_no = payload.reference_no
    if payload.notes is not None: payment.notes = payload.notes

    db.commit()
    db.refresh(payment)
    return {**payment.__dict__, "farmer_name": payment.farmer.name if payment.farmer else None}


@router.delete("/farmer/{payment_id}")
def delete_farmer_payment(payment_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    payment = db.query(models.FarmerPayment).get(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(payment)
    db.commit()
    return {"ok": True}


# ---- Mill Payments ----
@router.get("/mill", response_model=List[schemas.MillPaymentOut])
def list_mill_payments(mill_id: Optional[int] = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(models.MillPayment)
    if mill_id:
        q = q.filter(models.MillPayment.mill_id == mill_id)
    rows = q.order_by(models.MillPayment.id.desc()).all()
    return [
        {**r.__dict__, "mill_name": r.mill.name if r.mill else None}
        for r in rows
    ]


@router.post("/mill", response_model=schemas.MillPaymentOut)
def create_mill_payment(payload: schemas.MillPaymentCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    payment = models.MillPayment(**payload.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return {**payment.__dict__, "mill_name": payment.mill.name if payment.mill else None}


@router.patch("/mill/{payment_id}", response_model=schemas.MillPaymentOut)
def update_mill_payment(payment_id: int, payload: schemas.MillPaymentUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    payment = db.query(models.MillPayment).get(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Not found")
    
    if payload.amount is not None: payment.amount = payload.amount
    if payload.payment_mode is not None: payment.payment_mode = payload.payment_mode
    if payload.reference_no is not None: payment.reference_no = payload.reference_no
    if payload.notes is not None: payment.notes = payload.notes

    db.commit()
    db.refresh(payment)
    return {**payment.__dict__, "mill_name": payment.mill.name if payment.mill else None}


@router.delete("/mill/{payment_id}")
def delete_mill_payment(payment_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    payment = db.query(models.MillPayment).get(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(payment)
    db.commit()
    return {"ok": True}
