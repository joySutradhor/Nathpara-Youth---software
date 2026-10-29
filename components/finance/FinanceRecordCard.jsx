import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaTag,
  FaUser,
  FaUserCheck,
} from "react-icons/fa";

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString("bn-BD")}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  );

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function FinanceRecordCard({
  record,
  type = "expense",
  pending = false,
}) {
  const isExpense = type === "expense";

  const personName = record.member_name || "নাম পাওয়া যায়নি";

  const submitterName =
    record.submitted_by_name || (isExpense ? personName : "নাম পাওয়া যায়নি");

  const submitterId =
    record.submitted_by_member_id || (isExpense ? record.member_id : null);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-xl ${
              isExpense
                ? "bg-rose-50 text-rose-600"
                : "bg-teal-50 text-teal-700"
            }`}
          >
            <FaUser />
          </span>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-500">
              {isExpense ? "খরচের আবেদন" : "যার নামে জমা"}
            </p>

            <h3 className="mt-1 break-words text-sm font-black text-slate-900">
              {personName}
            </h3>

            {record.member_id && (
              <p className="mt-1 text-[11px] text-slate-500">
                সদস্য ID: {record.member_id}
              </p>
            )}
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
            pending
              ? "bg-amber-50 text-amber-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {pending ? <FaClock /> : <FaCheckCircle />}

          {pending ? "অপেক্ষমাণ" : "অনুমোদিত"}
        </span>
      </div>

      <div className="space-y-3 p-4">
        {/* AMOUNT */}
        <div
          className={`rounded-xl p-3 ${
            isExpense ? "bg-rose-50" : "bg-teal-50"
          }`}
        >
          <p
            className={`text-[11px] ${
              isExpense ? "text-rose-700" : "text-teal-700"
            }`}
          >
            {isExpense ? "খরচের পরিমাণ" : "জমার পরিমাণ"}
          </p>

          <p
            className={`mt-1 text-2xl font-black ${
              isExpense ? "text-rose-700" : "text-teal-800"
            }`}
          >
            {formatMoney(record.amount)}
          </p>
        </div>

        {/* SUBMITTER */}
        {pending && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-blue-700">
                <FaUserCheck />
              </span>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-blue-700">
                  {isExpense ? "খরচের আবেদন করেছেন" : "জমার আবেদন করেছেন"}
                </p>

                <p className="mt-1 break-words text-sm font-black text-slate-900">
                  {submitterName}
                </p>

                <p className="mt-1 text-[11px] text-slate-600">
                  {submitterId
                    ? `সদস্য ID: ${submitterId}`
                    : "সদস্য ID পাওয়া যায়নি"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EXPENSE CATEGORY */}
        {record.category && (
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <FaTag className="mt-0.5 shrink-0 text-slate-400" />

            <span>
              খরচের খাত:{" "}
              <strong className="text-slate-800">{record.category}</strong>
            </span>
          </div>
        )}

        {/* DATE */}
        <div className="flex items-start gap-2 text-xs text-slate-600">
          <FaCalendarAlt className="mt-0.5 shrink-0 text-slate-400" />

          <span>
            {pending ? "আবেদনের তারিখ" : "লেনদেনের তারিখ"}:{" "}
            <strong className="text-slate-800">
              {formatDate(
                pending
                  ? record.submitted_at
                  : isExpense
                    ? record.expense_date
                    : record.income_date,
              )}
            </strong>
          </span>
        </div>

        {/* DESCRIPTION */}
        {record.description && (
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <FaFileAlt className="mt-0.5 shrink-0 text-slate-400" />

            <p className="whitespace-pre-wrap break-words leading-6">
              {record.description}
            </p>
          </div>
        )}

        {/* PENDING NOTE */}
        {pending && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-800">
            আবেদনটি এখনো Admin অনুমোদন করেননি। এই টাকা বর্তমান ফান্ডে গণনা হয়নি।
          </p>
        )}
      </div>
    </article>
  );
}
