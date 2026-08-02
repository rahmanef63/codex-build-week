# Asisten Pribadi AI assets

Filenames keep the `temanusaha-*` prefix on purpose — renaming them would break
external references for no gain. Only the product name in copy changed.

```text
brand/
  temanusaha-mark.png       Generated transparent source mark; still rendered.
  temanusaha-logo-horizontal.png        Wordmark, spells the OLD name — no longer rendered.
  temanusaha-logo-horizontal-white.png  Wordmark, spells the OLD name — no longer rendered.
  temanusaha-pattern.png
illustrations/
  warung-dashboard-banner.png
products/
  nasi-ayam.png
  es-teh.png
  ayam-goreng.png
  nasi-putih.png
  sambal-extra.png
states/
  orders-empty.png
  activity-empty.png
  stock-safe.png
  setup-unseeded.png
```

Next.js metadata uses `app/icon.svg`, `app/apple-icon.tsx`, the generic root
card in `app/opengraph-image.tsx`, and the Demo card in
`app/(public)/demo/opengraph-image.tsx`. All four are code-drawn: no product
name is baked into a binary, so a rename never leaves a stale image behind.
