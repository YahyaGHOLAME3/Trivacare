/* Trivacare — Workflow simulator, SOS banner, Footer. */

/* ---------------- Workflow simulator ---------------- */
function Workflow({ t }) {
  const steps = t.workflow.steps;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(() => {
    try { return !window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return true; }
  });
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 2600);
    return () => clearInterval(timer.current);
  }, [playing, steps.length]);

  const cur = steps[step];
  const pct = steps.length > 1 ? (step / (steps.length - 1)) * 100 : 0;

  const toggle = () => setPlaying((p) => !p);
  const jump = (i) => { setPlaying(false); setStep(i); };

  return (
    <section id="workflow" className="py-20 sm:py-28 bg-white border-y border-slate-200/70 scroll-mt-16">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <Eyebrow>{t.workflow.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display font-extrabold text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[1.08] text-ink">{t.workflow.title}</h2>
            <p className="mt-4 text-lg text-slate-600">{t.workflow.sub}</p>
          </div>
          <button onClick={toggle}
            className="shrink-0 flex items-center gap-2 h-12 px-5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold border border-brand-200 transition-colors">
            <span className="grid place-items-center w-6 h-6 rounded-full bg-brand-600 text-white">
              <Icon name={playing ? "x" : "arrow-right"} size={14} strokeWidth={2.6} className={playing ? "" : "flip-x"} />
            </span>
            {playing ? t.workflow.pause : t.workflow.play}
          </button>
        </div>

        {/* stepper */}
        <div className="mt-12">
          {/* desktop horizontal track */}
          <div className="hidden md:block relative">
            <div className="absolute top-7 inset-x-0 h-1 rounded-full bg-slate-200" style={{ insetInline: "7%" }}></div>
            <div className="absolute top-7 start-[7%] h-1 rounded-full bg-gradient-to-r from-brand-600 to-teal-500 transition-all duration-500" style={{ width: `calc(${pct}% * 0.86)` }}></div>
            <ol className="relative grid grid-cols-4 gap-4">
              {steps.map((s, i) => {
                const reached = i <= step;
                const isCur = i === step;
                return (
                  <li key={i} className="flex flex-col items-center text-center">
                    <button onClick={() => jump(i)}
                      className={"relative grid place-items-center w-14 h-14 rounded-2xl border-2 bg-white transition-all duration-300 " +
                        (reached ? "border-brand-600 text-brand-600 shadow-soft" : "border-slate-200 text-slate-400") +
                        (isCur ? " scale-110 bg-brand-600 !text-white shadow-glow" : "")}>
                      <Icon name={s.icon} size={24} strokeWidth={1.9} />
                      {isCur && <span className="absolute inset-0 rounded-2xl border-2 border-brand-400" style={{ animation: "pulse-ring 1.8s ease-out infinite" }}></span>}
                    </button>
                    <span className={"mt-3 text-[11px] font-bold uppercase tracking-wide " + (reached ? "text-brand-600" : "text-slate-400")}>{s.tag}</span>
                    <span className={"mt-1 font-display font-bold text-[15px] leading-tight " + (reached ? "text-ink" : "text-slate-400")}>{s.title}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* mobile vertical track — same node layout, connecting lines */}
          <ol className="md:hidden relative flex flex-col">
            {steps.map((s, i) => {
              const reached = i <= step;
              const isCur = i === step;
              return (
                <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                  <div className="flex flex-col items-center self-stretch">
                    <button onClick={() => jump(i)}
                      className={"relative grid place-items-center w-14 h-14 rounded-2xl border-2 bg-white transition-all duration-300 shrink-0 " +
                        (reached ? "border-brand-600 text-brand-600 shadow-soft" : "border-slate-200 text-slate-400") +
                        (isCur ? " bg-brand-600 !text-white shadow-glow" : "")}>
                      <Icon name={s.icon} size={24} strokeWidth={1.9} />
                      {isCur && <span className="absolute inset-0 rounded-2xl border-2 border-brand-400" style={{ animation: "pulse-ring 1.8s ease-out infinite" }}></span>}
                    </button>
                    {i < steps.length - 1 && (
                      <span className="w-1 h-9 my-1.5 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        <span className={"block w-full rounded-full bg-gradient-to-b from-brand-600 to-teal-500 transition-all duration-500 " + (i < step ? "h-full" : "h-0")}></span>
                      </span>
                    )}
                  </div>
                  <button onClick={() => jump(i)} className="flex-1 text-start pt-2.5">
                    <span className={"block text-[11px] font-bold uppercase tracking-wide " + (reached ? "text-brand-600" : "text-slate-400")}>{s.tag}</span>
                    <span className={"block font-display font-bold text-[16px] leading-tight " + (reached ? "text-ink" : "text-slate-400")}>{s.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* detail */}
        <div key={step} className="rise mt-10 grid lg:grid-cols-[1.3fr_1fr] gap-6 items-stretch">
          <div className="rounded-[2rem] bg-slate-50 border border-slate-200 p-7 sm:p-9">
            <div className="flex items-center gap-3 mb-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-glow"><Icon name={cur.icon} size={24} /></span>
              <span className="text-[12px] font-extrabold uppercase tracking-[.12em] text-brand-600">{cur.tag}</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl sm:text-[28px] text-ink leading-tight">{cur.title}</h3>
            <p className="mt-3 text-[16px] text-slate-600 leading-relaxed max-w-xl">{cur.desc}</p>
          </div>

          {/* system "console" meta card */}
          <div className="rounded-[2rem] bg-ink text-white p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-12 -end-10 w-44 h-44 rounded-full bg-teal-500/20 blur-3xl"></div>
            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-2 text-[12px] font-mono text-teal-300">
                <span className="w-2 h-2 rounded-full bg-teal-400" style={{ animation: "floaty 2s ease-in-out infinite" }}></span>
                trivacare · live
              </span>
              <span className="font-mono text-[12px] text-slate-400">#TRV-2418</span>
            </div>
            <div className="relative mt-5">
              <div className="flex items-end gap-1.5 mb-3">
                {steps.map((_, i) => (
                  <span key={i} className={"h-1.5 flex-1 rounded-full transition-colors duration-500 " + (i <= step ? "bg-teal-400" : "bg-white/15")}></span>
                ))}
              </div>
              <p className="font-mono text-[14px] text-white flex items-center gap-2">
                <Icon name="check" size={16} className="text-teal-400" strokeWidth={3} /> {cur.meta}
              </p>
              <p className="mt-2 font-mono text-[12px] text-slate-400">
                {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")} · {cur.tag}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- SOS emergency banner ---------------- */
function SOS({ t, rtl }) {
  const [active, setActive] = useState(false);
  const [locating, setLocating] = useState(false);
  const trigger = () => {
    if (active) { setActive(false); return; }
    setLocating(true);
    setTimeout(() => { setLocating(false); setActive(true); }, 1300);
  };
  return (
    <section id="security" className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-br from-ink via-brand-950 to-slate-950 scroll-mt-16">
      <div className="absolute inset-0 grain opacity-40"></div>
      <div className="absolute -top-24 start-1/4 w-[420px] h-[420px] rounded-full bg-brand-600/20 blur-3xl"></div>
      <div className="absolute bottom-0 end-10 w-[360px] h-[360px] rounded-full bg-rose-600/15 blur-3xl"></div>

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* copy */}
          <div>
            <span className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-[12.5px] font-extrabold uppercase tracking-[.12em] text-rose-300">
              <Icon name="triangle-alert" size={15} /> {t.sos.eyebrow}
            </span>
            <h2 className="mt-5 font-display font-extrabold text-[clamp(2rem,3.8vw,3rem)] leading-[1.06] text-white">{t.sos.title}</h2>
            <p className="mt-4 text-lg text-slate-300 leading-relaxed max-w-xl">{t.sos.sub}</p>
            <ul className="mt-7 flex flex-col gap-3">
              {t.sos.points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[15.5px] font-semibold text-white">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-teal-400/20 text-teal-300 shrink-0"><Icon name="check" size={15} strokeWidth={2.6} /></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* interactive SOS device */}
          <div className="relative">
            <div className="rounded-[2.25rem] bg-white/[.04] border border-white/10 backdrop-blur-xl p-7 sm:p-9 shadow-lift">
              {/* map */}
              <div className="relative h-52 rounded-3xl overflow-hidden border border-white/10 bg-slate-900">
                <div className="absolute inset-0 opacity-60"
                  style={{ backgroundImage: "linear-gradient(rgba(80,120,200,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(80,120,200,.18) 1px, transparent 1px)", backgroundSize: "26px 26px" }}></div>
                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 55%, rgba(0,82,204,.35), transparent 60%)" }}></div>
                {/* roads */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M-10 60 L160 90 L260 50 L420 80" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="10" />
                  <path d="M80 -10 L120 110 L90 210" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
                  <path d="M40 150 L420 140" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
                </svg>
                {/* user pin */}
                <div className="absolute" style={{ left: "50%", top: "55%", transform: "translate(-50%,-50%)" }}>
                  <span className={"absolute inset-0 -m-2 rounded-full " + ((active || locating) ? "bg-rose-500/40" : "bg-brand-500/30")} style={{ animation: "pulse-ring 1.8s ease-out infinite" }}></span>
                  <span className={"relative grid place-items-center w-10 h-10 rounded-full text-white shadow-lg " + ((active || locating) ? "bg-rose-500" : "bg-brand-600")}>
                    <Icon name="navigation" size={18} className="flip-x" />
                  </span>
                </div>
                {/* clinic pin */}
                <div className={"absolute transition-opacity duration-500 " + (active ? "opacity-100" : "opacity-40")} style={{ left: "72%", top: "30%", transform: "translate(-50%,-50%)" }}>
                  <span className="grid place-items-center w-8 h-8 rounded-full bg-teal-400 text-teal-950 shadow-lg"><Icon name="plus" size={16} strokeWidth={3} /></span>
                </div>
                <span className="absolute top-3 start-3 font-mono text-[10.5px] text-white/60 flex items-center gap-1.5">
                  <span className={"w-1.5 h-1.5 rounded-full " + (active ? "bg-rose-400" : "bg-teal-400")}></span>
                  {locating ? t.sos.locating : (active ? "31.6295° N, 7.9811° W" : "Marrakech · GPS")}
                </span>
              </div>

              {/* status + button */}
              <div className="mt-6 flex items-center gap-5">
                <button onClick={trigger} aria-pressed={active}
                  className={"relative grid place-items-center w-24 h-24 rounded-full font-display font-extrabold text-xl text-white shrink-0 transition-all active:scale-95 " +
                    (active ? "bg-rose-600 shadow-sos" : "bg-rose-500 hover:bg-rose-600 shadow-sos")}>
                  {(active || locating) && <span className="absolute inset-0 rounded-full bg-rose-500/50" style={{ animation: "pulse-ring 1.6s ease-out infinite" }}></span>}
                  {(active || locating) && <span className="absolute inset-0 rounded-full bg-rose-500/40" style={{ animation: "pulse-ring 1.6s ease-out infinite", animationDelay: ".5s" }}></span>}
                  <span className="relative leading-none">{t.sos.button}</span>
                  <span className="relative text-[10px] font-semibold text-rose-100 mt-1">{t.sos.button_sub}</span>
                </button>
                <div className="min-w-0">
                  <p className={"flex items-center gap-2 text-[13.5px] font-bold " + (active ? "text-rose-300" : "text-teal-300")}>
                    <span className={"w-2 h-2 rounded-full " + (active ? "bg-rose-400" : "bg-teal-400")} style={{ animation: "floaty 2s ease-in-out infinite" }}></span>
                    {active ? t.sos.status_active : t.sos.status_idle}
                  </p>
                  {/* nearest clinic card */}
                  <div className={"mt-3 rounded-2xl bg-white/[.06] border border-white/10 p-3.5 transition-all duration-500 " + (active ? "opacity-100 translate-y-0" : "opacity-50")}>
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400"><Icon name="map-pin" size={13} /> {t.sos.card_title}</p>
                    <p className="mt-1 font-display font-bold text-[15px] text-white leading-tight">{t.sos.card_name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-teal-300">
                      <span className="flex items-center gap-1"><Icon name="navigation" size={12} /> {t.sos.card_dist}</span>
                      <span className="flex items-center gap-1 text-slate-300"><Icon name="phone" size={12} /> {t.sos.card_eta}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer({ t }) {
  const cols = [
    { title: t.footer.col_product, items: t.footer.product },
    { title: t.footer.col_company, items: t.footer.company },
    { title: t.footer.col_legal, items: t.footer.legal },
  ];
  return (
    <footer id="contact" className="bg-white border-t border-slate-200 scroll-mt-16">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div>
            <Logo />
            <p className="mt-4 text-[15px] text-slate-600 leading-relaxed max-w-xs">{t.footer.tagline}</p>
            <p className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-teal-700">
              <Icon name="shield-check" size={16} /> {t.footer.compliance}
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-display font-bold text-[13px] uppercase tracking-wide text-slate-400">{c.title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {c.items.map((it) => (
                  <li key={it}><a href="#" className="text-[15px] font-semibold text-slate-600 hover:text-brand-700 transition-colors">{it}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-7 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13.5px] text-slate-500">
          <p>{t.footer.rights}</p>
          <p className="flex items-center gap-1.5 font-semibold text-slate-600"><Icon name="heart-pulse" size={15} className="text-brand-600" /> {t.footer.made}</p>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Workflow, SOS, Footer });
