"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMoneyBillWave,
  FaUser,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaSpinner,
  FaSyncAlt,
  FaShieldAlt,
  FaExclamationTriangle,
  FaClipboardCheck,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";

const supabase = createClient();

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString("bn-BD")}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("bn-BD");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
  };

  const labels = {
    pending: "অপেক্ষমাণ",
    approved: "অনুমোদিত",
    rejected: "বাতিল",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-teal-700">
        <Icon className="text-xs" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-slate-500">{label}</p>

        <p className="mt-1 break-words text-sm font-bold leading-6 text-slate-800">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function ApprovalCard({ item, type, onReview }) {
  const isIncome = type === "income";

  const submitterText = item.submitter_name
    ? `${item.submitter_name} (${item.submitted_by_member_id})`
    : item.submitted_by_member_id
      ? `সদস্য ID: ${item.submitted_by_member_id}`
      : "সদস্যের তথ্য পাওয়া যায়নি";

  const beneficiaryText = item.beneficiary_member_id
    ? `${item.beneficiary_name || "সদস্য"} (${item.beneficiary_member_id})`
    : `${item.beneficiary_name || item.donor_name || "নাম পাওয়া যায়নি"} (সদস্য নন / ID নেই)`;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div>
          <p className="text-[11px] text-slate-500">
            {isIncome ? "জমার পরিমাণ" : "খরচের পরিমাণ"}
          </p>

          <h3
            className={`mt-1 text-2xl font-black ${
              isIncome ? "text-teal-700" : "text-rose-600"
            }`}
          >
            {formatMoney(item.amount)}
          </h3>
        </div>

        <StatusBadge status={item.status} />
      </div>

      <div className="space-y-4 p-4">
        <InfoRow
          icon={FaUser}
          label={isIncome ? "কে টাকা জমা দিয়েছেন" : "খরচ জমাদানকারী সদস্য"}
          value={submitterText}
        />

        {isIncome ? (
          <InfoRow
            icon={FaUsers}
            label="কার টাকা জমা হয়েছে"
            value={beneficiaryText}
          />
        ) : (
          <InfoRow icon={FaFileAlt} label="খরচের খাত" value={item.category} />
        )}

        <InfoRow
          icon={FaCalendarAlt}
          label={isIncome ? "জমার তারিখ" : "খরচের তারিখ"}
          value={formatDate(isIncome ? item.income_date : item.expense_date)}
        />

        <InfoRow
          icon={FaFileAlt}
          label={isIncome ? "জমার বিবরণ" : "খরচের বিবরণ"}
          value={item.description}
        />

        <InfoRow
          icon={FaClock}
          label="আবেদন জমার সময়"
          value={formatDateTime(item.created_at)}
        />

        {item.reviewed_at && (
          <InfoRow
            icon={FaClipboardCheck}
            label="সিদ্ধান্ত নেওয়ার সময়"
            value={formatDateTime(item.reviewed_at)}
          />
        )}

        {item.reviewed_by_email && (
          <InfoRow
            icon={FaShieldAlt}
            label="সিদ্ধান্ত নিয়েছেন"
            value={item.reviewed_by_email}
          />
        )}
      </div>

      {item.status === "pending" && (
        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={() => onReview(item, "rejected")}
            className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-extrabold text-red-700 hover:bg-red-100"
          >
            <FaTimesCircle />
            বাতিল
          </button>

          <button
            type="button"
            onClick={() => onReview(item, "approved")}
            className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-3 text-sm font-extrabold text-white hover:bg-teal-800"
          >
            <FaCheckCircle />
            অনুমোদন
          </button>
        </div>
      )}
    </article>
  );
}

export default function ApprovalsPage() {
  const [type, setType] = useState("income");
  const [filter, setFilter] = useState("pending");

  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [review, setReview] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [incomeResult, expenseResult] = await Promise.all([
        supabase.rpc("admin_income_list"),
        supabase.rpc("admin_expense_list"),
      ]);

      const errors = [];

      if (incomeResult.error) {
        console.error("Income list error:", incomeResult.error);
        errors.push("জমার তথ্য লোড করা যায়নি।");
        setIncomes([]);
      } else {
        setIncomes(incomeResult.data || []);
      }

      if (expenseResult.error) {
        console.error("Expense list error:", expenseResult.error);
        errors.push("খরচের তথ্য লোড করা যায়নি।");
        setExpenses([]);
      } else {
        setExpenses(expenseResult.data || []);
      }

      if (errors.length) {
        setError(`${errors.join(" ")} Admin Login এবং SQL RPC পরীক্ষা করুন।`);
      }
    } catch (err) {
      console.error("Approval loading error:", err);
      setError("তথ্য লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const items = type === "income" ? incomes : expenses;

  const pendingItems = items.filter((item) => item.status === "pending");

  const approvedItems = items.filter((item) => item.status === "approved");

  const rejectedItems = items.filter((item) => item.status === "rejected");

  const filteredItems = items.filter((item) => item.status === filter);

  const pendingAmount = pendingItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const incomePendingCount = incomes.filter(
    (item) => item.status === "pending",
  ).length;

  const expensePendingCount = expenses.filter(
    (item) => item.status === "pending",
  ).length;

  const filters = [
    {
      id: "pending",
      label: "অপেক্ষমাণ",
      count: pendingItems.length,
    },
    {
      id: "approved",
      label: "অনুমোদিত",
      count: approvedItems.length,
    },
    {
      id: "rejected",
      label: "বাতিল",
      count: rejectedItems.length,
    },
  ];

  function changeType(nextType) {
    if (submitting) return;

    setType(nextType);
    setFilter("pending");
    setMessage("");
    setReview(null);
  }

  function openReview(item, action) {
    setError("");
    setMessage("");

    setReview({
      item,
      action,
      type,
    });
  }

  async function confirmReview() {
    if (!review || submitting) return;

    setSubmitting(true);
    setError("");

    const { item, action, type: reviewType } = review;

    try {
      const rpcName =
        reviewType === "income"
          ? "admin_review_income"
          : "admin_review_expense";

      const rpcParams =
        reviewType === "income"
          ? {
              p_income_id: item.id,
              p_action: action,
            }
          : {
              p_expense_id: item.id,
              p_action: action,
            };

      const { error: reviewError } = await supabase.rpc(rpcName, rpcParams);

      if (reviewError) throw reviewError;

      const updateStatus = (previous) =>
        previous.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                status: action,
                reviewed_at: new Date().toISOString(),
              }
            : entry,
        );

      if (reviewType === "income") {
        setIncomes(updateStatus);
      } else {
        setExpenses(updateStatus);
      }

      const label = reviewType === "income" ? "জমা" : "খরচ";

      setMessage(
        action === "approved"
          ? `${formatMoney(item.amount)} ${label} সফলভাবে অনুমোদন করা হয়েছে।`
          : `${formatMoney(item.amount)} ${label} বাতিল করা হয়েছে।`,
      );

      setReview(null);
    } catch (err) {
      console.error("Approval review error:", err);

      setReview(null);

      setError(
        err?.message ||
          "সিদ্ধান্ত সংরক্ষণ করা যায়নি। Refresh করে আবার চেষ্টা করুন।",
      );

      await loadData();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
            জমা ও খরচের অনুমোদন
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            আবেদন যাচাই করে অনুমোদন বা বাতিল করুন
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading || submitting}
          className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* INCOME / EXPENSE TABS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => changeType("income")}
          disabled={submitting}
          className={`min-h-20 cursor-pointer rounded-2xl border p-3 text-left transition disabled:opacity-50 ${
            type === "income"
              ? "border-teal-600 bg-teal-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <FaArrowDown className="text-teal-700" />
            <span className="text-sm font-black text-slate-900">জমা</span>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Pending: {formatNumber(incomePendingCount)}
          </p>
        </button>

        <button
          type="button"
          onClick={() => changeType("expense")}
          disabled={submitting}
          className={`min-h-20 cursor-pointer rounded-2xl border p-3 text-left transition disabled:opacity-50 ${
            type === "expense"
              ? "border-rose-500 bg-rose-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <FaArrowUp className="text-rose-600" />
            <span className="text-sm font-black text-slate-900">খরচ</span>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Pending: {formatNumber(expensePendingCount)}
          </p>
        </button>
      </div>

      {/* SUMMARY */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 p-4 text-white">
          <FaClock className="text-lg text-teal-200" />

          <p className="mt-3 text-xs text-teal-100">
            অপেক্ষমাণ {type === "income" ? "জমা" : "খরচ"}
          </p>

          <p className="mt-1 text-2xl font-black">
            {loading ? "..." : formatNumber(pendingItems.length)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <FaMoneyBillWave className="text-lg text-amber-600" />

          <p className="mt-3 text-xs text-slate-500">অপেক্ষমাণ টাকা</p>

          <p className="mt-1 text-xl font-black text-slate-900">
            {loading ? "..." : formatMoney(pendingAmount)}
          </p>
        </div>
      </section>

      {/* SUCCESS */}
      {message && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"
        >
          <FaCheckCircle className="mt-1 shrink-0" />
          {message}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="mt-1 shrink-0" />
            {error}
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="mt-3 cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-700"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}

      {/* STATUS FILTERS */}
      <div className="grid grid-cols-3 gap-2">
        {filters.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            disabled={submitting}
            className={`min-h-12 cursor-pointer rounded-xl border px-2 py-2 text-xs font-bold transition disabled:opacity-50 ${
              filter === tab.id
                ? "border-teal-700 bg-teal-50 text-teal-700"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            {tab.label}
            <span className="ml-1">({formatNumber(tab.count)})</span>
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-white p-10 text-sm text-slate-500">
          <FaSpinner className="animate-spin text-teal-700" />
          তথ্য লোড হচ্ছে...
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
          <FaShieldAlt className="mx-auto text-3xl text-slate-300" />

          <p className="mt-3 text-sm font-bold text-slate-600">
            এই বিভাগে কোনো {type === "income" ? "জমা" : "খরচ"} নেই।
          </p>
        </div>
      )}

      {/* CARDS */}
      {!loading && (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredItems.map((item) => (
            <ApprovalCard
              key={`${type}-${item.id}`}
              item={item}
              type={type}
              onReview={openReview}
            />
          ))}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {review && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-3 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div
                className={`grid size-12 place-items-center rounded-xl ${
                  review.action === "approved"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {review.action === "approved" ? (
                  <FaCheckCircle className="text-xl" />
                ) : (
                  <FaTimesCircle className="text-xl" />
                )}
              </div>

              <div>
                <h2
                  id="review-title"
                  className="text-lg font-black text-slate-900"
                >
                  {review.action === "approved"
                    ? "অনুমোদন করবেন?"
                    : "বাতিল করবেন?"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  সিদ্ধান্ত নেওয়ার আগে তথ্য যাচাই করুন।
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">ধরন</span>
                <strong>{review.type === "income" ? "জমা" : "খরচ"}</strong>
              </div>

              {review.type === "expense" && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">খাত</span>
                  <strong>{review.item.category}</strong>
                </div>
              )}

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">পরিমাণ</span>
                <strong className="text-lg text-slate-900">
                  {formatMoney(review.item.amount)}
                </strong>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-500">বিবরণ</p>

                <p className="mt-2 whitespace-pre-wrap break-words font-medium text-slate-800">
                  {review.item.description || "—"}
                </p>
              </div>
            </div>

            {review.action === "approved" && (
              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-800">
                অনুমোদন করলে এই টাকা সংগঠনের মূল হিসাবে
                {review.type === "income"
                  ? " জমা হবে।"
                  : " খরচ হিসেবে গণনা হবে এবং বর্তমান ফান্ড কমবে।"}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReview(null)}
                disabled={submitting}
                className="min-h-12 cursor-pointer rounded-xl border border-slate-200 text-sm font-bold text-slate-700 disabled:opacity-50"
              >
                ফিরে যান
              </button>

              <button
                type="button"
                onClick={confirmReview}
                disabled={submitting}
                className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-black text-white disabled:opacity-50 ${
                  review.action === "approved" ? "bg-teal-700" : "bg-red-600"
                }`}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  <>
                    {review.action === "approved" ? (
                      <FaCheckCircle />
                    ) : (
                      <FaTimesCircle />
                    )}
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
