"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function AccountSettings({ businessName }: { businessName: string }) {
  const update = useMutation(api.real.updateBusiness);
  const [name, setName] = useState(businessName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  return <section className="max-w-xl rounded-md border border-border bg-card p-6"><p className="text-xs font-medium uppercase tracking-widest text-accent">Informasi usaha</p><h2 className="mt-2 text-lg font-semibold">Nama usaha</h2><p className="mt-1 text-sm text-muted-foreground">Nama ini tampil di dashboard dan konfigurasi GPT Anda.</p><form className="mt-5 space-y-3" onSubmit={async (event) => { event.preventDefault(); setError(""); try { await update({ name }); setSaved(true); } catch { setError("Profil usaha tidak dapat disimpan. Periksa nama usaha."); } }}><label className="grid gap-2 text-sm font-medium">Nama usaha<input className="rounded-md border border-input bg-background px-3 py-2" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); setError(""); }} required /></label><Button type="submit">Simpan perubahan</Button>{saved ? <p className="text-sm text-muted-foreground">Nama usaha berhasil diperbarui.</p> : null}{error ? <p className="text-sm text-destructive">{error}</p> : null}</form></section>;
}
