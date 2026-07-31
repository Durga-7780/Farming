"""
Seed Script for AgroLedger - 200 Farmers & Full Operational Data

This script populates the database with:
- 200 Comprehensive Farmer records (read from farmers_200_data.json)
- Produce Varieties (Paddy Common, Fine, BPT 5204, MTU 1010, Maize, Cotton, Chilli, Black Gram, Groundnut)
- Mills (8 Rice & Agro Mills)
- Vehicles & Drivers
- Admin User (admin@agroledger.local / Admin@123)
- Full Operational Purchases, Dispatches, Sales, and Payments for all 200 farmers
"""

import json
import os
import random
from datetime import datetime, timedelta

from app.database import Base, engine, SessionLocal
from app import models
from app.auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("=========================================")
    print("      AgroLedger Database Seeder         ")
    print("=========================================")

    # 1. Seed Admin User
    admin = db.query(models.User).filter(models.User.email == "admin@agroledger.local").first()
    if not admin:
        admin = models.User(
            name="Admin",
            email="admin@agroledger.local",
            hashed_password=hash_password("Admin@123"),
            role=models.UserRole.admin,
        )
        db.add(admin)
        print(" [+] Admin user created: admin@agroledger.local / Admin@123")
    else:
        print(" [=] Admin user already exists")

    # 2. Seed Produce Varieties
    varieties_def = [
        {"name_en": "Paddy - Common", "name_te": "వరి - సాధారణ", "category": "Paddy", "unit": "Quintal", "display_order": 1},
        {"name_en": "Paddy - Fine", "name_te": "వరి - ఫైన్ (సొనా మసూరి)", "category": "Paddy", "unit": "Quintal", "display_order": 2},
        {"name_en": "Paddy - BPT 5204", "name_te": "వరి - బి.పి.టి 5204 (సాంబ మసూరి)", "category": "Paddy", "unit": "Quintal", "display_order": 3},
        {"name_en": "Paddy - MTU 1010", "name_te": "వరి - ఎంటియు 1010", "category": "Paddy", "unit": "Quintal", "display_order": 4},
        {"name_en": "Maize", "name_te": "మొక్కజొన్న", "category": "Grain", "unit": "Quintal", "display_order": 5},
        {"name_en": "Cotton", "name_te": "పత్తి", "category": "Commercial", "unit": "Quintal", "display_order": 6},
        {"name_en": "Chilli", "name_te": "మిర్చి", "category": "Spices", "unit": "Quintal", "display_order": 7},
        {"name_en": "Black Gram", "name_te": "మినుములు", "category": "Pulses", "unit": "Quintal", "display_order": 8},
        {"name_en": "Groundnut", "name_te": "వేరుశనగ", "category": "Oilseeds", "unit": "Quintal", "display_order": 9},
    ]

    variety_map = {}
    for v in varieties_def:
        existing = db.query(models.ProduceVariety).filter(models.ProduceVariety.name_en == v["name_en"]).first()
        if not existing:
            pv = models.ProduceVariety(**v)
            db.add(pv)
            db.flush()
            variety_map[v["name_en"]] = pv.id
        else:
            variety_map[v["name_en"]] = existing.id
    print(f" [+] {len(variety_map)} Produce varieties verified/created.")

    # 3. Seed Mills
    mills_def = [
        {"code": "MIL00001", "name": "Sri Lakshmi Venkateswara Rice Mill", "contact_person": "V. Koteswara Rao", "mobile": "9848011223", "address": "Tenali Road, Guntur, AP", "bank_name": "State Bank of India", "bank_account": "30489102931", "bank_ifsc": "SBIN0001423"},
        {"code": "MIL00002", "name": "Sri Vijaya Durga Rice & Oil Mill", "contact_person": "M. Satyanarayana", "mobile": "9440155667", "address": "Autonagar, Vijayawada, AP", "bank_name": "Union Bank of India", "bank_account": "0534101000912", "bank_ifsc": "UBIN0534120"},
        {"code": "MIL00003", "name": "Kakatiya Agro Industries", "contact_person": "P. Ramesh Reddy", "mobile": "9866033445", "address": "Warangal Highway, Jangaon, TS", "bank_name": "HDFC Bank", "bank_account": "501002391029", "bank_ifsc": "HDFC0000842"},
        {"code": "MIL00004", "name": "Sri Rama Agro Industries", "contact_person": "Ch. Venkat", "mobile": "9949077889", "address": "Industrial Estate, Miryalaguda, TS", "bank_name": "State Bank of India", "bank_account": "38910293810", "bank_ifsc": "SBIN0002105"},
        {"code": "MIL00005", "name": "Sri Krishna Modern Rice Mill", "contact_person": "G. Murali Krishna", "mobile": "9989022334", "address": "Bypass Road, Eluru, AP", "bank_name": "ICICI Bank", "bank_account": "041201509123", "bank_ifsc": "ICIC0000412"},
        {"code": "MIL00006", "name": "Royal Agro Processing Unit", "contact_person": "K. Srinivas", "mobile": "8008066778", "address": "Port Road, Kakinada, AP", "bank_name": "Canara Bank", "bank_account": "214510109842", "bank_ifsc": "CNRB0002145"},
        {"code": "MIL00007", "name": "Annapurna Rice Mill", "contact_person": "B. Naresh", "mobile": "7032044556", "address": "Armoor Road, Nizamabad, TS", "bank_name": "Telangana Grameena Bank", "bank_account": "65891234091", "bank_ifsc": "TGBR0001045"},
        {"code": "MIL00008", "name": "Balaji Modern Rice Mill", "contact_person": "S. Prasad Raju", "mobile": "9177088990", "address": "Nandyal Highway, Kurnool, AP", "bank_name": "Andhra Pragathi Grameena Bank", "bank_account": "301210108912", "bank_ifsc": "APGB0003012"},
    ]

    mill_ids = []
    for m in mills_def:
        existing = db.query(models.Mill).filter(models.Mill.code == m["code"]).first()
        if not existing:
            mill_obj = models.Mill(**m)
            db.add(mill_obj)
            db.flush()
            mill_ids.append(mill_obj.id)
        else:
            mill_ids.append(existing.id)
    print(f" [+] {len(mill_ids)} Mills verified/created.")

    # 4. Seed Vehicles & Drivers
    vehicles_def = [
        {"number_plate": "AP 07 TH 4521", "owner_name": "S. Rambabu"},
        {"number_plate": "AP 16 TD 8892", "owner_name": "K. Venkat"},
        {"number_plate": "AP 39 TV 1204", "owner_name": "P. Nagesh"},
        {"number_plate": "TS 08 U 9934", "owner_name": "M. Raju"},
        {"number_plate": "TS 12 T 4410", "owner_name": "G. Suresh"},
        {"number_plate": "AP 26 TE 5632", "owner_name": "Ch. Prasad"},
    ]
    veh_ids = [db.query(models.Vehicle).filter(models.Vehicle.number_plate == v["number_plate"]).first() or db.add(models.Vehicle(**v)) or db.flush() or db.query(models.Vehicle).filter(models.Vehicle.number_plate == v["number_plate"]).first().id for v in vehicles_def]

    drivers_def = [
        {"name": "K. Nageswara Rao", "mobile": "9848123401", "license_number": "AP007202100912"},
        {"name": "M. Satish", "mobile": "9440123402", "license_number": "AP016202000814"},
        {"name": "P. Anji Reddy", "mobile": "9866123403", "license_number": "TS008201900412"},
        {"name": "S. Raju", "mobile": "9949123404", "license_number": "TS012202200109"},
    ]
    drv_ids = [db.query(models.Driver).filter(models.Driver.name == d["name"]).first() or db.add(models.Driver(**d)) or db.flush() or db.query(models.Driver).filter(models.Driver.name == d["name"]).first().id for d in drivers_def]

    # 5. Load & Seed 200 Farmers from JSON
    json_path = os.path.join(os.path.dirname(__file__), "farmers_200_data.json")
    with open(json_path, "r", encoding="utf-8") as f:
        farmers_list = json.load(f)

    now = datetime.utcnow()
    for idx, f_data in enumerate(farmers_list):
        var_id = variety_map.get(f_data.get("produce_variety_name")) or list(variety_map.values())[0]
        ex = db.query(models.Farmer).filter(models.Farmer.code == f_data["code"]).first()
        created_dt = now - timedelta(days=(200 - idx) // 7, hours=idx % 12)

        if not ex:
            farmer = models.Farmer(
                code=f_data["code"], name=f_data["name"], aadhar=f_data.get("aadhar"),
                mobile=f_data.get("mobile"), alt_mobile=f_data.get("alt_mobile"),
                produce_variety_id=var_id, no_of_bags=f_data.get("no_of_bags", 0),
                total_weight=f_data.get("total_weight", 0.0), mc_reading=f_data.get("mc_reading", 0.0),
                cost=f_data.get("cost", 0.0), place=f_data.get("place"), village=f_data.get("village"),
                mandal=f_data.get("mandal"), district=f_data.get("district"), bank_account=f_data.get("bank_account"),
                bank_ifsc=f_data.get("bank_ifsc"), bank_name=f_data.get("bank_name"), is_active=True, created_at=created_dt
            )
            db.add(farmer)
    db.commit()

    # 6. Seed Purchases, Dispatches, Sales, and Payments for ALL Farmers
    all_farmers = db.query(models.Farmer).all()

    for idx, farmer in enumerate(all_farmers):
        p_no = f"PUR-2026-{farmer.id:04d}"
        ex_pur = db.query(models.Purchase).filter(models.Purchase.purchase_no == p_no).first()
        p_date = farmer.created_at or (now - timedelta(days=idx % 30))

        if not ex_pur:
            q_qty = round(farmer.total_weight, 2)
            rate = round(farmer.cost / q_qty if q_qty > 0 else 2200.0, 2)
            gross = round(q_qty * rate, 2)
            net = round(gross * 0.98, 2)

            pur = models.Purchase(
                purchase_no=p_no, farmer_id=farmer.id, produce_variety_id=farmer.produce_variety_id,
                quantity=farmer.no_of_bags, weight_kg=round(q_qty * 100, 2), rate_per_unit=rate,
                gross_amount=gross, net_payable=net, status=models.PurchaseStatus.approved,
                purchase_date=p_date, created_at=p_date
            )
            db.add(pur)
            db.flush()

            # Farmer Payment
            paid = round(net * 0.7, 2)
            pmt = models.FarmerPayment(
                farmer_id=farmer.id, purchase_id=pur.id, amount=paid, payment_type="partial",
                payment_mode="bank", reference_no=f"REF-F-{farmer.id:04d}", payment_date=p_date + timedelta(days=1)
            )
            db.add(pmt)

            # Mill Dispatch
            d_bill = f"DISP-2026-{farmer.id:04d}"
            assigned_mill = mill_ids[idx % len(mill_ids)]
            disp = models.MillDispatch(
                dispatch_bill_no=d_bill, farmer_id=farmer.id, mill_id=assigned_mill,
                dispatch_bags=farmer.no_of_bags, dispatch_weight=farmer.total_weight, cost=farmer.cost,
                mc_reading=farmer.mc_reading, vehicle_type="lorry", vehicle_number="AP 07 TH 4521",
                driver_name="K. Nageswara Rao", signature_role="Manager", dispatch_datetime=p_date + timedelta(hours=3),
                is_unloaded=True
            )
            db.add(disp)

            # Mill Sale
            s_no = f"SALE-2026-{farmer.id:04d}"
            sale = models.Sale(
                sale_no=s_no, mill_id=assigned_mill, produce_variety_id=farmer.produce_variety_id,
                quantity=farmer.total_weight, rate_per_unit=round(rate * 1.12, 2),
                total_amount=round(farmer.cost * 1.12, 2), invoice_number=f"INV-2026-{farmer.id:04d}",
                sale_date=p_date + timedelta(days=2)
            )
            db.add(sale)

            # Mill Payment
            m_pmt = models.MillPayment(
                mill_id=assigned_mill, sale_id=sale.id, amount=round(sale.total_amount * 0.8, 2),
                payment_mode="bank", reference_no=f"REF-M-{farmer.id:04d}", payment_date=p_date + timedelta(days=3)
            )
            db.add(m_pmt)

    db.commit()
    db.close()
    print(" [+] Operational data fully seeded across all 200 farmers.")

if __name__ == "__main__":
    seed_database()
