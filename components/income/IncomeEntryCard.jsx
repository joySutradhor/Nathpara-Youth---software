import {
  FaUser,
  FaCalendarAlt,
  FaFileAlt,
  FaCheckCircle,
  FaIdBadge,
} from "react-icons/fa";

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString("bn-BD")}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function IncomeEntryCard({ income }) {
  const donorName = income.donor_name || "নাম পাওয়া যায়নি";

  const memberId = income.member_id;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
            <FaUser />
          </div>

          <div className="min-w-0">
            <h3 className="break-words text-sm font-black text-slate-900">
              {donorName}
            </h3>

            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
              <FaIdBadge />

              {memberId ? `সদস্য ID: ${memberId}` : "সদস্য নন"}
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700">
          <FaCheckCircle />
          অনুমোদিত
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="rounded-xl bg-teal-50 p-3">
          <p className="text-[11px] text-teal-700">জমার পরিমাণ</p>

          <p className="mt-1 text-2xl font-black text-teal-800">
            {formatMoney(income.amount)}
          </p>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-600">
          <FaCalendarAlt className="mt-0.5 shrink-0 text-teal-700" />

          <span>
            জমার তারিখ:{" "}
            <strong className="text-slate-800">
              {formatDate(income.income_date)}
            </strong>
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-600">
          <FaFileAlt className="mt-0.5 shrink-0 text-teal-700" />

          <div className="min-w-0">
            <p className="font-semibold text-slate-800">বিবরণ</p>

            <p className="mt-1 whitespace-pre-wrap break-words leading-6">
              {income.description?.trim() || "কোনো বিবরণ নেই"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
