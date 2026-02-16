import { Navigation } from "@/components/layout/Navigation";
import { PeopleDashboard } from "@/components/departments/PeopleDashboard";

export default function People() {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        <PeopleDashboard />
      </main>
    </div>
  );
}
