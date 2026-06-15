import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = new URL("..", import.meta.url);
const dataDir = new URL("data/", root);

let seed = 874213;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = (items) => items[Math.floor(rand() * items.length)];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, digits = 1) => Number(value.toFixed(digits));
const currency = (value) => Number(value.toFixed(2));

const csvEscape = (value) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const toCsv = (rows) => {
  const headers = Object.keys(rows[0]);
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
};

const months = Array.from({ length: 18 }, (_, index) => {
  const date = new Date(Date.UTC(2025, index, 1));
  return date.toISOString().slice(0, 7);
});

const regions = ["Atlantic", "Ontario", "Quebec", "Prairies", "British Columbia"];
const segments = ["High Value", "At Risk", "Loyal", "New", "Growth"];
const accounts = ["Premium", "Standard", "Digital", "Family", "Business"];
const categories = ["Billing", "Technical Support", "Account Change", "Product Guidance", "Complaint", "Retention Offer"];
const channels = ["Email", "In App", "Outbound Call", "SMS", "Relationship Manager"];

const customers = Array.from({ length: 420 }, (_, index) => {
  const segment = pick(segments);
  const region = pick(regions);
  const account_type = pick(accounts);
  const tenure_months = Math.floor(2 + rand() * 94);
  const age = Math.floor(22 + rand() * 48);
  const baseSpend = {
    Premium: 174,
    Standard: 83,
    Digital: 58,
    Family: 132,
    Business: 246,
  }[account_type];
  const segmentLift = {
    "High Value": 84,
    "At Risk": -6,
    Loyal: 28,
    New: -18,
    Growth: 42,
  }[segment];
  const monthly_spend = currency(clamp(baseSpend + segmentLift + (rand() - 0.42) * 74, 28, 420));
  const usage_index = round(clamp(
    44 + tenure_months * 0.42 + monthly_spend * 0.08 + (segment === "At Risk" ? -20 : 0) + rand() * 24,
    8,
    100
  ));
  const complaints_last_90d = Math.max(0, Math.floor((segment === "At Risk" ? 1.9 : 0.35) + rand() * 4.2));
  const support_tickets = Math.max(0, complaints_last_90d + Math.floor(rand() * (segment === "At Risk" ? 6 : 3)));
  const avg_resolution_hours = round(clamp(
    9 + support_tickets * 2.8 + complaints_last_90d * 4.6 + rand() * 13 - (segment === "Loyal" ? 3 : 0),
    2.5,
    68
  ));
  const campaign_engaged = rand() > (segment === "At Risk" ? 0.42 : 0.62) ? "Yes" : "No";
  const csat = round(clamp(
    92 - complaints_last_90d * 9.5 - avg_resolution_hours * 0.36 + usage_index * 0.1 + (campaign_engaged === "Yes" ? 3.8 : 0) + rand() * 9,
    28,
    99
  ));
  const nps = Math.round(clamp(csat - 48 + (rand() - 0.35) * 28, -72, 84));
  const churn_probability = round(clamp(
    86 - tenure_months * 0.38 - usage_index * 0.33 - csat * 0.42 + complaints_last_90d * 11 + avg_resolution_hours * 0.45 + (campaign_engaged === "Yes" ? -9 : 5) + rand() * 12,
    3,
    96
  ));
  const risk_band = churn_probability > 70 ? "High" : churn_probability > 30 ? "Medium" : "Low";
  const clv = currency(monthly_spend * clamp(30 - churn_probability * 0.18 + tenure_months * 0.09, 8, 42));
  const status = churn_probability > 76 && rand() > 0.53 ? "Churned" : "Active";

  return {
    customer_id: `CUST-${String(index + 1).padStart(5, "0")}`,
    segment,
    region,
    age,
    tenure_months,
    account_type,
    monthly_spend,
    usage_index,
    complaints_last_90d,
    support_tickets,
    avg_resolution_hours,
    csat,
    nps,
    campaign_engaged,
    churn_probability,
    risk_band,
    clv,
    status,
  };
});

const monthlyMetrics = months.map((month, index) => {
  const trend = index / (months.length - 1);
  const seasonality = Math.sin(index / 2.1) * 1.4;
  const retention_rate = round(clamp(83.2 + trend * 5.4 + seasonality + rand() * 1.6, 78, 94), 1);
  const churn_rate = round(100 - retention_rate, 1);
  const csat = round(clamp(78.4 + trend * 8.2 + Math.sin(index / 2.7) * 2 + rand() * 1.8, 71, 91), 1);
  const nps = Math.round(clamp(18 + trend * 31 + Math.cos(index / 2.2) * 6 + rand() * 8, 5, 58));
  const tickets = Math.round(1320 - trend * 230 + Math.sin(index / 1.8) * 80 + rand() * 110);
  const sla_compliance = round(clamp(78 + trend * 13.5 + rand() * 3.2, 73, 94), 1);
  const aht = round(clamp(18.6 - trend * 4.8 + rand() * 1.6, 10.5, 20.5), 1);
  const revenue_retained = Math.round(1180000 + trend * 460000 + retention_rate * 6200 + rand() * 68000);
  const campaign_conversion = round(clamp(9.8 + trend * 7.4 + Math.sin(index / 2.4) * 1.2 + rand() * 1.4, 7, 21), 1);

  return {
    month,
    retention_rate,
    churn_rate,
    csat,
    nps,
    tickets,
    sla_compliance,
    aht,
    revenue_retained,
    campaign_conversion,
  };
});

const serviceTickets = Array.from({ length: 680 }, (_, index) => {
  const customer = pick(customers);
  const category = pick(categories);
  const priority = customer.risk_band === "High" && rand() > 0.45 ? "High" : pick(["Low", "Medium", "Medium", "High"]);
  const resolution_hours = round(clamp(
    customer.avg_resolution_hours + (priority === "High" ? 7 : 0) + (category === "Complaint" ? 5 : 0) + (rand() - 0.5) * 16,
    1,
    92
  ));
  const sla_target_hours = priority === "High" ? 18 : priority === "Medium" ? 30 : 48;
  const csat = round(clamp(customer.csat + (sla_target_hours - resolution_hours) * 0.18 + (rand() - 0.5) * 12, 15, 100));

  return {
    ticket_id: `TICK-${String(index + 1).padStart(6, "0")}`,
    customer_id: customer.customer_id,
    opened_month: pick(months),
    category,
    priority,
    resolution_hours,
    sla_target_hours,
    sla_met: resolution_hours <= sla_target_hours ? "Yes" : "No",
    escalated: resolution_hours > sla_target_hours * 1.35 || (priority === "High" && rand() > 0.62) ? "Yes" : "No",
    csat,
  };
});

const campaignPerformance = [
  ["Winback Concierge", "Outbound Call", "At Risk", 980],
  ["Loyalty Dividend", "Email", "Loyal", 1480],
  ["Premium Care Review", "Relationship Manager", "High Value", 620],
  ["Early Value Check", "In App", "New", 1100],
  ["Usage Builder", "SMS", "Growth", 920],
].map(([campaign_name, channel, target_segment, participants], index) => {
  const maturity = index + 1;
  const open_rate = round(clamp(38 + maturity * 5 + rand() * 8 + (channel === "Relationship Manager" ? 16 : 0), 30, 82), 1);
  const click_rate = round(clamp(open_rate * (0.26 + rand() * 0.12), 8, 32), 1);
  const acceptance_rate = round(clamp(click_rate * (0.42 + rand() * 0.28) + (target_segment === "At Risk" ? 5 : 0), 5, 27), 1);
  const retained_customers = Math.round(participants * acceptance_rate / 100 * (0.73 + rand() * 0.14));
  const revenue_saved = Math.round(retained_customers * (1450 + rand() * 1900));

  return {
    campaign_id: `CMP-${String(index + 1).padStart(3, "0")}`,
    campaign_name,
    channel,
    target_segment,
    participants,
    open_rate,
    click_rate,
    acceptance_rate,
    retained_customers,
    revenue_saved,
  };
});

const activeCustomers = customers.filter((customer) => customer.status === "Active");
const highRisk = customers.filter((customer) => customer.risk_band === "High");
const summary = {
  generated_on: "2026-06-15",
  customer_rows: customers.length,
  ticket_rows: serviceTickets.length,
  campaign_rows: campaignPerformance.length,
  months: months.length,
  retention_rate: round(monthlyMetrics.at(-1).retention_rate, 1),
  churn_rate: round(monthlyMetrics.at(-1).churn_rate, 1),
  csat: round(monthlyMetrics.at(-1).csat, 1),
  nps: monthlyMetrics.at(-1).nps,
  sla_compliance: round(monthlyMetrics.at(-1).sla_compliance, 1),
  aht: round(monthlyMetrics.at(-1).aht, 1),
  active_customers: activeCustomers.length,
  high_risk_customers: highRisk.length,
  revenue_at_risk: Math.round(highRisk.reduce((sum, customer) => sum + customer.clv, 0)),
  revenue_retained: monthlyMetrics.at(-1).revenue_retained,
  campaign_revenue_saved: campaignPerformance.reduce((sum, campaign) => sum + campaign.revenue_saved, 0),
};

await mkdir(dataDir, { recursive: true });
await writeFile(new URL("customers.csv", dataDir), `${toCsv(customers)}\n`);
await writeFile(new URL("monthly_metrics.csv", dataDir), `${toCsv(monthlyMetrics)}\n`);
await writeFile(new URL("service_tickets.csv", dataDir), `${toCsv(serviceTickets)}\n`);
await writeFile(new URL("campaign_performance.csv", dataDir), `${toCsv(campaignPerformance)}\n`);
await writeFile(new URL("dataset_summary.json", dataDir), `${JSON.stringify(summary, null, 2)}\n`);

console.log(`Generated retention intelligence data in ${path.relative(process.cwd(), dataDir.pathname)}`);
