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
    info: { title: `Asisten Pribadi AI Agent — ${businessName}`, version: "1.0.0", description: "Kelola pesanan, stok, dan ringkasan ruang kerja pemilik token ini saja." },
    servers: [{ url: serverUrl }],
    security: [{ ApiKeyAuth: [] }],
    paths: {
      "/api/agent/orders": {
        get: { operationId: "list_pending_orders", summary: "Daftar pesanan yang masih pending", description: "Membaca pesanan PENDING milik ruang kerja pemilik token.", "x-openai-isConsequential": false, responses: { "200": { description: "Pesanan pending.", content: { "application/json": { schema: { type: "object", properties: { orders: { type: "array", items: order } } } } } }, "401": error } },
        post: { operationId: "create_order", summary: "Buat pesanan dan kurangi stok", description: "Setelah konfirmasi pengguna, buat pesanan di ruang kerja pemilik token secara atomik.", "x-openai-isConsequential": true, requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: false, required: ["requestId", "customerName", "items", "pickupTime", "paymentStatus"], properties: { requestId: { type: "string", description: "ID unik untuk retry aman." }, customerName: { type: "string" }, items: { type: "array", minItems: 1, items: { type: "object", required: ["product", "quantity"], properties: { product: { type: "string" }, quantity: { type: "integer", minimum: 1 } } } }, pickupTime: { type: "string", format: "date-time" }, paymentStatus: { type: "string", enum: ["UNPAID", "PAID", "PARTIAL"] }, notes: { type: "string" } } } } } }, responses: { "201": { description: "Pesanan dibuat." }, "200": { description: "Replay idempoten." }, "400": error, "401": error, "409": error } },
      },
      "/api/agent/orders/{id}": { patch: { operationId: "update_order", summary: "Perbarui status pesanan", description: "Setelah konfirmasi pengguna, ubah status pesanan milik ruang kerja pemilik token.", "x-openai-isConsequential": true, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID pesanan." }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", minProperties: 1, additionalProperties: false, properties: { fulfillmentStatus: { type: "string", enum: ["PENDING", "COMPLETED"] }, paymentStatus: { type: "string", enum: ["UNPAID", "PAID", "PARTIAL"] } } } } } }, responses: { "200": { description: "Pesanan diperbarui.", content: { "application/json": { schema: { type: "object", properties: { order } } } } }, "400": error, "401": error, "404": error } } },
      "/api/agent/inventory/low-stock": { get: { operationId: "get_low_stock_items", summary: "Daftar stok rendah", description: "Membaca produk dengan stok pada atau di bawah ambang ruang kerja pemilik token.", "x-openai-isConsequential": false, responses: { "200": { description: "Produk stok rendah." }, "401": error } } },
      "/api/agent/summary/today": { get: { operationId: "get_daily_summary", summary: "Ringkasan hari ini", description: "Membaca ringkasan hari ini dalam zona Asia/Jakarta untuk ruang kerja pemilik token.", "x-openai-isConsequential": false, responses: { "200": { description: "Ringkasan hari ini." }, "401": error } } },
      "/api/agent/business": { get: { operationId: "get_business_profile", summary: "Baca profil ruang kerja", description: "Membaca profil ruang kerja pemilik token.", "x-openai-isConsequential": false, responses: { "200": { description: "Profil ruang kerja." }, "401": error } }, patch: { operationId: "update_business_profile", summary: "Ubah nama ruang kerja", description: "Setelah konfirmasi pengguna, memperbarui nama ruang kerja pemilik token.", "x-openai-isConsequential": true, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string" } } } } } }, responses: { "200": { description: "Profil diperbarui." }, "400": error, "401": error } } },
      "/api/agent/products": { get: { operationId: "list_products", summary: "Daftar katalog produk", description: "Membaca seluruh katalog produk ruang kerja pemilik token.", "x-openai-isConsequential": false, responses: { "200": { description: "Katalog produk." }, "401": error } }, post: { operationId: "create_product", summary: "Tambah produk", description: "Setelah konfirmasi pengguna, menambah produk ke katalog ruang kerja pemilik token.", "x-openai-isConsequential": true, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "price", "stock", "lowStockThreshold"], properties: { name: { type: "string" }, price: { type: "number", minimum: 0 }, stock: { type: "number", minimum: 0 }, lowStockThreshold: { type: "number", minimum: 0 } } } } } }, responses: { "201": { description: "Produk ditambahkan." }, "400": error, "401": error } } },
      "/api/agent/products/{id}": { patch: { operationId: "update_product", summary: "Ubah produk", description: "Setelah konfirmasi pengguna, memperbarui produk milik ruang kerja pemilik token.", "x-openai-isConsequential": true, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "price", "stock", "lowStockThreshold"], properties: { name: { type: "string" }, price: { type: "number", minimum: 0 }, stock: { type: "number", minimum: 0 }, lowStockThreshold: { type: "number", minimum: 0 } } } } } }, responses: { "200": { description: "Produk diperbarui." }, "400": error, "401": error, "404": error } }, delete: { operationId: "delete_product", summary: "Hapus produk", description: "Setelah konfirmasi pengguna, menghapus produk milik ruang kerja pemilik token.", "x-openai-isConsequential": true, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Produk dihapus." }, "401": error, "404": error } } },
    },
    components: { schemas: {}, securitySchemes: { ApiKeyAuth: { type: "apiKey", in: "header", name: "X-Action-API-Key", description: "Token Agent Setup ruang kerja ini." } } },
  };
}

function builderDetails(businessName: string, products: Array<{ name: string; price: number }>) {
  return {
    name: `Asisten ${businessName}`,
    description: `Asisten pribadi untuk ${businessName}. Membantu mencatat pesanan, mengecek stok, dan merangkum kondisi terbaru dari data ruang kerja ini.`,
    instructions: `# Peran\n\nKamu adalah asisten pribadi untuk ${businessName}. Jawab singkat, ramah, dan konkret dalam Bahasa Indonesia.\n\n# Ruang lingkup\n\nKamu hanya bekerja untuk ${businessName}. Kamu dapat mengelola ringkasan, pesanan pending, stok rendah, profil ruang kerja, dan seluruh katalog produk. Jangan memakai data demo atau menyebut ruang kerja lain.\n\n# Pemilihan Action\n\nRingkasan → get_daily_summary. Stok rendah → get_low_stock_items. Pesanan pending → list_pending_orders. Profil ruang kerja → get_business_profile atau update_business_profile. Katalog → list_products, create_product, update_product, atau delete_product. Jangan memanggil Action yang tidak relevan.\n\n# Sumber kebenaran\n\nHarga, stok, total, dan status harus berasal dari Action terbaru. Jangan menebak atau mengklaim perubahan sebelum Action berhasil. Jangan meminta, menampilkan, atau menaruh API key/token di percakapan maupun respons.\n\n# Mutasi\n\nSebelum membuat, mengubah, atau menghapus pesanan, profil, atau produk: tampilkan ringkasan data nyata yang akan berubah dan tunggu konfirmasi eksplisit. Jangan pernah membuat ID contoh. Jika ID pesanan atau produk belum diketahui, panggil daftar yang relevan terlebih dahulu. Untuk membuat pesanan, buat requestId UUID baru setelah konfirmasi; bila timeout, ulangi payload identik dengan requestId yang sama.\n\n# Respons\n\nSetelah Action sukses, rangkum tindakan dan hasilnya secara ringkas. Jika Action gagal, jelaskan pesan aman dari API dan minta koreksi minimum. Jangan menjanjikan pembayaran, pengiriman pesan, pembatalan pesanan, akuntansi, atau operasi lain di luar Action.`,
    starters: [
      `Bagaimana ringkasan ${businessName} hari ini?`,
      "Pesanan mana yang masih pending?",
      "Stok apa yang perlu segera diperiksa?",
      "Saya ingin mencatat pesanan baru.",
    ],
    settings: "Knowledge: kosong\nRecommended model: No Recommended Model\nCapabilities: Web Search off, Canvas off, Image Generation off, Code Interpreter & Data Analysis off\nAuthentication: API Key → Custom header → X-Action-API-Key",
    knowledge: `# ${businessName}\n\nAsisten ini hanya membantu ruang kerja ${businessName}. Gunakan Action sebagai sumber kebenaran untuk pesanan, stok, dan ringkasan hari ini. Jangan memakai data ruang kerja lain atau data demo.\n\n## Katalog saat file dibuat\n\n${products.length ? products.map((product) => `- ${product.name}: Rp${product.price.toLocaleString("id-ID")}`).join("\n") : "Belum ada produk."}\n\n## Batas aman\n\nMinta konfirmasi eksplisit sebelum membuat atau mengubah pesanan. Jangan meminta atau menampilkan API key maupun token.`,
  };
}

export function AgentSetup() {
  const config = useQuery(api.agent.configuration);
  const issue = useMutation(api.agent.issue);
  const [token, setToken] = useState("");
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const [copied, setCopied] = useState("");
  const [tab, setTab] = useState("name");
  if (!config) return <p className="text-sm text-muted-foreground">Memuat panduan asisten…</p>;

  const details = builderDetails(config.businessName, config.products);
  const schema = JSON.stringify(actionSchema(config.businessName, config.serverUrl), null, 2);
  const copy = async (id: string, value: string) => { await navigator.clipboard.writeText(value); setCopied(id); };
  const fields = [
    ["name", "Nama GPT", details.name],
    ["description", "Deskripsi", details.description],
    ["instructions", "Instruksi", details.instructions],
    ["starters", "Pembuka percakapan", details.starters.join("\n")],
    ["settings", "Pengaturan GPT", details.settings],
    ["integration", "Hubungkan Action", ""],
  ] as const;
  const active = fields.find(([id]) => id === tab) ?? fields[0];
  const downloadKnowledge = () => {
    const href = URL.createObjectURL(new Blob([details.knowledge], { type: "text/markdown" }));
    const link = document.createElement("a"); link.href = href; link.download = `${config.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-knowledge.md`; link.click(); URL.revokeObjectURL(href);
  };

  return <section className="w-full border-y border-border py-6">
    <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-medium uppercase tracking-widest text-accent">Siapkan asisten AI</p><h2 className="mt-2 text-xl font-semibold break-words">Hubungkan GPT ke {config.businessName}</h2><p className="mt-2 text-sm text-muted-foreground">Ikuti langkah berikut berurutan. Detail teknis tersedia hanya saat dibutuhkan.</p></div><KeyRound className="shrink-0 text-accent" /></div>
    <ol className="mt-6 grid overflow-hidden rounded-md border border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-y divide-border">
      {["Salin identitas dan instruksi GPT", "Tambahkan Action dan token", "Uji ringkasan serta pesanan"].map((step, index) => <li className="flex gap-3 p-4 text-sm" key={step}><span className="text-accent">{index + 1}.</span>{step}</li>)}
    </ol>
    {/* TODO(rr): underline tabs (border-b-2 active marker); shadcn Button has no underline-tab variant, kept raw to avoid fighting utilities. */}
    <div className="mt-6 flex max-w-full overflow-x-auto border-b border-border" role="tablist" aria-label="Detail GPT Builder">{fields.map(([id, label]) => <button className={`min-h-11 shrink-0 border-b-2 px-3 py-2 text-sm ${tab === id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`} key={id} onClick={() => setTab(id)} role="tab" aria-selected={tab === id}>{label}</button>)}</div>
    {tab !== "integration" ? <div className="mt-6 rounded-md border border-border bg-muted/30 p-4 sm:p-5" role="tabpanel"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{active[1]}</h3><Button className="pointer-coarse:min-h-11" size="sm" variant="outline" onClick={() => void copy(active[0], active[2])}>{copied === active[0] ? <Check /> : <Copy />}{copied === active[0] ? "Tersalin" : "Salin semua"}</Button></div>{active[0] === "starters" ? <div className="mt-4 space-y-2">{details.starters.map((starter, index) => <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3 text-sm" key={starter}><span>{starter}</span><Button className="pointer-coarse:min-h-11" size="xs" variant="outline" onClick={() => void copy(`starter-${index}`, starter)}>{copied === `starter-${index}` ? <Check /> : <Copy />}{copied === `starter-${index}` ? "Tersalin" : "Salin"}</Button></div>)}</div> : <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">{active[2]}</pre>}</div> : null}
    <div className={`mt-6 space-y-6 ${tab === "integration" ? "block" : "hidden"}`}><div className="rounded-md border border-border p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Pengetahuan GPT</h3><p className="mt-1 text-xs text-muted-foreground">Opsional: unduh lalu unggah ke bagian Knowledge di GPT Builder.</p></div><Button className="pointer-coarse:min-h-11" size="sm" variant="outline" onClick={downloadKnowledge}><Download />Unduh .md</Button></div></div>
    <div className="rounded-md border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Action dan token</h3><p className="mt-1 text-xs text-muted-foreground">Tempel schema pada Action, lalu masukkan token sebagai API Key dengan custom header.</p>{config.token ? <p className="mt-2 text-xs text-muted-foreground">Token aktif: {config.token.prefix}… · dibuat {new Date(config.token.createdAt).toLocaleDateString("id-ID")} · {config.token.expiresAt ? `berakhir ${new Date(config.token.expiresAt).toLocaleDateString("id-ID")}` : "tanpa masa berlaku"}</p> : null}</div><div className="flex gap-2"><Button className="pointer-coarse:min-h-11" size="sm" onClick={async () => { const result = await issue(); setToken(result.token); setTokenExpiresAt(result.expiresAt); }}>Buat token baru</Button><Button className="pointer-coarse:min-h-11" size="sm" variant="outline" onClick={() => void copy("schema", schema)}>{copied === "schema" ? <Check /> : <Copy />}{copied === "schema" ? "Tersalin" : "Salin schema"}</Button></div></div>{token && <div className="mt-4 rounded-md border border-accent bg-secondary p-4"><p className="text-sm font-semibold">Token hanya ditampilkan sekali</p><p className="mt-1 text-xs text-muted-foreground">Salin sekarang. Token berakhir {tokenExpiresAt ? new Date(tokenExpiresAt).toLocaleDateString("id-ID") : "sesuai kebijakan"}.</p><code className="mt-2 block break-all text-xs">{token}</code><Button className="mt-3 pointer-coarse:min-h-11" onClick={() => void copy("token", token)} size="sm">{copied === "token" ? <Check /> : <Copy />}{copied === "token" ? "Tersalin" : "Salin token"}</Button></div>}<details className="mt-5 rounded-md bg-muted p-4 text-xs"><summary className="cursor-pointer font-medium">Lihat schema teknis</summary><pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap break-words">{schema}</pre></details></div></div>
  </section>;
}
