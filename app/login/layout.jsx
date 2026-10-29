import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import PublicShell from "@/components/PublicShell";
import { createClient } from "@/lib/supabase/server";

function LoginLoading() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto size-9 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />

        <p className="mt-3 text-sm font-bold text-slate-600">
          লগইন পেজ লোড হচ্ছে...
        </p>
      </div>
    </div>
  );
}

async function LoginAuthCheck({ children }) {
  // Dynamic request শুরু হবে Suspense Boundary-এর ভেতরে
  await connection();

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

export default function LoginLayout({ children }) {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginAuthCheck>{children}</LoginAuthCheck>
    </Suspense>
  );
}
