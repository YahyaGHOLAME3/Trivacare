import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppIcon } from "../../assets/icons/app-icon";
import { PERSONA_TO_ROLE, signIn, signUp } from "../auth";
import { ThemeToggle } from "../theme";
import { Button, Card, Field, Logo, inputClassName } from "./primitives";

const PERSONAS = {
  patient: {
    title: "patient",
    loginTitle: "Connexion patient",
    signupTitle: "Créer un compte patient",
    emailLabel: "E-mail patient",
    passwordHint: "Accès individuel et confidentiel",
    accent: "from-brand-600 to-teal-600",
    roleLabel: "Patient",
    switchLabel: "Accès patient",
    switchText: "Dossier, rendez-vous et suivi du séjour.",
    icon: "user-round",
  },
  clinique: {
    title: "clinique",
    loginTitle: "Connexion clinique",
    signupTitle: "Créer un compte clinique",
    emailLabel: "E-mail établissement",
    passwordHint: "Accès réservé à la structure clinique",
    accent: "from-teal-600 to-teal-800",
    roleLabel: "Clinique",
    switchLabel: "Accès clinique",
    switchText: "Admissions, documents et coordination.",
    icon: "building-2",
  },
  professionnel: {
    title: "professionnel de santé",
    loginTitle: "Connexion professionnel de santé",
    signupTitle: "Créer un compte professionnel",
    emailLabel: "E-mail professionnel",
    passwordHint: "Accès nominatif du praticien",
    accent: "from-brand-700 to-brand-900",
    roleLabel: "Professionnel",
    switchLabel: "Accès professionnel",
    switchText: "Notes, patients et décisions cliniques.",
    icon: "stethoscope",
  },
};

function getAuthErrorMessage(error) {
  if (error instanceof Error && error.message) return error.message;
  return "Impossible de traiter votre demande pour le moment.";
}

export function LoginPage() {
  const { persona = "patient" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.pathname.startsWith("/inscription/");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    specialty: "",
    licenseNumber: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = useMemo(() => PERSONAS[persona] || PERSONAS.patient, [persona]);
  const otherPersonas = useMemo(
    () => Object.entries(PERSONAS).filter(([key]) => key !== persona),
    [persona],
  );

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (isSignup && form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = isSignup
        ? await signUp({
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            email: form.email,
            password: form.password,
            role: PERSONA_TO_ROLE[persona] || PERSONA_TO_ROLE.patient,
            organizationName: form.organizationName,
            specialty: form.specialty,
            licenseNumber: form.licenseNumber,
          })
        : await signIn({
            email: form.email,
            password: form.password,
          });

      navigate(location.state?.from || session.targetPath, { replace: true });
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchBasePath = isSignup ? "/inscription" : "/connexion";
  const alternateModePath = isSignup ? "/connexion" : "/inscription";

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
              <h2 className="mt-6 text-3xl font-extrabold">
                {isSignup ? config.signupTitle : config.loginTitle}
              </h2>
              <p className="mt-3 max-w-[34rem] text-sm text-white/85">
                {isSignup
                  ? "Créez un accès sécurisé pour rejoindre l’espace Trivacare correspondant à votre rôle."
                  : "Accédez à votre espace sécurisé Trivacare avec vos identifiants."}
              </p>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <form className="space-y-4" onSubmit={onSubmit}>
                {isSignup ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Prénom">
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={updateField("firstName")}
                        className={inputClassName}
                        placeholder="Prénom"
                        required
                      />
                    </Field>
                    <Field label="Nom">
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={updateField("lastName")}
                        className={inputClassName}
                        placeholder="Nom"
                        required
                      />
                    </Field>
                  </div>
                ) : null}

                {isSignup ? (
                  <Field label="Téléphone">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={updateField("phone")}
                      className={inputClassName}
                      placeholder="+212 ..."
                    />
                  </Field>
                ) : null}

                {isSignup && persona === "clinique" ? (
                  <Field label="Nom de la structure">
                    <input
                      type="text"
                      value={form.organizationName}
                      onChange={updateField("organizationName")}
                      className={inputClassName}
                      placeholder="Clinique Atlas"
                      required
                    />
                  </Field>
                ) : null}

                {isSignup && persona === "professionnel" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Spécialité">
                      <input
                        type="text"
                        value={form.specialty}
                        onChange={updateField("specialty")}
                        className={inputClassName}
                        placeholder="Cardiologie"
                        required
                      />
                    </Field>
                    <Field label="N° d’autorisation">
                      <input
                        type="text"
                        value={form.licenseNumber}
                        onChange={updateField("licenseNumber")}
                        className={inputClassName}
                        placeholder="PRO-2026-001"
                        required
                      />
                    </Field>
                  </div>
                ) : null}

                <Field label={config.emailLabel}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    className={inputClassName}
                    placeholder="nom@trivacare.ma"
                    required
                  />
                </Field>
                <Field label="Mot de passe" hint={config.passwordHint}>
                  <input
                    type="password"
                    value={form.password}
                    onChange={updateField("password")}
                    className={inputClassName}
                    placeholder="••••••••••"
                    required
                  />
                </Field>

                {isSignup ? (
                  <Field label="Confirmer le mot de passe">
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={updateField("confirmPassword")}
                      className={inputClassName}
                      placeholder="••••••••••"
                      required
                    />
                  </Field>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {error}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Traitement..."
                      : isSignup
                        ? "Créer mon compte"
                        : "Se connecter"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => navigate("/")}
                    disabled={isSubmitting}
                  >
                    Retour à l'accueil
                  </Button>
                </div>
              </form>

              <div className="auth-switch-card rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-600">
                <p className="font-bold text-ink">
                  {isSignup ? "Vous avez déjà un compte ?" : "Vous n'avez pas encore de compte ?"}
                </p>
                <p className="auth-switch-copy mt-1">
                  {isSignup
                    ? "Reconnectez-vous avec vos identifiants existants."
                    : "Créez un accès en quelques secondes selon votre profil Trivacare."}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`${alternateModePath}/${persona}`)}
                  className="auth-switch-link mt-3 inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition-opacity hover:opacity-80"
                >
                  {isSignup ? "Aller à la connexion" : "Créer un compte"}
                  <AppIcon name="arrow-right" size={16} />
                </button>
              </div>
            </div>
          </Card>

          <div className="motion-fade-up motion-delay-2 mx-auto mt-6 max-w-lg">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Basculer vers un autre espace
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {otherPersonas.map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(`${switchBasePath}/${key}`)}
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
