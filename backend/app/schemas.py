from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "staff"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    role: str
    is_active: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Farmer ----------
class FarmerBase(BaseModel):
    name: str
    aadhar: Optional[str] = None
    mobile: Optional[str] = None
    alt_mobile: Optional[str] = None
    produce_variety_id: Optional[int] = None
    no_of_bags: Optional[int] = 0
    total_weight: Optional[float] = 0
    mc_reading: Optional[float] = 0
    cost: Optional[float] = 0
    place: Optional[str] = None
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    bank_account: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_name: Optional[str] = None
    notes: Optional[str] = None


class FarmerCreate(FarmerBase):
    pass


class FarmerUpdate(FarmerBase):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class FarmerOut(FarmerBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: Optional[str]
    produce_variety_name: Optional[str] = None
    is_active: bool
    created_at: datetime


# ---------- Mill ----------
class MillBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    mobile: Optional[str] = None
    gst_number: Optional[str] = None
    address: Optional[str] = None
    bank_account: Optional[str] = None
    bank_ifsc: Optional[str] = None


class MillCreate(MillBase):
    pass


class MillUpdate(MillBase):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class MillOut(MillBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: Optional[str]
    is_active: bool
    created_at: datetime


# ---------- Produce Variety ----------
class ProduceVarietyBase(BaseModel):
    name_en: str
    name_te: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = "Quintal"
    display_order: Optional[int] = 0


class ProduceVarietyCreate(ProduceVarietyBase):
    pass


class ProduceVarietyOut(ProduceVarietyBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool


# ---------- Vehicle / Driver ----------
class VehicleCreate(BaseModel):
    number_plate: str
    owner_name: Optional[str] = None


class VehicleOut(VehicleCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool


class DriverCreate(BaseModel):
    name: str
    mobile: Optional[str] = None
    license_number: Optional[str] = None


class DriverOut(DriverCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool


# ---------- Purchase ----------
class PurchaseBase(BaseModel):
    farmer_id: int
    produce_variety_id: int
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    quantity: float = 0
    weight_kg: float = 0
    rate_per_unit: float = 0
    quality_grade: Optional[str] = None
    commission_amount: float = 0
    additional_charges: float = 0
    discount: float = 0
    notes: Optional[str] = None


class PurchaseCreate(PurchaseBase):
    pass


class PurchaseUpdate(BaseModel):
    quantity: Optional[float] = None
    weight_kg: Optional[float] = None
    rate_per_unit: Optional[float] = None
    quality_grade: Optional[str] = None
    commission_amount: Optional[float] = None
    additional_charges: Optional[float] = None
    discount: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class PurchaseOut(PurchaseBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    purchase_no: str
    gross_amount: float
    net_payable: float
    status: str
    purchase_date: datetime
    farmer_name: Optional[str] = None
    produce_variety_name: Optional[str] = None


# ---------- Sale ----------
class SaleBase(BaseModel):
    mill_id: int
    produce_variety_id: int
    quantity: float = 0
    rate_per_unit: float = 0
    invoice_number: Optional[str] = None
    vehicle_number: Optional[str] = None
    notes: Optional[str] = None


class SaleCreate(SaleBase):
    pass


class SaleOut(SaleBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    sale_no: str
    total_amount: float
    sale_date: datetime
    mill_name: Optional[str] = None
    produce_variety_name: Optional[str] = None


# ---------- Payments ----------
class FarmerPaymentCreate(BaseModel):
    farmer_id: int
    purchase_id: Optional[int] = None
    amount: float
    payment_type: Optional[str] = 'partial'
    payment_mode: Optional[str] = 'cash'
    reference_no: Optional[str] = None
    notes: Optional[str] = None


class FarmerPaymentUpdate(BaseModel):
    amount: Optional[float] = None
    payment_type: Optional[str] = None
    payment_mode: Optional[str] = None
    reference_no: Optional[str] = None
    notes: Optional[str] = None


class FarmerPaymentOut(FarmerPaymentCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    payment_date: datetime
    farmer_name: Optional[str] = None


class MillPaymentCreate(BaseModel):
    mill_id: int
    sale_id: Optional[int] = None
    amount: float
    payment_mode: Optional[str] = 'cash'
    reference_no: Optional[str] = None
    notes: Optional[str] = None


class MillPaymentUpdate(BaseModel):
    amount: Optional[float] = None
    payment_mode: Optional[str] = None
    reference_no: Optional[str] = None
    notes: Optional[str] = None


class MillPaymentOut(MillPaymentCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    payment_date: datetime
    mill_name: Optional[str] = None


# ---------- Expense ----------
class ExpenseCreate(BaseModel):
    category: str
    amount: float
    description: Optional[str] = None


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None


class ExpenseOut(ExpenseCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    expense_date: datetime


# ---------- Dashboard / AI ----------
class DashboardSummary(BaseModel):
    todays_purchases: float
    todays_sales: float
    current_stock_qty: float
    pending_farmer_payments: float
    pending_mill_payments: float
    total_farmers: int
    total_mills: int
    month_purchase_total: float
    month_sales_total: float


class AIInsightRequest(BaseModel):
    question: Optional[str] = None


class AIInsightResponse(BaseModel):
    insight: str


# ---------- Mill Dispatch ----------
class MillDispatchCreate(BaseModel):
    farmer_id: int
    mill_id: int
    dispatch_bags: int
    dispatch_weight: float = 0
    cost: float = 0
    mc_reading: float = 0
    vehicle_weight: float = 0
    vehicle_type: str  # lorry, tractor
    vehicle_number: Optional[str] = None
    engine_number: Optional[str] = None
    trailer_number: Optional[str] = None
    driver_name: str
    signature_role: str
    dispatch_datetime: Optional[datetime] = None


class MillDispatchUpdate(BaseModel):
    mill_mc: Optional[float] = None
    mill_weight: Optional[float] = None
    mill_cost: Optional[float] = None
    is_unloaded: Optional[bool] = None


class MillDispatchOut(MillDispatchCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    dispatch_bill_no: str
    farmer_name: Optional[str] = None
    farmer_mobile: Optional[str] = None
    mill_name: Optional[str] = None
    variety_name: Optional[str] = None
    created_at: datetime
    mill_mc: Optional[float] = 0
    mill_weight: Optional[float] = 0
    mill_cost: Optional[float] = 0
    is_unloaded: Optional[bool] = False
