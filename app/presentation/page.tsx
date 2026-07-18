import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Presentasi",
  description: "Deck interaktif TemanUsaha AI untuk OpenAI Build Week.",
};

export default function PresentationPage() {
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        background: "#08150f",
      }}
    >
      <iframe
        src="/presentation/index.html"
        title="Presentasi interaktif TemanUsaha AI"
        allow="fullscreen"
        style={{
          width: "100%",
          height: "100%",
          border: 0,
          display: "block",
        }}
      />
    </main>
  );
}
