import type { ReactNode } from "react";

// Static light-token stamp for the public product surface.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="light">{children}</div>;
}
