# Jalur Custom GPT dan agent builder

Gunakan salah satu client; jangan membuat jalur backend khusus untuk client baru.

## Custom GPT

1. Buka `GPTs/alfa.md` dan ikuti field Builder secara berurutan.
2. Gunakan schema dari Agent Setup untuk data milik Anda.
3. Pasang token sebagai API key dengan header `X-Action-API-Key`.
4. Uji satu read, lalu satu mutation setelah konfirmasi eksplisit.

## Agent harness

```bash
node .claude/skills/asisten-pribadi/agent.mjs --help
node .claude/skills/asisten-pribadi/agent.mjs get_business_profile
```

Set `CONVEX_SITE_URL` dan `AGENT_TOKEN` hanya di environment lokal. Instruksi
lengkap dan contoh payload ada di `.claude/skills/asisten-pribadi/SKILL.md`.

## MCP

Endpoint `/mcp` memerlukan deployment-level bearer key dan token workspace.
Bearer key membuka server MCP, tetapi tidak menentukan tenant. Jangan mengurangi
model dua credential ini demi onboarding yang lebih singkat.

