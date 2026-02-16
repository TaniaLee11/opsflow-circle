import { Navigation } from "@/components/layout/Navigation";
import { SystemsDashboard } from "@/components/departments/SystemsDashboard";

export default function Systems() {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        <SystemsDashboard />
      </main>
    </div>
  );
}
