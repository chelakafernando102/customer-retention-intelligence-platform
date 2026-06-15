import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "README.md",
  "assets/dashboard-preview.png",
  "data/customers.csv",
  "data/monthly_metrics.csv",
  "data/service_tickets.csv",
  "data/campaign_performance.csv",
  "data/dataset_summary.json",
  "sql/schema.sql",
  "sql/analytics_queries.sql",
  "python/churn_model.py",
  "docs/business_requirements.md",
  "docs/data_dictionary.md",
  "docs/report_blueprint.md",
  "docs/model_design.md",
];

const parseCsv = (text) => {
  const rows = text.trim().split(/\r?\n/);
  const headers = rows[0].split(",");
  return { headers, count: rows.length - 1 };
};

for (const file of requiredFiles) {
  await access(new URL(`../${file}`, import.meta.url));
}

const customers = parseCsv(await readFile(new URL("../data/customers.csv", import.meta.url), "utf8"));
const monthly = parseCsv(await readFile(new URL("../data/monthly_metrics.csv", import.meta.url), "utf8"));
const tickets = parseCsv(await readFile(new URL("../data/service_tickets.csv", import.meta.url), "utf8"));
const summary = JSON.parse(await readFile(new URL("../data/dataset_summary.json", import.meta.url), "utf8"));

const expectedCustomerFields = ["customer_id", "segment", "region", "churn_probability", "risk_band", "clv"];
for (const field of expectedCustomerFields) {
  if (!customers.headers.includes(field)) {
    throw new Error(`Missing customer field: ${field}`);
  }
}

if (customers.count < 300) throw new Error("Customer data should include at least 300 rows.");
if (monthly.count < 12) throw new Error("Monthly metrics should include at least 12 periods.");
if (tickets.count < 500) throw new Error("Service ticket data should include at least 500 rows.");
if (summary.retention_rate <= 0 || summary.retention_rate > 100) throw new Error("Invalid retention summary.");

console.log("Project validation passed.");
console.log(`Customers: ${customers.count}`);
console.log(`Tickets: ${tickets.count}`);
console.log(`Monthly periods: ${monthly.count}`);
