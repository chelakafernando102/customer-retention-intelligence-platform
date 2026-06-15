# Customer Retention & Operations Intelligence Platform

A premium analytics portfolio project for customer retention, service operations, churn risk scoring, and executive KPI reporting.

![Dashboard preview](assets/dashboard-preview.png)

## What It Demonstrates

- Business analysis: BRD, stakeholder needs, process mapping, KPI definition, and executive recommendations.
- SQL analytics: warehouse schema, KPI queries, segmentation analysis, campaign ROI, and service operations views.
- Python analytics: interpretable churn scoring and customer risk banding.
- Dashboard design: polished executive interface with filters, trend charts, risk distribution, priority queues, and export.
- Data storytelling: simulated business data that mirrors retention problems faced by financial services, telecom, subscription, and customer service teams.

## Live Dashboard

Hosted dashboard:

[https://chelakafernando102.github.io/customer-retention-intelligence-platform/](https://chelakafernando102.github.io/customer-retention-intelligence-platform/)

To run locally, open `index.html` directly or run:

```bash
npm run preview
```

Then visit `http://localhost:4173`.

## Project Structure

```text
.
+-- assets/
|   +-- dashboard-preview.png
+-- data/
|   +-- customers.csv
|   +-- monthly_metrics.csv
|   +-- service_tickets.csv
|   +-- campaign_performance.csv
|   +-- dataset_summary.json
+-- docs/
|   +-- business_requirements.md
|   +-- data_dictionary.md
|   +-- model_design.md
|   +-- report_blueprint.md
+-- python/
|   +-- churn_model.py
+-- scripts/
|   +-- generate_data.mjs
|   +-- validate_project.mjs
+-- sql/
|   +-- schema.sql
|   +-- analytics_queries.sql
+-- index.html
+-- styles.css
+-- script.js
```

## Key KPIs

- Customer Retention Rate
- Customer Churn Rate
- Customer Lifetime Value
- Revenue at Risk
- Net Promoter Score
- Customer Satisfaction Score
- SLA Compliance
- Average Handling Time
- Escalation Rate
- Campaign Acceptance Rate

## Run The Analytics

Generate the deterministic sample dataset:

```bash
npm run generate
```

Validate the project files and generated data:

```bash
npm test
```

Score customers with the Python churn model:

```bash
python3 python/churn_model.py
```

## Portfolio Resume Summary

Customer Retention & Operations Intelligence Platform | SQL, Python, Power BI, Excel

Designed and developed an end-to-end analytics platform to monitor customer retention, customer engagement, service operations, and revenue exposure. Built executive dashboards tracking churn, retention, customer lifetime value, SLA compliance, complaint resolution, CSAT, NPS, and campaign ROI. Used SQL and Python to transform simulated operational data, segment customers, and generate predictive churn risk scores. Produced business requirements documentation, dashboard blueprints, data dictionary, process maps, and strategic recommendations for data-driven retention improvement.
