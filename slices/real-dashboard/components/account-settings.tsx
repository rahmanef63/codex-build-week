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
  return <div className="divide-y divide-border border-y border-border"><section className="grid w-full gap-6 py-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-12"><div><p className="text-xs font-medium uppercase tracking-widest text-accent">Profil usaha</p><h2 className="mt-2 text-lg font-semibold">Identitas dashboard</h2><p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">Nama ini tampil di dashboard dan konfigurasi GPT Anda.</p></div><form className="max-w-xl space-y-3" onSubmit={async (event) => { event.preventDefault(); setError(""); try { await update({ name }); setSaved(true); } catch { setError("Profil usaha tidak dapat disimpan. Periksa nama usaha."); } }}><label className="grid gap-2 text-sm font-medium">Nama usaha<input className="rounded-md border border-input bg-background px-3 py-2" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); setError(""); }} required /></label><Button type="submit">Simpan perubahan</Button>{saved ? <p className="text-sm text-muted-foreground">Nama usaha berhasil diperbarui.</p> : null}{error ? <p className="text-sm text-destructive">{error}</p> : null}</form></section><section className="grid gap-6 py-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-12"><div><p className="text-xs font-medium uppercase tracking-widest text-accent">Keamanan</p><h2 className="mt-2 text-lg font-semibold">Data usaha terisolasi</h2></div><div className="max-w-xl space-y-2 text-sm text-muted-foreground"><p>Dashboard ini hanya menampilkan data milik akun yang sedang masuk.</p><p>Token asisten dibuat dan dirotasi dari menu Siapkan asisten; token lama otomatis tidak berlaku.</p></div></section></div>;
}
