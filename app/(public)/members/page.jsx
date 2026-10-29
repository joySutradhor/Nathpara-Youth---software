"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

import {
  FaUsers,
  FaUserPlus,
  FaIdCard,
  FaBriefcase,
  FaArrowLeft,
  FaPhoneAlt,
  FaCopy,
  FaCheck,
  FaSpinner,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaExclamationCircle,
} from "react-icons/fa";

/* ==============================
   CONFIG
============================== */

const PAGE_SIZE = 20;
const banglaDigits = "০১২৩৪৫৬৭৮৯";

/* ==============================
   HELPERS
============================== */

function normalizeSearch(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[০-৯]/g, (digit) => String(banglaDigits.indexOf(digit)));
}

function toBanglaNumber(value) {
  return Number(value).toLocaleString("bn-BD");
}

/* ==============================
   MEMBER CARD
============================== */

function MemberCard({ member, copiedId, onCopy }) {
  const isCopied = copiedId === member.member_id;

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
          <FaUsers />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-extrabold text-slate-900">
            {member.full_name}
          </h3>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <FaBriefcase className="shrink-0 text-[10px]" />

            <span className="break-words">{member.profession || "—"}</span>
          </p>
        </div>

        <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-center">
          <FaIdCard className="mx-auto text-xs text-teal-700" />

          <p className="mt-1 font-mono text-sm font-black text-slate-800">
            {member.member_id}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">
        <div className="flex min-w-0 items-center gap-2">
          <FaPhoneAlt className="shrink-0 text-sm text-teal-700" />

          <span className="font-mono text-sm font-bold text-slate-800">
            {member.mobile}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCopy(member.mobile, member.member_id)}
            className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
              isCopied
                ? "bg-emerald-100 text-emerald-700"
                : "bg-white text-slate-700 shadow-sm"
            }`}
          >
            {isCopied ? (
              <>
                <FaCheck />
                কপি হয়েছে
              </>
            ) : (
              <>
                <FaCopy />
                কপি
              </>
            )}
          </button>

          <a
            href={`tel:${member.mobile}`}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-3 text-xs font-bold text-white"
          >
            <FaPhoneAlt />
            কল
          </a>
        </div>
      </div>
    </article>
  );
}

/* ==============================
   MEMBERS PAGE
============================== */

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const requestId = useRef(0);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  const isTyping = normalizeSearch(search) !== debouncedSearch;

  const searchBusy = loading || isTyping;

  /* ==============================
     SEARCH DEBOUNCE
  ============================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(normalizeSearch(search));
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  /* ==============================
     FETCH MEMBERS
  ============================== */

  const fetchMembers = useCallback(
    async (pageNumber = 0, append = false, keyword = "") => {
      const currentRequest = ++requestId.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const supabase = createClient();

        const from = pageNumber * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from("public_members")
          .select("member_id, full_name, profession, mobile, created_at", {
            count: "exact",
          });

        const safeSearch = keyword.replace(/[%_(),.*"']/g, "").trim();

        if (safeSearch) {
          query = query.or(
            `full_name.ilike.%${safeSearch}%,member_id.ilike.%${safeSearch}%`,
          );
        }

        const {
          data,
          count,
          error: fetchError,
        } = await query
          .order("created_at", { ascending: false })
          .order("member_id", { ascending: false })
          .range(from, to);

        if (currentRequest !== requestId.current) {
          return;
        }

        if (fetchError) {
          throw fetchError;
        }

        const newMembers = data ?? [];
        const total = count ?? 0;

        setMembers((previous) =>
          append ? [...previous, ...newMembers] : newMembers,
        );

        setTotalCount(total);
        setPage(pageNumber);
        setHasMore(from + newMembers.length < total);
      } catch (err) {
        if (currentRequest !== requestId.current) {
          return;
        }

        console.error("Members fetch error:", err);

        setError("সদস্য তালিকা লোড করা যায়নি।");

        if (!append) {
          setMembers([]);
          setTotalCount(0);
          setHasMore(false);
        }
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  /* ==============================
     SEARCH FETCH
  ============================== */

  useEffect(() => {
    fetchMembers(0, false, debouncedSearch);

    return () => {
      requestId.current += 1;
    };
  }, [debouncedSearch, fetchMembers]);

  /* ==============================
     SEARCH CHANGE
  ============================== */

  function handleSearchChange(value) {
    requestId.current += 1;

    setSearch(value);
    setLoading(false);
    setLoadingMore(false);
  }

  /* ==============================
     LOAD MORE
  ============================== */

  async function handleLoadMore() {
    if (loading || loadingMore || isTyping || !hasMore) {
      return;
    }

    await fetchMembers(page + 1, true, debouncedSearch);
  }

  /* ==============================
     COPY PHONE
  ============================== */

  async function handleCopy(mobile, memberId) {
    try {
      await navigator.clipboard.writeText(String(mobile));

      setCopiedId(memberId);

      setTimeout(() => {
        setCopiedId((current) => (current === memberId ? null : current));
      }, 2000);
    } catch (err) {
      console.error("Copy error:", err);
      alert("মোবাইল নম্বর কপি করা যায়নি।");
    }
  }

  /* ==============================
     UI
  ============================== */

  return (
    <main className="mx-auto max-w-lg space-y-4 px-3 py-4">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="হোমপেজে ফিরে যান"
          className="grid size-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm"
        >
          <FaArrowLeft />
        </Link>

        <div>
          <h1 className="text-lg font-black text-slate-900">সদস্য তালিকা</h1>

          <p className="text-[11px] text-slate-500">
            নাথপাড়া যুবসংঘের সদস্যবৃন্দ
          </p>
        </div>
      </div>

      {/* SUMMARY */}

      <section className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-teal-700 to-teal-900 p-5 text-white">
        <div>
          <p className="text-xs text-teal-100">মোট সদস্য</p>

          <h2 className="mt-1 text-3xl font-black">
            {toBanglaNumber(totalCount)}
          </h2>

          <p className="mt-1 text-[11px] text-teal-100">
            {debouncedSearch ? "সার্চের ফলাফল" : "নিবন্ধিত সদস্য"}
          </p>
        </div>

        <FaUsers className="text-3xl text-teal-200" />
      </section>

      {/* JOIN BUTTON */}

      <Link
        href="/join"
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white text-sm font-extrabold text-teal-700 shadow-sm"
      >
        <FaUserPlus />
        নতুন সদস্য হোন
      </Link>

      {/* SEARCH BOX */}

      <div className="relative">
        <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

        <input
          ref={searchInputRef}
          type="text"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="সদস্যের নাম অথবা ID লিখুন"
          aria-label="নাম অথবা সদস্য ID দিয়ে খুঁজুন"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-20 text-base text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />

        <span className="pointer-events-none absolute right-11 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center">
          {searchBusy && (
            <FaSpinner className="animate-spin text-sm text-teal-600" />
          )}
        </span>

        {search && (
          <button
            type="button"
            onClick={() => {
              handleSearchChange("");
              searchInputRef.current?.focus();
            }}
            aria-label="সার্চ মুছুন"
            className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {/* FIXED RESULT STATUS */}

      <div
        className="flex min-h-6 items-center px-1 text-xs font-semibold text-slate-500"
        aria-live="polite"
      >
        {searchBusy ? (
          <span>খোঁজা হচ্ছে...</span>
        ) : debouncedSearch ? (
          <span>{toBanglaNumber(totalCount)} জন সদস্য পাওয়া গেছে</span>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>

      {/* ERROR */}

      {error && (
        <div
          role="alert"
          className="rounded-2xl bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="flex items-center gap-2">
            <FaExclamationCircle />
            {error}
          </div>

          <button
            type="button"
            onClick={() => fetchMembers(0, false, debouncedSearch)}
            className="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-bold text-red-700"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}

      {/* STABLE MEMBER LIST */}

      <section
        ref={listRef}
        className="min-h-[65dvh] [overflow-anchor:none]"
        aria-busy={searchBusy}
      >
        {loading && members.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-8 text-sm text-slate-500">
            <FaSpinner className="animate-spin text-teal-700" />
            সদস্য তালিকা লোড হচ্ছে...
          </div>
        ) : members.length === 0 && !searchBusy && !error ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <FaUsers className="mx-auto text-3xl text-slate-300" />

            <p className="mt-3 text-sm text-slate-500">
              {debouncedSearch
                ? "এই নাম বা ID দিয়ে কোনো সদস্য পাওয়া যায়নি।"
                : "এখনো কোনো সদস্য নেই।"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <MemberCard
                key={member.member_id}
                member={member}
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}

        {/* LOAD MORE */}

        {!error && hasMore && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore || searchBusy}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white text-sm font-extrabold text-teal-700 transition hover:bg-teal-50 disabled:opacity-60"
          >
            {loadingMore ? (
              <>
                <FaSpinner className="animate-spin" />
                লোড হচ্ছে...
              </>
            ) : (
              <>
                <FaChevronDown />
                আরও সদস্য দেখুন
              </>
            )}
          </button>
        )}
      </section>

      {/* LIST INFO */}

      <p className="pb-2 text-center text-[11px] text-slate-400">
        {toBanglaNumber(members.length)} জন দেখানো হচ্ছে
        {" / "}
        {toBanglaNumber(totalCount)} জন
      </p>
    </main>
  );
}
