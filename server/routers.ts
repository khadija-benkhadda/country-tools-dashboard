import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { fetchAddresses, fetchDocuments, fetchPlaces, fetchTrends, generatedTextSource } from "./liveData";

const requestSchema = z.object({
  countryCode: z.string().min(2).max(3).optional(),
  countryName: z.string().min(1).max(120).optional(),
  count: z.number().int().min(1).max(1000).default(100),
  category: z.string().max(80).default("All"),
  placeType: z.string().max(80).default("Random"),
  topic: z.string().max(120).default("marketing"),
  contentType: z.string().max(80).default("Guide"),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  live: router({
    trends: publicProcedure.input(requestSchema).query(async ({ input }) => {
      if (!input.countryCode) throw new Error("countryCode is required");
      return fetchTrends(input.countryCode, input.count, input.category);
    }),
    addresses: publicProcedure.input(requestSchema).query(async ({ input }) => {
      if (!input.countryName) throw new Error("countryName is required");
      return fetchAddresses(input.countryName, input.count);
    }),
    places: publicProcedure.input(requestSchema).query(async ({ input }) => {
      if (!input.countryName) throw new Error("countryName is required");
      return fetchPlaces(input.countryName, input.placeType, input.count);
    }),
    documents: publicProcedure.input(requestSchema).query(async ({ input }) => fetchDocuments(input.topic, input.count, input.contentType)),
    textSource: publicProcedure.input(z.object({ kind: z.string().min(1).max(40) })).query(({ input }) => generatedTextSource(input.kind)),
  }),
});

export type AppRouter = typeof appRouter;
