import {
  buildCreativePrompt,
  isOpenAIMediaEnabled,
  parseCreativeRequest,
  requestOpenAI,
} from "@/lib/openai-features";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isOpenAIMediaEnabled()) {
    return Response.json({ error: "Studio visual hanya tersedia untuk demo lokal." }, { status: 404 });
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Content-Type harus application/json." }, { status: 415 });
  }

  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader?.trim() ? Number(contentLengthHeader) : Number.NaN;
  if (!Number.isFinite(contentLength) || contentLength > 2_048) {
    return Response.json({ error: "Permintaan terlalu besar." }, { status: 413 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const creative = parseCreativeRequest(input);
  if (!creative) {
    return Response.json({ error: "Pilih logo atau poster dan isi brief maksimal 500 karakter." }, { status: 400 });
  }

  const model = "gpt-image-2";
  try {
    const response = await requestOpenAI("images/generations", {
      model,
      output_format: "png",
      prompt: buildCreativePrompt(creative.kind, creative.brief),
      quality: "medium",
      size: creative.kind === "logo" ? "1024x1024" : "1024x1536",
    });

    if (!response.ok) {
      console.error("openai-image-request-failed", response.status);
      return Response.json({ error: "Gambar belum berhasil dibuat. Coba lagi." }, { status: 502 });
    }

    const result = await response.json() as { data?: Array<{ b64_json?: string }> };
    const image = result.data?.[0]?.b64_json;
    if (!image) {
      console.error("openai-image-result-empty");
      return Response.json({ error: "Gambar belum berhasil dibuat. Coba lagi." }, { status: 502 });
    }

    return new Response(Buffer.from(image, "base64"), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "image/png",
        "X-OpenAI-Model": model,
      },
    });
  } catch {
    console.error("openai-image-unavailable");
    return Response.json({ error: "Studio visual belum tersedia." }, { status: 503 });
  }
}
