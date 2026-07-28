import { v } from "convex/values";
import { optionalUserId, requireUserId } from "./_shared/auth";
import { fail } from "./_shared/errors";
import { logError } from "./_shared/log";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { readDashboard } from "./business";

// Mode Real: setiap user memiliki satu usaha; businessId = userId sehingga
// data user terpisah total dari data demo Bu Sari.
// Live per owner sign-off 2026-07-18 (recorded in AGENTS.md, given directly
// by the owner in an interactive session, outside any agent commit trail).
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

const logChange = (ctx: MutationCtx, businessId: string, action: string, outputSummary: string) =>
  ctx.db.insert("aiActionLogs", { businessId, action, inputSummary: "Perubahan dari dashboard usaha.", outputSummary, requiresVerification: true, createdAt: Date.now() });

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
  returns: v.object({ ok: v.boolean() }),
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
      await logChange(ctx, userId, "create_business", "Usaha baru dibuat.");
      return { ok: true };
    } catch (error) {
      logError("real:createBusiness", error);
      throw error;
    }
  },
});

export const updateBusiness = mutation({
  args: { name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const name = args.name.trim();
    if (!name) fail("INVALID_NAME", "Nama usaha wajib diisi.");
    const business = await ctx.db.query("businesses").withIndex("by_business_id", (q) => q.eq("businessId", userId)).unique();
    if (!business) fail("BUSINESS_NOT_FOUND", "Buat usaha terlebih dahulu.");
    await ctx.db.patch(business._id, { name });
    await logChange(ctx, userId, "update_business", "Profil usaha diperbarui.");
  },
});

export const createProduct = mutation({
  args: { name: v.string(), price: v.number(), stock: v.number(), lowStockThreshold: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const name = args.name.trim();
    if (!name || !Number.isFinite(args.price) || !Number.isFinite(args.stock) || !Number.isFinite(args.lowStockThreshold) || args.price < 0 || args.stock < 0 || args.lowStockThreshold < 0) fail("VALIDATION_ERROR", "Data produk tidak valid.");
    const products = await ctx.db.query("products").withIndex("by_business_slug", (q) => q.eq("businessId", userId)).take(51);
    if (products.length >= 50) fail("TOO_MANY_PRODUCTS", "Maksimal 50 produk.");
    const base = slugify(name);
    let slug = base;
    let suffix = 2;
    while (products.some((product) => product.slug === slug)) slug = `${base}-${suffix++}`;
    await ctx.db.insert("products", { businessId: userId, slug, name, price: Math.round(args.price), stock: Math.round(args.stock), lowStockThreshold: Math.round(args.lowStockThreshold), sortOrder: products.length });
    await logChange(ctx, userId, "create_product", `Produk ${name} ditambahkan.`);
  },
});

export const updateProduct = mutation({
  args: { productId: v.id("products"), name: v.string(), price: v.number(), stock: v.number(), lowStockThreshold: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const name = args.name.trim();
    const product = await ctx.db.get(args.productId);
    if (!product || product.businessId !== userId) fail("PRODUCT_NOT_FOUND", "Produk tidak ditemukan.");
    if (!name || !Number.isFinite(args.price) || !Number.isFinite(args.stock) || !Number.isFinite(args.lowStockThreshold) || args.price < 0 || args.stock < 0 || args.lowStockThreshold < 0) fail("VALIDATION_ERROR", "Data produk tidak valid.");
    await ctx.db.patch(args.productId, { name, price: Math.round(args.price), stock: Math.round(args.stock), lowStockThreshold: Math.round(args.lowStockThreshold) });
    await logChange(ctx, userId, "update_product", `Produk ${name} diperbarui.`);
  },
});

export const removeProduct = mutation({
  args: { productId: v.id("products") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product || product.businessId !== userId) fail("PRODUCT_NOT_FOUND", "Produk tidak ditemukan.");
    await ctx.db.delete(args.productId);
    await logChange(ctx, userId, "delete_product", `Produk ${product.name} dihapus.`);
  },
});
