import { describe, expect, it } from "vitest";
import { createSearchAnalyticsCsv } from "./dashboardCsv";

describe("dashboard CSV export", () => {
  it("exports only selected-range aggregate terms and counts with safe CSV quoting", () => {
    const csv = createSearchAnalyticsCsv({
      startDate: "2026-08-01",
      endDate: "2026-08-31",
      rows: [{ query: "tea, mint", count: 3 }, { query: "brand \"x\"", count: 1 }],
    });

    expect(csv).toContain('"Range start","Range end","Product search term","Search count"');
    expect(csv).toContain('"2026-08-01","2026-08-31","tea, mint","3"');
    expect(csv).toContain('"2026-08-01","2026-08-31","brand ""x""","1"');
    expect(csv).not.toContain("email");
    expect(csv).not.toContain("IP address");
  });
});
