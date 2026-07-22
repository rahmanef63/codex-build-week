"use client";

import { BarChart3, ClipboardPlus, PackageSearch } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const actions = [
  {
    icon: ClipboardPlus,
    label: "Catat pesanan",
    result: "Order pending dibuat dan stok diperbarui.",
    detail: "GPTs meneruskan instruksi ke aksi yang tervalidasi.",
  },
  {
    icon: PackageSearch,
    label: "Periksa stok",
    result: "Produk stok rendah muncul untuk ditindaklanjuti.",
    detail: "Data produk dibaca tanpa mengubah catatan usaha.",
  },
  {
    icon: BarChart3,
    label: "Lihat ringkasan",
    result: "Total hari ini disusun dari transaksi yang tercatat.",
    detail: "Hasil AI dapat dibandingkan dengan sumber datanya.",
  },
] as const;

export function AgentFlowPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = actions[activeIndex];
  const Icon = active.icon;

  return (
    <section aria-label="Contoh alur tindakan AI" className="relative overflow-hidden rounded-md border border-border bg-card p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium text-muted-foreground">Simulasi tindakan GPTs</p>
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 animate-pulse rounded-full bg-accent" />
          Dapat diperiksa
        </span>
      </div>

      <div className="mt-8 flex min-h-40 items-center gap-4 border-y border-border py-6" aria-live="polite">
        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground transition-transform duration-300 motion-safe:group-hover:scale-105">
          <Icon aria-hidden className="size-6" />
        </span>
        <div>
          <p className="text-base font-semibold">{active.result}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{active.detail}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3" role="group" aria-label="Pilih contoh tindakan">
        {actions.map(({ icon: ActionIcon, label }, index) => (
          <Button
            aria-pressed={activeIndex === index}
            className={cn("h-auto justify-start px-3 py-2 text-left", activeIndex === index && "bg-secondary")}
            key={label}
            onClick={() => setActiveIndex(index)}
            variant="ghost"
          >
            <ActionIcon aria-hidden className="size-4" />
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>
    </section>
  );
}
