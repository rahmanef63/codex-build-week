# Jalur platform, DevOps, dan maintainer

Gunakan deployment milik sendiri. Repository ini memperlakukan Convex sebagai
product surface dan Vercel sebagai host dashboard opsional.

1. Buat deployment Convex dan Vercel terpisah dari production yang sudah ada.
2. Isi environment melalui dashboard provider, bukan file yang di-commit.
3. Gunakan `npm run build:auto` untuk provisioning dan deploy idempotent.
4. Jalankan `npm run check`, `npm audit --audit-level=high`, dan smoke test URL.
5. Uji `/api/agent/*` dengan token tenant A dan pastikan token tenant B tidak dapat membaca datanya.

Operasi reset Demo memakai `DEMO_RESET_KEY`, bersifat destruktif hanya untuk
tenant contoh, dan tetap memerlukan persetujuan sebelum dijalankan. Jangan
menjalankan `convex dev` watch mode terhadap deployment yang melayani production.

