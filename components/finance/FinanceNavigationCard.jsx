function FinanceNavigationCard({
  href,
  title,
  description,
  icon: Icon,
  theme = "teal",
  horizontal = false,
}) {
  const themes = {
    teal: {
      card: "border-teal-100 bg-teal-50 hover:border-teal-300",
      icon: "bg-white text-teal-700",
      title: "text-teal-900",
      arrow: "text-teal-700",
    },

    rose: {
      card: "border-rose-100 bg-rose-50 hover:border-rose-300",
      icon: "bg-white text-rose-700",
      title: "text-rose-900",
      arrow: "text-rose-700",
    },

    amber: {
      card: "border-amber-100 bg-amber-50 hover:border-amber-300",
      icon: "bg-white text-amber-700",
      title: "text-amber-900",
      arrow: "text-amber-700",
    },
  };

  const selected = themes[theme] || themes.teal;

  if (horizontal) {
    return (
      <Link
        href={href}
        className={`group flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl border p-3 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99] ${selected.card}`}
      >
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-xl ${selected.icon}`}
        >
          <Icon className="text-lg" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-black ${selected.title}`}>{title}</h3>

          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            {description}
          </p>
        </div>

        <FaChevronRight
          className={`shrink-0 text-xs transition-transform group-hover:translate-x-1 ${selected.arrow}`}
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group flex min-h-32 cursor-pointer flex-col justify-between rounded-2xl border p-3 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] ${selected.card}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`grid size-10 place-items-center rounded-xl ${selected.icon}`}
        >
          <Icon className="text-base" />
        </span>

        <FaChevronRight
          className={`text-xs opacity-60 transition-transform group-hover:translate-x-1 ${selected.arrow}`}
        />
      </div>

      <div className="mt-3">
        <h3 className={`text-sm font-black ${selected.title}`}>{title}</h3>

        <p className="mt-1 text-[11px] leading-5 text-slate-600">
          {description}
        </p>
      </div>
    </Link>
  );
}
