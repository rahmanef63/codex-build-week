# Security Policy

## Supported version

Perbaikan keamanan diterapkan pada branch `main`.

## Melaporkan kerentanan

Jangan membuka issue publik untuk dugaan kerentanan, token bocor, bypass autentikasi, atau masalah isolasi tenant.

Laporkan secara privat melalui GitHub Security Advisories:

1. Buka tab **Security** repository.
2. Pilih **Advisories**.
3. Pilih **Report a vulnerability**.

Sertakan dampak, langkah reproduksi minimum, endpoint atau komponen terkait, dan saran mitigasi bila tersedia. Jangan menyertakan data pelanggan, credential aktif, atau token mentah.

Pemilik project akan berusaha mengonfirmasi laporan dalam 7 hari dan memberi pembaruan setelah scope serta mitigasi dipahami.

## Ruang lingkup prioritas

- Bypass autentikasi dashboard.
- Akses lintas `businessId`.
- Pemalsuan atau pengambilan token Agent.
- Replay order yang menggandakan transaksi.
- Kebocoran data pelanggan atau secret melalui kartu publik, log, atau UI.
- Mutasi stok/order yang tidak atomik.

## Praktik aman

- Gunakan deployment development dan data sintetis untuk pengujian.
- Rotasi key yang dicurigai bocor.
- Jangan menaruh key dalam issue, PR, log CI, screenshot, atau source control.
- Jangan melakukan pengujian destruktif pada deployment production tanpa izin tertulis.
