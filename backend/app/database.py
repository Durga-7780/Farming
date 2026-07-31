import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Force consistent SQLite database path so seeding and API endpoints share the exact same DB
db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agroledger.db")
DATABASE_URL = os.getenv("DATABASE_URL") or f"sqlite:///{db_path}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
