import { Navigation } from "@/components/layout/Navigation";
import { SupportDashboard } from "@/components/departments/SupportDashboard";

export default function Support() {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 md:ml-64">
        <SupportDashboard />
      </main>
    </div>
  );
}
