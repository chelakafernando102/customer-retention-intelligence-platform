#!/usr/bin/env python3
"""Score customer churn risk from the generated portfolio dataset.

This script intentionally runs with the Python standard library so the project
can be evaluated anywhere. In a production analytics stack, the same feature set
would be trained with pandas, scikit-learn, and scheduled model monitoring.
"""

from __future__ import annotations

import csv
import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "customers.csv"
OUTPUT_DIR = ROOT / "outputs"
SCORES = OUTPUT_DIR / "churn_scores.csv"
REPORT = OUTPUT_DIR / "model_report.json"


def sigmoid(value: float) -> float:
    return 1 / (1 + math.exp(-value))


def risk_score(row: dict[str, str]) -> float:
    tenure = float(row["tenure_months"])
    complaints = float(row["complaints_last_90d"])
    resolution = float(row["avg_resolution_hours"])
    csat = float(row["csat"])
    usage = float(row["usage_index"])
    campaign_engaged = 1 if row["campaign_engaged"] == "Yes" else 0
    monthly_spend = float(row["monthly_spend"])

    z = (
        0.40
        - 0.018 * tenure
        - 0.020 * usage
        - 0.055 * csat
        + 0.72 * complaints
        + 0.045 * resolution
        + 0.0018 * monthly_spend
        - 0.45 * campaign_engaged
    )
    return round(sigmoid(z) * 100, 2)


def band(score: float) -> str:
    if score > 70:
        return "High"
    if score > 30:
        return "Medium"
    return "Low"


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)

    with DATA.open(newline="") as source:
        rows = list(csv.DictReader(source))

    scored_rows = []
    for row in rows:
        score = risk_score(row)
        scored_rows.append(
            {
                "customer_id": row["customer_id"],
                "segment": row["segment"],
                "region": row["region"],
                "churn_score": score,
                "risk_band": band(score),
                "clv": row["clv"],
                "recommended_action": "Concierge outreach" if score > 70 else "Monitor" if score > 30 else "Maintain",
            }
        )

    with SCORES.open("w", newline="") as target:
        writer = csv.DictWriter(target, fieldnames=scored_rows[0].keys())
        writer.writeheader()
        writer.writerows(scored_rows)

    total = len(scored_rows)
    high = sum(1 for row in scored_rows if row["risk_band"] == "High")
    medium = sum(1 for row in scored_rows if row["risk_band"] == "Medium")
    low = sum(1 for row in scored_rows if row["risk_band"] == "Low")
    revenue_at_risk = sum(float(row["clv"]) for row in scored_rows if row["risk_band"] == "High")
    report = {
        "model_type": "interpretable logistic risk score",
        "rows_scored": total,
        "features": [
            "tenure_months",
            "usage_index",
            "csat",
            "complaints_last_90d",
            "avg_resolution_hours",
            "monthly_spend",
            "campaign_engaged",
        ],
        "risk_distribution": {
            "high": high,
            "medium": medium,
            "low": low,
        },
        "high_risk_rate": round(high / total * 100, 2),
        "revenue_at_risk": round(revenue_at_risk, 2),
    }
    REPORT.write_text(json.dumps(report, indent=2))
    print(f"Scored {total} customers")
    print(f"High-risk accounts: {high}")
    print(f"Revenue at risk: ${revenue_at_risk:,.0f}")


if __name__ == "__main__":
    main()
