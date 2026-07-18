import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ConvexClientProvider } from "@/components/convex-provider";
import { CreativeStudio } from "@/components/creative-studio";
import { RealApp } from "@/components/real-app";
import { isOpenAIMediaEnabled } from "@/lib/openai-features";

export const metadata: Metadata = {
  title: "Mode Real",
  description: "Dashboard usaha Anda sendiri, terhubung ke Convex dengan akun aman.",
};

export default function RealPage() {
  const mediaEnabled = isOpenAIMediaEnabled();

  return (
    <main className="real-shell">
      <nav className="real-nav" aria-label="Navigasi mode">
        <Link href="/">← Pilih mode</Link>
        <Image
          src="/assets/brand/temanusaha-logo-horizontal.png"
          alt="TemanUsaha AI"
          width={210}
          height={64}
          priority
        />
      </nav>

      <section className="real-hero" aria-labelledby="real-title">
        <div className="real-copy">
          <span className="eyebrow">Mode Real</span>
          <h1 id="real-title">Dashboard usaha Anda sendiri.</h1>
          <p>
            Daftar dengan email, kenalkan usaha Anda, dan pantau pesanan, stok,
            serta omzet secara realtime. Data Anda tersimpan terpisah dari demo
            dan hanya bisa diakses oleh akun Anda.
          </p>
        </div>
      </section>

      <ConvexClientProvider>
        <RealApp />
      </ConvexClientProvider>

      <CreativeStudio enabled={mediaEnabled} />
    </main>
  );
}
