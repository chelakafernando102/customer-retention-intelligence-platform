# SQL Examples

## Segment-Level Churn Risk

```sql
SELECT
    customer_segment,
    AVG(churn_risk),
    SUM(customer_lifetime_value)
FROM customers
GROUP BY customer_segment;
```

## Segment-Level Churn Probability

```sql
SELECT
    customer_segment,
    AVG(churn_probability) AS avg_churn_probability,
    COUNT(customer_id) AS customers
FROM customer_retention
GROUP BY customer_segment;
```

## Revenue At Risk By Segment

```sql
SELECT
    customer_segment,
    SUM(customer_lifetime_value) AS revenue_at_risk
FROM customer_retention
WHERE churn_probability >= 70
GROUP BY customer_segment
ORDER BY revenue_at_risk DESC;
```

## Complaint-Based Churn Driver

```sql
SELECT
    CASE
        WHEN complaints_last_90d >= 3 THEN '3+ complaints'
        ELSE '0-2 complaints'
    END AS complaint_group,
    AVG(churn_probability) AS avg_churn_probability,
    COUNT(*) AS customers
FROM customer_retention
GROUP BY complaint_group;
```

## Campaign Performance

```sql
SELECT
    campaign_name,
    target_segment,
    acceptance_rate,
    retained_customers,
    revenue_saved
FROM campaign_performance
ORDER BY revenue_saved DESC;
```

## Service Escalation Risk

```sql
SELECT
    category,
    AVG(resolution_hours) AS avg_resolution_hours,
    AVG(csat) AS avg_csat,
    SUM(CASE WHEN escalated = 'Yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS escalation_rate
FROM service_tickets
GROUP BY category;
```
