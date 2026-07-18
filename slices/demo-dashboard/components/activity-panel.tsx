import type { DashboardData } from "@/shared/types/dashboard";
import { formatAction, formatDateTime } from "@/shared/lib/format";
import { EmptyState } from "./empty-state";

export function ActivityPanel({
  activity,
  hidden,
}: {
  activity: DashboardData["activity"];
  hidden: boolean;
}) {
  return (
    <section
      aria-labelledby="tab-activity"
      className="panel"
      hidden={hidden}
      id="panel-activity"
      role="tabpanel"
      tabIndex={0}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Jejak tindakan</span>
          <h2>Aktivitas AI</h2>
        </div>
        <p>Setiap perubahan dapat dilihat dan diperiksa.</p>
      </div>
      {activity.length ? (
        <ol className="activity-list">
          {activity.map((item) => (
            <li className="activity-card" key={item._id}>
              <div className="activity-meta">
                <strong>{formatAction(item.action)}</strong>
                <time dateTime={new Date(item.createdAt).toISOString()}>
                  {formatDateTime(item.createdAt)}
                </time>
              </div>
              <dl>
                <div>
                  <dt>Dipahami</dt>
                  <dd>{item.inputSummary}</dd>
                </div>
                <div>
                  <dt>Dilakukan</dt>
                  <dd>{item.outputSummary}</dd>
                </div>
              </dl>
              {item.requiresVerification && (
                <span className="verify-badge">Perlu diperiksa</span>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <div className="content-card">
          <EmptyState image="/assets/states/activity-empty.png" text="Belum ada aktivitas AI." />
        </div>
      )}
    </section>
  );
}
