"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  FaArrowUp,
  FaUser,
  FaSearch,
  FaCheckCircle,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileAlt,
  FaSpinner,
  FaTimes,
  FaChevronLeft,
  FaShieldAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/* ==========================================
   EXPENSE CATEGORIES
========================================== */

const categories = [
  "মূর্তি",
  "লাইটিং",
  "ডেকোরেশন",
  "ইভেন্ট",
  "পণ্ডিত",
  "প্রসাদ",
  "ঢাকি",
  "গেস্ট",
  "রান্নার কর্মী",
  "সাংস্কৃতিক অনুষ্ঠান",
  "অন্যান্য",
];

/* ==========================================
   HELPERS
========================================== */

function normalizeDigits(value) {
  return String(value)
    .replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function money(value) {
  return `৳${Number(value || 0).toLocaleString("bn-BD")}`;
}

function getToday() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* ==========================================
   MEMBER SEARCH COMPONENT
========================================== */

function MemberSearch({ selected, onSelect, disabled }) {
  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (selected || query.trim().length < 1) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const { data, error: searchError } = await supabase.rpc(
          "search_expense_members",
          {
            p_query: normalizeDigits(query.trim()),
          },
        );

        if (searchError) throw searchError;

        if (!cancelled) {
          setResults(data || []);
          setOpen(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError("সদস্য খুঁজতে সমস্যা হয়েছে।");
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, selected]);

  function handleSelect(member) {
    onSelect(member);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleClear() {
    onSelect(null);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-teal-700">
            <FaUser />
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-900">
              {selected.full_name}
            </p>

            <p className="mt-1 text-xs text-teal-700">
              সদস্য ID: {selected.member_id}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          aria-label="সদস্য পরিবর্তন করুন"
          className="grid size-9 cursor-pointer place-items-center rounded-xl bg-white text-slate-500 disabled:opacity-50"
        >
          <FaTimes />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder="নাম বা সদস্য ID দিয়ে খুঁজুন"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none focus:border-teal-600 disabled:opacity-50"
        />

        {loading && (
          <FaSpinner className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-teal-700" />
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {open && query.trim() && !loading && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          {results.length > 0 ? (
            results.map((member) => (
              <button
                key={member.member_id}
                type="button"
                onClick={() => handleSelect(member)}
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-3 text-left hover:bg-teal-50"
              >
                <span className="truncate text-sm font-bold text-slate-800">
                  {member.full_name}
                </span>

                <span className="shrink-0 text-xs font-bold text-teal-700">
                  {member.member_id}
                </span>
              </button>
            ))
          ) : (
            <p className="p-3 text-center text-xs text-slate-500">
              কোনো সদস্য পাওয়া যায়নি
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================
   EXPENSE PAGE
========================================== */

export default function SubmitExpensePage() {
  const [member, setMember] = useState(null);

  const [category, setCategory] = useState("");

  const [amount, setAmount] = useState("");

  const [description, setDescription] = useState("");

  const [expenseDate, setExpenseDate] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [successId, setSuccessId] = useState("");

  useEffect(() => {
    setExpenseDate(getToday());
  }, []);

  function validateForm() {
    if (!member) {
      return "প্রথমে খরচ জমাদানকারী সদস্য নির্বাচন করুন।";
    }

    if (!category) {
      return "খরচের খাত নির্বাচন করুন।";
    }

    if (!amount || !/^[0-9]+$/.test(amount)) {
      return "সঠিক টাকার পরিমাণ লিখুন।";
    }

    if (Number(amount) <= 0) {
      return "টাকার পরিমাণ শূন্যের বেশি হতে হবে।";
    }

    if (description.trim().length < 5) {
      return "খরচের বিস্তারিত বিবরণ অন্তত ৫ অক্ষরে লিখুন।";
    }

    if (!expenseDate) {
      return "খরচের তারিখ নির্বাচন করুন।";
    }

    return "";
  }

  function handlePreview(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setConfirmOpen(true);
  }

  async function handleSubmit() {
    if (submitting) return;

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setConfirmOpen(false);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data, error: submitError } = await supabase.rpc(
        "submit_expense_v1",
        {
          p_submitted_by_member_id: member.member_id,
          p_category: category,
          p_amount: Number(amount),
          p_description: description.trim(),
          p_expense_date: expenseDate,
        },
      );

      if (submitError) throw submitError;

      setSuccessId(data);

      setConfirmOpen(false);

      setMember(null);
      setCategory("");
      setAmount("");
      setDescription("");
      setExpenseDate(getToday());
    } catch (err) {
      console.error("Expense submission error:", err);

      setError(err?.message || "খরচ জমা দেওয়া যায়নি। আবার চেষ্টা করুন।");

      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (successId) {
    return (
      <div className="mx-auto max-w-lg px-3 py-6">
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-3xl text-emerald-600">
            <FaCheckCircle />
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-900">
            খরচের তথ্য জমা হয়েছে!
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            আপনার দেওয়া খরচের তথ্য সফলভাবে সংরক্ষিত হয়েছে। অ্যাডমিন অনুমোদন দিলে
            এটি সংগঠনের মূল হিসাবের সঙ্গে যুক্ত হবে।
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">জমার রেফারেন্স</p>

            <p className="mt-1 break-all text-xs font-bold text-slate-800">
              {successId}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSuccessId("")}
            className="mt-6 min-h-12 w-full cursor-pointer rounded-xl bg-teal-700 px-4 text-sm font-bold text-white"
          >
            আরেকটি খরচ জমা দিন
          </button>

          <Link
            href="/"
            className="mt-3 flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-sm font-bold text-slate-700"
          >
            হোমপেজে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-3 py-5">
      {/* PAGE HEADER */}
      <section>
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-500"
        >
          <FaChevronLeft />
          হোমপেজ
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-xl text-rose-600">
            <FaArrowUp />
          </span>

          <div>
            <h1 className="text-xl font-black text-slate-900">খরচ জমা দিন</h1>

            <p className="mt-1 text-xs text-slate-500">
              সংগঠনের খরচের তথ্য জমা করুন
            </p>
          </div>
        </div>
      </section>

      {/* INFO */}
      <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <FaShieldAlt className="mt-0.5 shrink-0 text-teal-700" />

        <p className="text-xs leading-6 text-teal-900">
          জমা দেওয়া খরচ প্রথমে <strong>Pending</strong> থাকবে। অ্যাডমিন অনুমোদন
          দেওয়ার পর মূল হিসাবের সঙ্গে যুক্ত হবে।
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handlePreview}
        className="space-y-5 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
      >
        {/* MEMBER */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
            <FaUser className="text-teal-700" />
            খরচ জমাদানকারী সদস্য
            <span className="text-red-500">*</span>
          </label>

          <MemberSearch
            selected={member}
            onSelect={setMember}
            disabled={submitting}
          />

          <p className="mt-2 text-[11px] text-slate-400">
            সংগঠনের নিবন্ধিত সদস্য নির্বাচন করুন।
          </p>
        </div>

        {/* CATEGORY */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            খরচের খাত <span className="text-red-500">*</span>
          </label>

          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={submitting}
            required
            className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-600"
          >
            <option value="">খরচের খাত নির্বাচন করুন</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* AMOUNT */}
        <div>
          <label
            htmlFor="amount"
            className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"
          >
            <FaMoneyBillWave className="text-teal-700" />
            টাকার পরিমাণ
            <span className="text-red-500">*</span>
          </label>

          <input
            id="amount"
            type="text"
            inputMode="numeric"
            pattern="[0-9]+"
            value={amount}
            onChange={(event) =>
              setAmount(
                normalizeDigits(event.target.value).replace(/[^0-9]/g, ""),
              )
            }
            disabled={submitting}
            required
            placeholder="যেমন: 500"
            className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-teal-600"
          />
        </div>

        {/* DATE */}
        <div>
          <label
            htmlFor="expenseDate"
            className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"
          >
            <FaCalendarAlt className="text-teal-700" />
            খরচের তারিখ
            <span className="text-red-500">*</span>
          </label>

          <input
            id="expenseDate"
            type="date"
            value={expenseDate}
            onChange={(event) => setExpenseDate(event.target.value)}
            disabled={submitting}
            required
            className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-600"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"
          >
            <FaFileAlt className="text-teal-700" />
            খরচের বিবরণ
            <span className="text-red-500">*</span>
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={submitting}
            required
            rows={4}
            minLength={5}
            placeholder="কী কারণে খরচ হয়েছে, বিস্তারিত লিখুন..."
            className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-teal-600"
          />
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700"
          >
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={submitting}
          className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-black text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaCheckCircle />
          খরচের তথ্য জমা দিন
        </button>
      </form>

      {/* CONFIRMATION MODAL */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-confirm-title"
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-xl text-rose-600">
                <FaArrowUp />
              </span>

              <div>
                <h2
                  id="expense-confirm-title"
                  className="text-lg font-black text-slate-900"
                >
                  খরচ নিশ্চিত করুন
                </h2>

                <p className="text-xs text-slate-500">
                  তথ্যগুলো ভালোভাবে মিলিয়ে নিন।
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">সদস্য</span>

                <strong className="text-right">{member?.full_name}</strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">সদস্য ID</span>

                <strong>{member?.member_id}</strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">খরচের খাত</span>

                <strong className="text-right">{category}</strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">পরিমাণ</span>

                <strong className="text-lg text-rose-600">
                  {money(amount)}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">তারিখ</span>

                <strong>{expenseDate}</strong>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-500">বিবরণ</p>

                <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="min-h-12 cursor-pointer rounded-xl border border-slate-200 text-sm font-bold text-slate-700 disabled:opacity-50"
              >
                বাতিল
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    জমা হচ্ছে...
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
    </div>
  );
}
