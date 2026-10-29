"use client";

import { useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaClock,
} from "react-icons/fa";

import PublicFinanceList from "@/components/finance/PublicFinanceList";

export default function PendingSubmissionsPage() {
  const [activeTab, setActiveTab] = useState("income");

  return (
    <div>
      <div className="mx-auto max-w-lg px-3 pt-5">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <FaClock className="text-amber-700" />

            <h1 className="text-base font-black text-slate-900">
              অপেক্ষমাণ আবেদনসমূহ
            </h1>
          </div>

          <p className="mt-2 text-xs leading-6 text-slate-600">
            এখানে জমা ও খরচের অপেক্ষমাণ আবেদন দেখা যাবে।
            Admin অনুমোদন না করা পর্যন্ত এগুলো মূল হিসাবে
            যোগ বা বিয়োগ হবে না।
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-sm font-black transition-colors ${
              activeTab === "income"
                ? "border-teal-700 bg-teal-50 text-teal-800"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <FaArrowDown />
            অপেক্ষমাণ জমা
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("expense")}
            className={`flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-sm font-black transition-colors ${
              activeTab === "expense"
                ? "border-rose-600 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <FaArrowUp />
            অপেক্ষমাণ খরচ
          </button>
        </div>
      </div>

      {activeTab === "income" ? (
        <PublicFinanceList
          key="pending-income"
          title="অপেক্ষমাণ জমার তালিকা"
          subtitle="যেসব জমার আবেদন এখনো Admin যাচাই করছেন।"
          type="income"
          pending={true}
          listRpc="get_public_pending_income"
          summaryRpc="get_public_pending_summary"
          summaryAmountKey="pending_income_amount"
          summaryCountKey="pending_income_count"
        />
      ) : (
        <PublicFinanceList
          key="pending-expense"
          title="অপেক্ষমাণ খরচের তালিকা"
          subtitle="যেসব খরচের আবেদন এখনো Admin যাচাই করছেন।"
          type="expense"
          pending={true}
          listRpc="get_public_pending_expenses"
          summaryRpc="get_public_pending_summary"
          summaryAmountKey="pending_expense_amount"
          summaryCountKey="pending_expense_count"
        />
      )}
    </div>
  );
}