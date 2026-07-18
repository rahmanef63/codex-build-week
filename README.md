# TemanUsaha AI

TemanUsaha AI mengubah instruksi Bahasa Indonesia menjadi pencatatan pesanan, perubahan stok, dan pekerjaan yang bisa diverifikasi oleh pemilik warung.

Demo sengaja sempit: satu bisnis sintetis, **Warung Nasi Bu Sari**, enam operasi GPT Actions, dan satu dashboard realtime dengan tampilan Today, Orders, serta AI Activity.

## Arsitektur

```text
Pemilik warung -> Custom GPT -> Convex HTTP Actions -> Convex database
Pemilik warung -> Next.js dashboard -------------> Convex database
```

Convex adalah satu-satunya source of truth. Pembuatan order, pengurangan stok, dan audit log berjalan dalam satu mutation atomik. Next.js hanya menjadi lapisan visibilitas realtime; tidak ada API gateway kedua.

## Stack

- Next.js App Router + React + TypeScript
- Convex database, queries, mutations, dan HTTP Actions
- Custom GPT + OpenAPI Actions
- Codex GPT-5 untuk orkestrasi build lokal dan cloud

Backend tidak memanggil OpenAI API secara langsung pada MVP ini. Agents SDK/Responses API baru perlu ditambahkan jika percakapan dipindahkan dari Custom GPT ke aplikasi sendiri.

## Menjalankan Next.js dengan Convex Cloud

Prasyarat: Node.js 20 atau lebih baru.

```powershell
npm install
npx convex dev --once
npm run dev
```

Project ini memakai deployment cloud development `utmost-snake-682`; tidak perlu menjalankan backend Convex lokal. `.env.local` menyimpan binding cloud dan URL client/site, sedangkan secret Action disimpan pada environment deployment Convex.

Di terminal kedua, pasang secret pada deployment yang sedang aktif:

```powershell
npx convex env set ACTION_API_KEY "ganti-dengan-secret-acak"
npx convex env set DEMO_RESET_KEY "ganti-dengan-secret-reset"
npx convex run seed:reset '{\"resetKey\":\"ganti-dengan-secret-reset\"}'
```

Setelah Next.js memiliki URL HTTPS publik, hubungkan URL tersebut ke Convex agar Action dapat mengembalikan kartu PNG:

```powershell
npx convex env set DASHBOARD_PUBLIC_URL "https://nama-deployment.vercel.app"
```

Buka [http://localhost:3000](http://localhost:3000). Jalankan `npm run check` untuk test, typecheck, dan production build.

## Data demo

Seed membuat Warung Nasi Bu Sari dengan lima produk:

| Produk | Harga | Stok | Ambang stok rendah |
| --- | ---: | ---: | ---: |
| Nasi Ayam | Rp15.000 | 12 | 5 |
| Es Teh | Rp5.000 | 18 | 8 |
| Ayam Goreng | Rp12.000 | 7 | 5 |
| Nasi Putih | Rp5.000 | 20 | 8 |
| Sambal Extra | Rp3.000 | 6 | 10 |

Order demo `3 Nasi Ayam + 2 Es Teh` harus bernilai Rp55.000.

## GPT Actions

HTTP Actions tersedia pada `https://utmost-snake-682.convex.site`:

| Method | Path | Operation ID |
| --- | --- | --- |
| POST | `/api/orders` | `create_order` |
| GET | `/api/orders?status=pending` | `list_pending_orders` |
| PATCH | `/api/orders/{id}` | `update_order` |
| GET | `/api/inventory/low-stock` | `get_low_stock_items` |
| GET | `/api/summary/today` | `get_daily_summary` |
| GET | `/api/dashboard-card?view=today` | `get_dashboard_card_image` |

Semua endpoint mewajibkan header `X-Action-API-Key`. `POST /api/orders` juga mewajibkan `requestId` agar retry Action tidak menggandakan order. Retry dengan payload yang sama mengembalikan order awal; pemakaian `requestId` yang sama untuk payload berbeda ditolak dengan HTTP 409.

### Menghubungkan Custom GPT

1. Ikuti paket field-by-field di [`GPTs/alfa.md`](GPTs/alfa.md).
2. Di GPT editor, buat Action dan tempel [`GPTs/temanusaha-actions.yaml`](GPTs/temanusaha-actions.yaml).
3. Pilih API key dengan custom header `X-Action-API-Key`.
4. Ambil nilai Action key dari Convex Dashboard atau `npx convex env get ACTION_API_KEY`, lalu masukkan ke GPT editor tanpa menaruhnya di chat/repo.
5. Uji setiap operasi di Preview sebelum demo.

Prompt utama:

```text
Catat pesanan Bu Rina, 3 nasi ayam dan 2 es teh, ambil jam 12.30, belum bayar.
```

Custom GPT harus menampilkan interpretasi dan meminta konfirmasi sebelum memanggil `create_order`. Setelah sukses, respons menggunakan AI Action Receipt:

```text
Apa yang saya pahami:
Apa yang saya lakukan:
Data yang digunakan:
Yang harus diperiksa:
Cara memberi instruksi lebih jelas:
```

## Codex: project lokal dan cloud

Folder ini adalah local project Codex. `AGENTS.md` menyimpan scope, aturan keamanan, dan perintah verifikasi yang berlaku lintas task.

Untuk Codex cloud:

1. Push repo ini ke GitHub.
2. Buat cloud environment untuk repo/branch tersebut.
3. Gunakan setup command `npm ci` dan pin Node.js 20+.
4. Tambahkan `NEXT_PUBLIC_CONVEX_URL` dari deployment cloud sebagai environment variable bila cloud task perlu menjalankan Next.js.
5. Jalankan task cloud per hasil yang terpisah, misalnya backend, UI, atau review; merge melalui diff/PR.

ChatGPT Project dan local project bukan filesystem yang sama. ChatGPT Project menyimpan chat, file, instructions, dan sources di cloud; folder lokal tetap sumber kode. GitHub menjadi jembatan yang bisa di-checkout oleh Codex cloud.

Progress dan pembagian agent/model ada di [`TASKS.md`](TASKS.md). Agent Alpha mengorkestrasi integrasi; Beta mengerjakan Convex/Actions; Gamma mengerjakan dashboard; Reviewer melakukan audit read-only. Semua agent build pada sesi ini memakai GPT-5 Codex.

## Responsible AI

- Data demo seluruhnya sintetis.
- Angka bisnis hanya boleh berasal dari Action/Convex.
- Mutasi transaksi harus dikonfirmasi dalam percakapan.
- API menolak stok negatif, update kosong, dan request tanpa API key.
- Dashboard dan AI Activity menjadi bukti yang dapat dikoreksi pengguna.
- Demo tidak memproses pembayaran nyata.

## Batas MVP

Belum ada login, multi-tenant admin, WhatsApp API, payment gateway, OCR, accounting, forecasting, atau Agents SDK runtime. Tambahkan hanya setelah alur enam Action terbukti andal.

## Submission

Repository branch: [rahmanef63/codex-build-week — agent/temanusaha-ai](https://github.com/rahmanef63/codex-build-week/tree/agent/temanusaha-ai).

Devpost draft: [TemanUsaha AI](https://devpost.com/software/temanusaha-ai).

Demo slide deck tersedia saat aplikasi berjalan di [`/presentation/index.html`](http://localhost:3000/presentation/index.html).

Sebelum Devpost: deploy dashboard dan Convex, rekam video publik kurang dari tiga menit, tambahkan URL repo/demo, lalu isi Codex `/feedback` session ID di sini.

```text
Codex feedback session ID: TODO
```

Dokumentasi resmi: [Codex Projects](https://learn.chatgpt.com/docs/projects), [Codex cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environment), [Custom GPT Actions](https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts), [Convex + Next.js](https://docs.convex.dev/quickstart/nextjs), dan [Convex HTTP Actions](https://docs.convex.dev/functions/http-actions).
