"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

import {
  FaArrowLeft,
  FaArrowDown,
  FaUser,
  FaUsers,
  FaIdCard,
  FaMoneyBillWave,
  FaAlignLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaExclamationCircle,
  FaSearch,
  FaShieldAlt,
  FaChevronRight,
} from "react-icons/fa";

/* ==========================================
   HELPERS
========================================== */

const banglaDigits = "০১২৩৪৫৬৭৮৯";

function normalizeDigits(value) {
  return String(value).replace(/[০-৯]/g, (digit) =>
    String(banglaDigits.indexOf(digit)),
  );
}

function formatMoney(amount) {
  return `৳${Number(amount).toLocaleString("bn-BD")}`;
}

function todayLocal() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* ==========================================
   MEMBER SEARCH COMPONENT
========================================== */

function MemberSearch({
  label,
  selectedMember,
  onSelect,
  onClear,
  required = true,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestId = useRef(0);

  useEffect(() => {
    if (selectedMember) return;

    const keyword = normalizeDigits(query.trim());

    if (!keyword) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }

    const currentRequest = ++requestId.current;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const supabase = createClient();

        const { data, error: searchError } = await supabase.rpc(
          "search_income_members",
          {
            p_query: keyword,
          },
        );

        if (searchError) throw searchError;

        if (currentRequest !== requestId.current) return;

        setResults(data ?? []);
      } catch (err) {
        console.error("Member search error:", err);

        if (currentRequest === requestId.current) {
          setResults([]);
          setError("সদস্য খুঁজতে সমস্যা হয়েছে।");
        }
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      requestId.current += 1;
    };
  }, [query, selectedMember]);

  function selectMember(member) {
    setQuery("");
    setResults([]);
    setError("");
    onSelect(member);
  }

  function clearMember() {
    setQuery("");
    setResults([]);
    setError("");
    onClear();
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {selectedMember ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <FaCheckCircle />
            </div>

            <div className="min-w-0">
              <p className="break-words text-sm font-extrabold text-slate-900">
                {selectedMember.full_name}
              </p>

              <p className="mt-1 text-xs font-bold text-emerald-700">
                ID: {selectedMember.member_id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearMember}
            aria-label="নির্বাচিত সদস্য পরিবর্তন করুন"
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg bg-white text-slate-600"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="সদস্যের নাম অথবা ID লিখুন"
              aria-label={label}
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-base text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />

            {loading && (
              <FaSpinner className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-teal-600" />
            )}
          </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          {!loading && query.trim() && !error && results.length === 0 && (
            <p className="mt-2 text-xs text-slate-500">
              কোনো সদস্য পাওয়া যায়নি।
            </p>
          )}

          {results.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {results.map((member) => (
                <button
                  key={member.member_id}
                  type="button"
                  onClick={() => selectMember(member)}
                  className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left transition last:border-b-0 hover:bg-teal-50"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-slate-900">
                      {member.full_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Member ID: {member.member_id}
                    </p>
                  </div>

                  <FaChevronRight className="shrink-0 text-xs text-teal-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================
   MAIN PAGE
========================================== */

export default function SubmitIncomePage() {
  const [submitter, setSubmitter] = useState(null);

  const [beneficiaryType, setBeneficiaryType] = useState("member");

  const [beneficiaryMember, setBeneficiaryMember] = useState(null);

  const [beneficiaryName, setBeneficiaryName] = useState("");

  const [amount, setAmount] = useState("");

  const [description, setDescription] = useState("");

  const [incomeDate, setIncomeDate] = useState("");

  useEffect(() => {
    setIncomeDate(todayLocal());
  }, []);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  /* ==========================================
     VALIDATION
  ========================================== */

  function handleReview(event) {
    event.preventDefault();

    if (!submitter) {
      setError("প্রথমে টাকা জমাদাতা সদস্য নির্বাচন করুন।");
      return;
    }

    if (beneficiaryType === "member" && !beneficiaryMember) {
      setError("যার টাকা জমা হচ্ছে সেই সদস্য নির্বাচন করুন।");
      return;
    }

    if (beneficiaryType === "non_member" && beneficiaryName.trim().length < 2) {
      setError("যার টাকা জমা হচ্ছে তার সঠিক নাম লিখুন।");
      return;
    }

    const parsedAmount = Number(normalizeDigits(amount));

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      parsedAmount > 9999999999
    ) {
      setError("সঠিক টাকার পরিমাণ লিখুন।");
      return;
    }

    if (description.trim().length < 2) {
      setError("জমার বিবরণ লিখুন।");
      return;
    }

    if (!incomeDate) {
      setError("জমার তারিখ নির্বাচন করুন।");
      return;
    }

    setError("");
    setConfirmOpen(true);
  }

  /* ==========================================
     FINAL SUBMIT
  ========================================== */

  async function handleFinalSubmit() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: submitError } = await supabase.rpc("submit_income_v2", {
        p_submitted_by_member_id: submitter.member_id,

        p_beneficiary_member_id:
          beneficiaryType === "member" ? beneficiaryMember.member_id : null,

        p_beneficiary_name:
          beneficiaryType === "non_member" ? beneficiaryName.trim() : null,

        p_amount: Number(normalizeDigits(amount)),

        p_description: description.trim(),

        p_income_date: incomeDate,
      });

      if (submitError) throw submitError;

      setConfirmOpen(false);
      setSuccess(true);
    } catch (err) {
      console.error("Income submission error:", err);

      setConfirmOpen(false);
      setError("জমার তথ্য Submit করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================
     RESET FORM
  ========================================== */

  function resetForm() {
    setSubmitter(null);
    setBeneficiaryType("member");
    setBeneficiaryMember(null);
    setBeneficiaryName("");
    setAmount("");
    setDescription("");
    setIncomeDate(todayLocal());
    setConfirmOpen(false);
    setError("");
    setSuccess(false);
  }

  /* ==========================================
     SUCCESS SCREEN
  ========================================== */

  if (success) {
    return (
      <main className="mx-auto flex min-h-[75dvh] max-w-lg flex-col items-center justify-center px-4 py-8 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-emerald-50">
          <FaCheckCircle className="text-4xl text-emerald-600" />
        </div>

        <h1 className="mt-5 text-2xl font-black text-slate-900">
          জমার তথ্য জমা হয়েছে!
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          আপনার জমার তথ্য সফলভাবে সংরক্ষিত হয়েছে। Admin অনুমোদন করার পর মূল
          ফান্ডে যোগ হবে।
        </p>

        <div className="mt-5 w-full rounded-2xl bg-amber-50 p-4 text-xs leading-6 text-amber-800">
          বর্তমান অবস্থা: <strong>অনুমোদনের অপেক্ষায়</strong>
        </div>

        <Link
          href="/"
          className="mt-6 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-teal-700 px-5 text-sm font-bold text-white"
        >
          হোমপেজে ফিরে যান
        </Link>

        <button
          type="button"
          onClick={resetForm}
          className="mt-3 min-h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700"
        >
          আরও জমা যুক্ত করুন
        </button>
      </main>
    );
  }

  /* ==========================================
     FORM SCREEN
  ========================================== */

  return (
    <main className="mx-auto max-w-lg space-y-4 px-3 py-4">
      {/* TITLE */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="হোমপেজে ফিরে যান"
          className="grid size-10 cursor-pointer place-items-center rounded-xl bg-white text-slate-700 shadow-sm"
        >
          <FaArrowLeft />
        </Link>

        <div>
          <h1 className="text-lg font-black text-slate-900">টাকা জমা করুন</h1>

          <p className="text-[11px] text-slate-500">
            সদস্যের মাধ্যমে জমার তথ্য Submit করুন
          </p>
        </div>
      </div>

      {/* INTRO */}
      <section className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/15">
          <FaArrowDown className="text-xl" />
        </div>

        <div>
          <h2 className="text-sm font-extrabold">নতুন জমার তথ্য</h2>

          <p className="mt-1 text-[11px] leading-5 text-emerald-100">
            কে জমা দিচ্ছেন এবং কার জন্য জমা দিচ্ছেন, দুটি তথ্যই আলাদাভাবে দিন।
          </p>
        </div>
      </section>

      {/* FORM */}
      <form
        onSubmit={handleReview}
        className="space-y-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
      >
        {/* SECTION 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="grid size-7 place-items-center rounded-full bg-teal-700 text-xs font-black text-white">
              ১
            </span>

            <h2 className="text-sm font-extrabold text-slate-900">
              কে টাকা জমা দিচ্ছেন?
            </h2>
          </div>

          <MemberSearch
            label="জমাদাতা সদস্য"
            selectedMember={submitter}
            onSelect={setSubmitter}
            onClear={() => setSubmitter(null)}
          />

          <p className="text-[11px] leading-5 text-slate-500">
            জমাদাতা অবশ্যই নাথপাড়া যুবসংঘের সদস্য হতে হবে।
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="grid size-7 place-items-center rounded-full bg-teal-700 text-xs font-black text-white">
              ২
            </span>

            <h2 className="text-sm font-extrabold text-slate-900">
              কার টাকা জমা হচ্ছে?
            </h2>
          </div>

          {/* TYPE SELECTOR */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setBeneficiaryType("member");
                setBeneficiaryName("");
                setError("");
              }}
              className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border text-xs font-extrabold transition ${
                beneficiaryType === "member"
                  ? "border-teal-700 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <FaUsers />
              সদস্য
            </button>

            <button
              type="button"
              onClick={() => {
                setBeneficiaryType("non_member");
                setBeneficiaryMember(null);
                setError("");
              }}
              className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border text-xs font-extrabold transition ${
                beneficiaryType === "non_member"
                  ? "border-teal-700 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <FaUser />
              সদস্য নন
            </button>
          </div>

          {beneficiaryType === "member" ? (
            <MemberSearch
              label="যার টাকা সেই সদস্য"
              selectedMember={beneficiaryMember}
              onSelect={setBeneficiaryMember}
              onClear={() => setBeneficiaryMember(null)}
            />
          ) : (
            <div>
              <label
                htmlFor="beneficiary_name"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                যার টাকা তার পুরো নাম
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <FaUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="beneficiary_name"
                  type="text"
                  value={beneficiaryName}
                  onChange={(event) => setBeneficiaryName(event.target.value)}
                  required
                  maxLength={100}
                  placeholder="ব্যক্তির পুরো নাম লিখুন"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>
          )}

          <p className="text-[11px] leading-5 text-slate-500">
            জমাদাতা ও যার টাকা—একই সদস্যও হতে পারেন।
          </p>
        </section>

        {/* SECTION 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="grid size-7 place-items-center rounded-full bg-teal-700 text-xs font-black text-white">
              ৩
            </span>

            <h2 className="text-sm font-extrabold text-slate-900">
              জমার বিবরণ
            </h2>
          </div>

          {/* AMOUNT */}
          <div>
            <label
              htmlFor="amount"
              className="mb-2 block text-xs font-bold text-slate-700"
            >
              টাকার পরিমাণ
              <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <FaMoneyBillWave className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                id="amount"
                type="text"
                inputMode="numeric"
                pattern="[0-9]+"
                value={amount}
                onChange={(event) => {
                  const onlyNumbers = normalizeDigits(
                    event.target.value,
                  ).replace(/[^0-9]/g, "");

                  setAmount(onlyNumbers);
                }}
                required
                placeholder="যেমন: 500"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-base text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {/* DATE */}
          <div>
            <label
              htmlFor="income_date"
              className="mb-2 block text-xs font-bold text-slate-700"
            >
              জমার তারিখ
              <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <FaCalendarAlt className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                id="income_date"
                type="date"
                value={incomeDate}
                onChange={(event) => setIncomeDate(event.target.value)}
                required
                className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-xs font-bold text-slate-700"
            >
              জমার বিবরণ
              <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <FaAlignLeft className="pointer-events-none absolute left-3.5 top-4 text-slate-400" />

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={3}
                maxLength={500}
                placeholder="কী বাবদ টাকা জমা হচ্ছে লিখুন"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs leading-6 text-red-700"
          >
            <FaExclamationCircle className="mt-1 shrink-0" />
            {error}
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-extrabold text-white transition hover:bg-teal-800"
        >
          <FaArrowDown />
          জমার তথ্য Submit করুন
        </button>

        <p className="flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-slate-500">
          <FaShieldAlt className="shrink-0 text-teal-600" />
          Admin Approval ছাড়া ফান্ডে যোগ হবে না।
        </p>
      </form>

      {/* ==========================================
         FINAL CONFIRMATION
      ========================================== */}

      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-3 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="income-confirm-title"
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2
                id="income-confirm-title"
                className="text-lg font-black text-slate-900"
              >
                জমার তথ্য নিশ্চিত করুন
              </h2>

              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmOpen(false)}
                aria-label="বন্ধ করুন"
                className="grid size-9 cursor-pointer place-items-center rounded-xl bg-slate-100 text-slate-600 disabled:cursor-not-allowed"
              >
                <FaTimes />
              </button>
            </div>

            <p className="mt-2 text-xs leading-6 text-slate-500">
              সব তথ্য সঠিক হলে নিশ্চিত করুন।
            </p>

            <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div>
                <p className="text-[11px] text-slate-500">জমাদাতা সদস্য</p>
                <p className="mt-1 font-bold text-slate-900">
                  {submitter?.full_name} ({submitter?.member_id})
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">যার টাকা জমা হচ্ছে</p>

                <p className="mt-1 font-bold text-slate-900">
                  {beneficiaryType === "member"
                    ? `${beneficiaryMember?.full_name} (${beneficiaryMember?.member_id})`
                    : `${beneficiaryName.trim()} (সদস্য নন)`}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">টাকার পরিমাণ</p>
                <p className="mt-1 text-lg font-black text-teal-700">
                  {formatMoney(normalizeDigits(amount))}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">জমার তারিখ</p>
                <p className="mt-1 font-bold text-slate-900">{incomeDate}</p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">বিবরণ</p>
                <p className="mt-1 whitespace-pre-wrap break-words font-bold text-slate-900">
                  {description.trim()}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmOpen(false)}
                className="min-h-12 cursor-pointer rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 disabled:cursor-not-allowed"
              >
                সংশোধন করুন
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleFinalSubmit}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-2 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    অপেক্ষা করুন
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    নিশ্চিত করুন
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
