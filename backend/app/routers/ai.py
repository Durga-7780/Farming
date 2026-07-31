import os
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/ai", tags=["ai"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


def build_business_snapshot(db: Session) -> dict:
    today = datetime.utcnow().date()
    month_start = today.replace(day=1)
    week_start = today - timedelta(days=7)

    total_purchase_value = float(db.query(func.coalesce(func.sum(models.Purchase.net_payable), 0)).scalar())
    total_paid = float(db.query(func.coalesce(func.sum(models.FarmerPayment.amount), 0)).scalar())
    total_sale_value = float(db.query(func.coalesce(func.sum(models.Sale.total_amount), 0)).scalar())
    total_collected = float(db.query(func.coalesce(func.sum(models.MillPayment.amount), 0)).scalar())

    week_purchases = float(db.query(func.coalesce(func.sum(models.Purchase.net_payable), 0)).filter(
        models.Purchase.purchase_date >= week_start).scalar())
    week_sales = float(db.query(func.coalesce(func.sum(models.Sale.total_amount), 0)).filter(
        models.Sale.sale_date >= week_start).scalar())

    top_varieties = (
        db.query(models.ProduceVariety.name_en, func.sum(models.Purchase.quantity).label("qty"))
        .join(models.Purchase, models.Purchase.produce_variety_id == models.ProduceVariety.id)
        .group_by(models.ProduceVariety.id)
        .order_by(func.sum(models.Purchase.quantity).desc())
        .limit(5)
        .all()
    )

    expenses_by_category = (
        db.query(models.Expense.category, func.sum(models.Expense.amount))
        .group_by(models.Expense.category)
        .all()
    )

    return {
        "total_purchase_value": total_purchase_value,
        "outstanding_farmer_payments": total_purchase_value - total_paid,
        "total_sale_value": total_sale_value,
        "outstanding_mill_collections": total_sale_value - total_collected,
        "last_7_days_purchases": week_purchases,
        "last_7_days_sales": week_sales,
        "top_produce_varieties_by_quantity": [{"name": n, "qty": float(q)} for n, q in top_varieties],
        "expenses_by_category": [{"category": c, "amount": float(a)} for c, a in expenses_by_category],
        "farmer_count": db.query(models.Farmer).filter(models.Farmer.is_active == True).count(),
        "mill_count": db.query(models.Mill).filter(models.Mill.is_active == True).count(),
    }


@router.post("/insights", response_model=schemas.AIInsightResponse)
def get_insights(payload: schemas.AIInsightRequest, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is not configured on the server")

    import urllib.request
    import urllib.error

    snapshot = build_business_snapshot(db)

    system_prompt = (
        "You are an AI assistant for AgroLedger, an agri-commodity trading ERP. "
        "You have access to a JSON snapshot of the business's current numbers. "
        "Your role is to summarize data and explain app features. "
        "CRITICAL RULES: "
        "1. You cannot delete or update data. You only have read-only access for summaries. "
        "2. If asked about how to use features, provide clear, step-by-step explanations. "
        "3. Keep your responses small, short, and direct. "
        "4. Do not invent numbers not present in the data. Currency is INR. "
        "5. If asked about anything outside of this application's data or features, do not explain. Reply EXACTLY with: 'I don't have enough reliable information to answer that accurately. My primary purpose is to assist with the Rice Commission Management application. If your question is related to this system or its workflows, I'll be happy to help.'"
    )
    user_prompt = f"Business snapshot:\n{json.dumps(snapshot, indent=2)}\n\n"
    if payload.question:
        user_prompt += f"Specific question from the user: {payload.question}"
    else:
        user_prompt += "Give a general health summary based on the data."

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    data = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.4,
        "max_tokens": 500
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            insight = result["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise HTTPException(status_code=502, detail=f"Groq API error: {e.code} - {error_body}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {str(e)}")

    return {"insight": insight}
