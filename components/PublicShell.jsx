"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaArrowDown,
  FaArrowUp,
  FaUsers,
  FaSignInAlt,
} from "react-icons/fa";
import Header from "@/components/Header";

const menus = [
  { label: "হোম", href: "/", icon: FaHome },
  { label: "জমা", href: "/submit-income", icon: FaArrowDown },
  { label: "খরচ", href: "/submit-expense", icon: FaArrowUp },
  { label: "সদস্য", href: "/members", icon: FaUsers },
  { label: "অ্যাডমিন", href: "/login", icon: FaSignInAlt },
];
export default function PublicShell({ children }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f8fb]">
      <Header />
      <main className="min-w-0 flex-1">{children}</main>
      <nav
        aria-label="প্রধান মেনু"
        className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = pathname === menu.href;
            return (
              <Link
                key={menu.href}
                href={menu.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 transition ${active ? "bg-teal-50 text-teal-700" : "text-slate-400 hover:bg-slate-50 hover:text-teal-700"}`}
              >
                <Icon className="text-lg" />
                <span className="text-[10px] font-bold">{menu.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-16 shrink-0" />
    </div>
  );
}
