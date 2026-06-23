import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppIcon } from "../../assets/icons/app-icon";
import { signOut } from "../auth";
import { ThemeToggle } from "../theme";
import { Avatar, Button, Card, Logo } from "./primitives";

export function AppShell({
  area,
  badge,
  navItems,
  current,
  onSOS,
  user,
  headerTitle,
  searchPlaceholder,
  children,
  headerActions,
  persona,
  profileHref,
}) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);
  const activeItem = useMemo(
    () => navItems.find((item) => item.id === current) || navItems[0],
    [current, navItems],
  );
  const notifications = useMemo(() => {
    const byPersona = {
      patient: [
        {
          title: "Rendez-vous confirmé",
          body: "Votre consultation cardiologique du 27 juin à 14:30 est confirmée.",
          meta: "Il y a 8 min",
          tone: "bg-brand-50 text-brand-700",
        },
        {
          title: "Document reçu",
          body: "Un nouveau document médical a été ajouté à votre dossier.",
          meta: "Il y a 24 min",
          tone: "bg-teal-50 text-teal-700",
        },
        {
          title: "Message de coordination",
          body: "Votre coordinatrice vous a laissé un message sécurisé.",
          meta: "Aujourd'hui",
          tone: "bg-slate-100 text-slate-600",
        },
      ],
      clinique: [
        {
          title: "Admission à confirmer",
          body: "Un patient attend une validation de prise en charge.",
          meta: "Il y a 5 min",
          tone: "bg-amber-50 text-amber-700",
        },
        {
          title: "Document signé",
          body: "Un consentement a été validé pour l'établissement.",
          meta: "Il y a 18 min",
          tone: "bg-teal-50 text-teal-700",
        },
        {
          title: "Message Trivacare",
          body: "La coordination demande un retour avant 16h00.",
          meta: "Aujourd'hui",
          tone: "bg-slate-100 text-slate-600",
        },
      ],
      professionnel: [
        {
          title: "Patient mis à jour",
          body: "Le dossier d'un patient suivi contient un nouveau document.",
          meta: "Il y a 11 min",
          tone: "bg-brand-50 text-brand-700",
        },
        {
          title: "Note à signer",
          body: "Une note de consultation attend votre validation.",
          meta: "Il y a 36 min",
          tone: "bg-amber-50 text-amber-700",
        },
        {
          title: "Coordination clinique",
          body: "Un message sécurisé a été ajouté à votre suivi.",
          meta: "Aujourd'hui",
          tone: "bg-slate-100 text-slate-600",
        },
      ],
    };

    return byPersona[persona] || byPersona.patient;
  }, [persona]);

  const handleLogout = () => {
    if (persona) signOut(persona);
    navigate(`/connexion/${persona || "patient"}`);
  };

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen]);

  const Nav = (
    <div className="motion-fade-right flex h-full flex-col">
      <div className="border-b border-slate-100 px-5 py-5">
        <Logo badge={badge} />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = item.id === current;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                navigate(item.href);
                setMobileOpen(false);
              }}
              className={[
                "relative flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-left text-sm font-semibold transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-ink",
              ].join(" ")}
            >
              <span
                className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-brand-600 ${active ? "opacity-100" : "opacity-0"}`}
              />
              <AppIcon
                name={item.icon}
                size={19}
                className={active ? "text-brand-600" : "text-slate-400"}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="grid min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="space-y-3 px-3 pb-3">
        <button
          type="button"
          onClick={onSOS}
          className="flex h-12 w-full items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-600 text-[11px] font-extrabold text-white">
            SOS
          </span>
          Urgence géolocalisée
        </button>
        <Card className="border-slate-100 bg-slate-50 p-3 shadow-none">
          <div className="flex items-center gap-3">
            <Avatar initials={user.initials} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{user.name}</p>
              <p className="truncate text-xs text-slate-400">
                {area} · {user.meta}
              </p>
            </div>
          </div>
        </Card>
        <Button variant="ghost" className="w-full" onClick={handleLogout}>
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <aside className="hidden h-[calc(100vh-110px)] rounded-5xl border border-slate-200 bg-white lg:flex lg:flex-col">
        {Nav}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[82vw] bg-white shadow-lift">
            {Nav}
          </div>
        </div>
      ) : null}

      <div className="dashboard-content min-w-0">
        <header className="motion-fade-down relative z-30 mb-5 rounded-4xl border border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <AppIcon name="menu" size={22} />
            </button>
            <div className="hidden min-w-[240px] flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-slate-400 md:flex md:max-w-[460px] xl:max-w-[520px]">
              <AppIcon name="search" size={17} />
              <span className="truncate text-sm">{searchPlaceholder}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((value) => !value)}
                >
                  <AppIcon name="bell" size={18} />
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>

                {notificationsOpen ? (
                  <div
                    role="dialog"
                    aria-label="Notifications"
                    className="absolute -right-4 top-[calc(100%+0.75rem)] z-50 w-[min(360px,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-[0_28px_70px_-24px_rgba(11,21,36,0.4)] backdrop-blur-xl sm:right-0"
                  >
                    <div className="border-b border-slate-100 px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold text-ink">Notifications</p>
                          <p className="mt-1 text-xs text-slate-400">Aperçu front-end du menu de notifications</p>
                        </div>
                        <span className="inline-flex min-w-6 justify-center rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
                          {notifications.length}
                        </span>
                      </div>
                    </div>

                    <div className="max-h-[min(420px,calc(100vh-9rem))] overflow-y-auto overscroll-contain px-3 py-3">
                      <div className="space-y-2">
                        {notifications.map((item) => (
                          <button
                            key={`${item.title}-${item.meta}`}
                            type="button"
                            className="flex w-full items-start gap-3 rounded-[1.35rem] px-3 py-3 text-left transition-colors hover:bg-slate-50"
                          >
                            <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${item.tone}`}>
                              <AppIcon name="bell" size={16} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold text-ink">{item.title}</span>
                              <span className="mt-1 block text-sm leading-6 text-slate-500">{item.body}</span>
                              <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.meta}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              {headerActions}
              <Button
                variant="ghost"
                className="hidden xl:inline-flex"
                onClick={() => profileHref && navigate(profileHref)}
              >
                {user.name}
              </Button>
            </div>
          </div>
        </header>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
