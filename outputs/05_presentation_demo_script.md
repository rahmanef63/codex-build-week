# TemanUsaha AI - Presentation And Demo Script

## 30-Second Pitch

Banyak pemilik warung makan masih mengelola pesanan, stok, dan pembayaran lewat WhatsApp dan buku catatan. TemanUsaha AI membuat pekerjaan itu bisa dikelola lewat percakapan Bahasa Indonesia, tetapi tetap terhubung ke dashboard sebagai sumber data. Setiap aksi menghasilkan AI Action Receipt: apa yang AI pahami, apa yang dilakukan, data yang digunakan, apa yang perlu dicek, dan cara memberi instruksi yang lebih jelas.

## 3-Minute Demo Flow

### 0:00-0:25 - Problem

"Ini Warung Nasi Bu Sari. Order masuk lewat chat, stok ada di kepala, dan pekerjaan restock sering baru ketahuan saat barang hampir habis."

Show: Today dashboard with pending orders, unpaid orders, revenue, and low stock.

### 0:25-0:45 - Solution

"TemanUsaha AI memungkinkan pemilik warung mengelola operasional melalui percakapan, sambil memahami apa yang dilakukan AI dan apa yang perlu mereka periksa."

### 0:45-1:30 - Catat Pesanan

Prompt:

```text
Catat pesanan Bu Rina, 3 nasi ayam dan 2 es teh, ambil jam 12.30, belum bayar.
```

Expected:

- GPT shows interpretation.
- GPT asks confirmation.
- GPT Action creates order.
- Stock decreases.
- Orders and AI Activity update.

### 1:30-2:05 - Operasional

Prompt:

```text
Pesanan apa yang belum selesai hari ini?
```

Expected:

- GPT reads pending orders.
- GPT identifies pickup time and unpaid status.

### 2:05-2:30 - Insight

Prompt:

```text
Bagaimana kondisi warung hari ini?
```

Expected:

- GPT reads daily summary.
- GPT reports order count, recorded revenue, pending orders, unpaid orders, and low stock.

### 2:30-2:50 - Responsible AI

Show AI Action Receipt:

```text
Apa yang saya pahami: Bu Rina memesan 3 nasi ayam dan 2 es teh, ambil jam 12.30, belum bayar.
Apa yang saya lakukan: Membuat order baru dan memperbarui stok.
Data yang digunakan: nama pelanggan, produk, jumlah, waktu ambil, status pembayaran.
Yang harus diperiksa: jumlah, harga, dan status pembayaran.
Cara memberi instruksi lebih jelas: sebutkan pelanggan, produk, jumlah, waktu, dan metode pembayaran.
```

Then show AI Activity dashboard.

### 2:50-3:00 - Close

"TemanUsaha AI bukan hanya membantu UMKM menggunakan AI. Ia membantu mereka memahami, memeriksa, dan mempercayai AI secara bertahap."

## Slide Outline

1. Title: TemanUsaha AI.
2. Problem: warung mencatat operasional di WhatsApp dan buku.
3. User: pemilik warung makan rumahan.
4. Solution: conversational assistant + dashboard + GPT Actions.
5. Demo: chat -> structured order -> stock update -> dashboard -> AI Action Receipt.
6. Responsible AI: confirmation, no invented data, AI Activity log.
7. Tech: Custom GPT, GPT Actions, API, dashboard, database, Codex/GPT-5.6.
8. Continuation: test with 5-10 warung, then WhatsApp integration.

## Devpost Copy

Project name:

```text
TemanUsaha AI
```

Tagline:

```text
A conversational operating assistant for Indonesian microbusinesses, starting with daily order and inventory management for small food businesses.
```

Short description:

```text
TemanUsaha AI helps Indonesian food microbusiness owners record orders, update inventory, check pending work, and understand daily operations through natural Bahasa Indonesia conversations. A Custom GPT uses GPT Actions to read and update a lightweight dashboard, while every important interaction includes an AI Action Receipt explaining what the AI understood, what it did, what data it used, what needs verification, and how the owner can give clearer instructions next time.
```

How Codex/GPT-5.6 was used:

```text
Codex helped narrow the product scope, split the work across API/actions, dashboard, documentation, and QA agents, generate the OpenAPI Actions schema, implement the demo flow, and verify responsible AI behavior. GPT-5.6 was used for prompt design, workflow reasoning, and product/presentation refinement.
```

README must include:

- Setup steps.
- Environment variables.
- How to seed demo data.
- How to run dashboard/API.
- How to import `03_gpt_actions_openapi.yaml` into Custom GPT.
- Demo prompts.
- Known limitations.
- Responsible AI notes.
- Codex `/feedback` session ID.
