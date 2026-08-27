import {
  boolean,
  decimal,
  int,
  index,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  category: varchar("category", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["boycotted", "caution", "alternative"]).notNull(),
  parentCompany: varchar("parentCompany", { length: 160 }),
  shortDescription: text("shortDescription").notNull(),
  verificationSummary: text("verificationSummary").notNull(),
  evidenceUrl: varchar("evidenceUrl", { length: 512 }),
  evidenceLabel: varchar("evidenceLabel", { length: 180 }),
  impactScore: int("impactScore").default(0).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  brandId: int("brandId"),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  barcode: varchar("barcode", { length: 64 }),
  category: varchar("category", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["boycotted", "caution", "alternative"]).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const productSearchEvents = mysqlTable(
  "productSearchEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    normalizedQuery: varchar("normalizedQuery", { length: 160 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    createdAtIndex: index("product_search_events_created_at_idx").on(table.createdAt),
    queryCreatedAtIndex: index("product_search_events_query_created_at_idx").on(table.normalizedQuery, table.createdAt),
  }),
);

// These counters deliberately store a scoped HMAC-derived client key rather
// than a raw IP address. They are used only to protect public endpoints from
// automated abuse and are pruned after their short retention window.
export const requestRateLimits = mysqlTable(
  "requestRateLimits",
  {
    id: int("id").autoincrement().primaryKey(),
    scope: varchar("scope", { length: 48 }).notNull(),
    clientKey: varchar("clientKey", { length: 64 }).notNull(),
    requestCount: int("requestCount").default(0).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    scopeClientUnique: uniqueIndex("request_rate_limit_scope_client_unique").on(table.scope, table.clientKey),
    expiresAtIndex: index("request_rate_limit_expires_at_idx").on(table.expiresAt),
  }),
);

// A short database-backed lease prevents one visitor from opening multiple
// simultaneous model streams across autoscaled application instances.
export const assistantStreamLeases = mysqlTable(
  "assistantStreamLeases",
  {
    id: int("id").autoincrement().primaryKey(),
    clientKey: varchar("clientKey", { length: 64 }).notNull(),
    leaseToken: varchar("leaseToken", { length: 64 }).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    clientKeyUnique: uniqueIndex("assistant_stream_lease_client_unique").on(table.clientKey),
    expiresAtIndex: index("assistant_stream_lease_expires_at_idx").on(table.expiresAt),
  }),
);

export const boycottListings = mysqlTable(
  "boycottListings",
  {
    id: int("id").autoincrement().primaryKey(),
    workbookRow: int("workbookRow").notNull(),
    category: varchar("category", { length: 120 }).notNull(),
    listedBrand: varchar("listedBrand", { length: 200 }).notNull(),
    listedSubproduct: varchar("listedSubproduct", { length: 500 }).notNull(),
    impactOnSource: varchar("impactOnSource", { length: 80 }).notNull(),
    countryShown: varchar("countryShown", { length: 160 }),
    notes: text("notes"),
    sourceUrl: varchar("sourceUrl", { length: 512 }).notNull(),
    sourceLabel: varchar("sourceLabel", { length: 220 }).notNull(),
    sourceReviewedAt: timestamp("sourceReviewedAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ workbookRowUnique: uniqueIndex("boycott_listing_workbook_row_unique").on(table.workbookRow) }),
);

export const boycottListingAlternatives = mysqlTable("boycottListingAlternatives", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  position: int("position").notNull(),
  company: varchar("company", { length: 200 }).notNull(),
  productService: varchar("productService", { length: 500 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 512 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const proofLinks = mysqlTable("proofLinks", {
  id: int("id").autoincrement().primaryKey(),
  brandId: int("brandId"),
  productId: int("productId"),
  title: varchar("title", { length: 200 }).notNull(),
  publisher: varchar("publisher", { length: 160 }),
  url: varchar("url", { length: 512 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["primary", "reporting", "research", "statement"]).default("reporting").notNull(),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userContributions = mysqlTable("userContributions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contributionType: mysqlEnum("contributionType", ["question", "answer", "donation"]).notNull(),
  entityId: int("entityId"),
  label: varchar("label", { length: 240 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const alternatives = mysqlTable("alternatives", {
  id: int("id").autoincrement().primaryKey(),
  brandId: int("brandId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  description: text("description").notNull(),
  websiteUrl: varchar("websiteUrl", { length: 512 }),
  priceTier: mysqlEnum("priceTier", ["value", "mid", "premium"]).default("mid").notNull(),
  region: varchar("region", { length: 120 }),
  verificationStatus: mysqlEnum("verificationStatus", ["verified", "reviewing", "community"]).default("reviewing").notNull(),
  endorsementCount: int("endorsementCount").default(0).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  sourceReviewedAt: timestamp("sourceReviewedAt"),
  availabilityNote: text("availabilityNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const alternativeRatings = mysqlTable(
  "alternativeRatings",
  {
    id: int("id").autoincrement().primaryKey(),
    alternativeId: int("alternativeId").notNull(),
    userId: int("userId").notNull(),
    score: int("score").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ uniqueAlternativeRating: uniqueIndex("alternative_rating_user_unique").on(table.alternativeId, table.userId) }),
);

export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 240 }).notNull(),
  slug: varchar("slug", { length: 260 }).notNull().unique(),
  externalKey: varchar("externalKey", { length: 80 }).unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  sourceName: varchar("sourceName", { length: 180 }),
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const newsRefreshState = mysqlTable("news_refresh_state", {
  id: int("id").primaryKey(),
  cronTaskUid: varchar("cronTaskUid", { length: 65 }).unique(),
  lastRefreshedAt: timestamp("lastRefreshedAt"),
  lastStatus: varchar("lastStatus", { length: 40 }),
  lastImportedCount: int("lastImportedCount").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description").notNull(),
  goalAmount: decimal("goalAmount", { precision: 12, scale: 2 }).notNull(),
  raisedAmount: decimal("raisedAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 8 }).default("USD").notNull(),
  urgency: mysqlEnum("urgency", ["urgent", "active", "ongoing"]).default("active").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  userId: int("userId"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("USD").notNull(),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "refunded"]).default("pending").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const communityQuestions = mysqlTable("communityQuestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  body: text("body").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["pending", "published", "hidden"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const communityAnswers = mysqlTable("communityAnswers", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(),
  userId: int("userId").notNull(),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["published", "hidden"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const answerVotes = mysqlTable(
  "answerVotes",
  {
    id: int("id").autoincrement().primaryKey(),
    answerId: int("answerId").notNull(),
    userId: int("userId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ uniqueAnswerVote: uniqueIndex("answer_user_unique").on(table.answerId, table.userId) }),
);

export const adminAuditLogs = mysqlTable("adminAuditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 160 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: int("entityId"),
  detail: text("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Brand = typeof brands.$inferSelect;
export type Alternative = typeof alternatives.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProofLink = typeof proofLinks.$inferSelect;
export type BoycottListing = typeof boycottListings.$inferSelect;
