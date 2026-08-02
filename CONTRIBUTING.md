# Contributing to Asisten Pribadi AI

Terima kasih sudah tertarik berkontribusi. Project ini adalah **reference build**: yang
dijaga bukan hanya fiturnya, tetapi polanya — satu backend Convex, satu permukaan HTTP,
dan tiga klien setara (Custom GPT, agent harness, dashboard web). Perubahan diprioritaskan
yang kecil, teruji, aman, dan mudah ditinjau.

## Mulai

1. Fork repository dan buat branch dari `main`.
2. Gunakan Node.js 22+.
3. Jalankan `npm install`.
4. Salin `.env.example` menjadi `.env.local` dan hubungkan deployment Convex development milik Anda.
5. Jalankan `npm run convex:sync`, lalu `npm run dev`.

Jangan memakai deployment production atau data pelanggan nyata untuk pengembangan.

## Sebelum membuka pull request

```bash
npm run check
```

Pull request harus:

- Menjelaskan masalah dan alasan perubahan.
- Memiliki scope yang fokus.
- Menambahkan atau memperbarui satu pemeriksaan yang dapat dijalankan ketika logika non-trivial berubah.
- Menjaga batas data Demo dan data pengguna.
- Menjaga backend tetap berfungsi tanpa frontend (dashboard bersifat opsional).
- Tidak menyertakan secret, token, `.env.local`, data pribadi, atau screenshot pelanggan.
- Menyertakan screenshot desktop/mobile untuk perubahan UI yang terlihat.

## Konvensi

- Gunakan TypeScript strict dan pola yang sudah ada di slice terkait.
- Gunakan `shared/` hanya untuk kode yang benar-benar dipakai lintas slice.
- Convex adalah source of truth; jangan membuat penyimpanan transaksi kedua di Next.js.
- Mutasi order harus menjaga atomisitas order, stok, dan `aiActionLogs`.
- Handler Agent harus menurunkan `businessId` dari token terverifikasi, bukan dari input klien.
- Perubahan pada permukaan `/api/agent/*` berlaku untuk **semua** klien. Kalau menyentuh
  kontraknya, perbarui ketiganya: schema Custom GPT di `GPTs/`, skill agent harness di
  `.claude/skills/`, dan dashboard.
- Pertahankan operation ID Demo yang didokumentasikan di README.
- Skenario contoh (warung, Bu Rina, Rp55.000) adalah fixture yang dipakai test. Boleh
  di-demote dalam framing, tidak boleh dihapus dari data, seed, atau test.
- Nama produk adalah **Asisten Pribadi AI** di semua locale — proper noun, tidak
  diterjemahkan. Jangan menambahkan kembali nama lama ke copy produk.
- Gunakan Bahasa Indonesia yang ringkas untuk alur operasional. Jika mengubah
  landing, perbarui keempat locale di `app/(public)/landing-copy.ts`.

## Commit

Gunakan pesan singkat dalam bentuk imperatif, misalnya:

```text
Clarify agent token setup
Fix mobile navigation labels
Add tenant isolation coverage
```

## Melaporkan bug

Sertakan:

- Perilaku yang diharapkan dan aktual.
- Langkah reproduksi minimum.
- Klien yang dipakai (Custom GPT, agent harness, atau dashboard).
- Browser dan viewport jika terkait UI.
- Output error yang sudah disanitasi.

Untuk kerentanan keamanan, ikuti [SECURITY.md](SECURITY.md) dan jangan membuat issue publik.
