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
      <header className="w-full pb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </header>
      <div className="w-full" data-dashboard-feature-content>
        {children}
      </div>
    </section>
  );
}
