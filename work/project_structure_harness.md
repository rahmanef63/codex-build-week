# TemanUsaha AI: Minimal Hackathon Harness

Target: Custom GPT + GPT Actions yang mengoperasikan dashboard UMKM ringan.  Satu source of truth adalah backend/API; dashboard dan GPT hanya dua klien.

## 1. Struktur Proyek

Gunakan salah satu shell frontend (`Next.js`, `Vite + React`, atau template dashboard yang tersedia) dan pertahankan folder domain berikut.

```text
temanusaha-ai/
  app/                         # Next app router, atau src/ pada Vite
    dashboard/
      overview/
      products/
      stock/
      orders/
      customers/
      tasks/
      notes/
      insights/
      activity/
      receipts/
  components/                  # Komponen dari Tailwind/shadcn atau kit terpilih
  lib/
    api-client.ts
    auth.ts
    format.ts
  server/                      # Boleh route handlers Next atau service API terpisah
    routes/
    services/
    repositories/
    actions/                   # Implementasi endpoint yang dipanggil GPT Actions
  db/
    schema.sql                 # atau schema ORM yang setara
    seed.ts
  openapi/
    temanusaha-actions.yaml    # Spec yang diimpor ke Custom GPT
  prompts/
    custom-gpt-instructions.md
  public/
  .env.example
  README.md
```

Untuk hackathon, pilih satu database relasional managed/local yang paling cepat tersedia (Supabase/Postgres atau SQLite). Jangan buat event bus, vector DB, atau microservice kecuali sudah dibutuhkan demo.

## 2. Data Model

Semua tabel bisnis memiliki `id`, `business_id`, `created_at`, dan `updated_at` kecuali disebut lain. Gunakan UUID/string ID agar seed dan Actions mudah direferensikan.

| Model | Field inti | Relasi / catatan |
|---|---|---|
| `businesses` | `id`, `name`, `owner_name`, `currency`, `timezone` | Satu UMKM demo. |
| `users` | `id`, `business_id`, `name`, `email`, `role` | Cukup `owner` untuk demo. |
| `products` | `id`, `name`, `sku`, `price`, `cost`, `stock_on_hand`, `reorder_level`, `is_active` | `sku` unik per bisnis. Stock bisa diproyeksikan langsung untuk demo. |
| `stock_movements` | `id`, `product_id`, `type`, `quantity`, `reason`, `reference_type`, `reference_id`, `actor_type` | `type`: `in`, `out`, `adjustment`; catat setiap perubahan stock. |
| `customers` | `id`, `name`, `phone`, `email`, `address`, `tags`, `last_order_at` | `phone` opsional unik per bisnis. |
| `orders` | `id`, `customer_id`, `status`, `payment_status`, `subtotal`, `discount`, `total`, `ordered_at`, `notes` | Status: `draft`, `confirmed`, `fulfilled`, `cancelled`. |
| `order_items` | `id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `line_total` | Simpan snapshot nama/harga. |
| `tasks` | `id`, `title`, `status`, `priority`, `due_at`, `assignee_id`, `source` | Status: `open`, `done`; `source`: `dashboard`, `agent`. |
| `notes` | `id`, `body`, `entity_type`, `entity_id`, `author_id`, `source` | `entity_type` bisa `business`, `customer`, `order`, `product`. |
| `insights` | `id`, `type`, `title`, `summary`, `severity`, `metric`, `status`, `generated_at` | Insight tersimpan agar dashboard/GPT konsisten; `status`: `new`, `seen`, `dismissed`. |
| `activity_logs` | `id`, `actor_type`, `actor_name`, `action`, `entity_type`, `entity_id`, `metadata` | Audit append-only; aktor `user`, `agent`, atau `system`. |
| `literacy_receipts` | `id`, `question`, `answer`, `sources`, `disclaimer`, `topic`, `created_by` | Bukti jawaban edukasi AI; bukan nasihat hukum/keuangan. |

Aturan minimum:

- Semua query dibatasi `business_id`; jangan percaya ID lintas bisnis dari Action.
- Pembuatan/ubah order yang mengubah stok harus membuat `stock_movements` dan `activity_logs` dalam satu transaksi.
- Simpan `metadata` sebagai JSON untuk payload sebelum/sesudah perubahan tanpa membuat tabel audit tambahan.

## 3. API Routes

Base URL: `/api/v1`. Semua respons JSON memiliki bentuk `{ data, error? }`; route mutasi menulis audit log.

| Method / route | Fungsi | Dipakai oleh |
|---|---|---|
| `GET /summary` | KPI: omzet, order, stok menipis, tugas terbuka, insight terbaru | Dashboard, GPT |
| `GET, POST /products` | List/filter dan tambah produk | Dashboard, GPT |
| `GET, PATCH /products/:id` | Detail dan edit produk | Dashboard, GPT |
| `POST /products/:id/stock-movements` | Tambah/kurangi/koreksi stock | Dashboard, GPT |
| `GET /stock/low` | Produk pada/bawah `reorder_level` | Dashboard, GPT |
| `GET, POST /customers` | List dan tambah pelanggan | Dashboard, GPT |
| `GET, PATCH /customers/:id` | Detail dan edit pelanggan | Dashboard, GPT |
| `GET, POST /orders` | List/filter dan buat order dengan item | Dashboard, GPT |
| `GET, PATCH /orders/:id` | Detail dan ubah status/pembayaran | Dashboard, GPT |
| `GET, POST /tasks` | List dan buat tugas | Dashboard, GPT |
| `PATCH /tasks/:id` | Ubah tugas/selesaikan | Dashboard, GPT |
| `GET, POST /notes` | Filter dan tulis catatan kontekstual | Dashboard, GPT |
| `GET /insights` | Insight tersimpan | Dashboard, GPT |
| `POST /insights/generate` | Hitung aturan sederhana dari data transaksi/stock | Dashboard, GPT (opsional) |
| `GET /activity` | Aktivitas terbaru | Dashboard, GPT |
| `GET, POST /literacy-receipts` | Riwayat dan simpan receipt edukasi | Dashboard, GPT |

Untuk OpenAPI Action, ekspos hanya operasi yang diperlukan dalam demo: `getBusinessSummary`, `findProducts`, `adjustStock`, `createOrder`, `getLowStock`, `createTask`, `addNote`, `getInsights`, dan `saveLiteracyReceipt`. Deskripsi operasi harus menyatakan parameter wajib, efek stok, dan konfirmasi yang wajib diminta sebelum mutasi.

## 4. Dashboard Screens

1. **Overview**: KPI hari ini, order terakhir, stok menipis, tugas terbuka, tiga insight, dan aktivitas terakhir.
2. **Products**: tabel produk, pencarian SKU/nama, form tambah/edit, status stock dan reorder level.
3. **Stock**: daftar low stock dan riwayat movement; aksi penyesuaian stock dengan alasan.
4. **Orders**: daftar/filter order, detail item, status pemenuhan dan pembayaran.
5. **Customers**: tabel pelanggan, riwayat order ringkas, catatan pelanggan.
6. **Tasks & Notes**: tugas terbuka/selesai dan catatan terhubung ke entitas bisnis.
7. **Insights**: insight yang bisa ditandai sudah dibaca/dismiss; tampilkan angka sumbernya.
8. **Activity**: audit timeline, termasuk tindakan oleh `agent`.
9. **Literacy Receipts**: pertanyaan, jawaban, sumber, disclaimer, dan waktu dibuat.

Gunakan shell dashboard dari template yang dipilih: sidebar, topbar, tabel, form dialog, toast, empty/loading/error state. Tidak perlu membangun design system baru.

## 5. Agent Harness dan Runtime Mapping

| Lapisan | Implementasi minimal | Tanggung jawab |
|---|---|---|
| Custom GPT | Instructions + imported `temanusaha-actions.yaml` | Bahasa Indonesia, memahami intent UMKM, memilih Action, merangkum hasil. |
| GPT Actions | HTTPS calls ke `/api/v1/*` dengan API key/service token | Fetch dan mutasi data terotorisasi. |
| API/service | Validasi input, scope `business_id`, transaksi order/stock, audit log | Domain rule dan source of truth. |
| Database | Tabel pada bagian 2 | State bisnis dan receipt. |
| Dashboard | Client ke API yang sama | Operator dapat memverifikasi/edit hasil agent. |

Runtime flow:

```text
User -> Custom GPT -> GPT Action -> API/service -> database
                  <- JSON result <- API/service <- database
User -> Dashboard ----------------> API/service -> database
```

Instruksi agent minimum:

- Jawab dalam Bahasa Indonesia yang singkat dan operasional.
- Untuk pertanyaan data, panggil Action sebelum menyebut angka.
- Sebelum tindakan destruktif atau mutasi bernilai material (hapus, batalkan order, kurangi stok besar), jelaskan dampak dan minta konfirmasi eksplisit.
- Setelah Action mutasi sukses, sebutkan ringkas hasilnya; API mencatat audit log.
- Jawaban edukasi bisnis/AI harus menyebut batasan, tidak mengarang data usaha, dan menyimpan `literacy_receipt` bila pengguna meminta ringkasan/penjelasan yang ingin dirujuk.
- Jangan mengakses atau mengungkap data lintas `business_id`.

## 6. Environment Variables

```dotenv
# App
APP_URL=http://localhost:3000
APP_ENV=development

# Database
DATABASE_URL=

# Auth / tenant demo
DEMO_BUSINESS_ID=biz_demo_jakarta
DEMO_USER_ID=user_owner_demo

# API for dashboard and GPT Actions
API_BASE_URL=http://localhost:3000/api/v1
ACTION_API_KEY=change-me

# OpenAI (hanya jika backend juga memanggil model; Custom GPT Actions tidak memerlukannya)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

Jangan masukkan `OPENAI_API_KEY` atau `ACTION_API_KEY` ke frontend/public env. Custom GPT menyimpan autentikasi Action pada konfigurasi Action, bukan di kode browser.

## 7. Seed Data

Seed satu bisnis `Warung Rasa Jakarta` dan satu owner `Rahma`. Buat data yang mendukung narasi demo:

- Produk: Kopi Susu Gula Aren (stok 18, reorder 10), Es Teh Lemon (stok 7, reorder 12), Roti Bakar Cokelat (stok 24, reorder 8), Nasi Ayam Sambal (stok 4, reorder 10).
- Pelanggan: Dita Pramesti, Budi Santoso, dan Kantor Karya Bersama.
- Lima order dari tujuh hari terakhir; minimal dua `fulfilled`, satu `confirmed`, dan satu order dengan Es Teh/Nasi Ayam.
- Stock movement awal dan satu pengurangan karena order.
- Tiga tugas: beli bahan Nasi Ayam (open/high), follow-up Kantor Karya Bersama (open/medium), cek kas harian (done).
- Dua catatan pelanggan dan tiga activity log, salah satunya aktor `agent`.
- Dua insights: "Nasi Ayam Sambal di bawah reorder level" dan "Es Teh Lemon perlu restock"; sertakan metric jumlah stok.
- Satu literacy receipt contoh tentang cara membaca stok menipis, dengan disclaimer.

## 8. Checklist Runnable Demo

- [ ] `DATABASE_URL` terisi dan migrasi/schema berhasil diterapkan.
- [ ] Seed selesai dan dashboard menampilkan `Warung Rasa Jakarta` dengan data di atas.
- [ ] Server berjalan; `/api/v1/summary` mengembalikan JSON untuk tenant demo.
- [ ] Dashboard bisa melihat produk, low stock, order, pelanggan, tugas, insights, activity, dan receipts.
- [ ] Buat order demo mengurangi `stock_on_hand`, menambah `stock_movement`, dan menulis `activity_log` secara atomik.
- [ ] OpenAPI spec dapat diimpor ke Custom GPT dan auth Action diarahkan ke environment demo.
- [ ] Uji percakapan: "Stok apa yang menipis?", "Kurangi stok Kopi Susu 2 untuk tester" (setelah konfirmasi), "Buat tugas beli bahan Nasi Ayam", dan "Apa arti reorder level?"
- [ ] Setiap mutasi dari GPT tampil di dashboard Activity; jawaban literasi tersimpan di Receipts.
- [ ] Siapkan satu akun/demo tenant saja; reset database/seed sebelum presentasi bila data berubah.
