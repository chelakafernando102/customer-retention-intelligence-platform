# Predictive Model Design

## Objective

Estimate the probability that a customer will churn, then assign the customer to a Low, Medium, or High risk band for retention prioritization.

## Target

The simulated `status` field represents the retention outcome. In a production environment this would be a labeled historical churn event.

## Features

- Tenure in months.
- Product usage index.
- Customer satisfaction score.
- Recent complaint count.
- Support ticket volume.
- Average resolution time.
- Campaign engagement.
- Monthly spend.

## Scoring Logic

The included Python script uses an interpretable logistic risk formula. Higher complaint count, longer resolution times, and higher spend increase urgency, while longer tenure, higher usage, stronger satisfaction, and campaign engagement reduce churn risk.

Risk bands:

- Low: 0-30%.
- Medium: 31-70%.
- High: 71-100%.

## Production Enhancements

- Train a supervised model with historical churn labels.
- Track precision, recall, lift, and calibration by segment.
- Monitor score drift monthly.
- Add bias checks across region and account type.
- Send high-risk customer lists into CRM workflow queues.
