-- =========================================================
-- 39PRODUCTION
-- BUSINESS PAYMENT FLOW
-- DP 50% -> FINAL 50% -> PROFIT -> REVENUE SHARING
-- =========================================================


-- =========================================================
-- ORDERS
-- =========================================================

ALTER TABLE orders
ADD COLUMN paid_amount INTEGER NOT NULL DEFAULT 0;

ALTER TABLE orders
ADD COLUMN final_paid_at TEXT;

ALTER TABLE orders
ADD COLUMN final_payment_due_at TEXT;

ALTER TABLE orders
ADD COLUMN business_project_id INTEGER;

ALTER TABLE orders
ADD COLUMN public_payment_token TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_business_project
ON orders(business_project_id);

CREATE INDEX IF NOT EXISTS idx_orders_public_payment_token
ON orders(public_payment_token);


-- =========================================================
-- PAYMENT TRANSACTIONS
-- =========================================================

ALTER TABLE payment_transactions
ADD COLUMN paid_amount INTEGER NOT NULL DEFAULT 0;

ALTER TABLE payment_transactions
ADD COLUMN payment_url TEXT;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order
ON payment_transactions(order_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_stage
ON payment_transactions(payment_stage);


-- =========================================================
-- BUSINESS PROJECTS
-- =========================================================

ALTER TABLE business_projects
ADD COLUMN order_id INTEGER;

ALTER TABLE business_projects
ADD COLUMN revenue INTEGER NOT NULL DEFAULT 0;

ALTER TABLE business_projects
ADD COLUMN project_cost INTEGER NOT NULL DEFAULT 0;

ALTER TABLE business_projects
ADD COLUMN net_profit INTEGER NOT NULL DEFAULT 0;

ALTER TABLE business_projects
ADD COLUMN completed_at TEXT;

CREATE INDEX IF NOT EXISTS idx_business_projects_order
ON business_projects(order_id);


-- =========================================================
-- PROJECT COSTS
-- Untuk biaya produksi / pembelian / repair
-- =========================================================

CREATE TABLE IF NOT EXISTS project_costs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    project_id INTEGER NOT NULL,

    description TEXT NOT NULL,

    category TEXT NOT NULL DEFAULT 'Operational',

    amount INTEGER NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'Completed',

    finance_transaction_id INTEGER,

    created_by INTEGER,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id)
        REFERENCES business_projects(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_costs_project
ON project_costs(project_id);


-- =========================================================
-- PAYMENT IDEMPOTENCY
-- Satu transaksi DANA tidak boleh diproses dua kali
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_payment_transactions_partner
ON payment_transactions(partner_reference_no);


-- =========================================================
-- INITIAL DATA REPAIR
-- Existing DP-paid orders
-- =========================================================

UPDATE orders
SET paid_amount = COALESCE(dp_amount, 0)
WHERE
    payment_status = 'DP_PAID'
    AND COALESCE(paid_amount, 0) = 0;


UPDATE orders
SET paid_amount = COALESCE(final_total, total_price, 0)
WHERE
    payment_status IN ('PAID_FULL', 'FULL_PAID')
    AND COALESCE(paid_amount, 0) = 0;