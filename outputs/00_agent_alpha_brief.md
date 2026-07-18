# Agent Alpha Brief - TemanUsaha AI

## Role

Agent Alpha owns product direction, build scope, agent coordination, and demo readiness.

Decision: build the narrow demo first.

## Product Focus

TemanUsaha AI is a conversational operating assistant for Indonesian microbusinesses, starting with daily order and inventory management for small food businesses.

Indonesian version:

TemanUsaha AI adalah asisten operasional berbasis percakapan untuk usaha mikro Indonesia, dimulai dari pencatatan pesanan dan stok warung makan.

## Demo Business

```text
Warung Nasi Bu Sari
```

Use case:

```text
Warung makan rumahan menerima pesanan langsung dan lewat WhatsApp. Pemilik perlu mencatat pesanan, memperbarui stok, dan melihat pekerjaan yang belum selesai tanpa belajar dashboard rumit.
```

## North Star Demo

One natural-language instruction becomes:

- structured order
- stock update
- visible pending work
- AI Activity log
- AI Action Receipt

## MVP Capabilities

Only build five:

1. Catat pesanan.
2. Cek pesanan belum selesai.
3. Perbarui status pesanan.
4. Cek stok hampir habis.
5. Ringkasan harian.

## GPT Actions

Keep max five endpoints:

```http
POST /api/orders
GET /api/orders?status=pending
PATCH /api/orders/{id}
GET /api/inventory/low-stock
GET /api/summary/today
```

## Dashboard

Only three screens:

- Today
- Orders
- AI Activity

Dashboard is the verification and visibility layer. The product is the conversation.

## AI Action Receipt

Every important action must show:

```text
Apa yang saya pahami:
Apa yang saya lakukan:
Data yang digunakan:
Yang harus diperiksa:
Cara memberi instruksi lebih jelas:
```

## Build Priority

1. Seed Warung Nasi Bu Sari and five products.
2. Build order and summary endpoints.
3. Build Custom GPT + GPT Actions.
4. Verify create-order end-to-end.
5. Add confirmation and AI Action Receipt.
6. Build dashboard three screens.
7. Rehearse demo.

## Hard Cuts

Skip accounting, invoice PDF, OCR, WhatsApp API, payment gateway, marketplace, supplier workflows, payroll, RAG, complex auth, multi-tenant admin, and forecasting.
