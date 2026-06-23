import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppIcon } from "../../assets/icons/app-icon";
import { signIn } from "../auth";
import { ThemeToggle } from "../theme";
import { Button, Card, Field, Logo, inputClassName } from "./primitives";

const PERSONAS = {
  patient: {
    title: "Connexion patient",
    emailLabel: "E-mail patient",
    passwordHint: "Accès individuel et confidentiel",
    target: "/patient/tableau-de-bord",
    accent: "from-brand-600 to-teal-600",
    roleLabel: "Patient",
    switchLabel: "Accès patient",
    switchText: "Dossier, rendez-vous et suivi du séjour.",
    icon: "user-round",
  },
  clinique: {
    title: "Connexion clinique",
    emailLabel: "E-mail établissement",
    passwordHint: "Accès réservé à la structure clinique",
    target: "/clinique/tableau-de-bord",
    accent: "from-teal-600 to-teal-800",
    roleLabel: "Clinique",
    switchLabel: "Accès clinique",
    switchText: "Admissions, documents et coordination.",
    icon: "building-2",
  },
  professionnel: {
    title: "Connexion professionnel de santé",
    emailLabel: "E-mail professionnel",
    passwordHint: "Accès nominatif du praticien",
    target: "/professionnel/tableau-de-bord",
    accent: "from-brand-700 to-brand-900",
    roleLabel: "Professionnel",
    switchLabel: "Accès professionnel",
    switchText: "Notes, patients et décisions cliniques.",
    icon: "stethoscope",
  },
};

export function LoginPage() {
  const { persona = "patient" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const config = useMemo(() => PERSONAS[persona] || PERSONAS.patient, [persona]);
  const otherPersonas = useMemo(
    () => Object.entries(PERSONAS).filter(([key]) => key !== persona),
    [persona],
  );

  const onSubmit = (event) => {
    event.preventDefault();
    signIn(persona);
    navigate(location.state?.from || config.target, { replace: true });
  };

  return (
    <div className="login-surface relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f6f1_0%,#f1f5f9_100%)] transition-colors duration-300">
      <div className="login-backdrop absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,82,204,0.08),_transparent_34%),radial-gradient(circle_at_82%_18%,_rgba(20,154,130,0.1),_transparent_28%),linear-gradient(to_bottom,_rgba(255,255,255,0.45),_rgba(255,255,255,0))]" />
      <div className="ambient-wash absolute left-[-6%] top-[12%] h-64 w-64 rounded-full bg-white/60 blur-3xl" />
      <div className="ambient-wash absolute right-[-8%] top-[42%] h-72 w-72 rounded-full bg-[#e7efe9] blur-3xl" />
      <ThemeToggle className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6" />

      <div className="relative mx-auto flex min-h-screen max-w-[1280px] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl">
          <Card className="motion-fade-up overflow-hidden border-white/80 bg-white/90 shadow-[0_30px_80px_-40px_rgba(11,21,36,0.35)] backdrop-blur">
            <div className={`bg-gradient-to-br ${config.accent} px-6 py-7 text-white sm:px-8`}>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-2xl transition-opacity hover:opacity-90"
                  aria-label="Retour à l'accueil"
                >
                  <Logo />
                </button>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold">{config.title}</h2>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <form className="space-y-4" onSubmit={onSubmit}>
                <Field label={config.emailLabel}>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClassName}
                    placeholder="nom@trivacare.ma"
                    required
                  />
                </Field>
                <Field label="Mot de passe" hint={config.passwordHint}>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClassName}
                    placeholder="••••••••••"
                    required
                  />
                </Field>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button type="submit" variant="primary" className="flex-1">
                    Se connecter
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => navigate("/")}
                  >
                    Retour à l&apos;accueil
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          <div className="motion-fade-up motion-delay-2 mx-auto mt-6 max-w-lg">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Vous n&apos;êtes pas {config.roleLabel.toLowerCase()} ?
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {otherPersonas.map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(`/connexion/${key}`)}
                  className="login-persona-card motion-card group relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 p-4 text-left shadow-[0_18px_40px_-28px_rgba(11,21,36,0.28)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:bg-white/92"
                >
                  <div className="login-persona-glow absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.55),_transparent_40%)]" />
                  <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-70" />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700">
                      <AppIcon name={item.icon} size={18} />
                    </span>
                    <span className="text-slate-300 transition-colors group-hover:text-brand-700">
                      <AppIcon name="arrow-right" size={18} />
                    </span>
                  </div>
                  <p className="relative mt-5 text-sm font-extrabold text-ink">{item.switchLabel}</p>
                  <p className="relative mt-1.5 text-sm leading-6 text-slate-500">{item.switchText}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
