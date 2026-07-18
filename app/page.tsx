import { ConvexClientProvider } from "@/components/convex-provider";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  return (
    <ConvexClientProvider>
      <Dashboard />
    </ConvexClientProvider>
  );
}
