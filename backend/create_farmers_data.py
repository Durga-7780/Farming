import json
import random
from datetime import datetime, timedelta

# Seed for reproducible generation
random.seed(42)

first_names = [
    "Venkateswara", "Satyanarayana", "Koteswara", "Nageswara", "Sambasiva", 
    "Venkata", "Subba", "Tirupathi", "Chandrasekhar", "Jagadeeshwara", 
    "Hanumantha", "Suresh", "Prasad", "Murali", "Bhaskar", 
    "Pattabhi", "Srinivas", "Rama", "Anjaneyulu", "Mallikarjuna", 
    "Chenna", "Raghava", "Narayana", "Krishna", "Veerabhadra", 
    "Ramesh", "Suresh", "Naresh", "Rajesh", "Mahesh", 
    "Lokesh", "Prakash", "Mohan", "Vijay", "Kalyan", 
    "Harish", "Gopi", "Kishore", "Venu", "Gopal", 
    "Ashok", "Anand", "Tarun", "Pawan", "Phani", 
    "Santosh", "Sundar", "Dinesh", "Sudhakar", "Prabhakar", 
    "Madhusudhan", "Sudheer", "Nagendra", "Ravindra", "Surendra", 
    "Upendra", "Jitendra", "Ramachandra", "Purushottam", "Parandhama", 
    "Sitarama", "Lakshmana", "Bharata", "Shatrughna", "Subramanyam",
    "Bhanu", "Chaitanya", "Dharmendra", "Girish", "Hemant",
    "Jagan", "Kiran", "Madhav", "Narendra", "Pradeep"
]

surnames = [
    "Rao", "Reddy", "Varma", "Murthy", "Raju", 
    "Naidu", "Chowdary", "Sharma", "Gupta", "Prasad", 
    "Swamy", "Koundinya", "Kumar", "Babu", "Chari"
]

locations = [
    {"district": "Guntur", "mandal": "Tenali Mandal", "village": "Angalakuduru", "place": "Tenali Yard 1"},
    {"district": "Guntur", "mandal": "Tenali Mandal", "village": "Kuchipudi", "place": "Tenali Yard 2"},
    {"district": "Guntur", "mandal": "Repalle Mandal", "village": "Bhattiprolu", "place": "Repalle Center"},
    {"district": "Guntur", "mandal": "Bapatla Mandal", "village": "Karlapalem", "place": "Bapatla Yard"},
    {"district": "Guntur", "mandal": "Chilakaluripet Mandal", "village": "Ganapavaram", "place": "Chilakaluripet Hub"},
    {"district": "Krishna", "mandal": "Pamarru Mandal", "village": "Nidumolu", "place": "Pamarru Main Yard"},
    {"district": "Krishna", "mandal": "Gudivada Mandal", "village": "Pedana", "place": "Gudivada Collection Pt"},
    {"district": "Krishna", "mandal": "Vuyyuru Mandal", "village": "Mantada", "place": "Vuyyuru Yard"},
    {"district": "Krishna", "mandal": "Machilipatnam Mandal", "village": "Challapalli", "place": "Bandar Market Yard"},
    {"district": "West Godavari", "mandal": "Tadepalligudem Mandal", "village": "Pentapadu", "place": "Tadepalligudem Yard 1"},
    {"district": "West Godavari", "mandal": "Tadepalligudem Mandal", "village": "Pippara", "place": "Tadepalligudem Yard 2"},
    {"district": "West Godavari", "mandal": "Tanuku Mandal", "village": "Relangi", "place": "Tanuku Market Yard"},
    {"district": "West Godavari", "mandal": "Bhimavaram Mandal", "village": "Undi", "place": "Bhimavaram Collection Pt"},
    {"district": "East Godavari", "mandal": "Ravulapalem Mandal", "village": "Jonnada", "place": "Ravulapalem Yard"},
    {"district": "East Godavari", "mandal": "Mandapeta Mandal", "village": "Alamuru", "place": "Mandapeta Hub"},
    {"district": "East Godavari", "mandal": "Amalapuram Mandal", "village": "Ryali", "place": "Amalapuram Center"},
    {"district": "Nalgonda", "mandal": "Miryalaguda Mandal", "village": "Tripuraram", "place": "Miryalaguda Yard 1"},
    {"district": "Nalgonda", "mandal": "Miryalaguda Mandal", "village": "Vemulapally", "place": "Miryalaguda Yard 2"},
    {"district": "Suryapet", "mandal": "Huzurnagar Mandal", "village": "Kodad", "place": "Huzurnagar Center"},
    {"district": "Suryapet", "mandal": "Suryapet Mandal", "village": "Chivvemla", "place": "Suryapet Yard"},
    {"district": "Karimnagar", "mandal": "Jagtial Mandal", "village": "Korutla", "place": "Jagtial Collection Pt"},
    {"district": "Karimnagar", "mandal": "Metpally Mandal", "village": "Mallial", "place": "Metpally Yard"},
    {"district": "Nizamabad", "mandal": "Armoor Mandal", "village": "Anksapur", "place": "Armoor Market Yard"},
    {"district": "Nizamabad", "mandal": "Kamareddy Mandal", "village": "Sirikonda", "place": "Kamareddy Center"},
    {"district": "Kurnool", "mandal": "Nandyal Mandal", "village": "Rudravaram", "place": "Nandyal Yard 1"},
    {"district": "Kurnool", "mandal": "Dhone Mandal", "village": "Veldurthi", "place": "Dhone Center"}
]

banks = [
    {"name": "State Bank of India", "ifsc": "SBIN0001423"},
    {"name": "State Bank of India", "ifsc": "SBIN0002105"},
    {"name": "Union Bank of India", "ifsc": "UBIN0534120"},
    {"name": "Union Bank of India", "ifsc": "UBIN0538910"},
    {"name": "HDFC Bank", "ifsc": "HDFC0000842"},
    {"name": "ICICI Bank", "ifsc": "ICIC0000412"},
    {"name": "Canara Bank", "ifsc": "CNRB0002145"},
    {"name": "Andhra Pragathi Grameena Bank", "ifsc": "APGB0003012"},
    {"name": "Telangana Grameena Bank", "ifsc": "TGBR0001045"},
    {"name": "Indian Bank", "ifsc": "IDIB000M012"}
]

varieties = [
    "Paddy - Common",
    "Paddy - Fine",
    "Paddy - BPT 5204",
    "Paddy - MTU 1010",
    "Maize",
    "Cotton",
    "Chilli",
    "Black Gram",
    "Groundnut"
]

farmers_data = []

base_date = datetime(2026, 2, 1)

used_names = set()

for i in range(1, 201):
    code = f"FRM{i:05d}"
    
    # Generate unique name
    fn = random.choice(first_names)
    sn = random.choice(surnames)
    name = f"{fn} {sn}"
    counter = 1
    while name in used_names:
        name = f"{fn} {sn} ({counter})"
        counter += 1
    used_names.add(name)
    
    # Generate Aadhaar
    p1 = random.randint(2000, 9999)
    p2 = random.randint(1000, 9999)
    p3 = random.randint(1000, 9999)
    aadhar = f"{p1} {p2} {p3}"
    
    # Generate Mobiles
    m_prefix = random.choice(["9848", "9440", "9866", "9949", "9989", "8008", "7032", "9177", "9490", "8978"])
    m_suffix = f"{random.randint(100000, 999999)}"
    mobile = f"{m_prefix}{m_suffix}"
    
    alt_prefix = random.choice(["9440", "9848", "8897", "9618", "7702", "9100"])
    alt_suffix = f"{random.randint(100000, 999999)}"
    alt_mobile = f"{alt_prefix}{alt_suffix}"
    
    loc = random.choice(locations)
    bank = random.choice(banks)
    acct_num = f"{random.randint(10000000000, 999999999999)}"
    
    variety_name = random.choice(varieties)
    no_of_bags = random.randint(40, 550)
    total_weight = round(no_of_bags * random.uniform(0.70, 0.78), 2)  # quintals
    mc_reading = round(random.uniform(13.0, 18.2), 1)
    
    if "Paddy" in variety_name:
        rate = round(random.uniform(2150, 2480), 2)
    elif variety_name == "Maize":
        rate = round(random.uniform(1850, 2200), 2)
    elif variety_name == "Cotton":
        rate = round(random.uniform(6200, 7100), 2)
    elif variety_name == "Chilli":
        rate = round(random.uniform(14000, 18500), 2)
    elif variety_name == "Groundnut":
        rate = round(random.uniform(5800, 6600), 2)
    else:
        rate = round(random.uniform(4500, 5400), 2)
        
    cost = round(total_weight * rate, 2)
    photo_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer{i}"
    
    notes_options = [
        "A-Grade quality crop harvest. Inspected and approved for dispatch.",
        "Good moisture level, recommended for immediate processing.",
        "Slight moisture deviation recorded, standard drying applied.",
        "Premium grain quality, harvested during peak season.",
        "Clean produce with minimal foreign matter.",
        "Well-packaged bags delivered to collection center.",
        "High yield variety crop batch, excellent grain size."
    ]
    notes = random.choice(notes_options)
    
    created_at_dt = base_date + timedelta(days=random.randint(0, 175), hours=random.randint(8, 18))
    created_at_str = created_at_dt.isoformat()
    
    farmer_entry = {
        "id": i,
        "code": code,
        "name": name,
        "aadhar": aadhar,
        "mobile": mobile,
        "alt_mobile": alt_mobile,
        "village": loc["village"],
        "mandal": loc["mandal"],
        "district": loc["district"],
        "place": loc["place"],
        "bank_name": bank["name"],
        "bank_account": acct_num,
        "bank_ifsc": bank["ifsc"],
        "produce_variety_name": variety_name,
        "no_of_bags": no_of_bags,
        "total_weight": total_weight,
        "mc_reading": mc_reading,
        "cost": cost,
        "photo_url": photo_url,
        "notes": notes,
        "is_active": True,
        "created_at": created_at_str
    }
    farmers_data.append(farmer_entry)

# Write to JSON file
json_path = "farmers_200_data.json"
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(farmers_data, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {len(farmers_data)} farmers data into {json_path}")
