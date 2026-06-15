-- Customer Retention & Operations Intelligence Platform
-- Analytical warehouse schema for portfolio/demo deployment.

CREATE TABLE dim_customer (
  customer_id VARCHAR(20) PRIMARY KEY,
  segment VARCHAR(40) NOT NULL,
  region VARCHAR(40) NOT NULL,
  age INT NOT NULL,
  tenure_months INT NOT NULL,
  account_type VARCHAR(40) NOT NULL,
  monthly_spend DECIMAL(10, 2) NOT NULL,
  usage_index DECIMAL(5, 2) NOT NULL,
  complaints_last_90d INT NOT NULL,
  support_tickets INT NOT NULL,
  avg_resolution_hours DECIMAL(6, 2) NOT NULL,
  csat DECIMAL(5, 2) NOT NULL,
  nps INT NOT NULL,
  campaign_engaged VARCHAR(3) NOT NULL,
  churn_probability DECIMAL(5, 2) NOT NULL,
  risk_band VARCHAR(20) NOT NULL,
  clv DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL
);

CREATE TABLE fact_monthly_retention (
  month_key CHAR(7) PRIMARY KEY,
  retention_rate DECIMAL(5, 2) NOT NULL,
  churn_rate DECIMAL(5, 2) NOT NULL,
  csat DECIMAL(5, 2) NOT NULL,
  nps INT NOT NULL,
  tickets INT NOT NULL,
  sla_compliance DECIMAL(5, 2) NOT NULL,
  aht DECIMAL(5, 2) NOT NULL,
  revenue_retained DECIMAL(14, 2) NOT NULL,
  campaign_conversion DECIMAL(5, 2) NOT NULL
);

CREATE TABLE fact_service_ticket (
  ticket_id VARCHAR(24) PRIMARY KEY,
  customer_id VARCHAR(20) NOT NULL REFERENCES dim_customer(customer_id),
  opened_month CHAR(7) NOT NULL,
  category VARCHAR(60) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  resolution_hours DECIMAL(6, 2) NOT NULL,
  sla_target_hours DECIMAL(6, 2) NOT NULL,
  sla_met VARCHAR(3) NOT NULL,
  escalated VARCHAR(3) NOT NULL,
  csat DECIMAL(5, 2) NOT NULL
);

CREATE TABLE fact_campaign_performance (
  campaign_id VARCHAR(16) PRIMARY KEY,
  campaign_name VARCHAR(80) NOT NULL,
  channel VARCHAR(40) NOT NULL,
  target_segment VARCHAR(40) NOT NULL,
  participants INT NOT NULL,
  open_rate DECIMAL(5, 2) NOT NULL,
  click_rate DECIMAL(5, 2) NOT NULL,
  acceptance_rate DECIMAL(5, 2) NOT NULL,
  retained_customers INT NOT NULL,
  revenue_saved DECIMAL(14, 2) NOT NULL
);

CREATE INDEX idx_customer_risk_band ON dim_customer(risk_band);
CREATE INDEX idx_customer_segment ON dim_customer(segment);
CREATE INDEX idx_ticket_customer ON fact_service_ticket(customer_id);
CREATE INDEX idx_ticket_month ON fact_service_ticket(opened_month);
