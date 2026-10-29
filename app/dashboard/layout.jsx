import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

// Next.js 16.4.3:
// Allow request-time rendering for this protected route.
export const instant = false;

export default async function DashboardLayout({ children }) {
  await connection();

  // Supabase server client
  const supabase = await createClient();

  // ==========================================
  // CHECK AUTHENTICATED USER
  // ==========================================

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // ==========================================
  // CHECK ADMIN PERMISSION
  // ==========================================

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    redirect("/");
  }

  // ==========================================
  // RENDER ADMIN DASHBOARD
  // ==========================================

  return <AppShell>{children}</AppShell>;
}