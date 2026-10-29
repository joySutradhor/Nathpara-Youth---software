import { redirect } from "next/navigation";

import PublicShell from "@/components/PublicShell";
import { createClient } from "@/lib/supabase/server";

export default async function LoginLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!userError && user) {
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (!adminError && isAdmin === true) {
      redirect("/dashboard");
    }
  }

  return <PublicShell>{children}</PublicShell>;
}
