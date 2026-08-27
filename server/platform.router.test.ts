import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  listBrands: vi.fn(),
  createAlternative: vi.fn(),
  checkDatabaseProduct: vi.fn(),
  consumeRateLimit: vi.fn(),
  recordProductSearch: vi.fn(),
}));

import * as db from "./db";
import { appRouter } from "./routers";

const context = {
  user: null,
  req: {} as never,
  res: {} as never,
} as never;

describe("platform.directory.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("forwards the optional search and category filters to the data layer", async () => {
    vi.mocked(db.listBrands).mockResolvedValue([] as never);
    const caller = appRouter.createCaller(context);

    await expect(caller.platform.directory.list({ query: "laundry", category: "Household", status: "caution" })).resolves.toEqual([]);
    expect(db.listBrands).toHaveBeenCalledWith({ query: "laundry", category: "Household", status: "caution" });
  });

  it("rejects an unsupported public record status before reaching the data layer", async () => {
    const caller = appRouter.createCaller(context);

    await expect(caller.platform.directory.list({ status: "unreviewed" as never })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(db.listBrands).not.toHaveBeenCalled();
  });
});

describe("platform.productCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.consumeRateLimit).mockResolvedValue({ allowed: true, count: 1, resetAt: new Date(Date.now() + 60_000) } as never);
    vi.mocked(db.recordProductSearch).mockResolvedValue(undefined);
  });

  it("forwards a product query and returns the reviewed database match with its direct alternatives", async () => {
    const result = { query: "Kit Kat", matchCount: 1, matched: true, results: [{ listing: { id: 1, productName: "Kit Kat" }, alternatives: [{ name: "Tony's Chocolely" }] }] };
    vi.mocked(db.checkDatabaseProduct).mockResolvedValue(result as never);
    const caller = appRouter.createCaller(context);

    await expect(caller.platform.productCheck({ query: "Kit Kat" })).resolves.toEqual(result);
    expect(db.recordProductSearch).toHaveBeenCalledWith("Kit Kat");
    expect(db.checkDatabaseProduct).toHaveBeenCalledWith({ query: "Kit Kat" });
  });

  it("forwards the updated NIVEA search and returns its direct alternatives without changing the public contract", async () => {
    const result = { query: "NIVEA", verdict: "reviewed_boycott_match", matches: [{ listing: { listedBrand: "Beiersdorf AG", listedSubproduct: "NIVEA (face, lip and body care; sunscreen; deodorants)" }, alternatives: [{ company: "Weleda" }, { company: "Dr. Hauschka" }, { company: "Faith in Nature" }] }] };
    vi.mocked(db.checkDatabaseProduct).mockResolvedValue(result as never);
    const caller = appRouter.createCaller(context);

    await expect(caller.platform.productCheck({ query: "NIVEA" })).resolves.toEqual(result);
    expect(db.checkDatabaseProduct).toHaveBeenCalledWith({ query: "NIVEA" });
  });

  it("forwards an expanded Beiersdorf portfolio search and preserves its direct alternatives", async () => {
    const result = { query: "Eucerin", verdict: "reviewed_boycott_match", matches: [{ listing: { listedBrand: "Beiersdorf AG", listedSubproduct: "Eucerin (dermatological skincare)" }, alternatives: [{ company: "Weleda" }, { company: "Bioderma" }, { company: "Vanicream" }] }] };
    vi.mocked(db.checkDatabaseProduct).mockResolvedValue(result as never);
    const caller = appRouter.createCaller(context);

    await expect(caller.platform.productCheck({ query: "Eucerin" })).resolves.toEqual(result);
    expect(db.checkDatabaseProduct).toHaveBeenCalledWith({ query: "Eucerin" });
  });

  it("preserves the cautious no-match state instead of turning it into a not-boycotted claim", async () => {
    const result = { query: "Unknown drink", matchCount: 0, matched: false, results: [] };
    vi.mocked(db.checkDatabaseProduct).mockResolvedValue(result as never);
    const caller = appRouter.createCaller(context);

    await expect(caller.platform.productCheck({ query: "Unknown drink" })).resolves.toMatchObject({ matched: false, results: [] });
  });

  it("rejects too-short queries before reaching the database search", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.platform.productCheck({ query: "x" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(db.checkDatabaseProduct).not.toHaveBeenCalled();
  });

  it("returns a retryable 429 and skips the product lookup after the public check limit is reached", async () => {
    const setHeader = vi.fn();
    vi.mocked(db.consumeRateLimit).mockResolvedValue({ allowed: false, count: 31, resetAt: new Date(Date.now() + 30_000) } as never);
    const caller = appRouter.createCaller({
      ...context,
      res: { setHeader } as never,
    });

    await expect(caller.platform.productCheck({ query: "Kit Kat" })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });

    expect(setHeader).toHaveBeenCalledWith("Retry-After", expect.any(String));
    expect(db.recordProductSearch).not.toHaveBeenCalled();
    expect(db.checkDatabaseProduct).not.toHaveBeenCalled();
  });
});

const adminContext = {
  user: { id: 1, openId: "admin-user", name: "Admin", email: null, loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: {} as never,
  res: {} as never,
} as never;

describe("platform.admin.createAlternative", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects an invalid source review date before it reaches the data layer", async () => {
    const caller = appRouter.createCaller(adminContext);
    await expect(caller.platform.admin.createAlternative({ brandId: 5, name: "Regional candidate", category: "Homeware", description: "A source-linked candidate alternative with a transparent context.", priceTier: "mid", verificationStatus: "reviewing", sourceUrl: "https://example.org/source", sourceReviewedAt: "August 2026", availabilityNote: "Check local stock and read the source." })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(db.createAlternative).not.toHaveBeenCalled();
  });

  it("forwards regional source context when the administrator supplies valid data", async () => {
    vi.mocked(db.createAlternative).mockResolvedValue(42 as never);
    const caller = appRouter.createCaller(adminContext);
    await expect(caller.platform.admin.createAlternative({ brandId: 5, name: "Regional candidate", category: "Homeware", description: "A source-linked candidate alternative with a transparent context.", priceTier: "mid", region: "United Kingdom", verificationStatus: "reviewing", sourceUrl: "https://example.org/source", sourceReviewedAt: "2026-08-05", availabilityNote: "Check local stock and read the source." })).resolves.toBe(42);
    expect(db.createAlternative).toHaveBeenCalledWith(expect.objectContaining({ region: "United Kingdom", sourceUrl: "https://example.org/source", sourceReviewedAt: "2026-08-05", availabilityNote: "Check local stock and read the source." }));
  });
});
