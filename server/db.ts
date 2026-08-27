import { and, asc, desc, eq, gte, inArray, like, lt, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  alternatives,
  alternativeRatings,
  assistantStreamLeases,
  answerVotes,
  articles,
  boycottListingAlternatives,
  boycottListings,
  brands,
  campaigns,
  communityAnswers,
  communityQuestions,
  donations,
  InsertUser,
  newsRefreshState,
  proofLinks,
  products,
  productSearchEvents,
  requestRateLimits,
  userContributions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

let lastRateLimitPruneAt = 0;
let lastAssistantLeasePruneAt = 0;

/**
 * Counts a client request in a MySQL-backed fixed window. The unique row is
 * shared by every autoscaled application instance, unlike process memory.
 */
export async function consumeRateLimit(input: { scope: string; clientKey: string; limit: number; windowMs: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database-backed request controls are unavailable.");

  const now = new Date();
  const resetAt = new Date(now.getTime() + input.windowMs);
  await db.delete(requestRateLimits).where(and(
    eq(requestRateLimits.scope, input.scope),
    eq(requestRateLimits.clientKey, input.clientKey),
    lt(requestRateLimits.expiresAt, now),
  ));

  // Opportunistic pruning keeps the short-lived counter table bounded without
  // a separate worker. It does not affect rate-limit correctness.
  if (now.getTime() - lastRateLimitPruneAt > 300_000) {
    lastRateLimitPruneAt = now.getTime();
    await db.delete(requestRateLimits).where(lt(requestRateLimits.expiresAt, now));
  }

  await db.insert(requestRateLimits).values({
    scope: input.scope,
    clientKey: input.clientKey,
    requestCount: 1,
    expiresAt: resetAt,
  }).onDuplicateKeyUpdate({
    set: { requestCount: sql`${requestRateLimits.requestCount} + 1` },
  });

  const rows = await db.select({ count: requestRateLimits.requestCount, resetAt: requestRateLimits.expiresAt })
    .from(requestRateLimits)
    .where(and(eq(requestRateLimits.scope, input.scope), eq(requestRateLimits.clientKey, input.clientKey)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new Error("Rate-limit counter could not be read.");

  return {
    allowed: Number(row.count) <= input.limit,
    count: Number(row.count),
    resetAt: row.resetAt,
  };
}

export async function acquireAssistantStreamLease(input: { clientKey: string; leaseToken: string; leaseMs: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database-backed request controls are unavailable.");

  const now = new Date();
  await db.delete(assistantStreamLeases).where(and(
    eq(assistantStreamLeases.clientKey, input.clientKey),
    lt(assistantStreamLeases.expiresAt, now),
  ));
  if (now.getTime() - lastAssistantLeasePruneAt > 300_000) {
    lastAssistantLeasePruneAt = now.getTime();
    await db.delete(assistantStreamLeases).where(lt(assistantStreamLeases.expiresAt, now));
  }

  try {
    await db.insert(assistantStreamLeases).values({
      clientKey: input.clientKey,
      leaseToken: input.leaseToken,
      expiresAt: new Date(now.getTime() + input.leaseMs),
    });
    return true;
  } catch (error) {
    const driverCode = (error as { code?: string; cause?: { code?: string } }).code
      ?? (error as { cause?: { code?: string } }).cause?.code;
    if (driverCode === "ER_DUP_ENTRY") return false;
    throw error;
  }
}

export async function releaseAssistantStreamLease(input: { clientKey: string; leaseToken: string }) {
  const db = await getDb();
  if (!db) return;
  await db.delete(assistantStreamLeases).where(and(
    eq(assistantStreamLeases.clientKey, input.clientKey),
    eq(assistantStreamLeases.leaseToken, input.leaseToken),
  ));
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return { products: 0, alternatives: 0, members: 0 };
  const [products, alternativeCount, members] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(brands),
    db.select({ count: sql<number>`count(*)` }).from(alternatives),
    db.select({ count: sql<number>`count(*)` }).from(users),
  ]);
  return {
    products: Number(products[0]?.count ?? 0),
    alternatives: Number(alternativeCount[0]?.count ?? 0),
    members: Number(members[0]?.count ?? 0),
  };
}

export async function listBrands(params: { query?: string; category?: string; status?: "boycotted" | "caution" | "alternative" }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (params.query) {
    const pattern = `%${params.query}%`;
    conditions.push(or(like(brands.name, pattern), like(brands.parentCompany, pattern), like(brands.category, pattern)));
  }
  if (params.category && params.category !== "all") conditions.push(eq(brands.category, params.category));
  if (params.status) conditions.push(eq(brands.status, params.status));
  return db.select().from(brands).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(brands.isFeatured), desc(brands.updatedAt));
}

export async function getBrandBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
  const brand = result[0];
  if (!brand) return undefined;
  const [relatedAlternatives, brandProducts] = await Promise.all([
    getAlternativesWithRatings({ brandId: brand.id }),
    db.select().from(products).where(eq(products.brandId, brand.id)).orderBy(desc(products.updatedAt)),
  ]);
  const citations = await db.select().from(proofLinks).where(eq(proofLinks.brandId, brand.id)).orderBy(desc(proofLinks.reviewedAt));
  return { brand, alternatives: relatedAlternatives, products: brandProducts, citations };
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const productRows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  const product = productRows[0];
  if (!product) return undefined;
  const [citations, brandRows] = await Promise.all([
    db.select().from(proofLinks).where(eq(proofLinks.productId, product.id)).orderBy(desc(proofLinks.reviewedAt)),
    product.brandId ? db.select().from(brands).where(eq(brands.id, product.brandId)).limit(1) : Promise.resolve([]),
  ]);
  const brand = brandRows[0];
  const relatedAlternatives = brand ? await getAlternativesWithRatings({ brandId: brand.id }) : [];
  return { product, brand, citations, alternatives: relatedAlternatives };
}

export async function checkReviewedProduct(input: { query: string; region?: string }) {
  const db = await getDb();
  const query = input.query.trim();
  const source = {
    name: "Ireland Palestine Solidarity Campaign consumer boycott guidance",
    url: "https://www.ipsc.ie/campaigns/consumer-boycott",
    caveat: "This is a match against reviewed IPSC-referenced entries. IPSC describes its list as non-exhaustive, so no reviewed match is not confirmation that a product is not boycotted.",
  };
  if (!db || !query) return { query, verdict: "no_reviewed_match" as const, matches: [], alternatives: [], source };
  const pattern = `%${query}%`;
  const [brandMatches, productMatches] = await Promise.all([
    db.select().from(brands).where(or(like(brands.name, pattern), like(brands.parentCompany, pattern))).orderBy(desc(brands.updatedAt)),
    db.select({ product: products, brand: brands }).from(products).leftJoin(brands, eq(products.brandId, brands.id)).where(like(products.name, pattern)).orderBy(desc(products.updatedAt)),
  ]);
  const matches = [
    ...brandMatches.map(brand => ({ kind: "brand" as const, name: brand.name, slug: brand.slug, status: brand.status, category: brand.category, summary: brand.verificationSummary, evidenceUrl: brand.evidenceUrl, evidenceLabel: brand.evidenceLabel, updatedAt: brand.updatedAt, brandId: brand.id })),
    ...productMatches.map(({ product, brand }) => ({ kind: "product" as const, name: product.name, slug: product.slug, status: product.status, category: product.category, summary: product.description, evidenceUrl: brand?.evidenceUrl, evidenceLabel: brand?.evidenceLabel, updatedAt: product.updatedAt, brandId: brand?.id })),
  ];
  const brandIds = Array.from(new Set(matches.map(match => match.brandId).filter((id): id is number => Boolean(id))));
  const alternativesForMatches = brandIds.length ? await getAlternativesWithRatings({ brandIds, region: input.region }) : [];
  return { query, verdict: matches.length ? "reviewed_match" as const : "no_reviewed_match" as const, matches, alternatives: alternativesForMatches, source };
}

function normalizeDatabaseSearch(value: string) {
  return value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export async function recordProductSearch(query: string) {
  const normalizedQuery = normalizeDatabaseSearch(query).slice(0, 160);
  if (normalizedQuery.length < 2) return;

  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(productSearchEvents).values({ normalizedQuery });
  } catch (error) {
    // Analytics must never interrupt a public product check.
    console.warn("[Analytics] Unable to record product search", error);
  }
}

export async function getProductSearchAnalytics(input: { startDate: string; endDate: string }) {
  const db = await getDb();
  const empty = { totalSearches: 0, uniqueQueries: 0, dailySearches: [] as Array<{ date: string; count: number }>, mostSearched: [] as Array<{ query: string; count: number }>, leastSearched: [] as Array<{ query: string; count: number }> };
  if (!db) return empty;

  const start = new Date(`${input.startDate}T00:00:00.000Z`);
  const endExclusive = new Date(`${input.endDate}T00:00:00.000Z`);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  const period = and(gte(productSearchEvents.createdAt, start), lt(productSearchEvents.createdAt, endExclusive));
  const countExpression = sql<number>`count(*)`;
  const uniqueExpression = sql<number>`count(distinct ${productSearchEvents.normalizedQuery})`;
  // Keep the grouped expression byte-for-byte identical for MySQL only_full_group_by mode.
  const dateExpression = sql<string>`date(\`createdAt\`)`;

  const [totalRows, uniqueRows, dailyRows, mostRows, leastRows] = await Promise.all([
    db.select({ count: countExpression }).from(productSearchEvents).where(period),
    db.select({ count: uniqueExpression }).from(productSearchEvents).where(period),
    db.select({ date: dateExpression, count: countExpression }).from(productSearchEvents).where(period).groupBy(dateExpression).orderBy(asc(dateExpression)),
    db.select({ query: productSearchEvents.normalizedQuery, count: countExpression }).from(productSearchEvents).where(period).groupBy(productSearchEvents.normalizedQuery).orderBy(desc(countExpression), asc(productSearchEvents.normalizedQuery)).limit(8),
    db.select({ query: productSearchEvents.normalizedQuery, count: countExpression }).from(productSearchEvents).where(period).groupBy(productSearchEvents.normalizedQuery).orderBy(asc(countExpression), asc(productSearchEvents.normalizedQuery)).limit(8),
  ]);

  return {
    totalSearches: Number(totalRows[0]?.count ?? 0),
    uniqueQueries: Number(uniqueRows[0]?.count ?? 0),
    dailySearches: dailyRows.map(row => ({ date: String(row.date), count: Number(row.count) })),
    mostSearched: mostRows.map(row => ({ query: row.query, count: Number(row.count) })),
    leastSearched: leastRows.map(row => ({ query: row.query, count: Number(row.count) })),
  };
}

export async function getProductSearchExport(input: { startDate: string; endDate: string }) {
  const db = await getDb();
  if (!db) return [] as Array<{ query: string; count: number }>;

  const start = new Date(`${input.startDate}T00:00:00.000Z`);
  const endExclusive = new Date(`${input.endDate}T00:00:00.000Z`);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  const period = and(gte(productSearchEvents.createdAt, start), lt(productSearchEvents.createdAt, endExclusive));
  const countExpression = sql<number>`count(*)`;
  const rows = await db
    .select({ query: productSearchEvents.normalizedQuery, count: countExpression })
    .from(productSearchEvents)
    .where(period)
    .groupBy(productSearchEvents.normalizedQuery)
    .orderBy(desc(countExpression), asc(productSearchEvents.normalizedQuery));

  return rows.map(row => ({ query: row.query, count: Number(row.count) }));
}

function matchesDatabaseListing(query: string, listing: { listedBrand: string; listedSubproduct: string }) {
  const normalizedQuery = normalizeDatabaseSearch(query);
  if (!normalizedQuery) return false;
  const queryTerms = new Set(normalizedQuery.split(" ").filter(term => term.length > 2));
  return [listing.listedBrand, listing.listedSubproduct].some(value => {
    const candidate = normalizeDatabaseSearch(value);
    if (candidate.includes(normalizedQuery) || normalizedQuery.includes(candidate)) return true;
    return candidate.split(" ").filter(term => term.length > 3).some(term => queryTerms.has(term));
  });
}

export async function checkDatabaseProduct(input: { query: string }) {
  const db = await getDb();
  const query = input.query.trim();
  const source = {
    name: "Boycott-list guidance and related alternatives",
    url: "https://boycott-israel.org/boycott.html",
    reviewedAt: "2026-08-14",
    caveat: "A result means the search matches an item on the boycott list. A missing result means the product is not currently on this list; it is not a general endorsement or assurance.",
  };
  if (!db || !query) return { query, verdict: "unreviewed" as const, matches: [], source };
  const listings = await db.select().from(boycottListings);
  const matches = listings.filter(listing => matchesDatabaseListing(query, listing)).slice(0, 8);
  if (!matches.length) return { query, verdict: "unreviewed" as const, matches: [], source };
  const alternatives = await db.select().from(boycottListingAlternatives);
  return {
    query,
    verdict: "reviewed_boycott_match" as const,
    source,
    matches: matches.map(listing => ({
      ...listing,
      alternatives: alternatives.filter(alternative => alternative.listingId === listing.id).sort((left, right) => left.position - right.position),
    })),
  };
}

export async function getFeaturedProofLinks() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ citation: proofLinks, brand: brands })
    .from(proofLinks)
    .leftJoin(brands, eq(proofLinks.brandId, brands.id))
    .orderBy(desc(proofLinks.reviewedAt))
    .limit(3);
}

async function getAlternativesWithRatings(params: { query?: string; category?: string; brandId?: number; brandIds?: number[]; region?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (params.query) {
    const pattern = `%${params.query}%`;
    conditions.push(or(like(alternatives.name, pattern), like(alternatives.description, pattern), like(alternatives.category, pattern)));
  }
  if (params.category && params.category !== "all") conditions.push(eq(alternatives.category, params.category));
  if (params.brandId) conditions.push(eq(alternatives.brandId, params.brandId));
  if (params.brandIds?.length) conditions.push(or(...params.brandIds.map(id => eq(alternatives.brandId, id))));
  if (params.region && params.region !== "All regions") conditions.push(or(eq(alternatives.region, params.region), eq(alternatives.region, "Global")));
  const rows = await db.select().from(alternatives).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(alternatives.endorsementCount), desc(alternatives.createdAt));
  return Promise.all(rows.map(async alternative => {
    const summary = await db.select({ averageRating: sql<number>`coalesce(avg(${alternativeRatings.score}), 0)`, ratingCount: sql<number>`count(*)` }).from(alternativeRatings).where(eq(alternativeRatings.alternativeId, alternative.id));
    return { ...alternative, averageRating: Number(summary[0]?.averageRating ?? 0), ratingCount: Number(summary[0]?.ratingCount ?? 0) };
  }));
}

export async function listAlternatives(params: { query?: string; category?: string; region?: string }) {
  return getAlternativesWithRatings(params);
}

export async function rateAlternative(alternativeId: number, userId: number, score: number) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  await db.insert(alternativeRatings).values({ alternativeId, userId, score }).onDuplicateKeyUpdate({ set: { score, updatedAt: new Date() } });
}

export async function listArticles(category?: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).where(category && category !== "all" ? and(eq(articles.status, "published"), eq(articles.category, category)) : eq(articles.status, "published")).orderBy(desc(articles.publishedAt));
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(articles).where(and(eq(articles.slug, slug), eq(articles.status, "published"))).limit(1);
  return result[0];
}

export async function upsertFocusedNewsArticle(input: {
  externalKey: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  await db.insert(articles).values({ ...input, status: "published" }).onDuplicateKeyUpdate({
    set: {
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      sourceName: input.sourceName,
      sourceUrl: input.sourceUrl,
      publishedAt: input.publishedAt,
      updatedAt: new Date(),
    },
  });
}

export async function listFocusedNewsArticlesForScopeReview() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: articles.id, title: articles.title, excerpt: articles.excerpt, sourceName: articles.sourceName }).from(articles).where(eq(articles.category, "Conflict update")).orderBy(desc(articles.publishedAt));
}

export async function removeFocusedNewsArticles(ids: number[]) {
  const db = await getDb();
  if (!db || !ids.length) return 0;
  await db.delete(articles).where(inArray(articles.id, ids));
  return ids.length;
}

export async function updateFocusedNewsRefreshState(input: {
  cronTaskUid?: string | null;
  lastStatus: string;
  lastImportedCount: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  await db.insert(newsRefreshState).values({
    id: 1,
    cronTaskUid: input.cronTaskUid ?? null,
    lastStatus: input.lastStatus,
    lastImportedCount: input.lastImportedCount,
    lastRefreshedAt: new Date(),
  }).onDuplicateKeyUpdate({
    set: {
      ...(input.cronTaskUid ? { cronTaskUid: input.cronTaskUid } : {}),
      lastStatus: input.lastStatus,
      lastImportedCount: input.lastImportedCount,
      lastRefreshedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function isFocusedNewsRefreshTask(taskUid: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select({ id: newsRefreshState.id }).from(newsRefreshState).where(eq(newsRefreshState.cronTaskUid, taskUid)).limit(1);
  return result.length > 0;
}

export async function listActiveCampaigns() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).where(eq(campaigns.isActive, true)).orderBy(desc(campaigns.createdAt));
}

export async function listCommunityQuestions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(communityQuestions).where(eq(communityQuestions.status, "published")).orderBy(desc(communityQuestions.createdAt));
}

export async function getCommunityQuestion(questionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(communityQuestions).where(and(eq(communityQuestions.id, questionId), eq(communityQuestions.status, "published"))).limit(1);
  return rows[0];
}

export async function listModerationQuestions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(communityQuestions).orderBy(desc(communityQuestions.createdAt)).limit(80);
}

export async function createCommunityQuestion(input: { userId: number; title: string; body: string; category: string }) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  const result = await db.insert(communityQuestions).values({ ...input, status: "pending" });
  const id = Number(result[0].insertId);
  await db.insert(userContributions).values({ userId: input.userId, contributionType: "question", entityId: id, label: input.title });
  return id;
}

export async function listAnswers(questionId: number) {
  const db = await getDb();
  if (!db) return [];
  const answerRows = await db.select().from(communityAnswers).where(and(eq(communityAnswers.questionId, questionId), eq(communityAnswers.status, "published"))).orderBy(desc(communityAnswers.createdAt));
  const results = await Promise.all(answerRows.map(async answer => {
    const votes = await db.select({ count: sql<number>`count(*)` }).from(answerVotes).where(eq(answerVotes.answerId, answer.id));
    return { ...answer, votes: Number(votes[0]?.count ?? 0) };
  }));
  return results;
}

export async function createCommunityAnswer(input: { questionId: number; userId: number; body: string }) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  const result = await db.insert(communityAnswers).values(input);
  const id = Number(result[0].insertId);
  await db.insert(userContributions).values({ userId: input.userId, contributionType: "answer", entityId: id, label: "Community answer" });
  return id;
}

export async function toggleAnswerVote(answerId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  const existing = await db.select().from(answerVotes).where(and(eq(answerVotes.answerId, answerId), eq(answerVotes.userId, userId))).limit(1);
  if (existing[0]) {
    await db.delete(answerVotes).where(eq(answerVotes.id, existing[0].id));
    return false;
  }
  await db.insert(answerVotes).values({ answerId, userId });
  return true;
}

export async function getProfileContributions(userId: number) {
  const db = await getDb();
  if (!db) return { questions: [], answers: [], donations: [], timeline: [] };
  const [questions, answers, donationRows, timeline] = await Promise.all([
    db.select().from(communityQuestions).where(eq(communityQuestions.userId, userId)).orderBy(desc(communityQuestions.createdAt)),
    db.select().from(communityAnswers).where(eq(communityAnswers.userId, userId)).orderBy(desc(communityAnswers.createdAt)),
    db.select().from(donations).where(eq(donations.userId, userId)).orderBy(desc(donations.createdAt)),
    db.select().from(userContributions).where(eq(userContributions.userId, userId)).orderBy(desc(userContributions.createdAt)),
  ]);
  return { questions, answers, donations: donationRows, timeline };
}

export async function getAdminOverview() {
  const db = await getDb();
  if (!db) return { products: 0, articles: 0, pendingQuestions: 0, donations: 0 };
  const [productRows, articleRows, questionRows, donationRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(brands),
    db.select({ count: sql<number>`count(*)` }).from(articles),
    db.select({ count: sql<number>`count(*)` }).from(communityQuestions).where(eq(communityQuestions.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(donations).where(eq(donations.status, "succeeded")),
  ]);
  return { products: Number(productRows[0]?.count ?? 0), articles: Number(articleRows[0]?.count ?? 0), pendingQuestions: Number(questionRows[0]?.count ?? 0), donations: Number(donationRows[0]?.count ?? 0) };
}

export async function createBrand(input: {
  name: string;
  slug: string;
  category: string;
  status: "boycotted" | "caution" | "alternative";
  parentCompany?: string;
  shortDescription: string;
  verificationSummary: string;
  evidenceUrl?: string;
  evidenceLabel?: string;
  impactScore: number;
  isFeatured: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  const result = await db.insert(brands).values(input);
  return Number(result[0].insertId);
}

export async function createProduct(input: {
  brandId?: number;
  name: string;
  slug: string;
  barcode?: string;
  category: string;
  status: "boycotted" | "caution" | "alternative";
  description: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  const result = await db.insert(products).values(input);
  return Number(result[0].insertId);
}

export async function createAlternative(input: {
  brandId: number;
  name: string;
  category: string;
  description: string;
  websiteUrl?: string;
  priceTier: "value" | "mid" | "premium";
  region?: string;
  verificationStatus: "verified" | "reviewing" | "community";
  sourceUrl?: string;
  sourceReviewedAt?: string;
  availabilityNote?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  const { sourceReviewedAt, ...values } = input;
  const result = await db.insert(alternatives).values({ ...values, sourceReviewedAt: sourceReviewedAt ? new Date(`${sourceReviewedAt}T00:00:00.000Z`) : null });
  return Number(result[0].insertId);
}

export async function createCampaign(input: {
  title: string;
  slug: string;
  description: string;
  goalAmount: string;
  urgency: "urgent" | "active" | "ongoing";
}) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  const result = await db.insert(campaigns).values({ ...input, raisedAmount: "0", currency: "USD", isActive: true });
  return Number(result[0].insertId);
}

export async function addProofLink(input: {
  brandId?: number;
  productId?: number;
  title: string;
  publisher?: string;
  url: string;
  sourceType: "primary" | "reporting" | "research" | "statement";
}) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  const result = await db.insert(proofLinks).values({ ...input, reviewedAt: new Date() });
  return Number(result[0].insertId);
}

export async function getProductByBarcode(barcode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.barcode, barcode)).limit(1);
  return result[0];
}

export async function createArticle(input: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  sourceName?: string;
  sourceUrl?: string;
  status: "draft" | "published";
}) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  const result = await db.insert(articles).values({
    ...input,
    publishedAt: input.status === "published" ? new Date() : null,
  });
  return Number(result[0].insertId);
}

export async function setCommunityQuestionStatus(questionId: number, status: "published" | "hidden") {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable. Please try again shortly.");
  await db.update(communityQuestions).set({ status }).where(eq(communityQuestions.id, questionId));
}
