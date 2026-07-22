"use client";
import { Check, Copy, KeyRound } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

function actionSchema(businessName: string, serverUrl: string) {
  const error = { description: "Permintaan gagal.", content: { "application/json": { schema: { type: "object", properties: { error: { type: "object", properties: { code: { type: "string" }, message: { type: "string" } } } } } } } };
  const order = { type: "object", properties: { _id: { type: "string" }, customerName: { type: "string" }, total: { type: "number" }, paymentStatus: { type: "string", enum: ["UNPAID", "PAID", "PARTIAL"] }, fulfillmentStatus: { type: "string", enum: ["PENDING", "COMPLETED"] }, pickupTime: { type: "string", format: "date-time" } } };
  return {
    openapi: "3.1.0",
    info: { title: `TemanUsaha Agent — ${businessName}`, version: "1.0.0", description: "Kelola pesanan, stok, dan ringkasan usaha pemilik token ini saja." },
    servers: [{ url: serverUrl }],
    security: [{ ApiKeyAuth: [] }],
    paths: {
      "/api/agent/orders": {
        get: { operationId: "list_pending_orders", summary: "Daftar pesanan yang masih pending", description: "Membaca pesanan PENDING milik usaha pemilik token.", "x-openai-isConsequential": false, responses: { "200": { description: "Pesanan pending.", content: { "application/json": { schema: { type: "object", properties: { orders: { type: "array", items: order } } } } } }, "401": error } },
        post: { operationId: "create_order", summary: "Buat pesanan dan kurangi stok", description: "Setelah konfirmasi pengguna, buat pesanan usaha pemilik token secara atomik.", "x-openai-isConsequential": true, requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: false, required: ["requestId", "customerName", "items", "pickupTime", "paymentStatus"], properties: { requestId: { type: "string", description: "ID unik untuk retry aman." }, customerName: { type: "string" }, items: { type: "array", minItems: 1, items: { type: "object", required: ["product", "quantity"], properties: { product: { type: "string" }, quantity: { type: "integer", minimum: 1 } } } }, pickupTime: { type: "string", format: "date-time" }, paymentStatus: { type: "string", enum: ["UNPAID", "PAID", "PARTIAL"] }, notes: { type: "string" } } } } } }, responses: { "201": { description: "Pesanan dibuat." }, "200": { description: "Replay idempoten." }, "400": error, "401": error, "409": error } },
      },
      "/api/agent/orders/{id}": { patch: { operationId: "update_order", summary: "Perbarui status pesanan", description: "Setelah konfirmasi pengguna, ubah status pesanan milik usaha pemilik token.", "x-openai-isConsequential": true, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID pesanan." }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", minProperties: 1, additionalProperties: false, properties: { fulfillmentStatus: { type: "string", enum: ["PENDING", "COMPLETED"] }, paymentStatus: { type: "string", enum: ["UNPAID", "PAID", "PARTIAL"] } } } } } }, responses: { "200": { description: "Pesanan diperbarui.", content: { "application/json": { schema: { type: "object", properties: { order } } } } }, "400": error, "401": error, "404": error } } },
      "/api/agent/inventory/low-stock": { get: { operationId: "get_low_stock_items", summary: "Daftar stok rendah", description: "Membaca produk dengan stok pada atau di bawah ambang usaha pemilik token.", "x-openai-isConsequential": false, responses: { "200": { description: "Produk stok rendah." }, "401": error } } },
      "/api/agent/summary/today": { get: { operationId: "get_daily_summary", summary: "Ringkasan bisnis hari ini", description: "Membaca ringkasan hari ini dalam zona Asia/Jakarta untuk usaha pemilik token.", "x-openai-isConsequential": false, responses: { "200": { description: "Ringkasan hari ini." }, "401": error } } },
    },
    components: { securitySchemes: { ApiKeyAuth: { type: "apiKey", in: "header", name: "X-Action-API-Key", description: "Token Agent Setup usaha ini." } } },
  };
}

export function AgentSetup() {
  const config = useQuery(api.agent.configuration); const issue = useMutation(api.agent.issue); const [token, setToken] = useState(""); const [copied, setCopied] = useState(false);
  if (!config) return <p className="text-sm text-muted-foreground">Memuat setup agent / Loading agent setup…</p>;
  const schema = JSON.stringify(actionSchema(config.businessName, config.serverUrl), null, 2);
  const copy = async (value: string) => { await navigator.clipboard.writeText(value); setCopied(true); };
  return <section className="max-w-3xl rounded-md border border-border bg-card p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-widest text-accent">Agent setup / Setup agen</p><h2 className="mt-2 text-xl font-semibold">Custom GPT untuk {config.businessName}</h2><p className="mt-2 text-sm text-muted-foreground">Salin schema dan token untuk GPT Builder Anda.</p></div><KeyRound className="text-accent" /></div><div className="mt-6 flex gap-2"><Button onClick={async () => setToken((await issue()).token)}>Buat / rotasi token</Button><Button onClick={() => void copy(schema)} variant="outline">{copied ? <Check /> : <Copy />}Salin schema</Button></div>{token && <div className="mt-4 rounded-md border border-accent bg-secondary p-4"><p className="text-sm font-semibold">Token satu-kali / One-time token</p><code className="mt-2 block break-all text-xs">{token}</code><Button className="mt-3" onClick={() => void copy(token)} size="sm">Salin token</Button></div>}<pre className="mt-5 max-h-72 overflow-auto rounded-md bg-muted p-4 text-xs">{schema}</pre></section>;
}
