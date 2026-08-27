import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

vi.mock("../db", () => ({
  getProductSearchAnalytics: vi.fn(),
  getProductSearchExport: vi.fn(),
}));

import * as db from "../db";
import { dashboardRouter } from "./dashboard";

function createContext(email?: string): TrpcContext {
  return {
    user: email ? {
      id: 1,
      openId: "dashboard-test-owner",
      email,
      name: "Dashboard test user",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("dashboard access", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects unauthenticated requests", async () => {
    const caller = dashboardRouter.createCaller(createContext());
    await expect(caller.searchAnalytics({ startDate: "2026-08-01", endDate: "2026-08-31" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects signed-in users other than the named owner", async () => {
    const caller = dashboardRouter.createCaller(createContext("other@example.com"));
    await expect(caller.searchAnalytics({ startDate: "2026-08-01", endDate: "2026-08-31" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns only selected-range aggregate analytics to the named owner", async () => {
    const result = { totalSearches: 4, uniqueQueries: 2, dailySearches: [], mostSearched: [{ query: "kit kat", count: 3 }], leastSearched: [{ query: "apple", count: 1 }] };
    vi.mocked(db.getProductSearchAnalytics).mockResolvedValue(result);
    const caller = dashboardRouter.createCaller(createContext("adegokefaatihat@gmail.com"));

    await expect(caller.searchAnalytics({ startDate: "2026-08-01", endDate: "2026-08-31" })).resolves.toEqual(result);
    expect(db.getProductSearchAnalytics).toHaveBeenCalledWith({ startDate: "2026-08-01", endDate: "2026-08-31" });
  });

  it("rejects an administrator role when the email does not match the confirmed owner", async () => {
    const result = { totalSearches: 0, uniqueQueries: 0, dailySearches: [], mostSearched: [], leastSearched: [] };
    vi.mocked(db.getProductSearchAnalytics).mockResolvedValue(result);
    const adminContext = { ...createContext("owner-alias@example.com"), user: { ...createContext("owner-alias@example.com").user!, role: "admin" as const } };
    const caller = dashboardRouter.createCaller(adminContext);

    await expect(caller.searchAnalytics({ startDate: "2026-08-01", endDate: "2026-08-31" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns selected-range aggregate rows for CSV export to the confirmed owner only", async () => {
    const rows = [{ query: "kit kat", count: 3 }, { query: "apple", count: 1 }];
    vi.mocked(db.getProductSearchExport).mockResolvedValue(rows);
    const caller = dashboardRouter.createCaller(createContext("adegokefaatihat@gmail.com"));

    await expect(caller.exportSearchAnalytics({ startDate: "2026-08-01", endDate: "2026-08-31" })).resolves.toEqual(rows);
    expect(db.getProductSearchExport).toHaveBeenCalledWith({ startDate: "2026-08-01", endDate: "2026-08-31" });
  });
});
