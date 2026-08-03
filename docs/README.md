# Panduan Asisten Pribadi AI

Mulai dari latar belakang Anda. Semua jalur memakai backend dan endpoint yang
sama; yang berbeda hanya alat dan kedalaman penjelasannya.

| Latar belakang | Mulai di |
| --- | --- |
| Belum pernah coding | [Tanpa pengalaman coding](no-coding.md) |
| Vibe coder / nyaman memberi prompt | [Vibe coder](vibe-coder.md) |
| Software developer | [Developer](developer.md) |
| Builder Custom GPT atau agent | [Agent builder](agent-builder.md) |
| Platform, DevOps, atau maintainer | [Platform dan operasi](platform-operations.md) |

Gunakan halaman `/docs` pada aplikasi untuk wizard onboarding dan diagram
endpoint interaktif. Untuk contoh data sintetis yang siap dicoba, buka `/demo`.

## Aturan yang berlaku untuk semua jalur

- Jangan menaruh token di chat, screenshot, issue, atau source control.
- Backend menentukan tenant dari token atau identitas terverifikasi, bukan dari payload.
- Minta konfirmasi pengguna sebelum operasi tulis.
- Gunakan `requestId` baru untuk order baru; gunakan nilai yang sama hanya saat retry payload identik.
- Mulai dari satu operasi baca sebelum menguji operasi tulis.

