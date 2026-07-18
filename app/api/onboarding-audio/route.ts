import {
  getOnboardingScript,
  isOpenAIMediaEnabled,
  requestOpenAI,
} from "@/slices/creative-studio";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isOpenAIMediaEnabled()) {
    return Response.json({ error: "Audio AI hanya tersedia untuk demo lokal." }, { status: 404 });
  }

  const rawStep = new URL(request.url).searchParams.get("step");
  const step = rawStep === null ? Number.NaN : Number(rawStep);
  const script = getOnboardingScript(step);
  if (!script) return Response.json({ error: "Langkah tidak valid." }, { status: 400 });

  const model = "gpt-4o-mini-tts";
  try {
    const response = await requestOpenAI("audio/speech", {
      input: script,
      instructions: "Bacakan dalam bahasa Indonesia dengan hangat, jelas, tenang, dan tidak terburu-buru.",
      model,
      response_format: "mp3",
      voice: "coral",
    });

    if (!response.ok || !response.body) {
      console.error("openai-audio-request-failed", response.status);
      return Response.json({ error: "Audio belum tersedia. Coba lagi." }, { status: 502 });
    }

    return new Response(response.body, {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        "Content-Type": "audio/mpeg",
        "X-OpenAI-Model": model,
      },
    });
  } catch {
    console.error("openai-audio-unavailable");
    return Response.json({ error: "Audio onboarding belum tersedia." }, { status: 503 });
  }
}
