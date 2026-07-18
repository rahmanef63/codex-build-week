export function LoadingDashboard() {
  return (
    <main aria-busy="true" aria-live="polite" className="dashboard-shell">
      <span className="sr-only">Memuat dashboard</span>
      <div className="loading-line wide" />
      <div className="loading-line" />
      <div className="metric-grid loading-grid">
        {[0, 1, 2, 3].map((item) => <div className="loading-card" key={item} />)}
      </div>
    </main>
  );
}
