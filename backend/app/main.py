import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import Base, engine
from . import models
from .routers import auth, farmers, mills, masters, purchases, sales, payments, expenses, stock, dashboard, ai, dispatch

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AgroLedger API", version="1.0.0")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=".*" if not origins else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(mills.router)
app.include_router(masters.router)
app.include_router(purchases.router)
app.include_router(sales.router)
app.include_router(payments.router)
app.include_router(expenses.router)
app.include_router(stock.router)
app.include_router(dashboard.router)
app.include_router(ai.router)
app.include_router(dispatch.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "AgroLedger API"}
