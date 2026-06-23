/* Trivacare — three hero concept explorations. Self-contained (defines own Icon). */
const { useState: useS, useEffect: useE, useRef: useR } = React;

function HIcon({ name, size = 24, className = "", strokeWidth = 2, style }) {
  const inner = (window.TRIVA_ICONS || {})[name] || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }} />
  );
}

function HLogo({ light }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-teal-600 shadow-glow">
        <HIcon name="heart-pulse" size={19} className="text-white" strokeWidth={2.2} />
      </span>
      <span className={"font-display font-extrabold text-lg " + (light ? "text-white" : "text-ink")}>Triva<span className={light ? "text-teal-300" : "text-brand-600"}>care</span></span>
    </span>
  );
}

const EYEBROW = "Coordination médicale pour voyageurs";
const TITLE_A = "Votre partenaire santé";
const TITLE_B = "lors de vos voyages au Maroc";
const SUB = "Maladie chronique, handicap ou besoin médical spécifique : nous coordonnons vos soins avec des cliniques de confiance.";

/* ============================================================
   CONCEPT A — "Live Coordination Console"
   Right side = a realistic, layered product surface instead of a stock photo.
   ============================================================ */
function HeroConsole() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-white grain">
      <div className="absolute -top-40 -start-20 w-[520px] h-[520px] rounded-full bg-brand-200/40 blur-3xl"></div>
      <div className="absolute -bottom-40 end-0 w-[460px] h-[460px] rounded-full bg-teal-200/40 blur-3xl"></div>

      <div className="relative h-full px-14 py-10 flex flex-col">
        <HLogo />
        <div className="flex-1 grid grid-cols-[1fr_1.02fr] gap-12 items-center">
          {/* copy */}
          <div>
            <span className="inline-flex items-center gap-2 h-8 ps-2 pe-3.5 rounded-full bg-white border border-slate-200 shadow-soft text-[12.5px] font-bold text-brand-700">
              <span className="inline-grid place-items-center w-5 h-5 rounded-full bg-brand-600 text-white"><HIcon name="sparkles" size={12} /></span>{EYEBROW}
            </span>
            <h1 className="mt-5 font-display font-extrabold text-[3.1rem] leading-[1.03] text-ink">{TITLE_A}<br /><span className="text-brand-600">{TITLE_B}</span></h1>
            <p className="mt-5 text-[17px] leading-relaxed text-slate-600 max-w-md">{SUB}</p>
            <div className="mt-7 flex items-center gap-3">
              <span className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-brand-600 text-white font-bold shadow-glow">Commencer mon parcours <HIcon name="arrow-right" size={18} /></span>
              <span className="flex items-center gap-2 h-12 px-5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold"><HIcon name="play" size={15} className="text-brand-600" /> Démo</span>
            </div>
            <p className="mt-6 flex items-center gap-2 text-[13px] font-semibold text-teal-700"><HIcon name="lock-keyhole" size={15} /> Données chiffrées · Conforme RGPD · Médecins francophones</p>
          </div>

          {/* product console */}
          <div className="relative">
            {/* main card: live coordination */}
            <div className="relative rounded-[1.6rem] bg-ink text-white shadow-lift border border-white/10 overflow-hidden">
              <div className="absolute -top-16 -end-10 w-48 h-48 rounded-full bg-brand-500/30 blur-3xl"></div>
              {/* header */}
              <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/10">
                <span className="flex items-center gap-2.5">
                  <span className="relative grid place-items-center w-9 h-9 rounded-full bg-teal-500/20 text-teal-300"><HIcon name="stethoscope" size={18} /><span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-teal-400 ring-2 ring-ink"></span></span>
                  <span className="leading-tight"><span className="block text-[14px] font-bold">Dr. Salma Amrani</span><span className="block text-[11px] text-teal-300 font-mono">Coordinatrice · en ligne</span></span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">#TRV-2418</span>
              </div>
              {/* chat thread */}
              <div className="relative px-5 py-4 flex flex-col gap-3">
                <div className="self-start max-w-[78%] rounded-2xl rounded-bs-sm bg-white/[.07] px-3.5 py-2.5 text-[13px] leading-snug">Bonjour 👋 J'ai bien reçu votre dossier. Je vous oriente vers une clinique cardiologique à Marrakech.</div>
                <div className="self-end max-w-[78%] rounded-2xl rounded-be-sm bg-brand-600 px-3.5 py-2.5 text-[13px] leading-snug">Parfait, merci. C'est loin de mon riad ?</div>
                <div className="self-start max-w-[85%] rounded-2xl rounded-bs-sm bg-white/[.07] px-3.5 py-2.5 text-[13px] leading-snug flex items-center gap-2"><HIcon name="navigation" size={14} className="text-teal-300 shrink-0" /> Clinique Atlas — 1,2 km · créneau confirmé 14:30.</div>
              </div>
              {/* input */}
              <div className="relative mx-5 mb-4 flex items-center gap-2 rounded-xl bg-white/[.06] border border-white/10 px-3 h-11">
                <HIcon name="paperclip" size={16} className="text-slate-400" />
                <span className="flex-1 text-[13px] text-slate-400">Message sécurisé…</span>
                <HIcon name="mic" size={16} className="text-teal-300" />
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-brand-600 text-white"><HIcon name="send" size={14} /></span>
              </div>
            </div>

            {/* floating: secure transfer */}
            <div className="absolute -start-9 top-16 w-[190px] rounded-2xl bg-white shadow-lift border border-slate-100 p-3" style={{ animation: "floaty 6s ease-in-out infinite" }}>
              <span className="flex items-center gap-2 text-[11px] font-bold text-teal-700"><HIcon name="file-lock-2" size={14} /> Dossier chiffré</span>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden"><span className="block h-full w-[88%] rounded-full bg-gradient-to-r from-brand-600 to-teal-500"></span></div>
              <span className="mt-1.5 block font-mono text-[10px] text-slate-400">transfert · 88%</span>
            </div>

            {/* floating: status pill */}
            <div className="absolute -end-6 -bottom-5 rounded-2xl bg-teal-600 text-white shadow-glow px-4 py-3 flex items-center gap-2.5" style={{ animation: "floaty 6s ease-in-out infinite", animationDelay: "1.1s" }}>
              <HIcon name="circle-check-big" size={22} strokeWidth={2.2} />
              <span className="leading-tight"><span className="block font-display font-extrabold text-[15px]">Soins confirmés</span><span className="block text-[11px] text-teal-100">suivi actif 24/7</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CONCEPT B — "Editorial Full-Bleed"
   Image dominates, bleeding off the frame; oversized type; glass stat strip.
   ============================================================ */
function HeroEditorial() {
  const stats = [["80+", "Cliniques"], ["7", "Villes"], ["24/7", "Assistance"]];
  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 grid grid-cols-[1fr_1.15fr]">
      {/* left copy */}
      <div className="relative z-10 px-14 py-10 flex flex-col">
        <HLogo />
        <div className="flex-1 flex flex-col justify-center max-w-xl">
          <span className="inline-flex w-fit items-center gap-2 text-[12px] font-extrabold uppercase tracking-[.16em] text-brand-600"><span className="w-7 h-px bg-brand-400"></span>{EYEBROW}</span>
          <h1 className="mt-5 font-display font-extrabold text-[3.7rem] leading-[.98] text-ink tracking-tight">Votre<br />partenaire<br /><span className="relative inline-block">santé<span className="absolute -bottom-1 inset-x-0 h-3 bg-teal-300/60 -z-10 rounded"></span></span> au Maroc</h1>
          <p className="mt-6 text-[17px] leading-relaxed text-slate-600">{SUB}</p>
          <div className="mt-8 flex items-center gap-3">
            <span className="flex items-center gap-2 h-13 px-7 rounded-full bg-brand-600 text-white font-bold shadow-glow">Commencer mon parcours <HIcon name="arrow-right" size={18} /></span>
          </div>
          <p className="mt-7 flex items-center gap-2 text-[13px] font-semibold text-teal-700"><HIcon name="lock-keyhole" size={15} /> Conforme RGPD · Médecins coordinateurs francophones</p>
        </div>
      </div>

      {/* right full-bleed image */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-100 via-teal-50 to-brand-200"></div>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div className="text-brand-500/60">
            <HIcon name="users-round" size={72} strokeWidth={1.3} className="mx-auto" />
            <p className="mt-3 text-[13px] font-semibold text-slate-500/80 max-w-[16rem] mx-auto">Photo plein cadre — voyageuse recevant des soins coordonnés</p>
          </div>
        </div>
        {/* left fade into copy panel */}
        <div className="absolute inset-y-0 -start-px w-40 bg-gradient-to-r from-slate-50 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ink/45 to-transparent"></div>

        {/* circular trust seal */}
        <div className="absolute top-8 end-8 grid place-items-center w-24 h-24 rounded-full bg-white/90 backdrop-blur shadow-lift text-center" style={{ animation: "floaty 6s ease-in-out infinite" }}>
          <div><HIcon name="shield-check" size={22} className="text-teal-600 mx-auto" /><span className="block mt-0.5 font-display font-extrabold text-[13px] text-ink leading-none">100%</span><span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">sécurisé</span></div>
        </div>

        {/* glass stat strip */}
        <div className="absolute inset-x-7 bottom-7 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 p-1.5 flex">
          {stats.map(([v, k], i) => (
            <div key={k} className={"flex-1 px-4 py-3 text-center text-white " + (i < 2 ? "border-e border-white/25" : "")}>
              <span className="block font-display font-extrabold text-2xl drop-shadow">{v}</span>
              <span className="block text-[11px] font-semibold text-white/85 uppercase tracking-wide">{k}</span>
            </div>
          ))}
        </div>

        {/* coordinator chip */}
        <div className="absolute start-8 top-24 bg-white rounded-2xl shadow-lift border border-slate-100 p-2.5 pe-4 flex items-center gap-3" style={{ animation: "floaty 6s ease-in-out infinite", animationDelay: "1s" }}>
          <span className="relative grid place-items-center w-10 h-10 rounded-xl bg-teal-100 text-teal-700"><HIcon name="stethoscope" size={20} /><span className="absolute -top-0.5 -end-0.5 w-3 h-3 rounded-full bg-teal-500 ring-2 ring-white"></span></span>
          <span className="leading-tight"><span className="block text-[11px] text-slate-400">Dr. Salma A.</span><span className="block text-[13px] font-bold text-ink">Coordinatrice en ligne</span></span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CONCEPT C — "National Network Map"
   Geo hero: clinic network across Morocco, glowing city nodes + arcs.
   Ties directly to the geo-SOS / travels-in-Morocco story.
   ============================================================ */
function HeroNetwork() {
  const cities = [
    { n: "Tanger", x: 30, y: 14 }, { n: "Rabat", x: 26, y: 33 }, { n: "Casablanca", x: 21, y: 41 },
    { n: "Fès", x: 45, y: 30 }, { n: "Marrakech", x: 33, y: 58 }, { n: "Agadir", x: 22, y: 73 }, { n: "Essaouira", x: 16, y: 60 },
  ];
  const hub = { x: 33, y: 45 };
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-ink via-brand-950 to-slate-950">
      <div className="absolute inset-0 grain opacity-30"></div>
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(120,160,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(120,160,255,.06) 1px,transparent 1px)", backgroundSize: "40px 40px" }}></div>
      <div className="absolute top-1/2 end-[20%] w-[460px] h-[460px] -translate-y-1/2 rounded-full bg-brand-600/20 blur-3xl"></div>

      <div className="relative h-full px-14 py-10 flex flex-col">
        <HLogo light />
        <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8 items-center">
          {/* copy */}
          <div>
            <span className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full bg-white/10 border border-white/15 text-[12px] font-bold text-teal-300 backdrop-blur"><HIcon name="waypoints" size={14} /> {EYEBROW}</span>
            <h1 className="mt-5 font-display font-extrabold text-[3.2rem] leading-[1.02] text-white">{TITLE_A} <span className="text-teal-300">{TITLE_B}</span></h1>
            <p className="mt-5 text-[17px] leading-relaxed text-slate-300 max-w-md">Un réseau de cliniques de confiance dans tout le Maroc, coordonné pour vous — où que vous voyagiez.</p>
            <div className="mt-7 flex items-center gap-3">
              <span className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-brand-600 text-white font-bold shadow-glow">Commencer mon parcours <HIcon name="arrow-right" size={18} /></span>
              <span className="flex items-center gap-2 h-12 px-5 rounded-2xl bg-white/10 border border-white/15 text-white font-bold backdrop-blur">Comment ça marche</span>
            </div>
            <div className="mt-8 flex items-center gap-6">
              {[["80+", "cliniques"], ["7", "villes"], ["24/7", "assistance"]].map(([v, k]) => (
                <span key={k} className="leading-tight"><span className="block font-display font-extrabold text-2xl text-white">{v}</span><span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{k}</span></span>
              ))}
            </div>
          </div>

          {/* map */}
          <div className="relative h-[460px]">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <defs>
                <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#33b89c" stopOpacity=".5" /><stop offset="100%" stopColor="#33b89c" stopOpacity="0" /></radialGradient>
              </defs>
              {cities.map((c) => (
                <line key={c.n} x1={hub.x} y1={hub.y} x2={c.x} y2={c.y} stroke="rgba(140,178,255,.35)" strokeWidth=".4" strokeDasharray="1.4 1.4" />
              ))}
              <circle cx={hub.x} cy={hub.y} r="14" fill="url(#hubGlow)" />
            </svg>
            {/* hub */}
            <span className="absolute" style={{ left: hub.x + "%", top: hub.y + "%", transform: "translate(-50%,-50%)" }}>
              <span className="absolute inset-0 -m-3 rounded-full bg-teal-400/30" style={{ animation: "pulse-ring 2.4s ease-out infinite" }}></span>
              <span className="relative grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 text-white shadow-glow"><HIcon name="heart-pulse" size={22} strokeWidth={2.2} /></span>
            </span>
            {/* city nodes */}
            {cities.map((c, i) => (
              <span key={c.n} className="absolute" style={{ left: c.x + "%", top: c.y + "%", transform: "translate(-50%,-50%)" }}>
                <span className="absolute inset-0 -m-1 rounded-full bg-brand-400/40" style={{ animation: "pulse-ring 2.2s ease-out infinite", animationDelay: (i * 0.3) + "s" }}></span>
                <span className="relative grid place-items-center w-4 h-4 rounded-full bg-teal-300 ring-4 ring-teal-300/20"></span>
                <span className="absolute start-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-[10.5px] font-bold text-white/90 bg-white/10 backdrop-blur px-1.5 py-0.5 rounded-md border border-white/10">{c.n}</span>
              </span>
            ))}
            {/* SOS chip */}
            <div className="absolute -bottom-1 end-0 rounded-2xl bg-rose-500/15 border border-rose-400/30 backdrop-blur px-3.5 py-2.5 flex items-center gap-2" style={{ animation: "floaty 6s ease-in-out infinite" }}>
              <span className="grid place-items-center w-8 h-8 rounded-full bg-rose-500 text-white font-display font-extrabold text-[11px]">SOS</span>
              <span className="leading-tight"><span className="block text-[12px] font-bold text-white">Urgence géolocalisée</span><span className="block text-[10px] text-rose-200 font-mono">couverture nationale</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HeroConsole, HeroEditorial, HeroNetwork, HIcon, HLogo });
