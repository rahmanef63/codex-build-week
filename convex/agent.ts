import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { requireUserId } from "./_shared/auth";
import { fail } from "./_shared/errors";

const hash = async (value: string) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))].map((v) => v.toString(16).padStart(2, "0")).join("");
const makeToken = () => `tu_live_${btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")}`;

export const issue = mutation({ args: {}, handler: async (ctx) => { const userId = await requireUserId(ctx); const business = await ctx.db.query("businesses").withIndex("by_business_id", (q) => q.eq("businessId", userId)).unique(); if (!business) fail("BUSINESS_EXISTS", "Buat usaha terlebih dahulu."); const now = Date.now(); for (const item of await ctx.db.query("agentTokens").withIndex("by_business_created", (q) => q.eq("businessId", userId)).take(20)) if (!item.revokedAt) await ctx.db.patch(item._id, { revokedAt: now }); const token = makeToken(); await ctx.db.insert("agentTokens", { businessId: userId, tokenHash: await hash(token), tokenPrefix: token.slice(0, 14), createdAt: now }); return { token }; } });
export const configuration = query({ args: {}, handler: async (ctx) => { const userId = await requireUserId(ctx); const business = await ctx.db.query("businesses").withIndex("by_business_id", (q) => q.eq("businessId", userId)).unique(); if (!business) fail("BUSINESS_EXISTS", "Buat usaha terlebih dahulu."); return { businessName: business.name, serverUrl: process.env.CONVEX_SITE_URL ?? "" }; } });
export const resolve = internalQuery({ args: { token: v.string() }, handler: async (ctx, args) => { const tokenHash = await hash(args.token); const item = await ctx.db.query("agentTokens").withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash)).unique(); return item && !item.revokedAt ? { businessId: item.businessId } : null; } });
