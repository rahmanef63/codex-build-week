# TemanUsaha AI

TemanUsaha AI mengubah instruksi Bahasa Indonesia menjadi pencatatan pesanan, perubahan stok, dan pekerjaan yang bisa diverifikasi oleh pemilik warung.

Produk memiliki dua pengalaman yang terpisah: **Demo interaktif Bu Sari** untuk membuktikan workflow GPT Actions dan **dashboard usaha** untuk UMKM yang mendaftar dengan datanya sendiri.

- [`/demo`](https://codex-build-week.vercel.app/demo) memakai satu bisnis sintetis, **Warung Nasi Bu Sari**, enam operasi GPT Actions, dan dashboard realtime Today, Orders, serta AI Activity.
- [`/dashboard`](https://codex-build-week.vercel.app/dashboard) sudah live: registrasi email/kata sandi via `@convex-dev/auth` (provider Password), onboarding pembuatan bisnis (nama + produk awal), dan dashboard Convex realtime milik pengguna sendiri. UI-nya mengikuti design system `template-convex-starter`: dark secara default, aksen amber, dan token-driven. Rute lama `/real` tetap ada sebagai redirect permanen ke `/dashboard`, sehingga tautan lama tetap berfungsi.

Pilihan pengalaman tersedia di [`/`](https://codex-build-week.vercel.app/). Data Demo dan dashboard usaha terisolasi penuh (`businessId = userId`). Enam Action Demo tetap khusus Bu Sari; setiap dashboard usaha memiliki schema dan token Action sendiri yang menentukan tenant di server.

## Arsitektur

```text
Pemilik warung -> Custom GPT -> Convex HTTP Actions -> Convex database
Pemilik warung -> Next.js dashboard -------------> Convex database
UMKM (real)    -> Next.js /dashboard + Convex Auth (/real -> redirect) ---> Convex database
UMKM (lokal)   -> Next.js Media Studio ----------> OpenAI Images / TTS
```

Convex adalah satu-satunya source of truth. Pembuatan order, pengurangan stok, dan audit log berjalan dalam satu mutation atomik. Next.js hanya menjadi lapisan visibilitas realtime; tidak ada API gateway kedua.

Mode Real di `/dashboard` memakai `@convex-dev/auth` dengan provider Password untuk registrasi dan login email/kata sandi (live per persetujuan owner 2026-07-18, tercatat di AGENTS.md). Rute `/real` dipertahankan sebagai redirect permanen ke `/dashboard` agar tautan lama tidak putus. Setelah onboarding (nama bisnis + produk awal), pengguna mendapat dashboard Convex realtime miliknya sendiri. Isolasi data dijamin dengan `businessId = userId`, sehingga data pengguna terpisah penuh dari data demo Bu Sari. GPT Actions Demo tetap khusus Bu Sari. Pada **Agent GPT** di dashboard, pemilik dapat menyalin schema Workspace dan token sekali-pakai untuk GPT Builder; endpoint Workspace menentukan `businessId` dari token, bukan dari input GPT.

## Struktur

`app/` memakai dua route group App Router (transparan terhadap URL — `/`, `/demo`, `/dashboard`, `/real` tetap sama persis):

- `app/(public)/` — `/` dan `/demo` (termasuk `/demo/[view]` untuk deep link per tampilan kartu), diindeks mesin pencari.
- `app/(workspace)/` — `/dashboard` dan `/real` (redirect ke `/dashboard`), ditandai `noindex` karena menampung data milik pengguna (Mode Real live).

`app/robots.ts` dan `app/sitemap.ts` men-generate `/robots.txt` dan `/sitemap.xml` dari `shared/lib/site.ts`; keduanya melarang indexing `/dashboard` dan `/real`. Kode konsumer lain memakai `slices/<nama>/` (barrel `index.ts` sebagai kontrak, `slice.json` + `slice.manifest.json` untuk metadata) dan `shared/` untuk kode dipakai lebih dari satu slice. `rr.json` di root menyimpan konfigurasi konvensi resource template.

## Stack

- Next.js App Router + React + TypeScript
- Convex database, queries, mutations, dan HTTP Actions
- `@convex-dev/auth` + `@auth/core` untuk autentikasi email/kata sandi Mode Real
- Custom GPT + OpenAPI Actions
- OpenAI Image API dan Text-to-Speech untuk preview onboarding lokal
- Codex GPT-5 untuk orkestrasi build lokal dan cloud

Media Studio di Mode Real memakai `gpt-image-2` dan `gpt-4o-mini-tts` hanya saat `next dev`. Route berbayar ini hard-disabled pada build Production sampai identitas pengguna, kuota persisten, dan rate limit tersedia. Brief lokal dikirim ke OpenAI; jangan masukkan data pelanggan, data pribadi, kata sandi, atau rahasia usaha.

## Menjalankan Next.js dengan Convex Cloud

Prasyarat: Node.js 22.6 atau lebih baru.

```powershell
npm install
npm run convex:sync
npm run dev
```

Project ini memakai deployment cloud development `utmost-snake-682`; tidak perlu menjalankan backend Convex lokal. `.env.local` menyimpan binding cloud dan URL client/site, sedangkan secret Action disimpan pada environment deployment Convex.

Di terminal kedua, pasang secret pada deployment yang sedang aktif:

```powershell
npx convex env set ACTION_API_KEY "ganti-dengan-secret-acak"
npx convex env set DEMO_RESET_KEY "ganti-dengan-secret-reset"
npx convex run seed:reset '{\"resetKey\":\"ganti-dengan-secret-reset\"}'
```

Autentikasi dashboard membutuhkan `JWT_PRIVATE_KEY`, `JWKS`, dan `SITE_URL` pada deployment Convex. Untuk mengaktifkan verifikasi email dan pemulihan kata sandi, tambahkan `AUTH_RESEND_KEY` serta `AUTH_EMAIL_FROM` (alamat pengirim yang sudah diverifikasi di Resend). Jangan menaruh material kunci di repo, chat, atau screenshot.

Setelah Next.js memiliki URL HTTPS publik, hubungkan URL tersebut ke Convex agar Action dapat mengembalikan kartu PNG:

```powershell
npx convex env set DASHBOARD_PUBLIC_URL "https://nama-deployment.vercel.app"
```

Buka [http://localhost:3000](http://localhost:3000), lalu pilih `/demo` atau `/dashboard` (`/real` akan dialihkan ke `/dashboard`). Jalankan `npm run check` untuk test, typecheck, dan production build.

Untuk mencoba preview logo/poster dan panduan suara hanya di mesin lokal, simpan `OPENAI_API_KEY` pada `.env.local`. Jangan memasukkan key ke Vercel, Git, screenshot, atau chat. Production tetap menampilkan readiness flow tanpa memanggil endpoint OpenAI berbayar.

## Data demo

Seed membuat Warung Nasi Bu Sari dengan lima produk:

| Produk | Harga | Stok | Ambang stok rendah |
| --- | ---: | ---: | ---: |
| Nasi Ayam | Rp15.000 | 60 | 5 |
| Es Teh | Rp5.000 | 60 | 8 |
| Ayam Goreng | Rp12.000 | 7 | 5 |
| Nasi Putih | Rp5.000 | 20 | 8 |
| Sambal Extra | Rp3.000 | 6 | 10 |

Order demo `3 Nasi Ayam + 2 Es Teh` harus bernilai Rp55.000.

## GPT Actions — hanya Mode Demo

HTTP Actions tersedia pada `https://utmost-snake-682.convex.site`:

| Method | Path | Operation ID |
| --- | --- | --- |
| POST | `/api/orders` | `create_order` |
| GET | `/api/orders` | `list_pending_orders` |
| PATCH | `/api/orders/{id}` | `update_order` |
| GET | `/api/inventory/low-stock` | `get_low_stock_items` |
| GET | `/api/summary/today` | `get_daily_summary` |
| GET | `/api/dashboard-card?view=today` | `get_dashboard_card_image` |

Semua endpoint adalah kontrak Demo-only dan mewajibkan header `X-Action-API-Key`. Mode Real tidak boleh memanggilnya. `POST /api/orders` juga mewajibkan `requestId` agar retry Action tidak menggandakan order. Retry dengan payload yang sama mengembalikan order awal; pemakaian `requestId` yang sama untuk payload berbeda ditolak dengan HTTP 409.

### Menghubungkan Custom GPT

1. Ikuti paket field-by-field di [`GPTs/alfa.md`](GPTs/alfa.md).
2. Di GPT editor, buat Action dan tempel [`GPTs/temanusaha-actions.yaml`](GPTs/temanusaha-actions.yaml). [`GPTs/action-schema.json`](GPTs/action-schema.json) adalah cermin JSON dari spesifikasi Actions yang sama.
3. Pilih API key dengan custom header `X-Action-API-Key`.
4. Untuk Demo, masukkan `ACTION_API_KEY`. Untuk Workspace, gunakan schema dan token yang dibuat di tab **Agent GPT** dashboard; jangan menaruh token di chat/repo.
5. Uji setiap operasi di Preview sebelum demo atau pemakaian usaha.

Format konfirmasi dan template AI Action Receipt ada di [`GPTs/alfa.md`](GPTs/alfa.md).

## Codex: project lokal dan cloud

Folder ini adalah local project Codex. `AGENTS.md` menyimpan scope, aturan keamanan, dan perintah verifikasi yang berlaku lintas task.

Untuk Codex cloud:

1. Push repo ini ke GitHub.
2. Buat cloud environment untuk repo/branch tersebut.
3. Gunakan setup command `npm ci` dan pin Node.js 22.6+.
4. Tambahkan `NEXT_PUBLIC_CONVEX_URL` dari deployment cloud sebagai environment variable bila cloud task perlu menjalankan Next.js.
5. Jalankan task cloud per hasil yang terpisah, misalnya backend, UI, atau review; merge melalui diff/PR.

ChatGPT Project dan local project bukan filesystem yang sama. ChatGPT Project menyimpan chat, file, instructions, dan sources di cloud; folder lokal tetap sumber kode. GitHub menjadi jembatan yang bisa di-checkout oleh Codex cloud.

Progress, kontrak file, dan model yang dilaporkan setiap agent ada di [`TASKS.md`](TASKS.md). Agent Alpha mengorkestrasi integrasi; agent lain bekerja paralel dengan satu pemilik write-scope per folder.

## Responsible AI

- Data demo seluruhnya sintetis.
- Angka bisnis hanya boleh berasal dari Action/Convex.
- Mutasi transaksi harus dikonfirmasi dalam percakapan.
- API menolak stok negatif, update kosong, dan request tanpa API key.
- Dashboard dan AI Activity menjadi bukti yang dapat dikoreksi pengguna.
- Demo tidak memproses pembayaran nyata.

## Batas MVP

Belum ada multi-tenant admin, WhatsApp API, payment gateway, OCR, accounting, forecasting, atau Agents SDK runtime.

## Submission

Repository: [rahmanef63/codex-build-week](https://github.com/rahmanef63/codex-build-week).

Devpost draft: [TemanUsaha AI](https://devpost.com/software/temanusaha-ai).

Demo produk: [codex-build-week.vercel.app/demo](https://codex-build-week.vercel.app/demo). Slide deck tersedia di [codex-build-week.vercel.app/presentation](https://codex-build-week.vercel.app/presentation).

Dokumentasi resmi: [Codex Projects](https://learn.chatgpt.com/docs/projects), [Codex cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environment), [Custom GPT Actions](https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts), [Convex + Next.js](https://docs.convex.dev/quickstart/nextjs), dan [Convex HTTP Actions](https://docs.convex.dev/functions/http-actions).
