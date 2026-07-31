-- AgroLedger MySQL schema
-- Generated from SQLAlchemy models (backend/app/models.py)
-- Run after init_db.sql (which creates the database + user)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS drivers (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	name VARCHAR(120), 
	mobile VARCHAR(20), 
	license_number VARCHAR(40), 
	is_active BOOL, 
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX ix_drivers_id ON drivers (id);

CREATE TABLE IF NOT EXISTS expenses (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	category VARCHAR(60), 
	amount FLOAT, 
	description VARCHAR(255), 
	expense_date DATETIME, 
	created_at DATETIME, 
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX ix_expenses_id ON expenses (id);

CREATE TABLE EXISTS farmers (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	code VARCHAR(30), 
	name VARCHAR(150) NOT NULL, 
	mobile VARCHAR(20), 
	alt_mobile VARCHAR(20), 
	village VARCHAR(120), 
	mandal VARCHAR(120), 
	district VARCHAR(120), 
	bank_account VARCHAR(50), 
	bank_ifsc VARCHAR(20), 
	bank_name VARCHAR(120), 
	photo_url VARCHAR(255), 
	notes TEXT, 
	is_active BOOL, 
	created_at DATETIME, 
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX ix_farmers_id ON farmers (id);
CREATE UNIQUE INDEX ix_farmers_code ON farmers (code);

CREATE TABLE mills (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	code VARCHAR(30), 
	name VARCHAR(150) NOT NULL, 
	contact_person VARCHAR(120), 
	mobile VARCHAR(20), 
	gst_number VARCHAR(30), 
	address VARCHAR(255), 
	bank_account VARCHAR(50), 
	bank_ifsc VARCHAR(20), 
	is_active BOOL, 
	created_at DATETIME, 
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX ix_mills_id ON mills (id);
CREATE UNIQUE INDEX ix_mills_code ON mills (code);

CREATE TABLE produce_varieties (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	name_en VARCHAR(120) NOT NULL, 
	name_te VARCHAR(120), 
	category VARCHAR(80), 
	unit VARCHAR(20), 
	is_active BOOL, 
	display_order INTEGER, 
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX ix_produce_varieties_id ON produce_varieties (id);

CREATE TABLE users (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	name VARCHAR(120) NOT NULL, 
	email VARCHAR(150) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	`role` ENUM('admin','manager','staff'), 
	is_active BOOL, 
	created_at DATETIME, 
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX ix_users_id ON users (id);
CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE TABLE vehicles (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	number_plate VARCHAR(30), 
	owner_name VARCHAR(120), 
	is_active BOOL, 
	PRIMARY KEY (id), 
	UNIQUE (number_plate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX ix_vehicles_id ON vehicles (id);

CREATE TABLE activity_logs (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	user_id INTEGER, 
	action VARCHAR(50), 
	entity VARCHAR(50), 
	entity_id INTEGER, 
	details TEXT, 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX ix_activity_logs_id ON activity_logs (id);

CREATE TABLE purchases (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	purchase_no VARCHAR(40), 
	farmer_id INTEGER, 
	produce_variety_id INTEGER, 
	vehicle_id INTEGER, 
	driver_id INTEGER, 
	quantity FLOAT, 
	weight_kg FLOAT, 
	rate_per_unit FLOAT, 
	quality_grade VARCHAR(30), 
	commission_amount FLOAT, 
	additional_charges FLOAT, 
	discount FLOAT, 
	gross_amount FLOAT, 
	net_payable FLOAT, 
	status ENUM('draft','pending','approved','rejected','cancelled'), 
	purchase_date DATETIME, 
	notes TEXT, 
	created_at DATETIME, 
	updated_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(farmer_id) REFERENCES farmers (id), 
	FOREIGN KEY(produce_variety_id) REFERENCES produce_varieties (id), 
	FOREIGN KEY(vehicle_id) REFERENCES vehicles (id), 
	FOREIGN KEY(driver_id) REFERENCES drivers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE UNIQUE INDEX ix_purchases_purchase_no ON purchases (purchase_no);
CREATE INDEX ix_purchases_id ON purchases (id);

CREATE TABLE mill_dispatches (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	dispatch_bill_no VARCHAR(40), 
	farmer_id INTEGER NOT NULL, 
	mill_id INTEGER NOT NULL, 
	dispatch_bags INTEGER, 
	dispatch_weight FLOAT, 
	cost FLOAT, 
	mc_reading FLOAT, 
	vehicle_weight FLOAT, 
	vehicle_type VARCHAR(20), 
	vehicle_number VARCHAR(30), 
	engine_number VARCHAR(30), 
	trailer_number VARCHAR(30), 
	driver_name VARCHAR(120), 
	signature_role VARCHAR(30), 
	dispatch_datetime DATETIME, 
	created_at DATETIME, 
	mill_mc FLOAT DEFAULT 0,
	mill_weight FLOAT DEFAULT 0,
	mill_cost FLOAT DEFAULT 0,
	is_unloaded BOOL DEFAULT 0,
	PRIMARY KEY (id), 
	FOREIGN KEY(farmer_id) REFERENCES farmers (id), 
	FOREIGN KEY(mill_id) REFERENCES mills (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sales (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	sale_no VARCHAR(40), 
	mill_id INTEGER, 
	produce_variety_id INTEGER, 
	quantity FLOAT, 
	rate_per_unit FLOAT, 
	total_amount FLOAT, 
	invoice_number VARCHAR(60), 
	vehicle_number VARCHAR(30), 
	sale_date DATETIME, 
	notes TEXT, 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(mill_id) REFERENCES mills (id), 
	FOREIGN KEY(produce_variety_id) REFERENCES produce_varieties (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX ix_sales_id ON sales (id);
CREATE UNIQUE INDEX ix_sales_sale_no ON sales (sale_no);

CREATE TABLE farmer_payments (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	farmer_id INTEGER, 
	purchase_id INTEGER, 
	amount FLOAT, 
	payment_type VARCHAR(20), 
	payment_mode VARCHAR(20), 
	reference_no VARCHAR(60), 
	payment_date DATETIME, 
	notes TEXT, 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(farmer_id) REFERENCES farmers (id), 
	FOREIGN KEY(purchase_id) REFERENCES purchases (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX ix_farmer_payments_id ON farmer_payments (id);

CREATE TABLE mill_payments (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	mill_id INTEGER, 
	sale_id INTEGER, 
	amount FLOAT, 
	payment_mode VARCHAR(20), 
	reference_no VARCHAR(60), 
	payment_date DATETIME, 
	notes TEXT, 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(mill_id) REFERENCES mills (id), 
	FOREIGN KEY(sale_id) REFERENCES sales (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX ix_mill_payments_id ON mill_payments (id);

SET FOREIGN_KEY_CHECKS = 1;
