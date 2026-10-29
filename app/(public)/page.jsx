import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

import {
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaUserPlus,
  FaChevronRight,
  FaSpinner,
  FaClock,
  FaFacebookF,
  FaUsers,
  FaExternalLinkAlt,
  FaHeart,
  FaGlobe,
} from "react-icons/fa";

const FACEBOOK_PAGE = "https://www.facebook.com/nathparayouth";
const FACEBOOK_GROUP = "https://www.facebook.com/groups/nathparayouth";

const bn = (value) =>
  value == null || !Number.isFinite(Number(value))
    ? "—"
    : Number(value).toLocaleString("bn-BD");

const money = (value) => (bn(value) === "—" ? "—" : `৳${bn(value)}`);

function Action({ href, icon: Icon, title, tint }) {
  return (
    <Link
      href={href}
      className="flex min-h-21 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm transition hover:border-teal-200"
    >
      <span className={`grid size-10 place-items-center rounded-xl ${tint}`}>
        <Icon />
      </span>

      <span className="text-[11px] font-extrabold leading-4 text-slate-800">
        {title}
      </span>
    </Link>
  );
}

function NavCard({ href, icon: Icon, title, description, tint, wide = false }) {
  return (
    <Link
      href={href}
      className={`group flex gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition hover:border-teal-200 ${
        wide ? "col-span-2 items-center" : "min-h-29 flex-col"
      }`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${tint}`}
      >
        <Icon />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-black text-slate-900">{title}</h3>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {description}
        </p>
      </div>

      {wide && <FaChevronRight className="shrink-0 text-xs text-slate-400" />}
    </Link>
  );
}

function FacebookCommunity() {
  return (
    <section
      aria-label="আমাদের সঙ্গে যুক্ত থাকুন"
      className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
    >
      {/* HEADER */}
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700">
          <FaUsers className="text-sm" />
        </span>

        <div className="min-w-0">
          <h2 className="text-[13px] font-extrabold text-slate-900">
            আমাদের সঙ্গে যুক্ত থাকুন
          </h2>

          <p className="mt-0.5 text-[11px] text-slate-500">
            খবর ও আপডেট পেতে আমাদের অনুসরণ করুন।
          </p>
        </div>
      </div>

      {/* LINKS */}
      <div className="grid grid-cols-3 gap-2">
        <a
          href={FACEBOOK_PAGE}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="ফেসবুক পেজ ফলো করুন"
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-2 text-center text-[11px] font-bold text-white transition hover:bg-teal-800"
        >
          <FaFacebookF className="shrink-0" />
          <span>গ্রুপ</span>
        </a>

        <a
          href={FACEBOOK_GROUP}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="ফেসবুক গ্রুপে যোগ দিন"
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-teal-50 px-2 text-center text-[11px] font-bold text-teal-700 transition hover:bg-teal-100"
        >
          <FaUsers className="shrink-0" />
          <span>পেজ</span>
        </a>

        <a
          href="https://nathpara-youth.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="অফিসিয়াল ওয়েবসাইট দেখুন"
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-center text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <FaGlobe className="shrink-0" />
          <span>ওয়েবসাইট</span>
        </a>
      </div>
    </section>
  );
}

function Loading() {
  return (
    <main className="mx-auto max-w-lg space-y-4 px-3 py-4">
      <div className="flex h-46 items-center justify-center gap-3 rounded-3xl bg-teal-800 text-white">
        <FaSpinner className="animate-spin" />
        হিসাব লোড হচ্ছে...
      </div>

      <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
    </main>
  );
}

async function HomeContent() {
  await connection();

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_public_finance_summary");

  if (error) {
    console.error("Finance summary:", error.message);
  }

  const finance = error ? null : Array.isArray(data) ? data[0] : data;

  return (
    <main className="mx-auto max-w-lg space-y-5 px-3 py-4 pb-8">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
        >
          কিছু হিসাব এখন লোড করা যায়নি।
        </p>
      )}

      {/* CURRENT FUND */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-5 text-white shadow-lg shadow-teal-900/10">
        <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full border-[25px] border-white/5" />

        <div className="relative">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-100">
            <span>বর্তমান ফান্ড</span>
            <FaWallet className="text-lg" />
          </div>

          <h1 className="mt-2 text-3xl font-black">
            {money(finance?.current_balance)}
          </h1>

          <p className="mt-1 text-[11px] text-teal-100">
            প্রারম্ভিক ফান্ড {money(finance?.opening_balance ?? 0)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/20 pt-4">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] text-teal-100">
                <FaArrowDown />
                অনুমোদিত জমা
              </p>

              <p className="mt-1 text-lg font-black">
                {money(finance?.total_income)}
              </p>
            </div>

            <div className="border-l border-white/20 pl-3">
              <p className="flex items-center gap-1.5 text-[11px] text-teal-100">
                <FaArrowUp />
                অনুমোদিত খরচ
              </p>

              <p className="mt-1 text-lg font-black">
                {money(finance?.total_expense)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section aria-label="আবেদন জমা" className="grid grid-cols-3 gap-2">
        <Action
          href="/submit-income"
          icon={FaArrowDown}
          title="জমা করুন"
          tint="bg-emerald-50 text-emerald-700"
        />

        <Action
          href="/submit-expense"
          icon={FaArrowUp}
          title="খরচ দিন"
          tint="bg-rose-50 text-rose-700"
        />

        <Action
          href="/join"
          icon={FaUserPlus}
          title="সদস্য হোন"
          tint="bg-blue-50 text-blue-700"
        />
      </section>

      {/* FINANCIAL RECORDS */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-black text-slate-900">
            জমা ও খরচের হিসাব
          </h2>

          <p className="mt-1 text-[11px] text-slate-500">
            সবার জন্য উন্মুক্ত হিসাব
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <NavCard
            href="/income"
            icon={FaArrowDown}
            title="জমার হিসাব"
            description="অনুমোদিত জমার তালিকা"
            tint="bg-emerald-50 text-emerald-700"
          />

          <NavCard
            href="/expenses"
            icon={FaArrowUp}
            title="খরচের হিসাব"
            description="অনুমোদিত খরচের তালিকা"
            tint="bg-rose-50 text-rose-700"
          />

          <NavCard
            wide
            href="/pending-submissions"
            icon={FaClock}
            title="অপেক্ষমাণ জমা ও খরচের আবেদন"
            description="অনুমোদনের অপেক্ষায় থাকা জমা ও খরচের আবেদনের তালিকা"
            tint="bg-amber-50 text-amber-700"
          />
        </div>
      </section>

      {/* FACEBOOK COMMUNITY */}
      <FacebookCommunity />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}
