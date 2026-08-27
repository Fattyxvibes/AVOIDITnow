import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { ENV } from "../_core/env";
import { protectedProcedure, router } from "../_core/trpc";

const DASHBOARD_OWNER_EMAIL = ENV.dashboardOwnerEmail;

const dashboardOwnerProcedure = protectedProcedure.use(({ ctx, next }) => {
  const email = ctx.user.email?.trim().toLowerCase();
  if (email !== DASHBOARD_OWNER_EMAIL) {
    throw new TRPCError({ code: "FORBIDDEN", message: "This dashboard is private." });
  }
  return next({ ctx });
});

const dateRangeSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
}).refine(value => value.startDate <= value.endDate, {
  message: "The start date must be on or before the end date.",
});

export const dashboardRouter = router({
  searchAnalytics: dashboardOwnerProcedure
    .input(dateRangeSchema)
    .query(({ input }) => db.getProductSearchAnalytics(input)),
  exportSearchAnalytics: dashboardOwnerProcedure
    .input(dateRangeSchema)
    .query(({ input }) => db.getProductSearchExport(input)),
});

export { DASHBOARD_OWNER_EMAIL };
