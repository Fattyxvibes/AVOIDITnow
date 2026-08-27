export type DashboardCsvRow = { query: string; count: number };

function csvCell(value: string | number) {
  const escaped = String(value).replace(/"/g, '""');
  return `"${escaped}"`;
}

export function createSearchAnalyticsCsv(input: { startDate: string; endDate: string; rows: DashboardCsvRow[] }) {
  const header = ["Range start", "Range end", "Product search term", "Search count"];
  const lines = input.rows.map(row => [input.startDate, input.endDate, row.query, row.count].map(csvCell).join(","));
  return [header.map(csvCell).join(","), ...lines].join("\r\n");
}
