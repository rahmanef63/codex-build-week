import { Skeleton } from "@/shared/components/skeleton";

export default function WorkspaceLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="dash-center">
      <span className="sr-only">Memuat…</span>
      <div className="dash-card dash-onboarding" style={{ display: "grid", gap: 12 }}>
        <Skeleton style={{ height: 16, width: 160 }} />
        <Skeleton style={{ height: 26, width: 260 }} />
        <Skeleton style={{ height: 60 }} />
        <Skeleton style={{ height: 60 }} />
      </div>
    </div>
  );
}
