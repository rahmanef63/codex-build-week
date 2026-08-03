/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _shared_auth from "../_shared/auth.js";
import type * as _shared_errors from "../_shared/errors.js";
import type * as _shared_http from "../_shared/http.js";
import type * as _shared_log from "../_shared/log.js";
import type * as agent from "../agent.js";
import type * as agent_routes from "../agent_routes.js";
import type * as auth from "../auth.js";
import type * as business from "../business.js";
import type * as domain from "../domain.js";
import type * as http from "../http.js";
import type * as inventory from "../inventory.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_order_validation from "../lib/order_validation.js";
import type * as mcp_auth from "../mcp/auth.js";
import type * as mcp_handlers from "../mcp/handlers.js";
import type * as mcp_jsonrpc from "../mcp/jsonrpc.js";
import type * as mcp_routes from "../mcp/routes.js";
import type * as mcp_tools from "../mcp/tools.js";
import type * as mcp_types from "../mcp/types.js";
import type * as orders from "../orders.js";
import type * as real from "../real.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "_shared/auth": typeof _shared_auth;
  "_shared/errors": typeof _shared_errors;
  "_shared/http": typeof _shared_http;
  "_shared/log": typeof _shared_log;
  agent: typeof agent;
  agent_routes: typeof agent_routes;
  auth: typeof auth;
  business: typeof business;
  domain: typeof domain;
  http: typeof http;
  inventory: typeof inventory;
  "lib/errors": typeof lib_errors;
  "lib/order_validation": typeof lib_order_validation;
  "mcp/auth": typeof mcp_auth;
  "mcp/handlers": typeof mcp_handlers;
  "mcp/jsonrpc": typeof mcp_jsonrpc;
  "mcp/routes": typeof mcp_routes;
  "mcp/tools": typeof mcp_tools;
  "mcp/types": typeof mcp_types;
  orders: typeof orders;
  real: typeof real;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
