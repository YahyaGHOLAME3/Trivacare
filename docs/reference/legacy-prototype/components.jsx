/* Trivacare — Icon, Header, Hero, Intake, Services. Shared via window. */
const { useState, useEffect, useRef, useCallback } = React;

function Icon({ name, size = 24, className = "", strokeWidth = 2, style }) {
  const inner = (window.TRIVA_ICONS || {})[name] || "";
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

function Logo({ light = false }) {
  return (
    <span className="flex items-center gap-2.5 select-none">
      <span className="relative grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-teal-600 shadow-glow">
        <Icon name="heart-pulse" size={22} className="text-white" strokeWidth={2.2} />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-teal-300 ring-2 ring-white"></span>
      </span>
      <span className={"font-display font-extrabold text-xl tracking-tight " + (light ? "text-white" : "text-ink")}>
        Triva<span className="text-brand-600">care</span>
      </span>
    </span>
  );
}

/* ---------------- Header ---------------- */
function LangToggle({ lang, setLang, light }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const langs = ["fr", "en", "ar"];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox" aria-expanded={open}
        className={"flex items-center gap-1.5 h-10 px-3 rounded-xl font-semibold text-sm transition-colors " +
          (light ? "text-white/90 hover:bg-white/10" : "text-slate-700 hover:bg-slate-100")}
      >
        <Icon name="globe" size={18} className={light ? "text-teal-300" : "text-brand-600"} />
        <span className="uppercase tracking-wide">{lang}</span>
        <Icon name="chevron-down" size={15} className={"transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <ul role="listbox" className="absolute end-0 mt-2 w-44 p-1.5 bg-white rounded-2xl shadow-lift border border-slate-100 z-50 rise">
          {langs.map((l) => (
            <li key={l}>
              <button
                role="option" aria-selected={lang === l}
                onClick={() => { setLang(l); setOpen(false); }}
                className={"w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors " +
                  (lang === l ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50")}
              >
                <span>{window.TRIVA_I18N[l].label}</span>
                {lang === l && <Icon name="check" size={16} className="text-brand-600" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Header({ t, lang, setLang }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { k: "services", href: "#services" },
    { k: "workflow", href: "#workflow" },
    { k: "security", href: "#security" },
    { k: "contact", href: "#contact" },
  ];
  return (
    <header className={"fixed inset-x-0 top-0 z-40 transition-all duration-300 " +
      (scrolled ? "bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-soft" : "bg-transparent border-b border-transparent")}>
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="h-[72px] flex items-center justify-between gap-4">
          <a href="#top" className="shrink-0" aria-label="Trivacare"><Logo light={!scrolled} /></a>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Principale">
            {links.map((l) => (
              <a key={l.k} href={l.href}
                className={"px-3.5 py-2 rounded-lg text-[15px] font-semibold transition-colors " +
                  (scrolled ? "text-slate-600 hover:text-brand-700 hover:bg-brand-50" : "text-white/85 hover:text-white hover:bg-white/10")}>
                {t.nav[l.k]}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:block"><LangToggle lang={lang} setLang={setLang} light={!scrolled} /></div>
            <a href="#" className={"hidden md:flex items-center gap-1.5 h-10 px-3.5 rounded-xl font-semibold text-sm transition-colors " +
              (scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white/90 hover:bg-white/10")}>
              <Icon name="log-in" size={18} /> {t.nav.login}
            </a>
            <a href="#intake"
              className="hidden sm:flex items-center gap-2 h-11 ps-5 pe-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-glow hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] transition-all">
              {t.nav.cta} <Icon name="arrow-right" size={17} className="flip-x" />
            </a>
            <button onClick={() => setMenu(true)} className={"lg:hidden grid place-items-center w-11 h-11 rounded-xl transition-colors " +
              (scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10")} aria-label="Menu">
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setMenu(false)}></div>
          <div className="absolute top-0 end-0 h-full w-[82%] max-w-sm bg-white shadow-lift p-5 flex flex-col rise">
            <div className="flex items-center justify-between mb-6">
              <Logo />
              <button onClick={() => setMenu(false)} className="grid place-items-center w-11 h-11 rounded-xl text-slate-700 hover:bg-slate-100" aria-label="Fermer"><Icon name="x" size={24} /></button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {links.map((l) => (
                <a key={l.k} href={l.href} onClick={() => setMenu(false)}
                  className="px-4 py-3.5 rounded-xl text-lg font-semibold text-slate-800 hover:bg-brand-50 hover:text-brand-700">
                  {t.nav[l.k]}
                </a>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-100"><LangToggle lang={lang} setLang={setLang} /></div>
            <div className="mt-auto flex flex-col gap-2.5 pt-5">
              <a href="#" onClick={() => setMenu(false)} className="flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
                <Icon name="log-in" size={18} /> {t.nav.login}
              </a>
              <a href="#intake" onClick={() => setMenu(false)} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-brand-600 text-white font-bold shadow-glow">
                {t.nav.cta} <Icon name="arrow-right" size={18} className="flip-x" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------- Hero — "Réseau national" network map ---------------- */
const HERO_NODES = [
  { x: 48, y: 19 }, { x: 44, y: 38 }, { x: 39, y: 46 }, { x: 63, y: 35 },
  { x: 51, y: 63 }, { x: 40, y: 78 }, { x: 34, y: 65 },
];
const HERO_HUB = { x: 51, y: 50 };

function Hero({ t }) {
  const cities = t.hero.net.cities;
  const stats = t.hero.net.stats;
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-br from-ink via-brand-950 to-slate-950">
      <div className="absolute inset-0 grain opacity-30"></div>
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(120,160,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(120,160,255,.06) 1px,transparent 1px)", backgroundSize: "42px 42px" }}></div>
      <div className="absolute top-1/2 end-[18%] w-[460px] h-[460px] -translate-y-1/2 rounded-full bg-brand-600/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -start-20 w-[420px] h-[420px] rounded-full bg-teal-500/15 blur-3xl pointer-events-none"></div>

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 pt-[112px] pb-28 lg:pt-[136px] lg:pb-36">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          {/* Copy */}
          <div className="rise text-center lg:text-start">
            <span className="inline-flex items-center gap-2 h-8 ps-2.5 pe-3.5 rounded-full bg-white/10 border border-white/15 text-[12.5px] font-bold text-teal-300 backdrop-blur">
              <Icon name="waypoints" size={14} /> {t.hero.eyebrow}
            </span>
            <h1 className="mt-5 font-display font-extrabold text-[clamp(2.4rem,5.2vw,3.7rem)] leading-[1.04] text-white">
              {t.hero.title_a} <span className="text-teal-300">{t.hero.title_b}</span>
            </h1>
            <p className="mt-5 text-[17px] sm:text-lg leading-relaxed text-slate-300 max-w-lg mx-auto lg:mx-0">{t.hero.net.sub}</p>

            <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <a href="#intake" className="flex items-center gap-2 h-13 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-glow hover:-translate-y-0.5 active:scale-[.98] transition-all">
                {t.nav.cta} <Icon name="arrow-right" size={19} className="flip-x" />
              </a>
              <a href="#workflow" className="flex items-center gap-2 h-13 px-6 py-3.5 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 text-white font-bold backdrop-blur transition-colors">
                {t.nav.workflow}
              </a>
            </div>

            <p className="mt-6 flex items-center justify-center lg:justify-start gap-2 text-[13.5px] font-semibold text-teal-300">
              <Icon name="lock-keyhole" size={16} /> {t.hero.trust}
            </p>

            <dl className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4">
              {stats.map(([v, k]) => (
                <div key={k} className="leading-tight">
                  <dd className="font-display font-extrabold text-[1.7rem] text-white">{v}</dd>
                  <dt className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide">{k}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Network map */}
          <div className="relative h-[360px] sm:h-[440px] lg:h-[500px] rise" style={{ animationDelay: ".1s" }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <defs>
                <radialGradient id="heroHubGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#33b89c" stopOpacity=".5" />
                  <stop offset="100%" stopColor="#33b89c" stopOpacity="0" />
                </radialGradient>
              </defs>
              {HERO_NODES.map((c, i) => (
                <line key={i} x1={HERO_HUB.x} y1={HERO_HUB.y} x2={c.x} y2={c.y} stroke="rgba(140,178,255,.35)" strokeWidth=".4" strokeDasharray="1.4 1.4" />
              ))}
              <circle cx={HERO_HUB.x} cy={HERO_HUB.y} r="15" fill="url(#heroHubGlow)" />
            </svg>

            {/* hub */}
            <span className="absolute" style={{ left: HERO_HUB.x + "%", top: HERO_HUB.y + "%", transform: "translate(-50%,-50%)" }}>
              <span className="absolute inset-0 -m-3 rounded-2xl bg-teal-400/30" style={{ animation: "pulse-ring 2.4s ease-out infinite" }}></span>
              <span className="relative grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 text-white shadow-glow">
                <Icon name="heart-pulse" size={22} strokeWidth={2.2} />
              </span>
            </span>

            {/* city nodes */}
            {HERO_NODES.map((c, i) => (
              <span key={i} className="absolute" style={{ left: c.x + "%", top: c.y + "%", transform: "translate(-50%,-50%)" }}>
                <span className="absolute inset-0 -m-1 rounded-full bg-brand-400/40" style={{ animation: "pulse-ring 2.2s ease-out infinite", animationDelay: (i * 0.3) + "s" }}></span>
                <span className="relative grid place-items-center w-4 h-4 rounded-full bg-teal-300 ring-4 ring-teal-300/20"></span>
                <span className="absolute start-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-[10.5px] font-bold text-white/90 bg-white/10 backdrop-blur px-1.5 py-0.5 rounded-md border border-white/10">{cities[i]}</span>
              </span>
            ))}

            {/* SOS chip */}
            <div className="absolute bottom-0 end-0 rounded-2xl bg-rose-500/15 border border-rose-400/30 backdrop-blur px-3.5 py-2.5 flex items-center gap-2.5" style={{ animation: "floaty 6s ease-in-out infinite" }}>
              <span className="relative grid place-items-center w-9 h-9 rounded-full bg-rose-500 text-white font-display font-extrabold text-[11px]">
                SOS
                <span className="absolute inset-0 rounded-full bg-rose-500/50" style={{ animation: "pulse-ring 2s ease-out infinite" }}></span>
              </span>
              <span className="leading-tight">
                <span className="block text-[12.5px] font-bold text-white">{t.hero.net.sos_title}</span>
                <span className="block text-[10.5px] text-rose-200 font-mono">{t.hero.net.sos_sub}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Intake widget ---------------- */
function Field({ label, icon, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 mb-1.5 text-[13px] font-bold text-slate-700">
        <Icon name={icon} size={15} className="text-brand-600" /> {label}
      </span>
      {children}
    </label>
  );
}

function Intake({ t, lang }) {
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [done, setDone] = useState(false);
  const ready = type && city && date;
  const selCls = "w-full h-12 px-3.5 rounded-xl bg-white border border-slate-200 text-[15px] font-medium text-ink appearance-none cursor-pointer hover:border-brand-300 focus-visible:border-brand-500 transition-colors";
  const today = new Date().toISOString().split("T")[0];

  return (
    <section id="intake" className="relative -mt-12 lg:-mt-16 z-10 px-5 sm:px-8 pb-4 scroll-mt-24">
      <div className="mx-auto max-w-[1040px]">
        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-lift overflow-hidden">
          <div className="grid md:grid-cols-[1fr_1.55fr]">
            {/* left intro */}
            <div className="relative p-7 sm:p-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white overflow-hidden">
              <div className="absolute -bottom-16 -end-10 w-56 h-56 rounded-full bg-teal-400/20 blur-2xl"></div>
              <span className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-white/15 text-[12px] font-bold backdrop-blur">
                <Icon name="sparkles" size={13} /> {t.hero.eyebrow}
              </span>
              <h2 className="mt-4 font-display font-extrabold text-2xl sm:text-[28px] leading-tight">{t.intake.title}</h2>
              <p className="mt-2.5 text-[15px] text-brand-100 leading-relaxed">{t.intake.sub}</p>
              <p className="mt-6 flex items-center gap-2 text-[13px] font-semibold text-teal-200">
                <Icon name="shield-check" size={17} /> {t.intake.reassure}
              </p>
            </div>

            {/* right form / success */}
            <div className="p-7 sm:p-8">
              {!done ? (
                <form onSubmit={(e) => { e.preventDefault(); if (ready) setDone(true); }} className="flex flex-col gap-4">
                  <Field label={t.intake.type_label} icon="users-round">
                    <div className="relative">
                      <select value={type} onChange={(e) => setType(e.target.value)} className={selCls} required>
                        <option value="" disabled>{t.intake.type_ph}</option>
                        {t.intake.types.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <Icon name="chevron-down" size={18} className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={t.intake.city_label} icon="map-pin">
                      <div className="relative">
                        <select value={city} onChange={(e) => setCity(e.target.value)} className={selCls} required>
                          <option value="" disabled>{t.intake.city_ph}</option>
                          {t.intake.cities.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <Icon name="chevron-down" size={18} className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </Field>
                    <Field label={t.intake.date_label} icon="calendar">
                      <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)}
                        className={selCls + " font-mono text-sm"} required />
                    </Field>
                  </div>

                  <button type="submit" disabled={!ready}
                    className={"mt-1 flex items-center justify-center gap-2 h-13 py-3.5 rounded-xl font-bold text-white transition-all " +
                      (ready ? "bg-brand-600 hover:bg-brand-700 shadow-glow hover:-translate-y-0.5 active:scale-[.98]" : "bg-slate-300 cursor-not-allowed")}>
                    {t.intake.submit} <Icon name="arrow-right" size={18} className="flip-x" />
                  </button>
                </form>
              ) : (
                <div className="h-full flex flex-col justify-center text-center py-4 rise">
                  <span className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4" style={{ animation: "floaty 4s ease-in-out infinite" }}>
                    <Icon name="badge-check" size={36} strokeWidth={2} />
                  </span>
                  <h3 className="font-display font-extrabold text-2xl text-ink">{t.intake.success_title}</h3>
                  <p className="mt-2.5 text-[15px] text-slate-600 leading-relaxed max-w-sm mx-auto">
                    {t.intake.success_body(type, city)}
                  </p>
                  <button onClick={() => setDone(false)} className="mt-5 mx-auto text-[14px] font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4">
                    {t.intake.success_cta}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Services ---------------- */
function Eyebrow({ children, center }) {
  return (
    <span className={"inline-flex items-center gap-2 text-[12.5px] font-extrabold uppercase tracking-[.14em] text-brand-600 " + (center ? "justify-center" : "")}>
      <span className="w-6 h-px bg-brand-300"></span>{children}
    </span>
  );
}

function Services({ t }) {
  const [active, setActive] = useState(0);
  const items = t.services.items;
  const cur = items[active];
  return (
    <section id="services" className="py-20 sm:py-28 scroll-mt-20">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <Eyebrow>{t.services.eyebrow}</Eyebrow>
          <h2 className="mt-4 font-display font-extrabold text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[1.08] text-ink">{t.services.title}</h2>
          <p className="mt-4 text-lg text-slate-600">{t.services.sub}</p>
        </div>

        <div className="mt-10 grid lg:grid-cols-[1fr_1fr] gap-5 lg:gap-7 items-start">
          {/* card grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((it, i) => {
              const on = i === active;
              return (
                <button key={i} onClick={() => setActive(i)} aria-pressed={on}
                  className={"group text-start p-5 rounded-3xl border transition-all duration-200 " +
                    (on ? "bg-white border-brand-300 shadow-lift -translate-y-0.5 ring-1 ring-brand-200"
                        : "bg-white/70 border-slate-200 hover:border-brand-200 hover:shadow-soft hover:-translate-y-0.5")}>
                  <span className={"grid place-items-center w-12 h-12 rounded-2xl mb-4 transition-colors " +
                    (on ? "bg-brand-600 text-white shadow-glow" : "bg-brand-50 text-brand-600 group-hover:bg-brand-100")}>
                    <Icon name={it.icon} size={24} strokeWidth={1.9} />
                  </span>
                  <h3 className="font-display font-bold text-[17px] text-ink leading-snug">{it.title}</h3>
                  <p className="mt-1.5 text-[14px] text-slate-500 leading-relaxed">{it.short}</p>
                </button>
              );
            })}
          </div>

          {/* detail panel */}
          <div key={active} className="rise rounded-[2rem] bg-gradient-to-br from-ink to-brand-950 text-white p-7 sm:p-9 shadow-lift relative overflow-hidden min-h-[340px]">
            <div className="absolute -top-16 -end-10 w-56 h-56 rounded-full bg-brand-500/30 blur-3xl"></div>
            <div className="absolute -bottom-20 -start-12 w-60 h-60 rounded-full bg-teal-500/20 blur-3xl"></div>
            <div className="relative">
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur text-teal-300 mb-5 ring-1 ring-white/15">
                <Icon name={cur.icon} size={28} strokeWidth={1.8} />
              </span>
              <h3 className="font-display font-extrabold text-2xl sm:text-[26px] leading-tight">{cur.title}</h3>
              <p className="mt-3 text-[15.5px] text-slate-300 leading-relaxed">{cur.long}</p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {cur.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[15px] font-semibold">
                    <span className="grid place-items-center w-6 h-6 rounded-full bg-teal-400/20 text-teal-300 shrink-0"><Icon name="check" size={14} strokeWidth={2.6} /></span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Icon, Logo, Header, Hero, Intake, Services, Eyebrow, Field });
