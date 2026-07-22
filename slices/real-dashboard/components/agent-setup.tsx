"use client";

import { Check, Copy, Download, KeyRound } from "lucide-react";
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
    components: { schemas: {}, securitySchemes: { ApiKeyAuth: { type: "apiKey", in: "header", name: "X-Action-API-Key", description: "Token Agent Setup usaha ini." } } },
  };
}

function builderDetails(businessName: string) {
  return {
    name: `Asisten ${businessName}`,
    description: `Asisten operasional untuk ${businessName}. Membantu mencatat pesanan, mengecek stok, dan merangkum kondisi usaha dari data milik usaha ini.`,
    instructions: `# Peran\n\nKamu adalah asisten operasional untuk ${businessName}. Jawab singkat, ramah, dan konkret dalam Bahasa Indonesia.\n\n# Ruang lingkup\n\nKamu hanya bekerja untuk ${businessName}. Gunakan Action untuk membaca pesanan pending, stok rendah, dan ringkasan hari ini; gunakan Action mutasi hanya untuk membuat pesanan atau mengubah status pesanan. Jangan memakai data demo atau menyebut usaha lain.\n\n# Sumber kebenaran\n\nHarga, stok, total, dan status harus berasal dari Action terbaru. Jangan menebak atau mengklaim perubahan sebelum Action berhasil. Jangan meminta, menampilkan, atau menaruh API key/token di percakapan maupun respons.\n\n# Mutasi\n\nSebelum membuat atau mengubah pesanan, tampilkan ringkasan perubahan dan tunggu konfirmasi eksplisit pengguna. Untuk membuat pesanan, kumpulkan nama pelanggan, item, jumlah bulat positif, waktu ambil, dan status pembayaran. Buat requestId UUID baru setelah konfirmasi; bila timeout, ulangi payload identik dengan requestId yang sama.\n\n# Respons\n\nSetelah Action sukses, rangkum tindakan dan hasilnya secara ringkas. Jika Action gagal, jelaskan pesan aman dari API dan minta koreksi minimum. Jangan menjanjikan pembayaran, pengiriman pesan, pembatalan, perubahan stok manual, akuntansi, atau operasi lain di luar Action.`,
    starters: [
      `Bagaimana ringkasan ${businessName} hari ini?`,
      "Pesanan mana yang masih pending?",
      "Stok apa yang perlu segera diperiksa?",
      "Saya ingin mencatat pesanan baru.",
    ],
    settings: "Knowledge: kosong\nRecommended model: No Recommended Model\nCapabilities: Web Search off, Canvas off, Image Generation off, Code Interpreter & Data Analysis off\nAuthentication: API Key → Custom header → X-Action-API-Key",
    knowledge: `# ${businessName}\n\nAsisten ini hanya membantu operasional ${businessName}. Gunakan Action sebagai sumber kebenaran untuk pesanan, stok, dan ringkasan hari ini. Jangan memakai data usaha lain atau data demo.\n\n## Batas aman\n\nMinta konfirmasi eksplisit sebelum membuat atau mengubah pesanan. Jangan meminta atau menampilkan API key maupun token.`,
  };
}

export function AgentSetup() {
  const config = useQuery(api.agent.configuration);
  const issue = useMutation(api.agent.issue);
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState("");
  const [tab, setTab] = useState("name");
  if (!config) return <p className="text-sm text-muted-foreground">Memuat setup agent / Loading agent setup…</p>;

  const details = builderDetails(config.businessName);
  const schema = JSON.stringify(actionSchema(config.businessName, config.serverUrl), null, 2);
  const copy = async (id: string, value: string) => { await navigator.clipboard.writeText(value); setCopied(id); };
  const fields = [
    ["name", "Name", details.name],
    ["description", "Description", details.description],
    ["instructions", "Instructions", details.instructions],
    ["starters", "Conversation starters", details.starters.join("\n")],
    ["settings", "Pengaturan Builder", details.settings],
  ] as const;
  const active = fields.find(([id]) => id === tab) ?? fields[0];
  const downloadKnowledge = () => {
    const href = URL.createObjectURL(new Blob([details.knowledge], { type: "text/markdown" }));
    const link = document.createElement("a"); link.href = href; link.download = `${config.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-knowledge.md`; link.click(); URL.revokeObjectURL(href);
  };

  return <section className="max-w-3xl rounded-md border border-border bg-card p-6">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-widest text-accent">Agent setup / Setup agen</p><h2 className="mt-2 text-xl font-semibold">Custom GPT untuk {config.businessName}</h2><p className="mt-2 text-sm text-muted-foreground">Salin tiap detail ke tab Configure GPT Builder. Semua teks disesuaikan dengan nama usaha Anda.</p></div><KeyRound className="text-accent" /></div>
    <div className="mt-6 hidden border-b border-border md:flex" role="tablist" aria-label="Detail GPT Builder">{fields.map(([id, label]) => <button className={`border-b-2 px-3 py-2 text-sm ${tab === id ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`} key={id} onClick={() => setTab(id)} role="tab" aria-selected={tab === id}>{label}</button>)}</div>
    <div className="mt-6 md:hidden space-y-4">{fields.map(([id, label, value]) => <div key={id} className="rounded-md border border-border bg-muted/30 p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{label}</h3><Button size="sm" variant="outline" onClick={() => void copy(id, value)}>{copied === id ? <Check /> : <Copy />}{copied === id ? "Tersalin" : "Salin"}</Button></div><pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">{value}</pre></div>)}</div>
    <div className="mt-6 hidden rounded-md border border-border bg-muted/30 p-5 md:block" role="tabpanel"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{active[1]}</h3><Button size="sm" variant="outline" onClick={() => void copy(active[0], active[2])}>{copied === active[0] ? <Check /> : <Copy />}{copied === active[0] ? "Tersalin" : "Salin semua"}</Button></div>{active[0] === "starters" ? <div className="mt-4 space-y-2">{details.starters.map((starter, index) => <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3 text-sm" key={starter}><span>{starter}</span><Button size="xs" variant="outline" onClick={() => void copy(`starter-${index}`, starter)}>{copied === `starter-${index}` ? <Check /> : <Copy />}{copied === `starter-${index}` ? "Tersalin" : "Salin"}</Button></div>)}</div> : <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">{active[2]}</pre>}</div>
    <div className="mt-6 rounded-md border border-border p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Knowledge Base</h3><p className="mt-1 text-xs text-muted-foreground">Opsional: unduh lalu unggah ke bagian Knowledge GPT Builder.</p></div><Button size="sm" variant="outline" onClick={downloadKnowledge}><Download />Unduh .md</Button></div></div>
    <div className="mt-6 rounded-md border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Action schema dan token</h3><p className="mt-1 text-xs text-muted-foreground">Tempel schema ke Action. Token hanya untuk field API Key dengan custom header.</p></div><div className="flex gap-2"><Button size="sm" onClick={async () => setToken((await issue()).token)}>Buat / rotasi token</Button><Button size="sm" variant="outline" onClick={() => void copy("schema", schema)}>{copied === "schema" ? <Check /> : <Copy />}{copied === "schema" ? "Tersalin" : "Salin schema"}</Button></div></div>{token && <div className="mt-4 rounded-md border border-accent bg-secondary p-4"><p className="text-sm font-semibold">Token satu-kali / One-time token</p><code className="mt-2 block break-all text-xs">{token}</code><Button className="mt-3" onClick={() => void copy("token", token)} size="sm">{copied === "token" ? <Check /> : <Copy />}{copied === "token" ? "Tersalin" : "Salin token"}</Button></div>}<pre className="mt-5 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-4 text-xs">{schema}</pre></div>
  </section>;
}
