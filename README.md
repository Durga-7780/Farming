# AgroLedger

A procurement ERP for a farmer → mill trading business (paddy/grain purchase from farmers, sale to mills). Responsive for desktop and mobile, installable as a PWA.

**Stack:** FastAPI (Python) · MySQL · React + Vite + Tailwind + Framer Motion · Groq AI

This is a working **core MVP**, not the entire 36-category feature list from the original spec. It covers the full purchase → stock → sale → payment loop end to end, plus an AI insights page, on a clean architecture you (or a developer) can extend module by module. See "What's included" below.

---

## 1. Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8+ (running locally or reachable over network)
- A free Groq API key from https://console.groq.com/keys (optional — only needed for the AI Insights page)

## 2. Database setup

```bash
mysql -u root -p < backend/init_db.sql
```

This creates the `agroledger` database and an `agroledger_user` MySQL user. **Edit the password in `init_db.sql` before running in anything but a local dev box.**

## 3. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: set DATABASE_URL, SECRET_KEY, and GROQ_API_KEY

uvicorn app.main:app --reload --port 8000
```

Tables are created automatically on first run. Then seed an admin login and starter produce varieties:

```bash
python seed.py
```

This creates: **admin@agroledger.local / Admin@123** — change this password after first login (there's no "change password" screen yet in this MVP; update it directly via `/api/auth/register` or a DB update for now).

API docs are auto-generated at `http://localhost:8000/docs`.

## 4. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your API isn't at http://localhost:8000

npm run dev
```

Visit `http://localhost:5173`. Log in with the seeded admin account.

For production:
```bash
npm run build
# serve the dist/ folder with any static host (nginx, Vercel, Netlify, etc.)
```

## 5. Mobile / desktop

The frontend is responsive (sidebar nav on desktop, bottom nav on mobile) and ships as a PWA — on a phone browser, use "Add to Home Screen" to install it like an app. Drop 192×192 and 512×512 PNG icons into `frontend/public/` and reference them in `vite.config.js`'s `manifest.icons` for a custom app icon.

---

## What's included

- **Auth:** JWT login, roles (admin/manager/staff), protected routes
- **Dashboard:** KPI cards, 14-day purchase/sales trend chart, top farmers
- **Farmers & Mills:** full CRUD, search, per-entity ledger (outstanding balance)
- **Produce varieties, vehicles, drivers:** master data
- **Purchases:** create/approve/cancel, auto amount calculation (gross, commission, charges, discount → net payable), auto numbering
- **Sales:** create, auto totals, auto numbering
- **Stock:** live balance per variety (approved purchases − sales)
- **Payments:** farmer payouts and mill collections, by mode (cash/bank/UPI)
- **Expenses:** categorized expense log
- **AI Insights:** a Groq-backed assistant that reads a live snapshot of your numbers (purchase/sale totals, outstanding amounts, top varieties, expenses) and answers plain-language questions about the business

## What's not included (from the original 36-category wishlist)

Notably absent, left for a follow-up build: two-factor auth, file/image uploads & document storage, receipt PDF generation & printing, Excel/CSV import-export, email/SMS/WhatsApp notifications, advanced analytics & drill-downs, multi-branch/multi-tenant SaaS mode, audit log UI (the `activity_logs` table exists but isn't populated yet), settlement module (partial-purchase reconciliation), and dark mode / Telugu language toggle.

The database schema and router structure were built so each of these can be added as its own module without restructuring what's here — e.g. a `reports.py` router for Excel export, or a `notifications.py` router wired to an email/SMS provider behind the existing feature-flag pattern.

## Project structure

```
agroledger/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router registration
│   │   ├── database.py      # SQLAlchemy engine/session
│   │   ├── models.py        # ORM models (all tables)
│   │   ├── schemas.py       # Pydantic request/response models
│   │   ├── auth.py          # JWT + password hashing
│   │   └── routers/         # one file per feature area
│   ├── requirements.txt
│   ├── init_db.sql          # MySQL database + user creation
│   ├── seed.py               # admin user + sample produce varieties
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/            # one file per screen
    │   ├── components/       # Layout, Modal, StatCard, form primitives
    │   ├── context/           # auth state
    │   └── api/               # axios client
    ├── package.json
    └── .env.example
```

## Extending it

- New entity: add a SQLAlchemy model in `models.py`, a Pydantic schema in `schemas.py`, a router in `routers/`, register it in `main.py`, then a page in `frontend/src/pages/` and a link in `Layout.jsx`'s `NAV_ITEMS`.
- The AI insights endpoint (`backend/app/routers/ai.py`) builds a JSON snapshot of the business and sends it to Groq — extend `build_business_snapshot()` to feed it more data (e.g. per-farmer trends) for richer answers.
