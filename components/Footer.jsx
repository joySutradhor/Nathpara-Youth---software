import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:text-left">
        <p className="text-[11px] text-slate-500">
          © {new Date().getFullYear()} নাথপাড়া যুবসংঘ
        </p>

        <Link
          href="/"
          className="cursor-pointer text-[11px] font-bold text-teal-700 transition hover:text-teal-900"
        >
          আমাদের হিসাব • সবার জন্য
        </Link>
      </div>
    </footer>
  );
}