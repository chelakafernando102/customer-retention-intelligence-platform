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

-- Recruiter-facing SQL example: segment-level churn risk
SELECT
    customer_segment,
    AVG(churn_probability) AS avg_churn_probability,
    COUNT(customer_id) AS customers
FROM customer_retention
GROUP BY customer_segment;

-- Recruiter-facing SQL example: revenue at risk by segment
SELECT
    customer_segment,
    SUM(customer_lifetime_value) AS revenue_at_risk
FROM customer_retention
WHERE churn_probability >= 70
GROUP BY customer_segment
ORDER BY revenue_at_risk DESC;

-- Recruiter-facing SQL example: complaint-based churn driver
SELECT
    CASE
        WHEN complaints_last_90d >= 3 THEN '3+ complaints'
        ELSE '0-2 complaints'
    END AS complaint_group,
    AVG(churn_probability) AS avg_churn_probability,
    COUNT(*) AS customers
FROM customer_retention
GROUP BY complaint_group;

-- Recruiter-facing SQL example: campaign performance
SELECT
    campaign_name,
    target_segment,
    acceptance_rate,
    retained_customers,
    revenue_saved
FROM campaign_performance
ORDER BY revenue_saved DESC;

-- Recruiter-facing SQL example: service escalation risk
SELECT
    category,
    AVG(resolution_hours) AS avg_resolution_hours,
    AVG(csat) AS avg_csat,
    SUM(CASE WHEN escalated = 'Yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS escalation_rate
FROM service_tickets
GROUP BY category;
