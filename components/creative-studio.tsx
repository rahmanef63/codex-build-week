"use client";

import { useEffect, useState } from "react";

type Kind = "logo" | "poster";

export function CreativeStudio({ enabled }: Readonly<{ enabled: boolean }>) {
  const [brief, setBrief] = useState("");
  const [imageUrl, setImageUrl] = useState<string>();
  const [kind, setKind] = useState<Kind>("logo");
  const [message, setMessage] = useState(
    enabled
      ? "Jelaskan usaha Anda, lalu pilih hasil yang ingin dibuat."
      : "Studio visual dinonaktifkan di Production untuk melindungi kuota API.",
  );
  const [pending, setPending] = useState(false);

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  async function generate(nextKind: Kind) {
    const normalizedBrief = brief.trim();
    if (!normalizedBrief) {
      setMessage("Isi brief usaha terlebih dahulu.");
      return;
    }

    setKind(nextKind);
    setPending(true);
    setMessage(`Sedang membuat ${nextKind}…`);

    try {
      const response = await fetch("/api/creative-image", {
        body: JSON.stringify({ brief: normalizedBrief, kind: nextKind }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) throw new Error();

      const nextImageUrl = URL.createObjectURL(await response.blob());
      setImageUrl(nextImageUrl);
      setMessage(`${nextKind === "logo" ? "Logo" : "Poster"} siap diperiksa.`);
    } catch {
      setMessage("Hasil belum berhasil dibuat. Periksa konfigurasi API lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="creative-studio" aria-labelledby="creative-title">
      <div className="creative-copy">
        <span className="eyebrow">Studio visual AI</span>
        <h2 id="creative-title">Buat arah logo atau poster usaha.</h2>
        <p>
          Hasil adalah konsep awal dari AI. Periksa nama, teks, dan hak penggunaan sebelum dipublikasikan.
        </p>
        <p className="creative-disclosure">
          Saat fitur lokal diaktifkan, brief dikirim ke OpenAI. Jangan masukkan data pelanggan,
          data pribadi, kata sandi, atau rahasia usaha.
        </p>
        <label htmlFor="creative-brief">Brief usaha</label>
        <textarea
          id="creative-brief"
          disabled={!enabled}
          maxLength={500}
          onChange={(event) => setBrief(event.target.value)}
          placeholder="Contoh: kedai nasi rumahan yang hangat, cepat, dan terjangkau untuk pekerja kantoran"
          rows={4}
          value={brief}
        />
        <div className="creative-actions">
          <button disabled={!enabled || pending} onClick={() => generate("logo")} type="button">
            Buat logo
          </button>
          <button disabled={!enabled || pending} onClick={() => generate("poster")} type="button">
            Buat poster
          </button>
        </div>
        <p aria-live="polite" className="creative-status">{message}</p>
      </div>
      <div className="creative-preview">
        {imageUrl ? (
          <>
            {/* Generated user-requested content cannot use next/image optimization. */}
            <img alt={`Konsep ${kind} yang dibuat AI`} src={imageUrl} />
            <a download={`temanusaha-${kind}.png`} href={imageUrl}>Simpan PNG</a>
          </>
        ) : (
          <div aria-hidden="true">
            <span>AI</span>
            <strong>Preview {kind}</strong>
          </div>
        )}
      </div>
    </section>
  );
}
