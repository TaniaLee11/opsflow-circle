import { Navigation } from "@/components/layout/Navigation";
import { PeopleDashboard } from "@/components/departments/PeopleDashboard";

export default function People() {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 md:ml-64">
        <PeopleDashboard />
      </main>
    </div>
  );
}
