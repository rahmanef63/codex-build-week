# Vibe coder path

This path is for people who are comfortable describing an outcome to AI but do
not want to maintain every implementation detail themselves.

1. Clone the repository and copy `.env.example` to `.env.local`.
2. Run `npm ci`, `npm run convex:sync`, then `npm run dev`.
3. Ask AI to change one small behavior and name the target file or page.
4. Always run `npm run check` before accepting the change.
5. For backend work, preserve route paths, operation IDs, validation, tenant derivation, and audit logs.

A useful prompt states the outcome, constraints, and verification method. For example:

```text
Add a short explanation to /docs. Do not change any endpoint or schema.
Keep the layout usable at 320px and make sure npm run check passes.
```

Never ask AI to paste a token or `.env.local` contents into a conversation.
