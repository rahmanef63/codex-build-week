import { Skeleton } from "@/shared/components/skeleton";

export function LoadingDashboard() {
  return (
    <main aria-busy="true" aria-live="polite" className="dashboard-shell">
      <span className="sr-only">Memuat dashboard</span>
      <Skeleton style={{ width: "min(320px, 100%)", height: 34, marginBottom: 12 }} />
      <Skeleton style={{ width: 180, height: 18 }} />
      <div className="metric-grid loading-grid">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} style={{ height: 132, borderRadius: 18 }} />
        ))}
      </div>
    </main>
  );
}
