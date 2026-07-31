import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from .database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    staff = "staff"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.staff)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Farmer(Base):
    __tablename__ = "farmers"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(30), unique=True, index=True)
    name = Column(String(150), nullable=False)
    aadhar = Column(String(20))
    mobile = Column(String(20))
    alt_mobile = Column(String(20))
    produce_variety_id = Column(Integer, ForeignKey("produce_varieties.id"), nullable=True)
    no_of_bags = Column(Integer, default=0)
    total_weight = Column(Float, default=0)
    mc_reading = Column(Float, default=0)
    cost = Column(Float, default=0)
    place = Column(String(150))
    village = Column(String(120))
    mandal = Column(String(120))
    district = Column(String(120))
    bank_account = Column(String(50))
    bank_ifsc = Column(String(20))
    bank_name = Column(String(120))
    photo_url = Column(String(255))
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    produce_variety = relationship("ProduceVariety")
    purchases = relationship("Purchase", back_populates="farmer")
    payments = relationship("FarmerPayment", back_populates="farmer")


class Mill(Base):
    __tablename__ = "mills"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(30), unique=True, index=True)
    name = Column(String(150), nullable=False)
    contact_person = Column(String(120))
    mobile = Column(String(20))
    gst_number = Column(String(30))
    address = Column(String(255))
    bank_account = Column(String(50))
    bank_ifsc = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sales = relationship("Sale", back_populates="mill")
    payments = relationship("MillPayment", back_populates="mill")


class ProduceVariety(Base):
    __tablename__ = "produce_varieties"
    id = Column(Integer, primary_key=True, index=True)
    name_en = Column(String(120), nullable=False)
    name_te = Column(String(120))
    category = Column(String(80))
    unit = Column(String(20), default="Quintal")
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)


class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    number_plate = Column(String(30), unique=True)
    owner_name = Column(String(120))
    is_active = Column(Boolean, default=True)


class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120))
    mobile = Column(String(20))
    license_number = Column(String(40))
    is_active = Column(Boolean, default=True)


class PurchaseStatus(str, enum.Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"


class Purchase(Base):
    __tablename__ = "purchases"
    id = Column(Integer, primary_key=True, index=True)
    purchase_no = Column(String(40), unique=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    produce_variety_id = Column(Integer, ForeignKey("produce_varieties.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    quantity = Column(Float, default=0)
    weight_kg = Column(Float, default=0)
    rate_per_unit = Column(Float, default=0)
    quality_grade = Column(String(30))
    commission_amount = Column(Float, default=0)
    additional_charges = Column(Float, default=0)
    discount = Column(Float, default=0)
    gross_amount = Column(Float, default=0)
    net_payable = Column(Float, default=0)
    status = Column(Enum(PurchaseStatus), default=PurchaseStatus.pending)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="purchases")
    produce_variety = relationship("ProduceVariety")
    vehicle = relationship("Vehicle")
    driver = relationship("Driver")


class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    sale_no = Column(String(40), unique=True, index=True)
    mill_id = Column(Integer, ForeignKey("mills.id"))
    produce_variety_id = Column(Integer, ForeignKey("produce_varieties.id"))
    quantity = Column(Float, default=0)
    rate_per_unit = Column(Float, default=0)
    total_amount = Column(Float, default=0)
    invoice_number = Column(String(60))
    vehicle_number = Column(String(30))
    sale_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    mill = relationship("Mill", back_populates="sales")
    produce_variety = relationship("ProduceVariety")


class FarmerPayment(Base):
    __tablename__ = "farmer_payments"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=True)
    amount = Column(Float, default=0)
    payment_type = Column(String(20), default="partial")  # advance, partial, full
    payment_mode = Column(String(20), default="cash")  # cash, bank, upi
    reference_no = Column(String(60))
    payment_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="payments")


class MillPayment(Base):
    __tablename__ = "mill_payments"
    id = Column(Integer, primary_key=True, index=True)
    mill_id = Column(Integer, ForeignKey("mills.id"))
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=True)
    amount = Column(Float, default=0)
    payment_mode = Column(String(20), default="bank")
    reference_no = Column(String(60))
    payment_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    mill = relationship("Mill", back_populates="payments")


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(60))  # transport, labour, fuel, office, misc
    amount = Column(Float, default=0)
    description = Column(String(255))
    expense_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(50))
    entity = Column(String(50))
    entity_id = Column(Integer, nullable=True)
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class MillDispatch(Base):
    __tablename__ = "mill_dispatches"
    id = Column(Integer, primary_key=True, index=True)
    dispatch_bill_no = Column(String(40), unique=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    mill_id = Column(Integer, ForeignKey("mills.id"), nullable=False)
    dispatch_bags = Column(Integer, default=0)
    dispatch_weight = Column(Float, default=0)
    cost = Column(Float, default=0)
    mc_reading = Column(Float, default=0)
    vehicle_weight = Column(Float, default=0)
    vehicle_type = Column(String(20))  # lorry, tractor
    vehicle_number = Column(String(30))
    engine_number = Column(String(30))
    trailer_number = Column(String(30))
    driver_name = Column(String(120))
    signature_role = Column(String(30))  # Manager, Supervisor, Owner
    dispatch_datetime = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    mill_mc = Column(Float, default=0)
    mill_weight = Column(Float, default=0)
    mill_cost = Column(Float, default=0)
    is_unloaded = Column(Boolean, default=False)

    farmer = relationship("Farmer")
    mill = relationship("Mill")
