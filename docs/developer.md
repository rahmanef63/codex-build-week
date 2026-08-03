# Jalur software developer

Mulai dari kontrak publik, lalu ikuti aliran request sampai mutation.

1. Baca `AGENTS.md`, `README.md`, dan tabel Actions.
2. Jalankan `npm ci` dan `npm run check` untuk baseline.
3. Telusuri route di `convex/http.ts` dan `convex/agent_routes.ts`.
4. Telusuri validasi bersama di `convex/_shared/http.ts` dan mutation domain terkait.
5. Tambahkan satu regression test terkecil yang gagal tanpa perubahan Anda.

Checklist perubahan endpoint:

- Input divalidasi di trust boundary.
- `businessId` tidak diterima dari payload client.
- Mutation menulis `aiActionLogs`.
- Operasi order tetap idempotent dan atomik dengan perubahan stok.
- Custom GPT, harness, dan MCP tetap memakai vocabulary operasi yang sama.

