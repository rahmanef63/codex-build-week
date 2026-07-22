"use client";
import { Check, Copy, KeyRound } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function AgentSetup() {
  const config = useQuery(api.agent.configuration); const issue = useMutation(api.agent.issue); const [token, setToken] = useState(""); const [copied, setCopied] = useState(false);
  if (!config) return <p className="text-sm text-muted-foreground">Memuat setup agent / Loading agent setup…</p>;
  const schema = JSON.stringify({ openapi: "3.1.0", info: { title: `TemanUsaha Agent - ${config.businessName}`, version: "1.0.0" }, servers: [{ url: config.serverUrl }], security: [{ ApiKeyAuth: [] }], paths: { "/api/agent/orders": { get: { operationId: "list_pending_orders" }, post: { operationId: "create_order" } }, "/api/agent/orders/{id}": { patch: { operationId: "update_order" } }, "/api/agent/inventory/low-stock": { get: { operationId: "get_low_stock_items" } }, "/api/agent/summary/today": { get: { operationId: "get_daily_summary" } } }, components: { securitySchemes: { ApiKeyAuth: { type: "apiKey", in: "header", name: "X-Action-API-Key" } } } }, null, 2);
  const copy = async (value: string) => { await navigator.clipboard.writeText(value); setCopied(true); };
  return <section className="max-w-3xl rounded-md border border-border bg-card p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-widest text-accent">Agent setup / Setup agen</p><h2 className="mt-2 text-xl font-semibold">Custom GPT untuk {config.businessName}</h2><p className="mt-2 text-sm text-muted-foreground">Salin schema dan token untuk GPT Builder Anda.</p></div><KeyRound className="text-accent" /></div><div className="mt-6 flex gap-2"><Button onClick={async () => setToken((await issue()).token)}>Buat / rotasi token</Button><Button onClick={() => void copy(schema)} variant="outline">{copied ? <Check /> : <Copy />}Salin schema</Button></div>{token && <div className="mt-4 rounded-md border border-accent bg-secondary p-4"><p className="text-sm font-semibold">Token satu-kali / One-time token</p><code className="mt-2 block break-all text-xs">{token}</code><Button className="mt-3" onClick={() => void copy(token)} size="sm">Salin token</Button></div>}<pre className="mt-5 max-h-72 overflow-auto rounded-md bg-muted p-4 text-xs">{schema}</pre></section>;
}
