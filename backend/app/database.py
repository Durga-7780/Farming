import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agroledger.db")
DATABASE_URL = os.getenv("DATABASE_URL") or f"sqlite:///{db_path}"

# Pass check_same_thread ONLY if using SQLite, preventing TypeError on MySQL/PostgreSQL in production
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
