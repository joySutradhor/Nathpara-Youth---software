"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  FaSearch,
  FaTimes,
  FaSyncAlt,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaArrowDown,
  FaShieldAlt,
  FaExclamationTriangle,
  FaListAlt,
} from "react-icons/fa";

import { createClient } from "@/lib/supabase/client";

import IncomeSummaryCard from "./IncomeSummaryCard";
import IncomeEntryCard from "./IncomeEntryCard";

const PAGE_SIZE = 20;

const supabase = createClient();

function normalizeDigits(value) {
  return String(value)
    .replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export default function ApprovedIncomePage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);

  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(null);
  const [totalEntries, setTotalEntries] = useState(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Prevent old requests from overwriting newer results.
  const requestIdRef = useRef(0);

  // Keep track of whether first request has finished.
  const hasLoadedRef = useRef(false);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);

    try {
      const { data, error: summaryError } = await supabase.rpc(
        "get_public_income_summary",
      );

      if (summaryError) throw summaryError;

      const summary = Array.isArray(data) ? data[0] : data;

      setTotalIncome(summary?.total_income ?? 0);
      setTotalEntries(summary?.total_entries ?? 0);
    } catch (err) {
      console.error("Income summary error:", err);

      setTotalIncome(null);
      setTotalEntries(null);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Debounced search: wait until user stops typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = normalizeDigits(searchInput.trim());

      setSearchQuery(normalized);
      setPage(1);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary, refreshKey]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let cancelled = false;

    async function loadIncomeEntries() {
      if (!hasLoadedRef.current) {
        setInitialLoading(true);
      } else {
        setSearching(true);
      }

      setError("");

      try {
        const { data, error: listError } = await supabase.rpc(
          "get_public_approved_income",
          {
            p_search: searchQuery,
            p_limit: PAGE_SIZE + 1,
            p_offset: (page - 1) * PAGE_SIZE,
          },
        );

        if (listError) throw listError;

        // Ignore stale search results.
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        setIncomes(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        console.error("Approved income list error:", err);

        setError("জমার তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।");
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          hasLoadedRef.current = true;

          setInitialLoading(false);
          setSearching(false);
        }
      }
    }

    loadIncomeEntries();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, page, refreshKey]);

  const hasNextPage = incomes.length > PAGE_SIZE;
  const visibleIncomes = incomes.slice(0, PAGE_SIZE);

  // When input is ahead of the debounced query, mark results as updating.
  const normalizedInput = normalizeDigits(searchInput.trim());
  const waitingForDebounce = normalizedInput !== searchQuery;

  const isUpdating = searching || waitingForDebounce;

  function handleRefresh() {
    setRefreshKey((value) => value + 1);
  }

  function handlePreviousPage() {
    if (isUpdating) return;

    setPage((current) => Math.max(1, current - 1));
  }

  function handleNextPage() {
    if (isUpdating || !hasNextPage) return;

    setPage((current) => current + 1);
  }

  function clearSearch() {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-3 py-5">
      {/* PAGE HEADER */}
      {/* <section className="rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-teal-100">
              নাথপাড়া যুবসংঘ
            </p>

            <h1 className="mt-2 text-xl font-black leading-8">
              কে কত টাকা জমা দিয়েছেন?
            </h1>

            <p className="mt-2 text-xs leading-6 text-teal-100">
              সংগঠনের সকল অনুমোদিত জমার স্বচ্ছ হিসাব।
            </p>
          </div>

          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-xl">
            <FaArrowDown />
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-white/20 pt-4 text-[11px] text-teal-100">
          <FaShieldAlt />
          শুধু অ্যাডমিন অনুমোদিত জমা দেখানো হয়।
        </div>
      </section> */}

      {/* SUMMARY */}
      <IncomeSummaryCard
        totalIncome={totalIncome}
        totalEntries={totalEntries}
        loading={summaryLoading}
      />

      {/* SEARCH SECTION */}
      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-900">জমার তালিকা</h2>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={initialLoading || searching}
            className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-teal-50 px-3 text-xs font-bold text-teal-700 transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSyncAlt className={searching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="relative mt-4">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

          {/*
            type="text" prevents the browser's native X button.
            We display only our custom clear button.
          */}
          <input
            type="text"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="সদস্যের নাম বা ID দিয়ে খুঁজুন"
            aria-label="জমার তালিকা খুঁজুন"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
          />

          {/* Single clear button */}
          {searchInput.length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="সার্চ মুছুন"
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>

        {/* Stable status area prevents layout jumping */}
        <div
          className="mt-3 flex min-h-5 items-center gap-2 text-[11px] text-slate-500"
          aria-live="polite"
        >
          {isUpdating ? (
            <>
              <FaSpinner className="animate-spin text-teal-700" />
              খোঁজা হচ্ছে...
            </>
          ) : searchQuery ? (
            <>
              <FaSearch className="text-teal-700" />“{searchQuery}” এর ফলাফল
            </>
          ) : (
            "নাম অথবা ৪ সংখ্যার সদস্য ID দিয়ে খুঁজতে পারবেন।"
          )}
        </div>
      </section>

      {/* INITIAL LOADING */}
      {initialLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-2xl border border-slate-100 bg-slate-100"
            />
          ))}
        </div>
      )}

      {/* ERROR */}
      {!initialLoading && error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 p-4"
        >
          <div className="flex items-start gap-2 text-sm text-red-700">
            <FaExclamationTriangle className="mt-1 shrink-0" />
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-3 min-h-10 cursor-pointer rounded-lg bg-white px-3 text-xs font-bold text-red-700 transition-colors hover:bg-red-100"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}

      {/* RESULTS AREA */}
      {!initialLoading && !error && (
        <div
          className={`space-y-3 transition-opacity duration-200 ${
            isUpdating ? "opacity-50" : "opacity-100"
          }`}
          aria-busy={isUpdating}
        >
          {/* EMPTY */}
          {visibleIncomes.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
              <FaListAlt className="mx-auto text-3xl text-slate-300" />

              <p className="mt-3 text-sm font-bold text-slate-700">
                {searchQuery
                  ? "এই নামে বা ID-তে কোনো অনুমোদিত জমা পাওয়া যায়নি।"
                  : "এখনো কোনো অনুমোদিত জমা নেই।"}
              </p>
            </div>
          ) : (
            <>
              {/* Keep existing cards visible during searching */}
              <div className="space-y-3">
                {visibleIncomes.map((income) => (
                  <IncomeEntryCard key={income.id} income={income} />
                ))}
              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={page === 1 || isUpdating}
                  className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronLeft />
                  আগের
                </button>

                <span className="text-xs font-black text-slate-700">
                  পৃষ্ঠা {page.toLocaleString("bn-BD")}
                </span>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={!hasNextPage || isUpdating}
                  className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-teal-700 px-3 text-xs font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  পরের
                  <FaChevronRight />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* SUBMIT INCOME */}
      <Link
        href="/submit-income"
        className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-black text-white transition-colors hover:bg-teal-800"
      >
        <FaArrowDown />
        নতুন জমার তথ্য দিন
      </Link>

      {/* FOOTNOTE */}
      <div className="flex items-center justify-center gap-2 pb-2 text-center text-[11px] text-slate-500">
        <FaShieldAlt className="shrink-0 text-teal-700" />
        Pending বা Rejected জমা এখানে প্রকাশ করা হয় না।
      </div>
    </div>
  );
}
