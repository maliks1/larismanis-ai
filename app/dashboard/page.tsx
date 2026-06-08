// Force dynamic rendering - prevents caching of protected pages
export const dynamic = "force-dynamic";

import { HomeDashboard } from "@/components/home-dashboard";

export default function DashboardPage() {
  return <HomeDashboard />;
}
