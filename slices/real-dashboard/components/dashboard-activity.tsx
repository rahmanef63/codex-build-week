import type { DashboardData } from "@/shared/types/dashboard";
import { formatAction, formatDateTime } from "@/shared/lib/format";

export function DashboardActivity({ activity }: { activity: DashboardData["activity"] }) {
  return (
    <section className="max-w-6xl rounded-md border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold">Aktivitas AI</h2>
          <p className="text-xs text-muted-foreground">Riwayat tindakan yang tercatat untuk usaha ini</p>
        </div>
        <span className="text-xs text-muted-foreground">{activity.length} aktivitas</span>
      </div>
      {activity.length ? (
        <ol className="divide-y divide-border">
          {activity.map((item) => (
            <li className="space-y-2 px-6 py-4" key={item._id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{formatAction(item.action)}</h3>
                <time className="text-xs text-muted-foreground" dateTime={new Date(item.createdAt).toISOString()}>
                  {formatDateTime(item.createdAt)}
                </time>
              </div>
              <p className="text-sm text-muted-foreground">{item.outputSummary}</p>
              {item.requiresVerification ? <p className="text-xs text-destructive">Perlu diperiksa</p> : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-6 py-8 text-sm text-muted-foreground">Belum ada aktivitas AI.</p>
      )}
    </section>
  );
}
