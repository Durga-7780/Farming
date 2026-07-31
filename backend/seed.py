"""
Run once after the backend has started (tables created):
    python seed.py

Creates an admin login and a few produce varieties to get started.
"""
from app.database import SessionLocal
from app import models
from app.auth import hash_password

db = SessionLocal()

if not db.query(models.User).filter(models.User.email == "admin@agroledger.local").first():
    admin = models.User(
        name="Admin",
        email="admin@agroledger.local",
        hashed_password=hash_password("Admin@123"),
        role=models.UserRole.admin,
    )
    db.add(admin)
    print("Created admin user -> email: admin@agroledger.local  password: Admin@123")
else:
    print("Admin user already exists")

varieties = [
    {"name_en": "Paddy - Common", "name_te": "వరి - సాధారణ", "category": "Paddy", "unit": "Quintal", "display_order": 1},
    {"name_en": "Paddy - Fine", "name_te": "వరి - ఫైన్", "category": "Paddy", "unit": "Quintal", "display_order": 2},
    {"name_en": "Maize", "name_te": "మొక్కజొన్న", "category": "Grain", "unit": "Quintal", "display_order": 3},
]
for v in varieties:
    if not db.query(models.ProduceVariety).filter(models.ProduceVariety.name_en == v["name_en"]).first():
        db.add(models.ProduceVariety(**v))

db.commit()
db.close()
print("Seed complete.")
