"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUsers,
  FaArrowDown,
  FaArrowUp,
  FaClipboardCheck,
  FaUserShield,
  FaGlobe,
} from "react-icons/fa";
import Header from "@/components/Header";

const menuItems = [
  { label: "সদস্য", href: "/members", icon: FaUsers },
  { label: "জমা", href: "/submit-income", icon: FaArrowDown },
  { label: "খরচ", href: "/expenses", icon: FaArrowUp },
  { label: "অনুমোদন", href: "/dashboard/approvals", icon: FaClipboardCheck },
  { label: "অ্যাডমিন", href: "/dashboard", icon: FaUserShield },
];
export default function AppShell({ children }) {
  const pathname = usePathname();
  const isActive = (href) =>
    href === "/dashboard"
      ? pathname === "/dashboard" || pathname.startsWith("/dashboard/admins")
      : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f8fb]">
      <Header admin />
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
          <nav aria-label="অ্যাডমিন মেনু" className="sticky top-20 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${active ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"}`}
                >
                  <Icon className="text-base" />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-slate-100 pt-3">
              <Link
                href="/"
                className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700"
              >
                <FaGlobe /> পাবলিক ওয়েবসাইট
              </Link>
            </div>
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-3 pb-8 pt-5 sm:px-6">
          {children}
        </main>
      </div>
      <nav
        aria-label="প্রধান অ্যাডমিন মেনু"
        className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.04)] lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 transition ${active ? "bg-teal-50 text-teal-700" : "text-slate-400 hover:bg-slate-50 hover:text-teal-700"}`}
              >
                <Icon className="text-lg" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-16 shrink-0 lg:hidden" />
    </div>
  );
}
