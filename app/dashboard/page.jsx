import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaUsers,
  FaChevronRight,
  FaClock,
  FaSpinner,
  FaShieldAlt,
  FaHome,
  FaClipboardCheck,
  FaPlusCircle,
} from "react-icons/fa";

const bn = (value) =>
  value == null || !Number.isFinite(Number(value))
    ? "—"
    : Number(value).toLocaleString("bn-BD");

const money = (value) => (bn(value) === "—" ? "—" : `৳${bn(value)}`);

function MenuLink({ href, icon, title, description, color = "teal" }) {
  const colors = {
    teal: "bg-teal-50 text-teal-700",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <Link
      href={href}
      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl text-lg ${colors[color]}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-slate-900">
          {title}
        </span>
        <span className="mt-0.5 block text-[11px] leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <FaChevronRight className="shrink-0 text-xs text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
    </Link>
  );
}

function Loading() {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-3" aria-live="polite">
      <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
        <FaSpinner className="animate-spin" /> ড্যাশবোর্ড লোড হচ্ছে...
      </div>
      <div className="h-44 animate-pulse rounded-3xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

async function DashboardContent() {
  await connection();
  const supabase = await createClient();

  const [financeResult, pendingResult] = await Promise.all([
    supabase.rpc("get_public_finance_summary"),
    supabase.rpc("get_public_pending_summary"),
  ]);

  if (financeResult.error)
    console.error("Finance:", financeResult.error.message);
  if (pendingResult.error)
    console.error("Pending:", pendingResult.error.message);

  const first = (data) => (Array.isArray(data) ? data[0] : data);
  const finance = financeResult.error ? null : first(financeResult.data);
  const pending = pendingResult.error ? null : first(pendingResult.data);

  const incomePending = pending
    ? Number(pending.pending_income_count || 0)
    : null;
  const expensePending = pending
    ? Number(pending.pending_expense_count || 0)
    : null;
  const pendingTotal = pending ? incomePending + expensePending : null;

  return (
    <div className="mx-auto w-full max-w-xl space-y-5 pb-4">
      <header className="space-y-1">
        <p className="text-xs font-bold tracking-wide text-teal-700">
          নাথপাড়া যুবসংঘ
        </p>
        <h1 className="text-[22px] font-black leading-tight text-slate-900">
          অ্যাডমিন ড্যাশবোর্ড
        </h1>
        <p className="text-xs leading-5 text-slate-500">
          সংগঠনের আর্থিক হিসাব ও প্রয়োজনীয় কাজ এক জায়গায়।
        </p>
      </header>

      {(financeResult.error || pendingResult.error) && (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
        >
          কিছু তথ্য এখন পাওয়া যাচ্ছে না। অনুপস্থিত হিসাব — দিয়ে দেখানো হয়েছে।
        </p>
      )}

      {/* FINANCIAL OVERVIEW — ALL CALCULATIONS FIRST */}
      <section aria-labelledby="finance-title" className="space-y-3">
        <h2 id="finance-title" className="text-sm font-black text-slate-900">
          আর্থিক সারসংক্ষেপ
        </h2>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-5 text-white shadow-lg shadow-teal-900/10">
          <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full border-[22px] border-white/5" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-teal-100">
                বর্তমান ফান্ড
              </p>
              <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-lg">
                <FaWallet />
              </span>
            </div>
            <p className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {money(finance?.current_balance)}
            </p>
            <p className="mt-3 border-t border-white/15 pt-3 text-xs text-teal-100">
              প্রারম্ভিক ফান্ড:{" "}
              <span className="font-bold text-white">
                {money(finance?.opening_balance)}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-bold text-teal-700">
              <FaArrowDown /> মোট জমা
            </p>
            <p className="mt-3 break-words text-xl font-black text-slate-900">
              {money(finance?.total_income)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">অনুমোদিত</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-bold text-rose-600">
              <FaArrowUp /> মোট খরচ
            </p>
            <p className="mt-3 break-words text-xl font-black text-slate-900">
              {money(finance?.total_expense)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">অনুমোদিত</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-black text-slate-900">
              <FaClock className="text-amber-600" /> অপেক্ষমাণ আবেদন
            </p>
            <span className="rounded-xl bg-white px-3 py-1.5 text-lg font-black text-amber-800 shadow-sm">
              {bn(pendingTotal)}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/85 px-3 py-2.5">
              <p className="text-slate-500">জমা</p>
              <p className="mt-1 text-base font-black text-teal-700">
                {bn(incomePending)}টি
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                {money(pending?.pending_income_amount)}
              </p>
            </div>
            <div className="rounded-xl bg-white/85 px-3 py-2.5">
              <p className="text-slate-500">খরচ</p>
              <p className="mt-1 text-base font-black text-rose-600">
                {bn(expensePending)}টি
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                {money(pending?.pending_expense_amount)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN ADMIN ACTION */}
      <section aria-labelledby="actions-title" className="space-y-3">
        <h2 id="actions-title" className="text-sm font-black text-slate-900">
          প্রয়োজনীয় কাজ
        </h2>
        <Link
          href="/dashboard/approvals"
          className="flex items-center gap-3 rounded-2xl bg-teal-700 p-4 text-white shadow-md shadow-teal-900/10 transition hover:bg-teal-800"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 text-xl">
            <FaClipboardCheck />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black">
              আবেদন যাচাই ও অনুমোদন
            </span>
            <span className="mt-1 block text-xs text-teal-100">
              জমা ও খরচের আবেদন Approve / Reject করুন
            </span>
          </span>
          <FaChevronRight className="shrink-0" />
        </Link>
      
      </section>

      {/* NAVIGATION WITHOUT REPEATED FINANCIAL VALUES */}
      <section aria-labelledby="links-title" className="space-y-2.5">
        <h2 id="links-title" className="text-sm font-black text-slate-900">
          হিসাব ও অন্যান্য তথ্য
        </h2>
        <MenuLink
          href="/income"
          icon={<FaArrowDown />}
          title="জমার তালিকা"
          description="অনুমোদিত সব জমার বিস্তারিত"
        />
        <MenuLink
          href="/expenses"
          icon={<FaArrowUp />}
          title="খরচের তালিকা"
          description="অনুমোদিত সব খরচের বিস্তারিত"
          color="rose"
        />
        
      </section>

      
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
}
