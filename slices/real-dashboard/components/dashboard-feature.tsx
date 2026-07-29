import type { ReactNode } from "react";

export function DashboardFeature({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="w-full" data-dashboard-feature>
      <header className="w-full pb-7">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">Dashboard usaha</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </header>
      <div className="w-full" data-dashboard-feature-content>
        {children}
      </div>
    </section>
  );
}
