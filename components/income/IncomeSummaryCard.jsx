import { FaMoneyBillWave, FaListAlt } from "react-icons/fa";

function formatMoney(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `৳${Number(value).toLocaleString("bn-BD")}`;
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return Number(value).toLocaleString("bn-BD");
}

export default function IncomeSummaryCard({
  totalIncome,
  totalEntries,
  loading,
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 p-4 text-white shadow-sm">
        <div className="flex items-center gap-2 text-teal-100">
          <FaMoneyBillWave className="text-lg" />

          <span className="text-xs font-semibold">মোট অনুমোদিত জমা</span>
        </div>

        <p className="mt-3 break-words text-xl font-black sm:text-2xl">
          {loading ? "..." : formatMoney(totalIncome)}
        </p>

        <p className="mt-2 text-[11px] text-teal-100">শুধু অনুমোদিত টাকা</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <FaListAlt className="text-lg text-teal-700" />

          <span className="text-xs font-semibold">মোট জমার এন্ট্রি</span>
        </div>

        <p className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">
          {loading ? "..." : formatNumber(totalEntries)}
        </p>

        <p className="mt-2 text-[11px] text-slate-500">
          অনুমোদিত লেনদেনের সংখ্যা
        </p>
      </div>
    </div>
  );
}
