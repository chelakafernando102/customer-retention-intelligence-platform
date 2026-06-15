# Dashboard Blueprint

## Page 1: Executive Summary

- KPI cards: retention rate, churn rate, CSAT, NPS, revenue retained, revenue at risk.
- Trend chart: monthly retention and churn trend.
- Management brief: top actions and projected impact.
- Filters: period, segment, risk band, customer search.

## Page 2: Customer Retention

- Risk distribution by low, medium, and high bands.
- Segment exposure by customer lifetime value.
- High-risk customer queue sorted by churn probability and CLV.
- Breakdown by region, account type, campaign engagement, and complaint volume.

## Page 3: Service Operations

- Ticket volume, SLA compliance, average resolution time, escalation rate, and complaint volume.
- Complaint categories ranked by volume and resolution time.
- SLA misses by priority and month.
- Relationship between average resolution time and CSAT.

## Page 4: Campaign Performance

- Campaign acceptance rate, retained customers, and revenue saved.
- Channel performance by open rate and click-through rate.
- Target segment comparison.
- Recommendation list for campaign audience refinement.

## Power BI Build Notes

- Import CSVs from the `data` folder.
- Create relationships from `fact_service_ticket.customer_id` to `dim_customer.customer_id`.
- Use `fact_monthly_retention` as a standalone monthly KPI fact table.
- Use `fact_campaign_performance` for campaign ROI views.
- Add measures for retained revenue, revenue at risk, SLA compliance, high-risk customers, and campaign conversion.
