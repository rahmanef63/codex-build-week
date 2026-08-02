"use client";

import { useState, type ReactNode } from "react";
import { useMutation } from "convex/react";
import { MapPin } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { RequestLocation } from "../types";

// ISO 3166-1 alpha-2 → Indonesian country name, via the platform's own CLDR
// data. No geo dependency, no lookup table to rot.
function countryName(code: string) {
  try {
    return new Intl.DisplayNames(["id"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function locationRows(location: RequestLocation) {
  const place = [location.city, location.region].filter(Boolean).join(", ");
  return [
    ["Negara", location.country ? `${countryName(location.country)} (${location.country})` : null],
    ["Wilayah / kota", place || null],
    ["Zona waktu", location.timezone ?? null],
  ] as const;
}

function Section({
  children,
  eyebrow,
  intro,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  intro?: string;
  title: string;
}) {
  return (
    <section className="grid w-full gap-6 py-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-12">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">{eyebrow}</p>
        <h2 className="mt-2 text-lg font-semibold">{title}</h2>
        {intro ? <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{intro}</p> : null}
      </div>
      <div className="min-w-0 max-w-xl">{children}</div>
    </section>
  );
}

export function AccountSettings({
  businessName,
  requestLocation,
}: {
  businessName: string;
  requestLocation?: RequestLocation;
}) {
  const update = useMutation(api.real.updateBusiness);
  const [name, setName] = useState(businessName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const location = requestLocation ?? {};
  const rows = locationRows(location);
  const hasLocation = rows.some(([, value]) => value !== null);

  return (
    <div className="w-full divide-y divide-border border-y border-border">
      <Section
        eyebrow="Profil ruang kerja"
        intro="Nama ini tampil di dashboard dan konfigurasi GPT Anda."
        title="Identitas dashboard"
      >
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            try {
              await update({ name });
              setSaved(true);
            } catch {
              setError("Profil tidak dapat disimpan. Periksa nama ruang kerja.");
            }
          }}
        >
          <label className="grid gap-2 text-sm font-medium">
            Nama ruang kerja
            <input
              className="min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2"
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
                setError("");
              }}
              required
              value={name}
            />
          </label>
          <Button className="min-h-11" type="submit">Simpan perubahan</Button>
          {saved ? <p className="text-sm text-muted-foreground">Nama ruang kerja berhasil diperbarui.</p> : null}
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        </form>
      </Section>

      {/* PRIVACY — display only.
          These values come from the Vercel edge headers read server-side in
          app/(workspace)/dashboard/request-location.ts. The IP address they were
          derived from is never read, never logged, and never leaves the edge;
          the location itself is never written to Convex, a cookie, or the agent
          API. It is rendered here for the current request and then discarded. */}
      <Section
        eyebrow="Sesi"
        intro="Perkiraan lokasi permintaan Anda saat ini, dari jaringan tepi Vercel."
        title="Lokasi permintaan"
      >
        <div className="space-y-3">
          {hasLocation ? (
            <dl className="divide-y divide-border rounded-md border border-border">
              {rows.map(([label, value]) => (
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3" key={label}>
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 break-words text-right text-sm font-medium">{value ?? "Tidak terdeteksi"}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="flex items-start gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>Tidak tersedia di lingkungan lokal. Header lokasi hanya dikirim saat aplikasi berjalan di Vercel.</span>
            </p>
          )}
          <p className="text-xs leading-5 text-muted-foreground">
            Perkiraan tingkat kota, hanya untuk ditampilkan. Alamat IP tidak dibaca, tidak dicatat, dan lokasi ini tidak disimpan ke database.
          </p>
        </div>
      </Section>

      <Section eyebrow="Keamanan" title="Data ruang kerja terisolasi">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Dashboard ini hanya menampilkan data milik akun yang sedang masuk.</p>
          <p>Token asisten dibuat dan dirotasi dari menu Siapkan asisten; token lama otomatis tidak berlaku.</p>
        </div>
      </Section>
    </div>
  );
}
