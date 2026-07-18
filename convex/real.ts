import { v } from "convex/values";
import { optionalUserId, requireUserId } from "./_shared/auth";
import { fail } from "./_shared/errors";
import { logError } from "./_shared/log";
import { mutation, query } from "./_generated/server";
import { readDashboard } from "./business";

// Mode Real: setiap user memiliki satu usaha; businessId = userId sehingga
// data user terpisah total dari data demo Bu Sari.
//
// Dormant by design (AGENTS.md P0 mode boundary): no UI currently calls
// these functions. slices/real-dashboard renders advisory/"not connected"
// copy only. Do not wire this up to the frontend without a genuine human
// sign-off recorded outside any agent's own commit trail — a prior "Approved
// pivot" note self-authored by the same session that shipped the code was
// reverted for exactly this reason. Kept here, tested, as baseline
// @convex-dev/auth infra per the rr STACK baseline requirement.
export const dashboard = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await optionalUserId(ctx);
      if (!userId) return null;
      const data = await readDashboard(ctx, userId);
      if (!data.business) return { business: null };
      return data;
    } catch (error) {
      logError("real:dashboard", error);
      throw error;
    }
  },
});

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "produk";

export const createBusiness = mutation({
  args: {
    name: v.string(),
    products: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
        stock: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    try {
      const userId = await requireUserId(ctx);
      if (args.products.length > 50) {
        fail("TOO_MANY_PRODUCTS", "Maksimal 50 produk saat pendaftaran.");
      }
      const name = args.name.trim();
      if (!name) {
        fail("INVALID_NAME", "Nama usaha wajib diisi.");
      }
      const existing = await ctx.db
        .query("businesses")
        .withIndex("by_business_id", (q) => q.eq("businessId", userId))
        .unique();
      if (existing) {
        fail("BUSINESS_EXISTS", "Usaha Anda sudah terdaftar.");
      }
      await ctx.db.insert("businesses", {
        businessId: userId,
        name,
        currency: "IDR",
        timezone: "Asia/Jakarta",
      });
      const slugs = new Set<string>();
      let sortOrder = 0;
      for (const product of args.products) {
        const productName = product.name.trim();
        if (!productName || !Number.isFinite(product.price) || product.price < 0) continue;
        let slug = slugify(productName);
        while (slugs.has(slug)) slug = `${slug}-${sortOrder}`;
        slugs.add(slug);
        await ctx.db.insert("products", {
          businessId: userId,
          slug,
          name: productName,
          price: Math.round(product.price),
          stock: Math.max(0, Math.round(product.stock)),
          lowStockThreshold: 5,
          sortOrder: sortOrder++,
        });
      }
      return { ok: true };
    } catch (error) {
      logError("real:createBusiness", error);
      throw error;
    }
  },
});
