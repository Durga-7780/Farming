from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.get("", response_model=List[schemas.ExpenseOut])
def list_expenses(category: Optional[str] = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(models.Expense)
    if category:
        q = q.filter(models.Expense.category == category)
    return q.order_by(models.Expense.id.desc()).all()


@router.post("", response_model=schemas.ExpenseOut)
def create_expense(payload: schemas.ExpenseCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    expense = models.Expense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    expense = db.query(models.Expense).get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(expense)
    db.commit()
    return {"ok": True}


@router.patch("/{expense_id}", response_model=schemas.ExpenseOut)
def update_expense(expense_id: int, payload: schemas.ExpenseUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    expense = db.query(models.Expense).get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Not found")
    
    if payload.category is not None:
        expense.category = payload.category
    if payload.amount is not None:
        expense.amount = payload.amount
    if payload.description is not None:
        expense.description = payload.description

    db.commit()
    db.refresh(expense)
    return expense
