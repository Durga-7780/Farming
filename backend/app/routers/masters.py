from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["masters"])


# ---- Produce Varieties ----
@router.get("/produce-varieties", response_model=List[schemas.ProduceVarietyOut])
def list_varieties(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.ProduceVariety).order_by(models.ProduceVariety.display_order).all()


@router.post("/produce-varieties", response_model=schemas.ProduceVarietyOut)
def create_variety(payload: schemas.ProduceVarietyCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    variety = models.ProduceVariety(**payload.model_dump())
    db.add(variety)
    db.commit()
    db.refresh(variety)
    return variety


@router.delete("/produce-varieties/{variety_id}")
def deactivate_variety(variety_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    variety = db.query(models.ProduceVariety).get(variety_id)
    if not variety:
        raise HTTPException(status_code=404, detail="Not found")
    variety.is_active = False
    db.commit()
    return {"ok": True}


# ---- Vehicles ----
@router.get("/vehicles", response_model=List[schemas.VehicleOut])
def list_vehicles(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Vehicle).filter(models.Vehicle.is_active == True).all()


@router.post("/vehicles", response_model=schemas.VehicleOut)
def create_vehicle(payload: schemas.VehicleCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    vehicle = models.Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


# ---- Drivers ----
@router.get("/drivers", response_model=List[schemas.DriverOut])
def list_drivers(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Driver).filter(models.Driver.is_active == True).all()


@router.post("/drivers", response_model=schemas.DriverOut)
def create_driver(payload: schemas.DriverCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    driver = models.Driver(**payload.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver
