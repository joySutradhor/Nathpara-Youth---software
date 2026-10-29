import PublicFinanceList from "@/components/finance/PublicFinanceList";

export const metadata = {
  title: "অনুমোদিত খরচের হিসাব | নাথপাড়া যুবসংঘ",
  description: "নাথপাড়া যুবসংঘের অনুমোদিত খরচের তালিকা।",
};

export default function ApprovedExpensesPage() {
  return (
    <PublicFinanceList
      title="কোন খাতে কত টাকা খরচ হয়েছে?"
      subtitle="সংগঠনের সকল অনুমোদিত খরচের স্বচ্ছ হিসাব।"
      type="expense"
      pending={false}
      listRpc="get_public_approved_expenses"
      summaryRpc="get_public_expense_summary"
      summaryAmountKey="total_expense"
      summaryCountKey="total_entries"
    />
  );
}
