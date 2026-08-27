import { notifyOwner } from "../_core/notification";
import { TRPCError } from "@trpc/server";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { createPublicClientKey, PUBLIC_REQUEST_POLICIES, retryAfterSeconds } from "../requestControls";
import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

export const platformRouter = router({
  stats: publicProcedure.query(() => db.getPlatformStats()),
  productCheck: publicProcedure.input(z.object({ query: z.string().min(2).max(160) })).query(async ({ ctx, input }) => {
    let limitResult: Awaited<ReturnType<typeof db.consumeRateLimit>>;
    try {
      limitResult = await db.consumeRateLimit({
        ...PUBLIC_REQUEST_POLICIES.productCheck,
        clientKey: createPublicClientKey(ctx.req),
      });
    } catch (error) {
      console.error("[product-check] shared rate-limit check failed", error);
      throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Product checks are temporarily unavailable. Please try again shortly." });
    }
    if (!limitResult.allowed) {
      if (typeof ctx.res.setHeader === "function") {
        ctx.res.setHeader("Retry-After", String(retryAfterSeconds(limitResult.resetAt)));
      }
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many product checks. Please wait a moment and try again." });
    }
    
    await db.recordProductSearch(input.query);
    return db.checkDatabaseProduct(input);
  }),

  directory: router({
    list: publicProcedure
      .input(z.object({ query: z.string().max(120).optional(), category: z.string().max(80).optional(), status: z.enum(["boycotted", "caution", "alternative"]).optional() }))
      .query(({ input }) => db.listBrands(input)),
    detail: publicProcedure.input(z.object({ slug: z.string().min(1).max(180) })).query(({ input }) => db.getBrandBySlug(input.slug)),
    productDetail: publicProcedure.input(z.object({ slug: z.string().min(1).max(200) })).query(({ input }) => db.getProductBySlug(input.slug)),
    featuredProof: publicProcedure.query(() => db.getFeaturedProofLinks()),
    scan: publicProcedure.input(z.object({ barcode: z.string().min(6).max(64) })).query(({ input }) => db.getProductByBarcode(input.barcode)),
    alternatives: publicProcedure
      .input(z.object({ query: z.string().max(120).optional(), category: z.string().max(80).optional(), region: z.string().max(120).optional() }))
      .query(({ input }) => db.listAlternatives(input)),
    rateAlternative: protectedProcedure
      .input(z.object({ alternativeId: z.number().int().positive(), score: z.number().int().min(1).max(5) }))
      .mutation(({ ctx, input }) => db.rateAlternative(input.alternativeId, ctx.user.id, input.score)),
  }),

  news: router({
    list: publicProcedure.input(z.object({ category: z.string().max(80).optional() })).query(({ input }) => db.listArticles(input.category)),
    detail: publicProcedure.input(z.object({ slug: z.string().min(1).max(260) })).query(({ input }) => db.getArticleBySlug(input.slug)),
  }),

  donations: router({
    campaigns: publicProcedure.query(() => db.listActiveCampaigns()),
  }),

  community: router({
    listQuestions: publicProcedure.query(() => db.listCommunityQuestions()),
    detail: publicProcedure.input(z.object({ questionId: z.number().int().positive() })).query(({ input }) => db.getCommunityQuestion(input.questionId)),
    listAnswers: publicProcedure.input(z.object({ questionId: z.number().int().positive() })).query(({ input }) => db.listAnswers(input.questionId)),
    submitQuestion: protectedProcedure
      .input(z.object({ title: z.string().min(8).max(240), body: z.string().min(20).max(5000), category: z.string().min(2).max(80) }))
      .mutation(async ({ ctx, input }) => {
        const questionId = await db.createCommunityQuestion({ ...input, userId: ctx.user.id });
        await notifyOwner({ title: "New community question", content: `A new ${input.category} question is awaiting moderation: ${input.title}` });
        return { questionId, status: "pending" as const };
      }),
    submitAnswer: protectedProcedure
      .input(z.object({ questionId: z.number().int().positive(), body: z.string().min(12).max(5000) }))
      .mutation(async ({ ctx, input }) => {
        const answerId = await db.createCommunityAnswer({ ...input, userId: ctx.user.id });
        await notifyOwner({ title: "New community answer", content: `A community answer was submitted for question #${input.questionId}.` });
        return answerId;
      }),
    toggleAnswerVote: protectedProcedure
      .input(z.object({ answerId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => db.toggleAnswerVote(input.answerId, ctx.user.id)),
  }),

  profile: protectedProcedure.query(({ ctx }) => db.getProfileContributions(ctx.user.id)),

  admin: router({
    overview: adminProcedure.query(() => db.getAdminOverview()),
    createBrand: adminProcedure
      .input(z.object({
        name: z.string().min(2).max(160), slug: z.string().regex(/^[a-z0-9-]+$/).max(180), category: z.string().min(2).max(80),
        status: z.enum(["boycotted", "caution", "alternative"]), parentCompany: z.string().max(160).optional(),
        shortDescription: z.string().min(20).max(2000), verificationSummary: z.string().min(20).max(5000),
        evidenceUrl: optionalUrl, evidenceLabel: z.string().max(180).optional(), impactScore: z.number().int().min(0).max(100), isFeatured: z.boolean(),
      }))
      .mutation(({ input }) => db.createBrand({ ...input, evidenceUrl: input.evidenceUrl || undefined })),
    createArticle: adminProcedure
      .input(z.object({
        title: z.string().min(4).max(240), slug: z.string().regex(/^[a-z0-9-]+$/).max(260), excerpt: z.string().min(20).max(1000), content: z.string().min(50).max(20000),
        category: z.string().min(2).max(80), sourceName: z.string().max(180).optional(), sourceUrl: optionalUrl, status: z.enum(["draft", "published"]),
      }))
      .mutation(({ input }) => db.createArticle({ ...input, sourceUrl: input.sourceUrl || undefined })),
    createProduct: adminProcedure
      .input(z.object({
        brandId: z.number().int().positive().optional(), name: z.string().min(2).max(180), slug: z.string().regex(/^[a-z0-9-]+$/).max(200),
        barcode: z.string().max(64).optional(), category: z.string().min(2).max(80), status: z.enum(["boycotted", "caution", "alternative"]), description: z.string().min(12).max(5000),
      }))
      .mutation(({ input }) => db.createProduct(input)),
    createAlternative: adminProcedure
      .input(z.object({
        brandId: z.number().int().positive(), name: z.string().min(2).max(160), category: z.string().min(2).max(80), description: z.string().min(12).max(5000),
        websiteUrl: optionalUrl, priceTier: z.enum(["value", "mid", "premium"]), region: z.string().max(120).optional(), verificationStatus: z.enum(["verified", "reviewing", "community"]),
        sourceUrl: optionalUrl, sourceReviewedAt: z.string().date().optional(), availabilityNote: z.string().max(2000).optional(),
      }))
      .mutation(({ input }) => db.createAlternative({ ...input, websiteUrl: input.websiteUrl || undefined, sourceUrl: input.sourceUrl || undefined })),
    createCampaign: adminProcedure
      .input(z.object({
        title: z.string().min(4).max(180), slug: z.string().regex(/^[a-z0-9-]+$/).max(200), description: z.string().min(20).max(5000),
        goalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/), urgency: z.enum(["urgent", "active", "ongoing"]),
      }))
      .mutation(({ input }) => db.createCampaign(input)),
    addProof: adminProcedure
      .input(z.object({
        brandId: z.number().int().positive().optional(), productId: z.number().int().positive().optional(), title: z.string().min(4).max(200),
        publisher: z.string().max(160).optional(), url: z.string().url(), sourceType: z.enum(["primary", "reporting", "research", "statement"]),
      }).refine(value => Boolean(value.brandId || value.productId), { message: "A brand or product is required." }))
      .mutation(({ input }) => db.addProofLink(input)),
    moderateQuestion: adminProcedure
      .input(z.object({ questionId: z.number().int().positive(), status: z.enum(["published", "hidden"]) }))
      .mutation(({ input }) => db.setCommunityQuestionStatus(input.questionId, input.status)),
    listQuestions: adminProcedure.query(() => db.listModerationQuestions()),
  }),
});
