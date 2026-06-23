import { AppIcon } from "../../assets/icons/app-icon";

export function Logo({ badge }) {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-600 text-white shadow-glow">
        <AppIcon name="heart-pulse" size={20} strokeWidth={2.2} />
      </span>
      <span>
        <span className="block font-display text-lg font-extrabold text-ink">
          Triva<span className="text-teal-600">care</span>
        </span>
        {badge ? (
          <span className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-teal-700">
            {badge}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export function Card({ className = "", children }) {
  return (
    <div className={`motion-card rounded-4xl border border-slate-200 bg-white shadow-soft ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  icon,
  iconEnd,
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-glow",
    teal: "bg-teal-600 text-white hover:bg-teal-700 shadow-soft",
    ghost: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };

  return (
    <button
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all active:scale-[.98]",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {icon ? <AppIcon name={icon} size={16} /> : null}
      {children}
      {iconEnd ? <AppIcon name={iconEnd} size={16} /> : null}
    </button>
  );
}

export function Badge({ children, tone = "slate", icon, className = "" }) {
  const tones = {
    blue: "border-brand-200 bg-brand-50 text-brand-700",
    teal: "border-teal-200 bg-teal-50 text-teal-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    slate: "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold",
        tones[tone],
        className,
      ].join(" ")}
    >
      {icon ? <AppIcon name={icon} size={13} /> : null}
      {children}
    </span>
  );
}

export function Avatar({ initials, tone = "brand", size = 44 }) {
  const bg = tone === "teal" ? "from-teal-500 to-teal-700" : "from-brand-500 to-brand-700";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${bg} font-display font-bold text-white`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-bold text-slate-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

export function Toggle({ on, label, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-teal-600" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="motion-fade-up mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-[700px]">
        <h1 className="text-[clamp(1.8rem,3vw,2.3rem)] font-extrabold text-ink">{title}</h1>
        {subtitle ? <p className="mt-1.5 max-w-[62ch] text-sm leading-6 text-slate-500 sm:text-[15px]">{subtitle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2 sm:justify-end">{children}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, tone = "blue" }) {
  const tones = {
    blue: "bg-brand-50 text-brand-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <Card className="h-full p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tones[tone]}`}>
          <AppIcon name={icon} size={22} />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="truncate text-xs font-semibold text-slate-500">{label}</p>
          <p className="truncate font-display text-xl font-extrabold text-ink">{value}</p>
          {sub ? <p className="truncate text-xs text-slate-400">{sub}</p> : null}
        </div>
      </div>
    </Card>
  );
}

export function InfoList({ items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
        </div>
      ))}
    </div>
  );
}

export const inputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] font-medium text-ink transition-colors placeholder:text-slate-400 hover:border-brand-300 focus-visible:border-brand-500 focus-visible:bg-white";
