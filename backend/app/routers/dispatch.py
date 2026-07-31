from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/dispatches", tags=["dispatches"])


def generate_bill_no(db: Session) -> str:
    count = db.query(models.MillDispatch).count() + 1
    return f"DSP{count:05d}"


def _dispatch_dict(d):
    """Convert dispatch ORM object to dict with joined names."""
    out = d.__dict__.copy()
    out.pop("_sa_instance_state", None)
    out["farmer_name"] = d.farmer.name if d.farmer else None
    out["farmer_mobile"] = d.farmer.mobile if d.farmer else None
    out["mill_name"] = d.mill.name if d.mill else None
    out["variety_name"] = (
        d.farmer.produce_variety.name_en
        if d.farmer and d.farmer.produce_variety
        else None
    )
    return out


@router.get("")
def list_dispatches(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    dispatches = (
        db.query(models.MillDispatch)
        .order_by(models.MillDispatch.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_dispatch_dict(d) for d in dispatches]


@router.get("/{dispatch_id}")
def get_dispatch(dispatch_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    d = db.query(models.MillDispatch).get(dispatch_id)
    if not d:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    return _dispatch_dict(d)


@router.post("")
def create_dispatch(payload: schemas.MillDispatchCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    # Validate farmer
    farmer = db.query(models.Farmer).get(payload.farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Validate mill
    mill = db.query(models.Mill).get(payload.mill_id)
    if not mill:
        raise HTTPException(status_code=404, detail="Mill not found")

    # Validate dispatch bags
    if payload.dispatch_bags <= 0:
        raise HTTPException(status_code=400, detail="Dispatch bags must be > 0")
    if payload.dispatch_bags > (farmer.no_of_bags or 0):
        raise HTTPException(
            status_code=400,
            detail=f"Dispatch bags ({payload.dispatch_bags}) exceeds available bags ({farmer.no_of_bags or 0})"
        )

    # Validate vehicle details
    if payload.vehicle_type == "lorry" and not payload.vehicle_number:
        raise HTTPException(status_code=400, detail="Vehicle number required for lorry")
    if payload.vehicle_type == "tractor":
        if not payload.engine_number:
            raise HTTPException(status_code=400, detail="Engine number required for tractor")
        if not payload.trailer_number:
            raise HTTPException(status_code=400, detail="Trailer number required for tractor")

    # Create dispatch
    dispatch = models.MillDispatch(
        dispatch_bill_no=generate_bill_no(db),
        farmer_id=payload.farmer_id,
        mill_id=payload.mill_id,
        dispatch_bags=payload.dispatch_bags,
        dispatch_weight=payload.dispatch_weight,
        cost=payload.cost,
        mc_reading=payload.mc_reading,
        vehicle_weight=payload.vehicle_weight,
        vehicle_type=payload.vehicle_type,
        vehicle_number=payload.vehicle_number,
        engine_number=payload.engine_number,
        trailer_number=payload.trailer_number,
        driver_name=payload.driver_name,
        signature_role=payload.signature_role,
        dispatch_datetime=payload.dispatch_datetime or datetime.utcnow(),
        created_at=datetime.utcnow(),
    )
    db.add(dispatch)

    # Deduct from farmer stock
    farmer.no_of_bags = max(0, (farmer.no_of_bags or 0) - payload.dispatch_bags)
    if payload.dispatch_weight > 0:
        farmer.total_weight = max(0, (farmer.total_weight or 0) - payload.dispatch_weight)

    db.commit()
    db.refresh(dispatch)
    return _dispatch_dict(dispatch)


@router.patch("/{dispatch_id}")
def update_dispatch(
    dispatch_id: int, 
    payload: schemas.MillDispatchUpdate, 
    db: Session = Depends(get_db), 
    _=Depends(get_current_user)
):
    dispatch = db.query(models.MillDispatch).get(dispatch_id)
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")

    if payload.mill_mc is not None:
        dispatch.mill_mc = payload.mill_mc
    if payload.mill_weight is not None:
        dispatch.mill_weight = payload.mill_weight
    if payload.mill_cost is not None:
        dispatch.mill_cost = payload.mill_cost
    if payload.is_unloaded is not None:
        dispatch.is_unloaded = payload.is_unloaded

    db.commit()
    db.refresh(dispatch)
    return _dispatch_dict(dispatch)
