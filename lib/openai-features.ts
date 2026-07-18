export const onboardingScripts = [
  "Panduan ini dibacakan oleh suara AI. Mulai dengan identitas usaha dan akun pemilik yang terverifikasi. Siapkan nama usaha, jenis produk, dan kontak pemilik sebelum menghubungkan data.",
  "Panduan ini dibacakan oleh suara AI. Pisahkan data usaha nyata dari data demo. Gunakan penyimpanan khusus agar pesanan, stok, dan data pelanggan tidak bercampur.",
  "Panduan ini dibacakan oleh suara AI. Tetapkan izin untuk setiap tindakan AI. Bedakan tindakan yang hanya boleh dibaca, diusulkan, atau dijalankan setelah konfirmasi pemilik.",
] as const;

export type CreativeKind = "logo" | "poster";

export function isOpenAIMediaEnabled(
  environment: Record<string, string | undefined> = process.env,
) {
  return environment.NODE_ENV === "development";
}

export function parseCreativeRequest(value: unknown) {
  if (!value || typeof value !== "object") return null;

  const { brief, kind } = value as Record<string, unknown>;
  const normalizedBrief = typeof brief === "string" ? brief.trim() : "";
  if ((kind !== "logo" && kind !== "poster") || !normalizedBrief || normalizedBrief.length > 500) {
    return null;
  }

  return { brief: normalizedBrief, kind } as const;
}

export function buildCreativePrompt(kind: CreativeKind, brief: string) {
  const format = kind === "logo"
    ? "an original, simple vector-style logo concept on a clean neutral background, with a strong silhouette that remains clear at small sizes"
    : "an original vertical promotional poster with a clear visual hierarchy, generous text-safe space, and a polished small-business campaign look";

  return [
    `Create ${format}.`,
    "Use TemanUsaha AI's warm Indonesian visual direction: deep green, fresh cream, and restrained amber accents.",
    "Do not imitate an existing brand, logo, artist, or copyrighted character. Avoid illegible small text and watermarks.",
    `Business brief: ${brief}`,
  ].join(" ");
}

export function getOnboardingScript(step: number) {
  return Number.isInteger(step) ? onboardingScripts[step] ?? null : null;
}

export async function requestOpenAI(path: string, body: unknown) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");

  return fetch(`https://api.openai.com/v1/${path}`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    signal: AbortSignal.timeout(55_000),
  });
}
