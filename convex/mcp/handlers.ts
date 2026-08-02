// MCP tool handlers. Each one is the exact counterpart of an /api/agent/* route
// in agent_routes.ts: same internal function, same validation, same error code,
// same response body. Nothing here reaches a table directly.
//
// TENANT RULE: `businessId` is a parameter of this module, supplied by the
// caller after resolving the agent token. It is never read from `args`, and
// `assertNoTenantArgs` makes an attempt to smuggle one a hard failure rather
// than a silently ignored field.
import { internal } from "../_generated/api";
import { fail } from "../_shared/errors";
import { validOrderInput } from "../_shared/http";

type Args = Record<string, unknown>;

// Names a caller might try in the hope that some layer downstream honours them.
const TENANT_KEYS = ["businessId", "business_id", "business", "tenantId", "tenant", "workspaceId", "userId", "token", "apiKey"];

function assertNoTenantArgs(args: Args) {
  const smuggled = TENANT_KEYS.filter((key) => key in args);
  if (smuggled.length > 0) {
    fail(
      "VALIDATION_ERROR",
      "Ruang kerja ditentukan oleh token pemanggil, bukan oleh argumen tool.",
      smuggled,
    );
  }
}

const text = (value: unknown) => (typeof value === "string" ? value : "");
const finite = (value: unknown) => Number.isFinite(value as number);

async function logRead(ctx: any, businessId: string, action: string) {
  await ctx.runMutation(internal.agent.logRead, { businessId, action });
}

/**
 * Run one MCP tool for one tenant. Throws ConvexError on validation/auth/domain
 * failures; jsonrpc.ts turns those into `result.isError`, never a JSON-RPC error.
 */
export async function callTool(
  ctx: any,
  businessId: string,
  name: string,
  args: Args,
): Promise<unknown> {
  assertNoTenantArgs(args);

  switch (name) {
    case "list_pending_orders": {
      const orders = await ctx.runQuery(internal.orders.listPending, { businessId });
      await logRead(ctx, businessId, "list_pending_orders");
      return { orders };
    }

    case "create_order": {
      if (!validOrderInput(args)) {
        fail("VALIDATION_ERROR", "Field order tidak lengkap atau tidak valid.");
      }
      const input = args as unknown as {
        requestId: string;
        customerName: string;
        items: Array<{ product: string; quantity: number }>;
        pickupTime: string;
        paymentStatus: "UNPAID" | "PAID" | "PARTIAL";
        notes?: string;
      };
      return await ctx.runMutation(internal.orders.createOrder, {
        businessId,
        requestId: input.requestId.trim(),
        customerName: input.customerName.trim(),
        items: input.items,
        pickupTime: new Date(input.pickupTime).toISOString(),
        paymentStatus: input.paymentStatus,
        ...(typeof input.notes === "string" && input.notes.trim()
          ? { notes: input.notes.trim() }
          : {}),
      });
    }

    case "update_order": {
      const orderId = text(args.orderId).trim();
      const fulfillmentStatus = args.fulfillmentStatus;
      const paymentStatus = args.paymentStatus;
      if (
        !orderId ||
        orderId.includes("/") ||
        (fulfillmentStatus === undefined && paymentStatus === undefined) ||
        (fulfillmentStatus !== undefined &&
          !["PENDING", "COMPLETED"].includes(String(fulfillmentStatus))) ||
        (paymentStatus !== undefined &&
          !["UNPAID", "PAID", "PARTIAL"].includes(String(paymentStatus)))
      ) {
        fail("VALIDATION_ERROR", "ID atau status pesanan tidak valid.");
      }
      return await ctx.runMutation(internal.orders.updateOrder, {
        businessId,
        orderId,
        ...(fulfillmentStatus ? { fulfillmentStatus } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      });
    }

    case "get_low_stock_items": {
      const items = await ctx.runQuery(internal.inventory.lowStock, { businessId });
      await logRead(ctx, businessId, "get_low_stock_items");
      return { items };
    }

    case "get_daily_summary": {
      const summary = await ctx.runQuery(internal.business.summaryToday, { businessId });
      await logRead(ctx, businessId, "get_daily_summary");
      return summary;
    }

    case "get_business_profile": {
      const business = await ctx.runQuery(internal.agent.businessProfile, { businessId });
      await logRead(ctx, businessId, "get_business_profile");
      return { business };
    }

    case "update_business_profile": {
      const value = args.name;
      if (typeof value !== "string" || value.length > 120 || !value.trim()) {
        fail("VALIDATION_ERROR", "Nama ruang kerja wajib diisi.");
      }
      await ctx.runMutation(internal.agent.updateBusinessFromToken, {
        businessId,
        name: value as string,
      });
      return { ok: true };
    }

    case "list_products": {
      const products = await ctx.runQuery(internal.agent.listProducts, { businessId });
      await logRead(ctx, businessId, "list_products");
      return { products };
    }

    case "create_product": {
      if (
        typeof args.name !== "string" ||
        args.name.length > 120 ||
        !finite(args.price) ||
        !finite(args.stock) ||
        !finite(args.lowStockThreshold)
      ) {
        fail("VALIDATION_ERROR", "Data produk tidak valid.");
      }
      await ctx.runMutation(internal.agent.createProductFromToken, {
        businessId,
        name: args.name as string,
        price: args.price as number,
        stock: args.stock as number,
        lowStockThreshold: args.lowStockThreshold as number,
      });
      return { ok: true };
    }

    case "update_product": {
      const productId = text(args.productId).trim();
      if (
        !productId ||
        typeof args.name !== "string" ||
        args.name.length > 120 ||
        !finite(args.price) ||
        !finite(args.stock) ||
        !finite(args.lowStockThreshold)
      ) {
        fail("VALIDATION_ERROR", "Data produk tidak valid.");
      }
      await ctx.runMutation(internal.agent.updateProductFromToken, {
        businessId,
        productId,
        name: args.name as string,
        price: args.price as number,
        stock: args.stock as number,
        lowStockThreshold: args.lowStockThreshold as number,
      });
      return { ok: true };
    }

    case "delete_product": {
      const productId = text(args.productId).trim();
      if (!productId) fail("VALIDATION_ERROR", "ID produk wajib diisi.");
      await ctx.runMutation(internal.agent.removeProductFromToken, { businessId, productId });
      return { ok: true };
    }

    default:
      fail("VALIDATION_ERROR", `Tool '${name}' tidak dikenal.`);
  }
}
