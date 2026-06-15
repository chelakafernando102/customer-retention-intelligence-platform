# BA Artifacts

## Business Problem

Customer churn was increasing while leaders had limited visibility into service issues, campaign effectiveness, and high-risk customer segments. The business needed a centralized analytics platform to identify churn drivers, prioritize retention actions, and protect recurring revenue.

## Stakeholders

- Executive Leadership
- Customer Service Managers
- Marketing Team
- Operations Team

## Requirements

### Functional

- View churn risk by customer segment, CLV, complaints, and churn probability.
- Monitor retention campaigns by acceptance rate, retained customers, and revenue saved.
- Export reports for stakeholder review.

### Non-Functional

- Dashboard loads under 3 seconds for the sample data model.
- Dashboard is mobile responsive.
- KPIs and priority queues are readable without advanced training.

## User Stories

- As a Customer Retention Manager, I want to identify high-risk customers so that I can proactively intervene before churn occurs.
- As a Customer Service Manager, I want to monitor complaint resolution times so that I can reduce escalation risk.
- As a Marketing Analyst, I want to compare campaign performance by segment so that I can improve retention targeting.
- As an Executive Leader, I want a KPI scorecard so that I can review churn, revenue exposure, and service performance quickly.

## SQL Section

```sql
SELECT
    customer_segment,
    AVG(churn_risk),
    SUM(customer_lifetime_value)
FROM customers
GROUP BY customer_segment;
```

## Process Flow Diagram

Customer issue -> Risk score -> Service recovery -> Retention offer -> Outcome tracking

## KPI Definitions

| KPI | Definition |
| --- | --- |
| Retention Rate | Customers retained divided by customers at the start of the period. |
| Churn Probability | Predicted likelihood of churn from service, engagement, and satisfaction signals. |
| Revenue at Risk | CLV associated with customers in high-risk churn bands. |
| SLA Compliance | Tickets resolved within target service windows divided by total tickets. |
| Campaign Acceptance | Accepted retention offers divided by contacted campaign participants. |

## Key Findings

- Customers with 3+ complaints were 2.8x more likely to churn.
- Customers contacted within 48 hours of an issue showed higher retention.
- Premium-tier customers generated 42% of retained revenue.
- Retention campaigns improved engagement by 18%.

## Tools & Technologies

- SQL
- Power BI
- Excel
- Python
- Data Visualization
- Business Requirements Analysis
- KPI Design
- Customer Segmentation
