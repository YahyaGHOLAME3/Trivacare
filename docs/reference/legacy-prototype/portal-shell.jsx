/* Trivacare patient portal — shell: primitives, data, sidebar, topbar. */
const { useState: uS, useEffect: uE, useRef: uR } = React;

/* merged icon lookup: portal icons first, then base landing icons */
function PIcon({ name, size = 22, className = "", strokeWidth = 2, style }) {
  const inner = (window.PORTAL_ICONS && window.PORTAL_ICONS[name]) || (window.TRIVA_ICONS && window.TRIVA_ICONS[name]) || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }} />
  );
}

/* ---- patient + domain data ---- */
const PATIENT = {
  first: "Amine", last: "El Fassi", initials: "AE",
  email: "amine.elfassi@example.test", phone: "+212 6 61 24 88 03",
  profile: "Maladie chronique · Diabète type 2", dob: "14/03/1968", nationality: "Franco-marocaine",
  insurer: "Allianz Travel — Police N° TR-99820145", blood: "O+",
  city: "Marrakech", coordinator: "Dr. Salma Amrani",
};

const NAV = [
  { id: "dashboard", label: "Tableau de bord", icon: "layout-dashboard" },
  { id: "medical", label: "Dossier médical", icon: "folder-heart" },
  { id: "travel", label: "Plans de voyage", icon: "route" },
  { id: "rdv", label: "Mes rendez-vous", icon: "calendar-check", badge: 2 },
  { id: "billing", label: "Factures & paiements", icon: "receipt-text" },
  { id: "security", label: "Sécurité", icon: "shield-check" },
  { id: "account", label: "Mon compte", icon: "user-round" },
  { id: "help", label: "Aide", icon: "life-buoy" },
];
const NAV_LABELS = Object.fromEntries(NAV.map((n) => [n.id, n.label]));

/* ---- UI primitives ---- */
function Card({ className = "", children, as: Tag = "div", ...rest }) {
  return <Tag className={"rounded-3xl bg-white border border-slate-200 shadow-soft " + className} {...rest}>{children}</Tag>;
}

const TONE = {
  blue: "bg-brand-50 text-brand-700 border-brand-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
};
function Badge({ tone = "slate", icon, children, className = "" }) {
  return (
    <span className={"inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[12.5px] font-bold " + TONE[tone] + " " + className}>
      {icon && <PIcon name={icon} size={13} strokeWidth={2.4} />}{children}
    </span>
  );
}

function Btn({ variant = "primary", icon, iconEnd, children, className = "", ...rest }) {
  const base = "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const v = {
    primary: "h-11 px-5 bg-brand-600 hover:bg-brand-700 text-white shadow-glow hover:-translate-y-0.5 text-[14px]",
    teal: "h-11 px-5 bg-teal-600 hover:bg-teal-700 text-white shadow-soft hover:-translate-y-0.5 text-[14px]",
    ghost: "h-11 px-4 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-slate-700 text-[14px]",
    subtle: "h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13.5px]",
    danger: "h-11 px-5 bg-rose-600 hover:bg-rose-700 text-white shadow-soft text-[14px]",
  }[variant];
  return (
    <button className={base + " " + v + " " + className} {...rest}>
      {icon && <PIcon name={icon} size={17} />}{children}{iconEnd && <PIcon name={iconEnd} size={17} />}
    </button>
  );
}

function Avatar({ initials = "AE", size = 40, tone = "brand" }) {
  const bg = tone === "teal" ? "from-teal-500 to-teal-700" : "from-brand-500 to-brand-700";
  return (
    <span className={"grid place-items-center rounded-full bg-gradient-to-br text-white font-display font-bold shrink-0 " + bg}
      style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials}</span>
  );
}

function PageHead({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
      <div>
        <h1 className="font-display font-extrabold text-[clamp(1.6rem,3vw,2.1rem)] text-ink leading-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2.5 shrink-0">{children}</div>}
    </div>
  );
}

function Field({ label, hint, children, className = "" }) {
  return (
    <label className={"block " + className}>
      <span className="block mb-1.5 text-[13px] font-bold text-slate-700">{label}</span>
      {children}
      {hint && <span className="block mt-1 text-[12px] text-slate-400">{hint}</span>}
    </label>
  );
}
const inputCls = "w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[14.5px] text-ink font-medium placeholder:text-slate-400 hover:border-brand-300 focus-visible:border-brand-500 focus-visible:bg-white transition-colors";

function Toggle({ on, onClick, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onClick}
      className={"relative w-12 h-7 rounded-full transition-colors shrink-0 " + (on ? "bg-teal-600" : "bg-slate-300")}>
      <span className={"absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all " + (on ? "start-6" : "start-1")}></span>
    </button>
  );
}

/* ---- Sidebar ---- */
function Sidebar({ view, setView, onSOS, mobileOpen, setMobileOpen }) {
  const NavList = (
    <nav className="flex flex-col gap-1" aria-label="Navigation patient">
      {NAV.map((n) => {
        const on = view === n.id;
        return (
          <button key={n.id} onClick={() => { setView(n.id); setMobileOpen(false); }} aria-current={on ? "page" : undefined}
            className={"group relative flex items-center gap-3 h-11 ps-3.5 pe-3 rounded-xl text-[14.5px] font-semibold transition-colors " +
              (on ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-ink")}>
            <span className={"absolute start-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-brand-600 transition-opacity " + (on ? "opacity-100" : "opacity-0")}></span>
            <PIcon name={n.icon} size={20} strokeWidth={on ? 2.3 : 2} className={on ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"} />
            <span className="flex-1 text-start">{n.label}</span>
            {n.badge && <span className="grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-brand-600 text-white text-[11px] font-bold">{n.badge}</span>}
          </button>
        );
      })}
    </nav>
  );

  const inner = (
    <div className="flex flex-col h-full">
      <div className="h-[72px] flex items-center px-5 border-b border-slate-100">
        <span className="flex items-center gap-2.5">
          <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-teal-600 shadow-glow">
            <PIcon name="heart-pulse" size={19} className="text-white" strokeWidth={2.2} />
          </span>
          <span className="font-display font-extrabold text-lg text-ink">Triva<span className="text-brand-600">care</span></span>
          <span className="ms-1 text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-md">Patient</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4">{NavList}</div>

      <div className="px-3 pb-3">
        <button onClick={onSOS} className="w-full flex items-center gap-3 h-12 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[14px] transition-colors mb-3">
          <span className="relative grid place-items-center w-8 h-8 rounded-lg bg-rose-600 text-white font-display font-extrabold text-[11px]">SOS
            <span className="absolute inset-0 rounded-lg bg-rose-500/50" style={{ animation: "pulse-ring 2s ease-out infinite" }}></span>
          </span>
          Urgence géolocalisée
        </button>
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
          <Avatar initials={PATIENT.initials} size={38} />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold text-ink truncate">{PATIENT.first} {PATIENT.last}</p>
            <p className="text-[11.5px] text-slate-400 truncate">Patient · {PATIENT.city}</p>
          </div>
          <button onClick={() => setView("account")} className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:bg-white hover:text-slate-700" aria-label="Compte"><PIcon name="settings" size={17} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-[264px] shrink-0 bg-white border-e border-slate-200 sticky top-0 h-screen">{inner}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
          <div className="absolute top-0 start-0 h-full w-[280px] bg-white shadow-lift rise">{inner}</div>
        </div>
      )}
    </>
  );
}

/* ---- Topbar ---- */
function Topbar({ view, setMobileOpen, onSOS }) {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200">
      <div className="h-[72px] flex items-center gap-3 px-5 sm:px-7">
        <button onClick={() => setMobileOpen(true)} className="lg:hidden grid place-items-center w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100" aria-label="Menu"><PIcon name="menu" size={22} /></button>
        <div className="hidden md:flex items-center gap-2.5 h-10 ps-3.5 pe-4 rounded-xl bg-slate-100 text-slate-400 w-[280px]">
          <PIcon name="search" size={18} />
          <span className="text-[13.5px]">Rechercher un document, un RDV…</span>
        </div>
        <span className="lg:hidden font-display font-bold text-[17px] text-ink">{NAV_LABELS[view]}</span>
        <div className="ms-auto flex items-center gap-1.5 sm:gap-2.5">
          <button onClick={onSOS} className="sm:hidden grid place-items-center w-10 h-10 rounded-xl bg-rose-600 text-white font-display font-extrabold text-[11px]" aria-label="SOS">SOS</button>
          <button className="relative grid place-items-center w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Notifications">
            <PIcon name="bell" size={20} />
            <span className="absolute top-2 end-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>
          <div className="hidden sm:flex items-center gap-2.5 ps-2 pe-1 h-11 rounded-xl hover:bg-slate-100 cursor-pointer">
            <Avatar initials={PATIENT.initials} size={34} />
            <span className="leading-tight pe-1">
              <span className="block text-[13px] font-bold text-ink whitespace-nowrap">{PATIENT.first} {PATIENT.last}</span>
              <span className="block text-[11px] text-teal-600 font-semibold whitespace-nowrap">Dossier actif</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---- SOS modal ---- */
function SOSModal({ open, onClose }) {
  const [sent, setSent] = uS(false);
  uE(() => { if (!open) setSent(false); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-5" role="dialog" aria-modal="true" aria-label="Urgence">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md rounded-[1.75rem] bg-white shadow-lift p-7 rise">
        {!sent ? (
          <>
            <div className="flex items-center gap-3.5">
              <span className="relative grid place-items-center w-14 h-14 rounded-2xl bg-rose-100 text-rose-600">
                <PIcon name="triangle-alert" size={28} />
                <span className="absolute inset-0 rounded-2xl bg-rose-400/40" style={{ animation: "pulse-ring 1.8s ease-out infinite" }}></span>
              </span>
              <div>
                <h2 className="font-display font-extrabold text-xl text-ink">Déclencher le SOS</h2>
                <p className="text-[13.5px] text-slate-500">Votre position sera transmise à votre coordinateur.</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-600"><PIcon name="map-pin" size={15} className="text-rose-500" /> Position détectée</p>
              <p className="mt-1 font-mono text-[12.5px] text-slate-500">Marrakech · 31.6295° N, 7.9811° W</p>
            </div>
            <div className="mt-5 flex gap-3">
              <Btn variant="ghost" className="flex-1" onClick={onClose}>Annuler</Btn>
              <Btn variant="danger" className="flex-1" icon="navigation" onClick={() => setSent(true)}>Confirmer l'urgence</Btn>
            </div>
          </>
        ) : (
          <div className="text-center py-3">
            <span className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4"><PIcon name="check-check" size={34} strokeWidth={2.4} /></span>
            <h2 className="font-display font-extrabold text-xl text-ink">Secours alertés</h2>
            <p className="mt-2 text-[14px] text-slate-500 max-w-xs mx-auto">{PATIENT.coordinator} a reçu votre alerte et vous rappelle immédiatement. Restez où vous êtes si possible.</p>
            <Btn variant="ghost" className="mt-5 mx-auto" onClick={onClose}>Fermer</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { PIcon, PATIENT, NAV, NAV_LABELS, Card, Badge, Btn, Avatar, PageHead, Field, inputCls, Toggle, Sidebar, Topbar, SOSModal });
