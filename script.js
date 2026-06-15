const state = {
  customers: [],
  monthly: [],
  tickets: [],
  campaigns: [],
  summary: {},
};

const selectors = {
  period: document.querySelector("#periodFilter"),
  segment: document.querySelector("#segmentFilter"),
  risk: document.querySelector("#riskFilter"),
  search: document.querySelector("#searchInput"),
  exportButton: document.querySelector("#exportButton"),
  resetButton: document.querySelector("#resetButton"),
};

const numberFields = new Set([
  "age",
  "tenure_months",
  "monthly_spend",
  "usage_index",
  "complaints_last_90d",
  "support_tickets",
  "avg_resolution_hours",
  "csat",
  "nps",
  "churn_probability",
  "clv",
  "retention_rate",
  "churn_rate",
  "tickets",
  "sla_compliance",
  "aht",
  "revenue_retained",
  "campaign_conversion",
  "participants",
  "open_rate",
  "click_rate",
  "acceptance_rate",
  "retained_customers",
  "revenue_saved",
  "resolution_hours",
  "sla_target_hours",
]);

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  const headers = rows.shift();
  return rows
    .filter((items) => items.length === headers.length)
    .map((items) =>
      Object.fromEntries(
        headers.map((header, index) => [
          header,
          numberFields.has(header) ? Number(items[index]) : items[index],
        ])
      )
    );
};

const fetchCsv = async (path) => parseCsv(await (await fetch(path)).text());
const formatNumber = (value) => new Intl.NumberFormat("en-US").format(Math.round(value || 0));
const formatCurrency = (value, compact = true) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value || 0);
const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;
const average = (items, key) => items.reduce((sum, item) => sum + Number(item[key] || 0), 0) / Math.max(items.length, 1);
const sum = (items, key) => items.reduce((total, item) => total + Number(item[key] || 0), 0);
const slug = (value) => String(value).toLowerCase().replaceAll(" ", "-");

const groupBy = (items, key) =>
  items.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});

const getFilteredCustomers = () => {
  const segment = selectors.segment.value;
  const risk = selectors.risk.value;
  const search = selectors.search.value.trim().toLowerCase();

  return state.customers.filter((customer) => {
    const matchesSegment = segment === "All" || customer.segment === segment;
    const matchesRisk = risk === "All" || customer.risk_band === risk;
    const matchesSearch =
      !search ||
      customer.customer_id.toLowerCase().includes(search) ||
      customer.region.toLowerCase().includes(search) ||
      customer.account_type.toLowerCase().includes(search);

    return matchesSegment && matchesRisk && matchesSearch;
  });
};

const getSelectedMonths = () => state.monthly.slice(-Number(selectors.period.value));

const setText = (id, value) => {
  const element = document.querySelector(id);
  if (element) element.textContent = value;
};

const renderKpis = (customers, monthly) => {
  const latest = monthly.at(-1);
  const previous = monthly.at(-2) || latest;
  const revenueAtRisk = sum(customers.filter((customer) => customer.risk_band === "High"), "clv");
  const retentionDelta = latest.retention_rate - previous.retention_rate;
  const churnDelta = latest.churn_rate - previous.churn_rate;

  setText("#kpiRetention", formatPercent(latest.retention_rate));
  setText("#kpiRetentionDelta", `${retentionDelta >= 0 ? "+" : ""}${retentionDelta.toFixed(1)} pts vs prior month`);
  setText("#kpiChurn", formatPercent(latest.churn_rate));
  setText("#kpiChurnDelta", `${churnDelta <= 0 ? "" : "+"}${churnDelta.toFixed(1)} pts vs prior month`);
  setText("#kpiCsat", formatPercent(latest.csat));
  setText("#kpiNps", `NPS ${latest.nps}`);
  setText("#kpiRevenue", formatCurrency(latest.revenue_retained));
  setText("#kpiRevenueAtRisk", `${formatCurrency(revenueAtRisk)} revenue at risk`);
};

const renderTrendChart = (monthly) => {
  const svg = document.querySelector("#retentionChart");
  const width = 760;
  const height = 260;
  const padding = { top: 18, right: 18, bottom: 34, left: 46 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const values = monthly.flatMap((item) => [item.retention_rate, item.churn_rate]);
  const min = Math.floor(Math.min(...values) / 5) * 5;
  const max = Math.ceil(Math.max(...values) / 5) * 5;
  const x = (index) => padding.left + (index / Math.max(monthly.length - 1, 1)) * plotWidth;
  const y = (value) => padding.top + (1 - (value - min) / (max - min || 1)) * plotHeight;
  const pathFor = (key) => monthly.map((item, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(item[key])}`).join(" ");
  const areaPath = `${pathFor("retention_rate")} L ${x(monthly.length - 1)} ${height - padding.bottom} L ${x(0)} ${height - padding.bottom} Z`;
  const ticks = Array.from({ length: 5 }, (_, index) => min + ((max - min) / 4) * index);
  const labels = monthly.filter((_, index) => index === 0 || index === monthly.length - 1 || index === Math.floor(monthly.length / 2));

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = `
    ${ticks
      .map(
        (tick) => `
      <line class="grid-line" x1="${padding.left}" x2="${width - padding.right}" y1="${y(tick)}" y2="${y(tick)}"></line>
      <text class="axis-label" x="10" y="${y(tick) + 4}">${tick.toFixed(0)}%</text>
    `
      )
      .join("")}
    <path class="chart-fill" d="${areaPath}"></path>
    <path class="retention-line" d="${pathFor("retention_rate")}"></path>
    <path class="churn-line" d="${pathFor("churn_rate")}"></path>
    ${labels
      .map(
        (item, index) =>
          `<text class="axis-label" x="${x(monthly.indexOf(item)) - (index === labels.length - 1 ? 42 : 0)}" y="${height - 10}">${item.month}</text>`
      )
      .join("")}
  `;
};

const renderRisk = (customers) => {
  const counts = {
    High: customers.filter((customer) => customer.risk_band === "High").length,
    Medium: customers.filter((customer) => customer.risk_band === "Medium").length,
    Low: customers.filter((customer) => customer.risk_band === "Low").length,
  };
  const total = Math.max(customers.length, 1);
  const highDeg = (counts.High / total) * 360;
  const mediumDeg = highDeg + (counts.Medium / total) * 360;
  const ring = document.querySelector("#riskRing");

  ring.style.background = `conic-gradient(var(--red) 0deg ${highDeg}deg, var(--amber) ${highDeg}deg ${mediumDeg}deg, var(--green) ${mediumDeg}deg 360deg)`;
  setText("#riskRingValue", formatPercent((counts.High / total) * 100));
  document.querySelector("#riskLegend").innerHTML = Object.entries(counts)
    .map(
      ([risk, count]) => `
        <div class="risk-row">
          <span class="risk-name">${risk}</span>
          <span class="risk-value">${formatNumber(count)} accounts</span>
        </div>
      `
    )
    .join("");
};

const renderSegments = (customers) => {
  const groups = groupBy(customers, "segment");
  const rows = Object.entries(groups)
    .map(([segment, items]) => ({
      segment,
      revenue: sum(items.filter((customer) => customer.risk_band !== "Low"), "clv"),
      churn: average(items, "churn_probability"),
      count: items.length,
    }))
    .sort((a, b) => b.revenue - a.revenue);
  const maxRevenue = Math.max(...rows.map((row) => row.revenue), 1);

  document.querySelector("#segmentBars").innerHTML = rows.length
    ? rows
        .map(
          (row) => `
      <div class="bar-row">
        <div class="bar-top">
          <span>${row.segment}</span>
          <span>${formatCurrency(row.revenue)} exposure</span>
        </div>
        <div class="bar-track" aria-label="${row.segment} exposure">
          <span class="bar-fill" style="--bar-width: ${(row.revenue / maxRevenue) * 100}%"></span>
        </div>
        <small>${formatNumber(row.count)} customers, ${formatPercent(row.churn)} avg risk</small>
      </div>
    `
        )
        .join("")
    : `<div class="is-empty">No segment data for the selected filters.</div>`;
};

const renderOperations = (customers) => {
  const customerIds = new Set(customers.map((customer) => customer.customer_id));
  const tickets = state.tickets.filter((ticket) => customerIds.has(ticket.customer_id));
  const slaMet = tickets.filter((ticket) => ticket.sla_met === "Yes").length;
  const escalated = tickets.filter((ticket) => ticket.escalated === "Yes").length;
  const complaintTickets = tickets.filter((ticket) => ticket.category === "Complaint").length;
  const metrics = [
    ["Ticket volume", formatNumber(tickets.length), "headphones"],
    ["SLA compliance", formatPercent((slaMet / Math.max(tickets.length, 1)) * 100), "timer"],
    ["Avg resolution", `${average(tickets, "resolution_hours").toFixed(1)}h`, "clock"],
    ["Escalation rate", formatPercent((escalated / Math.max(tickets.length, 1)) * 100), "arrow-up-right"],
    ["Complaint volume", formatNumber(complaintTickets), "message-square-warning"],
  ];

  document.querySelector("#operationsMetrics").innerHTML = metrics
    .map(
      ([label, value]) => `
        <div class="metric-row">
          <span class="metric-name">${label}</span>
          <span class="metric-value">${value}</span>
        </div>
      `
    )
    .join("");
};

const renderCustomerTable = (customers) => {
  const rows = [...customers]
    .sort((a, b) => b.churn_probability - a.churn_probability || b.clv - a.clv)
    .slice(0, 12);

  setText("#tableCount", `${formatNumber(customers.length)} accounts`);
  document.querySelector("#customerTable").innerHTML = rows.length
    ? rows
        .map(
          (customer) => `
        <tr>
          <td>${customer.customer_id}</td>
          <td>${customer.segment}</td>
          <td>${customer.region}</td>
          <td><span class="pill ${slug(customer.risk_band)}">${customer.risk_band}</span></td>
          <td>${formatCurrency(customer.clv, false)}</td>
          <td>${customer.support_tickets} tickets, ${customer.avg_resolution_hours.toFixed(1)}h avg</td>
        </tr>
      `
        )
        .join("")
    : `<tr><td colspan="6" class="is-empty">No customers match the selected filters.</td></tr>`;
};

const renderCampaigns = () => {
  const maxSaved = Math.max(...state.campaigns.map((campaign) => campaign.revenue_saved), 1);
  document.querySelector("#campaignList").innerHTML = state.campaigns
    .sort((a, b) => b.revenue_saved - a.revenue_saved)
    .map(
      (campaign) => `
        <div class="campaign-row">
          <div class="campaign-top">
            <span>${campaign.campaign_name}</span>
            <span>${formatCurrency(campaign.revenue_saved)}</span>
          </div>
          <div class="bar-track" aria-label="${campaign.campaign_name} revenue saved">
            <span class="bar-fill" style="--bar-width: ${(campaign.revenue_saved / maxSaved) * 100}%"></span>
          </div>
          <small>${campaign.channel} / ${campaign.target_segment} / ${formatPercent(campaign.acceptance_rate)} acceptance</small>
        </div>
      `
    )
    .join("");
};

const renderInsights = (customers, monthly) => {
  const highRisk = customers.filter((customer) => customer.risk_band === "High");
  const highComplaints = customers.filter((customer) => customer.complaints_last_90d >= 3);
  const latest = monthly.at(-1);
  const campaignSaved = sum(state.campaigns, "revenue_saved");
  const insights = [
    [
      "High-risk outreach",
      `${formatNumber(highRisk.length)} accounts carry ${formatCurrency(sum(highRisk, "clv"))} in lifetime value exposure. Prioritize concierge recovery within the next review cycle.`,
    ],
    [
      "Service recovery",
      `${formatNumber(highComplaints.length)} customers have three or more recent complaints. Resolution time and CSAT are the clearest intervention levers.`,
    ],
    [
      "Campaign lift",
      `Retention campaigns have protected ${formatCurrency(campaignSaved)} with ${formatPercent(latest.campaign_conversion)} latest-month conversion.`,
    ],
  ];

  document.querySelector("#insightList").innerHTML = insights
    .map(([title, body]) => `<div class="insight-item"><strong>${title}</strong><p>${body}</p></div>`)
    .join("");
};

const exportSummary = () => {
  const customers = getFilteredCustomers();
  const monthly = getSelectedMonths();
  const highRisk = customers.filter((customer) => customer.risk_band === "High");
  const payload = {
    exported_at: new Date().toISOString(),
    filters: {
      period_months: Number(selectors.period.value),
      segment: selectors.segment.value,
      risk: selectors.risk.value,
      search: selectors.search.value,
    },
    kpis: {
      accounts: customers.length,
      retention_rate: monthly.at(-1).retention_rate,
      churn_rate: monthly.at(-1).churn_rate,
      csat: monthly.at(-1).csat,
      high_risk_customers: highRisk.length,
      revenue_at_risk: Math.round(sum(highRisk, "clv")),
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "retention-executive-summary.json";
  link.click();
  URL.revokeObjectURL(url);
};

const render = () => {
  const customers = getFilteredCustomers();
  const monthly = getSelectedMonths();

  renderKpis(customers, monthly);
  renderTrendChart(monthly);
  renderRisk(customers);
  renderSegments(customers);
  renderOperations(customers);
  renderCustomerTable(customers);
  renderCampaigns();
  renderInsights(customers, monthly);

  if (window.lucide) window.lucide.createIcons();
};

const init = async () => {
  const [customers, monthly, tickets, campaigns, summary] = await Promise.all([
    fetchCsv("data/customers.csv"),
    fetchCsv("data/monthly_metrics.csv"),
    fetchCsv("data/service_tickets.csv"),
    fetchCsv("data/campaign_performance.csv"),
    fetch("data/dataset_summary.json").then((response) => response.json()),
  ]);

  state.customers = customers;
  state.monthly = monthly;
  state.tickets = tickets;
  state.campaigns = campaigns;
  state.summary = summary;

  [...new Set(customers.map((customer) => customer.segment))]
    .sort()
    .forEach((segment) => selectors.segment.insertAdjacentHTML("beforeend", `<option value="${segment}">${segment}</option>`));

  [selectors.period, selectors.segment, selectors.risk, selectors.search].forEach((control) => {
    control.addEventListener("input", render);
  });
  selectors.exportButton.addEventListener("click", exportSummary);
  selectors.resetButton.addEventListener("click", () => {
    selectors.period.value = "18";
    selectors.segment.value = "All";
    selectors.risk.value = "All";
    selectors.search.value = "";
    render();
  });

  render();
};

init().catch((error) => {
  document.body.innerHTML = `<main class="is-empty">Dashboard data failed to load: ${error.message}</main>`;
});
