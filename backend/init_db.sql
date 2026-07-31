-- Run this once as MySQL root to create the database and app user.
-- mysql -u root -p < init_db.sql

CREATE DATABASE IF NOT EXISTS agroledger CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'agroledger_user'@'localhost' IDENTIFIED BY 'agroledger_pass';
GRANT ALL PRIVILEGES ON agroledger.* TO 'agroledger_user'@'localhost';
FLUSH PRIVILEGES;

-- Tables are auto-created by SQLAlchemy on first FastAPI startup (Base.metadata.create_all).
-- Change the password above before using this in production.
