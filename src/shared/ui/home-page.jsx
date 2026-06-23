import { ArrowRight, HeartPulse, ShieldCheck, Smartphone, Stethoscope, Building2, UserRound, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../theme";
import { Logo } from "./primitives";

const HOME_CONTENT = {
  nav: [
    ["Patient", "/connexion/patient"],
    ["Clinique", "/connexion/clinique"],
    ["Professionnel de santé", "/connexion/professionnel"],
  ],
  hero: {
    badge: "Trivacare · coordination médicale",
    title: "Une coordination médicale plus claire pour chaque parcours de soins.",
    description:
      "Trivacare centralise les demandes, les rendez-vous, les documents et le suivi afin de mieux coordonner le patient, l'établissement de soins et le professionnel de santé, sans mélanger les accès ni les responsabilités.",
    patientCta: "Entrer côté patient",
    clinicCta: "Accès clinique",
    professionalCta: "Accès professionnel de santé",
  },
  visual: {
    patientTitle: "Dossier, rendez-vous, documents",
    clinicTitle: "Admissions et coordination",
    professionalLabel: "Professionnel de santé",
    professionalTitle: "Suivi clinique personnel",
    footer: "Espaces séparés",
  },
  sectionOne: {
    badge: "Parcours de soins",
    title: "Trois espaces distincts pour une prise en charge mieux coordonnée.",
  },
  sectionTwo: {
    badge: "Choisir son espace",
    title: "Un accès adapté à chaque rôle du parcours médical.",
  },
};

const PERSONAS = [
  {
    id: "patient",
    label: "Patient",
    title: "Un espace patient simple pour suivre son parcours de soins.",
    text: "Demandes, rendez-vous, documents médicaux et échanges importants sont regroupés dans une interface claire et rassurante.",
    accent: "persona-accent--patient bg-[#eaf1ff] text-[#0a316c]",
    border: "border-[#cfdcff]",
    icon: UserRound,
    illustration: "patient",
    cta: "Accéder à l'espace patient",
  },
  {
    id: "clinique",
    label: "Clinique",
    title: "Un espace clinique pour piloter les admissions et la coordination.",
    text: "L'établissement suit les demandes, prépare les rendez-vous, gère les documents et coordonne la prise en charge sans confusion entre les rôles.",
    accent: "persona-accent--clinic bg-[#e8f6f1] text-[#0b4f46]",
    border: "border-[#c7eadf]",
    icon: Building2,
    illustration: "clinique",
    cta: "Accéder à l'espace clinique",
  },
  {
    id: "professionnel",
    label: "Professionnel de santé",
    title: "Un espace personnel pour le suivi médical de chaque patient.",
    text: "Le praticien consulte les informations utiles, suit ses patients et garde ses notes ou décisions dans un espace dédié.",
    accent: "persona-accent--professional bg-[#eef0f7] text-[#24314f]",
    border: "border-[#d9dfec]",
    icon: Stethoscope,
    illustration: "professionnel",
    cta: "Accéder à l'espace professionnel",
  },
];

const HIGHLIGHTS = [
  {
    title: "Trois accès distincts",
    text: "Chaque profil dispose de son propre espace, avec ses écrans, ses informations et ses responsabilités.",
    icon: ShieldCheck,
  },
  {
    title: "Pensé pour le mobile",
    text: "Les parcours restent simples à utiliser sur iPhone, Android, tablette et ordinateur.",
    icon: Smartphone,
  },
  {
    title: "Coordination lisible",
    text: "Les étapes de prise en charge, les rendez-vous et les documents importants restent faciles à suivre.",
    icon: Activity,
  },
];

const FLOW = [
  ["01", "Préparer le parcours", "Le patient renseigne sa demande, ses informations utiles et ses documents médicaux."],
  ["02", "Coordonner la prise en charge", "La clinique organise l'accueil, les rendez-vous et les éléments nécessaires au suivi."],
  ["03", "Assurer le suivi clinique", "Le professionnel de santé suit le patient depuis un espace personnel et sécurisé."],
];

function PersonaButton({ persona, navigate }) {
  const Icon = persona.icon;

  return (
    <button
      type="button"
      onClick={() => navigate(`/connexion/${persona.id}`)}
      className={`persona-card motion-card group relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-[2.75rem] border ${persona.border} bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(255,255,255,0.9))] p-7 text-left shadow-[0_22px_50px_-28px_rgba(11,21,36,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-28px_rgba(11,21,36,0.28)] sm:min-h-[460px]`}
    >
      <div className="persona-card-glow absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.6),_transparent_36%)]" />
      <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-70" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/88 to-transparent" />
      <div className="pointer-events-none absolute inset-0 opacity-45 transition-opacity duration-300 group-hover:opacity-52">
        <PersonaIllustration type={persona.illustration} />
      </div>
      <div className="relative flex items-start justify-between gap-4">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${persona.accent}`}>
          <Icon size={14} strokeWidth={2.2} />
          {persona.label}
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors group-hover:text-brand-700">
          <ArrowRight size={16} />
        </span>
      </div>
      <div className="relative mt-8 flex flex-1 flex-col">
        <h3 className="max-w-[16ch] text-[1.38rem] font-extrabold leading-[1.08] text-ink sm:text-[1.46rem]">
          {persona.title}
        </h3>
        <p className="mt-5 max-w-[30ch] text-sm leading-7 text-slate-500 sm:text-[1rem]">{persona.text}</p>
        <div className="mt-auto pt-10">
          <div className="h-px w-full bg-gradient-to-r from-slate-200 via-slate-300/70 to-transparent" />
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors group-hover:text-brand-700">
            {persona.cta}
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </button>
  );
}

function PersonaIllustration({ type }) {
  if (type === "patient") {
    return (
      <svg className="h-full w-full" viewBox="0 0 420 420" aria-hidden="true">
        <defs>
          <linearGradient id="patientFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dce7ff" />
            <stop offset="100%" stopColor="#9db7f4" />
          </linearGradient>
        </defs>
        <circle cx="312" cy="118" r="76" fill="url(#patientFill)" />
        <circle cx="145" cy="108" r="28" fill="#d6e2fb" />
        <path d="M84 302C104 250 150 222 206 222C257 222 304 247 330 288" fill="none" stroke="#89a6e8" strokeWidth="18" strokeLinecap="round" />
        <circle cx="195" cy="170" r="52" fill="#7da1e9" />
        <path d="M147 332H312C325 332 336 343 336 356V372H123V356C123 343 134 332 147 332Z" fill="#dbe7ff" />
        <rect x="128" y="276" width="150" height="74" rx="28" fill="#edf3ff" />
        <path d="M289 166C318 166 341 189 341 218V246H253V202C253 182 269 166 289 166Z" fill="#c8dafd" />
        <path d="M184 149C184 136 195 126 208 126C221 126 232 136 232 149C232 162 221 173 208 173C195 173 184 162 184 149Z" fill="#edf3ff" />
      </svg>
    );
  }

  if (type === "clinique") {
    return (
      <svg className="h-full w-full" viewBox="0 0 420 420" aria-hidden="true">
        <defs>
          <linearGradient id="clinicFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8f2ea" />
            <stop offset="100%" stopColor="#91d3c1" />
          </linearGradient>
        </defs>
        <circle cx="316" cy="102" r="70" fill="url(#clinicFill)" />
        <rect x="110" y="132" width="184" height="190" rx="28" fill="#edf8f4" />
        <rect x="136" y="164" width="38" height="38" rx="10" fill="#9fd8c7" />
        <rect x="188" y="164" width="38" height="38" rx="10" fill="#b7e3d6" />
        <rect x="240" y="164" width="28" height="96" rx="12" fill="#89cdb8" />
        <rect x="136" y="216" width="38" height="38" rx="10" fill="#b7e3d6" />
        <rect x="188" y="216" width="38" height="38" rx="10" fill="#9fd8c7" />
        <rect x="160" y="282" width="78" height="66" rx="24" fill="#d6efe6" />
        <path d="M198 90V134" stroke="#7dc1ad" strokeWidth="18" strokeLinecap="round" />
        <path d="M176 112H220" stroke="#7dc1ad" strokeWidth="18" strokeLinecap="round" />
        <path d="M78 336C110 308 156 296 208 296C254 296 294 306 334 334" fill="none" stroke="#9ed5c6" strokeWidth="14" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className="h-full w-full" viewBox="0 0 420 420" aria-hidden="true">
      <defs>
        <linearGradient id="professionalFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e7eaf5" />
          <stop offset="100%" stopColor="#bcc6e3" />
        </linearGradient>
      </defs>
      <circle cx="320" cy="112" r="74" fill="url(#professionalFill)" />
      <rect x="228" y="214" width="118" height="124" rx="26" fill="#eef1f8" />
      <rect x="246" y="242" width="82" height="12" rx="6" fill="#bcc6e3" />
      <rect x="246" y="268" width="62" height="12" rx="6" fill="#d3d9ea" />
      <rect x="246" y="294" width="74" height="12" rx="6" fill="#d3d9ea" />
      <circle cx="164" cy="160" r="52" fill="#c6d1ea" />
      <path d="M112 332C124 280 160 246 206 246C254 246 287 281 298 332" fill="#e9edf7" />
      <path d="M147 160C147 149 156 140 167 140C174 140 181 144 184 151C188 144 194 140 202 140C214 140 223 149 223 160C223 178 205 192 184 207C165 193 147 178 147 160Z" fill="#f8fbff" />
      <path d="M98 334H190" stroke="#bcc6e3" strokeWidth="14" strokeLinecap="round" />
    </svg>
  );
}

function FlowNode({ step, title, text }) {
  return (
    <div className="motion-card relative flex h-full flex-col rounded-[2.4rem] border border-slate-200/90 bg-white/85 p-6 text-center shadow-[0_18px_40px_-30px_rgba(11,21,36,0.25)] backdrop-blur">
      <span className="mx-auto inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
        {step}
      </span>
      <h4 className="mt-4 text-[1.45rem] font-extrabold leading-[1.05] text-ink">{title}</h4>
      <p className="mt-3 text-sm leading-7 text-slate-500">{text}</p>
    </div>
  );
}

function SignalCanvas() {
  return (
    <div className="signal-canvas motion-fade-left motion-delay-2 relative h-[420px] overflow-hidden rounded-[3rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,248,244,0.94))] p-5 shadow-[0_30px_70px_-36px_rgba(11,21,36,0.32)] backdrop-blur-xl sm:h-[360px] sm:p-6">
      <div className="absolute left-10 top-12 h-28 w-28 rounded-full bg-[#e7eefc]" />
      <div className="absolute right-10 top-10 h-20 w-20 rounded-full bg-[#e7f5ef]" />
      <div className="absolute bottom-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-[#eff2f8]" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 340" aria-hidden="true">
        <path
          d="M98 118C138 98 193 90 246 110C301 130 332 182 387 198C425 209 457 201 486 183"
          fill="none"
          stroke="rgba(11,21,36,0.11)"
          strokeWidth="2"
          strokeDasharray="6 10"
        />
        <path
          d="M120 246C178 221 250 218 304 239C354 259 392 282 446 274"
          fill="none"
          stroke="rgba(0,82,204,0.14)"
          strokeWidth="2"
        />
      </svg>

      <div className="relative hidden h-full sm:block">
        <div className="absolute left-8 top-10 z-10 w-[280px] rounded-[2rem] border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_16px_40px_-28px_rgba(11,21,36,0.3)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#edf3ff] text-brand-700">
              <UserRound size={20} strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Patient</p>
              <p className="text-[13px] font-semibold leading-5 text-ink">{HOME_CONTENT.visual.patientTitle}</p>
            </div>
          </div>
        </div>

        <div className="absolute right-6 top-14 z-20 w-[250px] rounded-[2rem] border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_16px_40px_-28px_rgba(11,21,36,0.3)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8f6f1] text-teal-700">
              <Building2 size={20} strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Clinique</p>
              <p className="text-[13px] font-semibold leading-5 text-ink">{HOME_CONTENT.visual.clinicTitle}</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-30 w-[330px] -translate-x-1/2 rounded-[2.2rem] bg-[#0f1d31] px-5 py-5 text-white shadow-[0_30px_60px_-30px_rgba(15,29,49,0.6)]">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-teal-300">
              <Stethoscope size={22} strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">{HOME_CONTENT.visual.professionalLabel}</p>
              <p className="text-[13px] font-semibold leading-5 text-white">{HOME_CONTENT.visual.professionalTitle}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/8 px-3 py-2 text-xs text-slate-200">
            <span>{HOME_CONTENT.visual.footer}</span>
            <span className="h-2.5 w-2.5 rounded-full bg-teal-300" />
          </div>
        </div>
      </div>

      <div className="relative flex h-full flex-col justify-center gap-3 sm:hidden">
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_16px_40px_-28px_rgba(11,21,36,0.3)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#edf3ff] text-brand-700">
              <UserRound size={20} strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Patient</p>
              <p className="text-[13px] font-semibold leading-5 text-ink">{HOME_CONTENT.visual.patientTitle}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_16px_40px_-28px_rgba(11,21,36,0.3)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8f6f1] text-teal-700">
              <Building2 size={20} strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Clinique</p>
              <p className="text-[13px] font-semibold leading-5 text-ink">{HOME_CONTENT.visual.clinicTitle}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2.2rem] bg-[#0f1d31] px-5 py-5 text-white shadow-[0_30px_60px_-30px_rgba(15,29,49,0.6)]">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-teal-300">
              <Stethoscope size={22} strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">{HOME_CONTENT.visual.professionalLabel}</p>
              <p className="text-[13px] font-semibold leading-5 text-white">{HOME_CONTENT.visual.professionalTitle}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/8 px-3 py-2 text-xs text-slate-200">
            <span>{HOME_CONTENT.visual.footer}</span>
            <span className="h-2.5 w-2.5 rounded-full bg-teal-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-surface relative min-h-screen overflow-hidden bg-[#f6f4ee] text-ink transition-colors duration-300">
      <div className="home-backdrop absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,82,204,0.08),_transparent_34%),radial-gradient(circle_at_85%_20%,_rgba(20,154,130,0.10),_transparent_28%),linear-gradient(to_bottom,_rgba(255,255,255,0.6),_rgba(255,255,255,0))]" />
      <div className="ambient-wash absolute left-[-8%] top-[18%] h-64 w-64 rounded-full bg-white/60 blur-3xl" />
      <div className="ambient-wash absolute right-[-4%] top-[44%] h-72 w-72 rounded-full bg-[#e7efe9] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-[1320px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="motion-fade-down rounded-[2rem] border border-white/70 bg-white/55 px-5 py-4 shadow-[0_10px_40px_-30px_rgba(11,21,36,0.3)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Logo />
            <div className="flex flex-wrap items-center gap-2">
              <ThemeToggle className="rounded-full" />
              <div className="flex flex-wrap gap-2">
                {HOME_CONTENT.nav.map(([label, href]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(href)}
                    className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-700"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8 sm:py-10 lg:py-12">
          <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="motion-fade-up relative">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <HeartPulse size={14} strokeWidth={2.1} className="text-brand-600" />
                  {HOME_CONTENT.hero.badge}
                </p>
                <h1 className="home-hero-title mt-6 max-w-4xl text-[clamp(3rem,6vw,5.7rem)] font-extrabold leading-[0.94] tracking-[-0.05em] text-[#0d1727]">
                  {HOME_CONTENT.hero.title}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  {HOME_CONTENT.hero.description}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/connexion/patient")}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0f1d31] px-6 text-sm font-bold text-white shadow-[0_20px_40px_-20px_rgba(15,29,49,0.55)] transition-transform hover:-translate-y-0.5"
                >
                  {HOME_CONTENT.hero.patientCta}
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/connexion/clinique")}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-6 text-sm font-bold text-slate-700 transition-colors hover:border-brand-200 hover:text-brand-700"
                >
                  {HOME_CONTENT.hero.clinicCta}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/connexion/professionnel")}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-6 text-sm font-bold text-slate-700 transition-colors hover:border-brand-200 hover:text-brand-700"
                >
                  {HOME_CONTENT.hero.professionalCta}
                </button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {HIGHLIGHTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-[2rem] border border-slate-200/90 bg-white/70 px-4 py-5 shadow-[0_16px_36px_-28px_rgba(11,21,36,0.28)] backdrop-blur"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#edf3ff] text-brand-700">
                        <Icon size={18} strokeWidth={2.1} />
                      </span>
                      <p className="mt-4 text-sm font-bold text-ink">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <SignalCanvas />
            </div>
          </section>

          <section className="mt-12">
            <div className="mx-auto max-w-[980px] text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                {HOME_CONTENT.sectionOne.badge}
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl text-[clamp(2rem,3.5vw,3.4rem)] font-extrabold leading-[0.98] text-ink">
                {HOME_CONTENT.sectionOne.title}
              </h2>
            </div>

            <div className="mx-auto mt-8 grid max-w-[1160px] gap-4 lg:grid-cols-3">
              {FLOW.map(([step, title, text]) => (
                <FlowNode key={step} step={step} title={title} text={text} />
              ))}
            </div>
          </section>

          <section className="mt-12">
            <div className="mx-auto max-w-[980px] text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                {HOME_CONTENT.sectionTwo.badge}
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl text-[clamp(1.9rem,3vw,2.9rem)] font-extrabold leading-[1.02] text-ink">
                {HOME_CONTENT.sectionTwo.title}
              </h2>
            </div>

            <div className="mx-auto mt-8 grid max-w-[1180px] auto-rows-fr gap-4 lg:grid-cols-3">
              {PERSONAS.map((persona) => (
                <PersonaButton key={persona.id} persona={persona} navigate={navigate} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
