# Jalur vibe coder

Jalur ini cocok jika Anda nyaman menjelaskan hasil yang diinginkan kepada AI,
tetapi tidak ingin memelihara banyak detail implementasi.

1. Clone repository dan salin `.env.example` menjadi `.env.local`.
2. Jalankan `npm ci`, `npm run convex:sync`, lalu `npm run dev`.
3. Minta AI mengubah satu perilaku kecil dan sebutkan file atau halaman targetnya.
4. Selalu jalankan `npm run check` sebelum menerima perubahan.
5. Untuk backend, pertahankan path, operation ID, validasi, tenant derivation, dan audit log.

Prompt yang baik menyebutkan hasil, batasan, dan cara verifikasi. Contoh:

```text
Tambahkan penjelasan pada halaman /docs. Jangan mengubah endpoint atau schema.
Pastikan mobile 320px tetap rapi dan npm run check lulus.
```

Jangan meminta AI menempel token atau isi `.env.local` ke percakapan.

