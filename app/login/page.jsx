"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaSignInAlt,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();

  const [supabase] = useState(() => createClient());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* =========================================
     ADMIN LOGIN
  ========================================= */

  async function handleLogin(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail || !password) {
        setErrorMessage("ইমেইল ও পাসওয়ার্ড লিখুন।");
        return;
      }

      // 1. Sign in
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (loginError) {
        setErrorMessage("ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।");
        return;
      }

      // 2. Check admin permission
      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin");

      if (adminError || isAdmin !== true) {
        await supabase.auth.signOut();

        setErrorMessage(
          adminError
            ? "Admin Permission যাচাই করা যায়নি।"
            : "এই অ্যাকাউন্টের Admin Permission নেই।",
        );

        return;
      }

      // 3. Redirect to dashboard
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setErrorMessage("লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-3 py-8">
      <div className="w-full">
        {/* BRANDING */}
        <div className="mb-6 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 text-white shadow-lg">
            <FaShieldAlt className="text-2xl" />
          </div>

          <h1 className="mt-4 text-2xl font-black text-slate-900">
            অ্যাডমিন লগইন
          </h1>

          <p className="mt-2 text-xs text-slate-500">
            নাথপাড়া যুবসংঘের হিসাব ব্যবস্থাপনা
          </p>
        </div>

        {/* LOGIN CARD */}
        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-base font-black text-slate-900">নিরাপদ লগইন</h2>

            <p className="mt-1 text-xs text-slate-500">
              অনুমোদিত অ্যাডমিন অ্যাকাউন্ট দিয়ে প্রবেশ করুন
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 p-5 sm:p-7">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                ইমেইল <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FaEnvelope className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-base text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                পাসওয়ার্ড <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 text-base text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  aria-label={
                    showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"
                  }
                  className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs leading-6 text-red-700"
              >
                <FaExclamationCircle className="mt-1 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-extrabold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  যাচাই করা হচ্ছে...
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  লগইন করুন
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
              <FaShieldAlt className="text-teal-600" />
              শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
