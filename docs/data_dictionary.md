# Data Dictionary

## data/customers.csv

| Field | Description |
| --- | --- |
| customer_id | Unique customer identifier. |
| segment | Lifecycle or value segment: High Value, At Risk, Loyal, New, Growth. |
| region | Customer operating region. |
| age | Customer age. |
| tenure_months | Number of months since onboarding. |
| account_type | Customer account/product type. |
| monthly_spend | Estimated recurring monthly spend. |
| usage_index | Composite product engagement score from 0 to 100. |
| complaints_last_90d | Complaint count during the last 90 days. |
| support_tickets | Recent support ticket volume. |
| avg_resolution_hours | Average time required to resolve service issues. |
| csat | Customer satisfaction score. |
| nps | Net Promoter Score proxy. |
| campaign_engaged | Whether the customer engaged with a retention campaign. |
| churn_probability | Simulated churn probability from 0 to 100. |
| risk_band | Low, Medium, or High churn risk. |
| clv | Estimated customer lifetime value. |
| status | Active or churned. |

## data/monthly_metrics.csv

| Field | Description |
| --- | --- |
| month | Reporting month. |
| retention_rate | Percentage of customers retained. |
| churn_rate | Percentage of customers lost. |
| csat | Monthly customer satisfaction score. |
| nps | Monthly Net Promoter Score proxy. |
| tickets | Monthly service ticket volume. |
| sla_compliance | Percentage of tickets resolved within SLA. |
| aht | Average handling time in hours. |
| revenue_retained | Estimated retained revenue. |
| campaign_conversion | Retention campaign conversion rate. |

## data/service_tickets.csv

| Field | Description |
| --- | --- |
| ticket_id | Unique service ticket identifier. |
| customer_id | Related customer identifier. |
| opened_month | Month the ticket was opened. |
| category | Ticket reason or complaint category. |
| priority | Support priority. |
| resolution_hours | Time from ticket open to resolution. |
| sla_target_hours | SLA target for the ticket. |
| sla_met | Whether the SLA target was met. |
| escalated | Whether the case required escalation. |
| csat | Satisfaction score after ticket close. |

## data/campaign_performance.csv

| Field | Description |
| --- | --- |
| campaign_id | Unique retention campaign identifier. |
| campaign_name | Campaign name. |
| channel | Delivery channel. |
| target_segment | Customer segment targeted. |
| participants | Customers included in the campaign. |
| open_rate | Campaign open rate. |
| click_rate | Campaign click-through rate. |
| acceptance_rate | Offer acceptance rate. |
| retained_customers | Customers retained through the intervention. |
| revenue_saved | Estimated revenue protected. |
