import { HomeDashboard } from "@/components/home-dashboard";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <HomeDashboard />;
}