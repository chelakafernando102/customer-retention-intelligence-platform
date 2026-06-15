-- Executive KPI scorecard
SELECT
  month_key,
  retention_rate,
  churn_rate,
  csat,
  nps,
  sla_compliance,
  revenue_retained
FROM fact_monthly_retention
ORDER BY month_key DESC
LIMIT 1;

-- Customers requiring immediate retention intervention
SELECT
  customer_id,
  segment,
  region,
  account_type,
  churn_probability,
  clv,
  complaints_last_90d,
  avg_resolution_hours,
  csat
FROM dim_customer
WHERE risk_band = 'High'
ORDER BY churn_probability DESC, clv DESC
LIMIT 25;

-- Segment-level revenue exposure and churn risk
SELECT
  segment,
  COUNT(*) AS customers,
  AVG(churn_probability) AS avg_churn_probability,
  SUM(CASE WHEN risk_band <> 'Low' THEN clv ELSE 0 END) AS revenue_exposure,
  AVG(csat) AS avg_csat,
  AVG(usage_index) AS avg_usage_index
FROM dim_customer
GROUP BY segment
ORDER BY revenue_exposure DESC;

-- Service performance by complaint category
SELECT
  category,
  COUNT(*) AS tickets,
  AVG(resolution_hours) AS avg_resolution_hours,
  AVG(csat) AS avg_ticket_csat,
  SUM(CASE WHEN sla_met = 'Yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS sla_compliance,
  SUM(CASE WHEN escalated = 'Yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS escalation_rate
FROM fact_service_ticket
GROUP BY category
ORDER BY tickets DESC;

-- Campaign effectiveness and revenue protection
SELECT
  campaign_name,
  channel,
  target_segment,
  participants,
  acceptance_rate,
  retained_customers,
  revenue_saved,
  revenue_saved / NULLIF(participants, 0) AS revenue_saved_per_participant
FROM fact_campaign_performance
ORDER BY revenue_saved DESC;

-- Churn drivers: service issues versus engagement
SELECT
  risk_band,
  COUNT(*) AS customers,
  AVG(complaints_last_90d) AS avg_complaints_last_90d,
  AVG(avg_resolution_hours) AS avg_resolution_hours,
  AVG(csat) AS avg_csat,
  AVG(usage_index) AS avg_usage_index,
  AVG(churn_probability) AS avg_churn_probability
FROM dim_customer
GROUP BY risk_band
ORDER BY avg_churn_probability DESC;
