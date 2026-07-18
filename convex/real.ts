import { getAuthUserId } from "@convex-dev/auth/server";
import { mutationGeneric, queryGeneric } from "convex/server";
import { ConvexError, v } from "convex/values";
import { readDashboard } from "./business";

// Mode Real: setiap user memiliki satu usaha; businessId = userId sehingga
// data user terpisah total dari data demo Bu Sari.
export const dashboard = queryGeneric({
  args: {},
  handler: async (ctx: any) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const data = await readDashboard(ctx, userId);
    if (!data.business) return { business: null };
    return data;
  },
});

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "produk";

export const createBusiness = mutationGeneric({
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
  handler: async (ctx: any, args: { name: string; products: Array<{ name: string; price: number; stock: number }> }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Masuk terlebih dahulu." });
    }
    if (args.products.length > 50) {
      throw new ConvexError({ code: "TOO_MANY_PRODUCTS", message: "Maksimal 50 produk saat pendaftaran." });
    }
    const name = args.name.trim();
    if (!name) {
      throw new ConvexError({ code: "INVALID_NAME", message: "Nama usaha wajib diisi." });
    }
    const existing = await ctx.db
      .query("businesses")
      .withIndex("by_business_id", (q: any) => q.eq("businessId", userId))
      .unique();
    if (existing) {
      throw new ConvexError({ code: "BUSINESS_EXISTS", message: "Usaha Anda sudah terdaftar." });
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
  },
});
