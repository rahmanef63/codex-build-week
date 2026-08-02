import { Skeleton } from "@/shared/components/skeleton";

// Previously this rendered the /demo dashboard skeleton (a four-tile metric
// grid) for every route in the public group — landing, /setup, /privacy and
// /terms included. That both mismatched the real layout, so the page visibly
// jumped when content arrived, and pulled the demo slice into the public zone.
// This placeholder mirrors the landing's own boxes: header row, hero column,
// side panel.
export default function PublicLoading() {
  return (
    <main aria-busy="true" aria-live="polite" className="min-h-dvh bg-canvas text-foreground">
      <span className="sr-only">Memuat halaman</span>
      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Skeleton className="h-11 w-48" />
          <Skeleton className="h-11 w-28" />
        </div>
        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] lg:gap-16 lg:py-16">
          <div className="grid gap-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-11 w-full sm:w-64" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </main>
  );
}
