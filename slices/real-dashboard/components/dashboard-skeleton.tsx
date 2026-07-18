export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="dash-shell">
      <span className="sr-only">Memuat dashboard…</span>
      <div className="dash-topbar">
        <div style={{ display: "grid", gap: 10 }}>
          <div className="dash-skeleton" style={{ height: 22, width: 150 }} />
          <div className="dash-skeleton" style={{ height: 28, width: 230 }} />
        </div>
        <div className="dash-skeleton" style={{ height: 36, width: 190 }} />
      </div>
      <div className="dash-stat-grid">
        {[0, 1, 2, 3].map((item) => (
          <div className="dash-skeleton" key={item} style={{ height: 96 }} />
        ))}
      </div>
      <div className="dash-skeleton" style={{ height: 230 }} />
    </div>
  );
}
