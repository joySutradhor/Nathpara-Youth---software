"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  FaSignInAlt,
  FaSignOutAlt,
  FaSpinner,
  FaUserShield,
} from "react-icons/fa";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function Header({ admin = false }) {
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      if (signOutError) throw signOutError;

      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);

      setError("লগআউট করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex min-w-0 cursor-pointer items-center gap-3"
        >
          {/* <div className="relative size-10 shrink-0 overflow-hidden rounded-2xl bg-white">
            <Image
              src="/logo.png"
              alt="নাথপাড়া যুবসংঘের লোগো"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div> */}

          <div className="min-w-0">
            <h1 className="truncate text-sm font-black text-slate-900">
              নাথপাড়া যুবসংঘ
            </h1>

            <p className="text-[10px] text-slate-500">
              আমাদের হিসাব • সবার জন্য
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {admin ? (
            <>
              <Link
                href="/dashboard"
                title="অ্যাডমিন ড্যাশবোর্ড"
                aria-label="অ্যাডমিন ড্যাশবোর্ড"
                className="grid size-10 cursor-pointer place-items-center rounded-xl bg-teal-50 text-teal-700 transition hover:bg-teal-100"
              >
                <FaUserShield />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSignOutAlt />
                )}

                <span className="hidden sm:inline">লগআউট</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              title="অ্যাডমিন লগইন"
              aria-label="অ্যাডমিন লগইন"
              className="grid size-10 cursor-pointer place-items-center rounded-xl bg-teal-50 text-teal-700 transition hover:bg-teal-100"
            >
              <FaSignInAlt />
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mx-auto max-w-6xl px-4 pb-3 text-xs font-semibold text-red-700"
        >
          {error}
        </div>
      )}
    </header>
  );
}
