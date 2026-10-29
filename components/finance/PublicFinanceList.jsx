"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaSearch,
  FaTimes,
  FaSyncAlt,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaListAlt,
  FaShieldAlt,
} from "react-icons/fa";

import { createClient } from "@/lib/supabase/client";
import FinanceRecordCard from "./FinanceRecordCard";

const PAGE_SIZE = 20;
const supabase = createClient();

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString("bn-BD")}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("bn-BD");
}

function normalizeDigits(value) {
  return String(value)
    .replace(/[০-৯]/g, (digit) =>
      String("০১২৩৪৫৬৭৮৯".indexOf(digit))
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    );
}

export default function PublicFinanceList({
  title,
  subtitle,
  type = "expense",
  pending = false,
  listRpc,
  summaryRpc,
  summaryAmountKey,
  summaryCountKey,
}) {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);

  const isExpense = type === "expense";

  const loadSummary = useCallback(async () => {
    if (!summaryRpc) {
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        summaryRpc
      );

      if (rpcError) throw rpcError;

      setSummary(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      console.error("Finance summary error:", err);
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [summaryRpc]);

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
    let cancelled = false;
    const requestId = ++requestIdRef.current;

    async function loadRecords() {
      if (!hasLoadedRef.current) {
        setInitialLoading(true);
      } else {
        setSearching(true);
      }

      setError("");

      try {
        const { data, error: rpcError } = await supabase.rpc(
          listRpc,
          {
            p_search: searchQuery,
            p_limit: PAGE_SIZE + 1,
            p_offset: (page - 1) * PAGE_SIZE,
          }
        );

        if (rpcError) throw rpcError;

        if (
          cancelled ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        if (
          cancelled ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        console.error("Finance list error:", err);
        setError("তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।");
      } finally {
        if (
          !cancelled &&
          requestId === requestIdRef.current
        ) {
          hasLoadedRef.current = true;
          setInitialLoading(false);
          setSearching(false);
        }
      }
    }

    loadRecords();

    return () => {
      cancelled = true;
    };
  }, [listRpc, searchQuery, page, refreshKey]);

  const normalizedInput = normalizeDigits(searchInput.trim());

  const waitingForDebounce =
    normalizedInput !== searchQuery;

  const isUpdating = searching || waitingForDebounce;

  const visibleRecords = records.slice(0, PAGE_SIZE);
  const hasNextPage = records.length > PAGE_SIZE;

  const totalAmount = summary?.[summaryAmountKey];
  const totalCount = summary?.[summaryCountKey];

  function clearSearch() {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  }

  function refresh() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-3 py-5">
      {/* HEADER */}
      <section
        className={`rounded-3xl bg-gradient-to-br p-5 text-white ${
          pending
            ? "from-amber-600 via-amber-700 to-slate-900"
            : isExpense
              ? "from-rose-600 via-rose-700 to-slate-900"
              : "from-teal-700 via-teal-800 to-slate-900"
        }`}
      >
        <h1 className="text-xl font-black leading-8">
          {title}
        </h1>

        <p className="mt-2 text-xs leading-6 text-white/85">
          {subtitle}
        </p>

        <div className="mt-4 flex items-center gap-2 border-t border-white/20 pt-4 text-[11px] text-white/85">
          <FaShieldAlt />

          {pending
            ? "এগুলো এখনো মূল হিসাবে গণনা হয়নি।"
            : "শুধু Admin অনুমোদিত হিসাব দেখানো হচ্ছে।"}
        </div>
      </section>

      {/* SUMMARY */}
      {summaryRpc && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-teal-700 p-4 text-white">
            <p className="text-xs text-teal-100">
              মোট টাকা
            </p>

            <p className="mt-3 break-words text-xl font-black">
              {summaryLoading
                ? "..."
                : totalAmount == null
                  ? "—"
                  : formatMoney(totalAmount)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">
              মোট এন্ট্রি
            </p>

            <p className="mt-3 text-xl font-black text-slate-900">
              {summaryLoading
                ? "..."
                : totalCount == null
                  ? "—"
                  : formatNumber(totalCount)}
            </p>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-900">
            তালিকা
          </h2>

          <button
            type="button"
            onClick={refresh}
            disabled={initialLoading || searching}
            className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-teal-50 px-3 text-xs font-bold text-teal-700 disabled:opacity-50"
          >
            <FaSyncAlt
              className={searching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="relative mt-4">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

          {/* text type = no browser native cross */}
          <input
            type="text"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder={
              isExpense
                ? "নাম, ID বা খাত দিয়ে খুঁজুন"
                : "নাম বা ID দিয়ে খুঁজুন"
            }
            aria-label="হিসাব খুঁজুন"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
          />

          {searchInput.length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="সার্চ মুছুন"
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100"
            >
              <FaTimes />
            </button>
          )}
        </div>

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
            <>“{searchQuery}” এর ফলাফল</>
          ) : (
            "সদস্যের নাম বা ID দিয়ে খুঁজতে পারবেন।"
          )}
        </div>
      </section>

      {/* FIRST LOAD SKELETON */}
      {initialLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-44 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      )}

      {/* ERROR */}
      {!initialLoading && error && (
        <div
          role="alert"
          className="rounded-2xl bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="mt-1 shrink-0" />
            {error}
          </div>

          <button
            type="button"
            onClick={refresh}
            className="mt-3 cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-bold"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}

      {/* RECORDS */}
      {!initialLoading && !error && (
        <div
          className={`space-y-3 transition-opacity duration-200 ${
            isUpdating ? "opacity-50" : "opacity-100"
          }`}
          aria-busy={isUpdating}
        >
          {visibleRecords.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
              <FaListAlt className="mx-auto text-3xl text-slate-300" />

              <p className="mt-3 text-sm font-bold text-slate-600">
                {isUpdating
                  ? "ফলাফল খোঁজা হচ্ছে..."
                  : "কোনো তথ্য পাওয়া যায়নি।"}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {visibleRecords.map((record) => (
                  <FinanceRecordCard
                    key={record.id}
                    record={record}
                    type={type}
                    pending={pending}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  disabled={page === 1 || isUpdating}
                  className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronLeft />
                  আগের
                </button>

                <span className="text-xs font-black">
                  পৃষ্ঠা {page.toLocaleString("bn-BD")}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                  disabled={!hasNextPage || isUpdating}
                  className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-teal-700 px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  পরের
                  <FaChevronRight />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}