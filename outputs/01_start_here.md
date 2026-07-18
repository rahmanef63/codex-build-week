# TemanUsaha AI - Start Here

## Posisi Event

Event Jakarta hari ini adalah OpenAI Build Week Community Hackathon Jakarta, Sabtu 18 Juli 2026, 09:00-15:00 di Hellolive, Centennial Tower Level 29, Jakarta. Formatnya individual hackathon, open track, maksimal 35 peserta, dengan fokus pada produk AI praktis, demo yang bisa dites, responsible AI, dan potensi lanjut.

Untuk challenge global OpenAI Build Week, deadline submission adalah Selasa 21 Juli 2026 pukul 17:00 PT. Devpost meminta working project, deskripsi proyek, video demo publik kurang dari 3 menit, repo, README, penjelasan penggunaan Codex/GPT-5.6, dan Codex `/feedback` session ID.

## Pitch

TemanUsaha AI adalah asisten operasional berbasis percakapan untuk usaha mikro Indonesia, dimulai dari pencatatan pesanan dan stok warung makan.

English:

TemanUsaha AI is a conversational operating assistant for Indonesian microbusinesses, starting with daily order and inventory management for small food businesses.

## Use Case Utama

Bangun satu bisnis simulasi:

```text
Warung Nasi Bu Sari
```

Masalahnya spesifik: pemilik warung menerima pesanan langsung dan lewat WhatsApp, lalu harus mencatat pesanan, memperbarui stok, dan mengingat pekerjaan yang belum selesai. Jangan posisikan sebagai sistem manajemen semua UMKM.

## Demo Yang Harus Jadi

1. Dashboard menampilkan Today, Orders, dan AI Activity.
2. Custom GPT menerima instruksi Bahasa Indonesia.
3. GPT Action membuat order.
4. Backend mengurangi stok dan mencatat AI action log.
5. Dashboard langsung menunjukkan perubahan.
6. Jawaban GPT menyertakan AI Action Receipt.

## Fitur Wajib

- `POST /api/orders`
- `GET /api/orders?status=pending`
- `PATCH /api/orders/{id}`
- `GET /api/inventory/low-stock`
- `GET /api/summary/today`

## Fitur Yang Dipotong Hari Ini

- Accounting lengkap.
- Invoice PDF.
- OCR nota.
- WhatsApp API nyata.
- Payment gateway.
- Supplier marketplace.
- Payroll.
- Login/role kompleks.
- RAG besar.
- Multi-tenant admin.
- Prediksi penjualan.

## AI Action Receipt

Format tetap:

```text
Apa yang saya pahami:
Apa yang saya lakukan:
Data yang digunakan:
Yang harus diperiksa:
Cara memberi instruksi lebih jelas:
```

## Build Order

1. Pasang dashboard kit.
2. Seed Warung Nasi Bu Sari dan lima produk.
3. Implement lima endpoint minimal.
4. Import OpenAPI ke Custom GPT.
5. Rehearse create-order flow.
6. Tulis README dan rekam video.

## Source Links

- Event Jakarta Luma: https://luma.com/keng8c0n
- OpenAI Build Week: https://openai.com/build-week/
- Devpost OpenAI Build Week: https://openai.devpost.com/
- GPT Actions docs: https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts
- OpenAI model guidance: https://developers.openai.com/api/docs/guides/latest-model
- Agents SDK: https://developers.openai.com/api/docs/guides/agents
