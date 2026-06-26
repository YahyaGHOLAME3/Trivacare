import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AppIcon } from "../assets/icons/app-icon";
import { patientAppointments, patientDocuments, patientNav, patientProfile, patientTrip } from "../shared/data/patient";
import { AppShell } from "../shared/ui/shell";
import { Badge, Button, Card, Field, InfoList, PageHeader, StatCard, Toggle, inputClassName } from "../shared/ui/primitives";
import { SosModal } from "../shared/ui/modals";

function PatientDashboard() {
  const next = patientAppointments[0];
  return (
    <div className="space-y-5">
      <PageHeader
        title={`Bonjour, ${patientProfile.name.split(" ")[0]}`}
        subtitle="Aujourd'hui · samedi 21 juin 2026"
      >
        <Button variant="ghost" icon="calendar-days">Mes rendez-vous</Button>
        <Button variant="primary" icon="plus">Nouveau voyage</Button>
      </PageHeader>

      <div className="metric-grid">
        <StatCard icon="calendar-check" tone="blue" label="Prochain rendez-vous" value="J-6" sub={`${next.date} · ${next.time}`} />
        <StatCard icon="folder-heart" tone="teal" label="Dossier médical" value="88%" sub="complété" />
        <StatCard icon="map-pin" tone="amber" label="Séjour en cours" value="Marrakech" sub="jusqu'au 07 juillet" />
        <StatCard icon="wallet" tone="rose" label="À régler" value="1 200 MAD" sub="1 devis à approuver" />
      </div>

      <div className="page-grid">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
              <Badge tone="teal" className="border-white/20 bg-white/10 text-white">
                Prochain rendez-vous · {next.soon}
              </Badge>
              <h2 className="mt-4 text-2xl font-extrabold">{next.title}</h2>
              <p className="mt-1 text-sm text-brand-100">
                {next.doctor} · {next.specialty}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ["calendar-days", next.date],
                  ["clock", next.time],
                  ["map-pin", next.clinic],
                ].map(([icon, text]) => (
                  <div
                    key={text}
                    className="flex min-h-[72px] items-center justify-center rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-semibold"
                  >
                    <div className="flex min-w-0 items-center justify-center gap-2">
                      <AppIcon name={icon} size={16} className="shrink-0 text-teal-200" />
                      <span className="min-w-0 break-words text-center leading-5">{text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              <Button icon="arrow-up-right">Voir le détail</Button>
              <Button variant="ghost" icon="messages-square">Message coordinateur</Button>
              <Button variant="ghost" icon="navigation">Itinéraire</Button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-ink">Prochains rendez-vous</h3>
              <Button variant="ghost" className="min-h-9 px-3" iconEnd="chevron-right">Tout voir</Button>
            </div>
            <div className="space-y-3">
              {patientAppointments.slice(0, 2).map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-center shadow-soft">
                    <span className="font-display text-base font-extrabold text-brand-700">
                      {item.date.split(" ")[0]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.doctor} · {item.time} · {item.city}
                    </p>
                  </div>
                  <Badge tone={item.status === "confirmé" ? "teal" : "amber"}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-ink to-brand-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">
                Votre coordinatrice
              </p>
              <h3 className="mt-2 text-xl font-bold">{patientProfile.coordinator}</h3>
              <p className="text-sm text-slate-300">En ligne · répond en 5 minutes</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-400">
                <AppIcon name="messages-square" size={16} />
                Écrire un message sécurisé…
                <span className="ml-auto grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-white">
                  <AppIcon name="send" size={14} />
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="subtle" icon="phone">Appeler</Button>
                <Button variant="subtle" icon="video">Visio</Button>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-lg font-bold text-ink">Suivi de prise en charge</h3>
            <div className="space-y-4">
              {[
                ["Demande reçue", true],
                ["Clinique assignée", true],
                ["Dossier transmis", true],
                ["Soins programmés", false],
              ].map(([label, done], index) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-2xl ${done ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                    <AppIcon name={done ? "check" : "heart-pulse"} size={16} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{label}</p>
                    {index === 2 ? <p className="text-xs text-slate-400">En cours de validation clinique</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-lg font-bold text-ink">Documents récents</h3>
            <div className="space-y-2">
              {patientDocuments.map(([label, meta]) => (
                <button
                  key={label}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <AppIcon name="file-text" size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{label}</span>
                    <span className="block text-xs text-slate-400">{meta}</span>
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MedicalPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Dossier médical"
        subtitle="Vos informations de santé, chiffrées et partagées uniquement avec votre accord."
      >
        <Badge tone="teal" icon="lock-keyhole">Chiffré de bout en bout</Badge>
      </PageHeader>
      <div className="page-grid">
        <Card className="space-y-5 p-5 sm:p-6">
          <div>
            <h3 className="text-lg font-bold text-ink">Informations médicales</h3>
            <p className="mt-1 text-sm text-slate-500">
              Données structurées pour faciliter la coordination avec la clinique et le praticien.
            </p>
          </div>
          <InfoList
            items={[
              ["Groupe sanguin", patientProfile.blood],
              ["Médecin traitant", "Dr. Philippe Moreau — Lyon"],
              ["Allergies", "Pénicilline, arachides"],
              ["Traitement principal", "Metformine 1000 mg · matin et soir"],
            ]}
          />
          <Field label="Antécédents médicaux">
            <textarea
              rows={6}
              className={`${inputClassName} h-auto resize-none py-3`}
              defaultValue="Diabète de type 2 diagnostiqué en 2009. Hypertension artérielle traitée. Pose d'un stent coronarien en 2019. Épisodes d'hypoglycémie matinale signalés depuis avril 2026."
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" icon="book-open">Ajouter un document</Button>
            <Button variant="teal" icon="check-check">Enregistrer le dossier</Button>
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="mb-3 text-lg font-bold text-ink">Completude du dossier</h3>
            <div className="rounded-full bg-slate-100">
              <div className="h-3 w-[88%] rounded-full bg-gradient-to-r from-brand-600 to-teal-500" />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Ajoutez votre carte d'assurance pour atteindre 100%.
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="mb-4 text-lg font-bold text-ink">Documents et examens</h3>
            <div className="space-y-3">
              {patientDocuments.map(([label, meta]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-600">
                    <AppIcon name="file-check-2" size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{label}</span>
                    <span className="block text-xs text-slate-400">{meta}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TravelPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Plans de voyage"
        subtitle="Construisez votre itinéraire et préparez la coordination médicale à chaque étape."
      >
        <Button variant="ghost" icon="route">Exporter</Button>
        <Button variant="primary" icon="check-check">Valider l'itinéraire</Button>
      </PageHeader>
      <div className="metric-grid xl:grid-cols-3">
        <StatCard icon="map-pin" label="Étapes" value={`${patientTrip.stops.length}`} sub="villes au Maroc" />
        <StatCard icon="calendar-days" tone="teal" label="Durée totale" value="13 nuits" sub="sur place" />
        <StatCard icon="building2" tone="amber" label="Cliniques identifiées" value="2" sub="sur le trajet" />
      </div>
      <div className="page-grid">
        <Card className="p-5 sm:p-6">
          <h3 className="mb-5 text-lg font-bold text-ink">Votre itinéraire</h3>
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Départ</p>
              <p className="mt-1 font-display text-xl font-bold text-ink">{patientTrip.departure}</p>
            </div>
            {patientTrip.stops.map((stop, index) => (
              <div key={stop.city} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-ink">{stop.city}</p>
                    <p className="text-sm text-slate-500">
                      Arrivée le {stop.arrival} · {stop.nights} nuits
                    </p>
                    <div className="mt-3 rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
                      Clinique pressentie : {stop.clinic}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4 p-5">
          <h3 className="text-lg font-bold text-ink">Ajouter une étape</h3>
          <Field label="Ville">
            <select className={inputClassName} defaultValue="Casablanca">
              {["Casablanca", "Rabat", "Agadir", "Fès", "Tanger"].map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Arrivée">
              <input type="date" className={inputClassName} defaultValue="2026-07-08" />
            </Field>
            <Field label="Nuits">
              <input type="number" className={inputClassName} defaultValue="2" />
            </Field>
          </div>
          <Button variant="primary" icon="plus" className="w-full">
            Ajouter l'étape
          </Button>
        </Card>
      </div>
    </div>
  );
}

function AppointmentsPage() {
  const [tab, setTab] = useState("avenir");
  const groups = {
    avenir: patientAppointments.filter((item) => item.status !== "terminé"),
    passes: patientAppointments.filter((item) => item.status === "terminé"),
  };
  return (
    <div className="space-y-5">
      <PageHeader title="Rendez-vous" subtitle="Consultations, examens et téléconsultations coordonnés par Trivacare.">
        <Button variant="primary" icon="plus">Demander un rendez-vous</Button>
      </PageHeader>
      <div className="inline-flex rounded-2xl bg-slate-100 p-1">
        {[
          ["avenir", "À venir"],
          ["passes", "Passés"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === id ? "bg-white text-brand-700 shadow-soft" : "text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {groups[tab].map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                <p className="text-sm text-slate-500">
                  {item.doctor} · {item.specialty}
                </p>
              </div>
              <Badge tone={item.status === "confirmé" ? "teal" : item.status === "en attente" ? "amber" : "slate"}>
                {item.status}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{item.date}</div>
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{item.time}</div>
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 sm:col-span-2">{item.clinic}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BillingPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Facturation et paiements" subtitle="Suivez vos paiements et validez les devis d'intervention.">
        <Button variant="ghost" icon="receipt-text">Télécharger le relevé</Button>
      </PageHeader>
      <div className="metric-grid xl:grid-cols-3">
        <StatCard icon="check-check" tone="teal" label="Total réglé" value="1 020 MAD" sub="2 factures payées" />
        <StatCard icon="hand-coins" tone="amber" label="En attente" value="350 MAD" sub="échéance 25 juin" />
        <StatCard icon="file-check-2" label="Devis à approuver" value="1 200 MAD" sub="1 intervention" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {[
          ["Consultation cardiologique", "600 MAD", "Payée"],
          ["Bilan sanguin — Atlas Bio", "420 MAD", "Payée"],
          ["Holter tensionnel 24 h", "1 200 MAD", "À approuver"],
        ].map(([label, amount, status]) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink">{label}</h3>
                <p className="text-sm text-slate-500">Juin 2026 · coordination Trivacare</p>
              </div>
              <Badge tone={status === "Payée" ? "green" : "amber"}>{status}</Badge>
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-ink">{amount}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="ghost">Détail</Button>
              {status !== "Payée" ? <Button variant="teal">Approuver</Button> : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SecurityPage() {
  const [twoFa, setTwoFa] = useState(true);
  return (
    <div className="space-y-5">
      <PageHeader title="Sécurité" subtitle="Protégez l'accès à votre dossier médical.">
        <Badge tone="green" icon="shield-check">Compte sécurisé</Badge>
      </PageHeader>
      <div className="page-grid">
        <Card className="space-y-4 p-5 sm:p-6">
          <h3 className="text-lg font-bold text-ink">Mot de passe</h3>
          <Field label="Mot de passe actuel">
            <input type="password" className={inputClassName} defaultValue="123456789" />
          </Field>
          <Field label="Nouveau mot de passe" hint="12 caractères minimum, avec chiffres et symboles.">
            <input type="password" className={inputClassName} />
          </Field>
          <Field label="Confirmation">
            <input type="password" className={inputClassName} />
          </Field>
          <Button variant="teal">Mettre à jour</Button>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink">Double authentification</h3>
                <p className="text-sm text-slate-500">Vérification supplémentaire sur nouvel appareil.</p>
              </div>
              <Toggle on={twoFa} onClick={() => setTwoFa((value) => !value)} label="Activer 2FA" />
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-4 text-lg font-bold text-ink">Appareils connectés</h3>
            <div className="space-y-3">
              {[
                "iPhone 14 · Safari · Marrakech",
                "MacBook Pro · Chrome · Lyon",
                "iPad · Application · Lyon",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-500">
                    <AppIcon name={index === 1 ? "monitor" : "smartphone"} size={18} />
                  </span>
                  <span className="flex-1 text-sm font-semibold text-ink">{item}</span>
                  {index === 0 ? <Badge tone="teal">Cet appareil</Badge> : <Button variant="ghost">Déconnecter</Button>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AccountPage() {
  const [notif, setNotif] = useState({
    rdv: true,
    docs: true,
    billing: false,
    sos: true,
  });
  return (
    <div className="space-y-5">
      <PageHeader title="Mon compte" subtitle="Vos informations personnelles et préférences.">
        <Button variant="primary" icon="check-check">Enregistrer</Button>
      </PageHeader>
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-display text-2xl font-bold text-white">
            {patientProfile.initials}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-ink">{patientProfile.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="blue">{patientProfile.profile}</Badge>
              <Badge tone="rose">{patientProfile.blood}</Badge>
              <Badge tone="slate">Marrakech</Badge>
            </div>
          </div>
        </div>
      </Card>
      <div className="page-grid">
        <Card className="space-y-4 p-5 sm:p-6">
          <h3 className="text-lg font-bold text-ink">Informations personnelles</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom"><input className={inputClassName} defaultValue="Amine" /></Field>
            <Field label="Nom"><input className={inputClassName} defaultValue="El Fassi" /></Field>
            <Field label="E-mail" className="sm:col-span-2"><input className={inputClassName} defaultValue={patientProfile.email} /></Field>
            <Field label="Téléphone"><input className={inputClassName} defaultValue={patientProfile.phone} /></Field>
            <Field label="Date de naissance"><input className={inputClassName} defaultValue={patientProfile.dob} /></Field>
          </div>
        </Card>
        <Card className="space-y-4 p-5 sm:p-6">
          <h3 className="text-lg font-bold text-ink">Préférences et alertes</h3>
          {[
            ["rdv", "Rappels de rendez-vous"],
            ["docs", "Nouveaux documents"],
            ["billing", "Factures et devis"],
            ["sos", "Alertes de sécurité"],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <Toggle
                on={notif[key]}
                onClick={() => setNotif((state) => ({ ...state, [key]: !state[key] }))}
                label={label}
              />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function HelpPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Aide" subtitle="Prenez en main Trivacare et trouvez des réponses rapides." />
      <div className="page-grid">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-ink to-brand-950 p-6 text-white">
              <h3 className="text-2xl font-extrabold">Visite guidée de l'application</h3>
              <p className="mt-2 text-sm text-slate-300">
                Découvrez le dossier médical, les voyages, les rendez-vous, la facturation et la sécurité.
              </p>
            </div>
            <div className="p-5">
              <Button icon="book-open">Démarrer la visite</Button>
            </div>
          </Card>
          <Card className="p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-ink">Questions fréquentes</h3>
            <div className="space-y-4">
              {[
                ["Comment Trivacare protège mes données médicales ?", "Vos données sont chiffrées et transmises uniquement avec votre accord explicite."],
                ["Puis-je utiliser Trivacare dans plusieurs villes ?", "Oui, chaque étape peut être préparée avec une clinique partenaire différente."],
                ["Comment fonctionne le SOS ?", "Votre position est transmise à la coordination médicale qui vous rappelle immédiatement."],
              ].map(([question, answer]) => (
                <div key={question} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-ink">{question}</p>
                  <p className="mt-2 text-sm text-slate-500">{answer}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="text-lg font-bold text-ink">Besoin d'aide humaine ?</h3>
            <p className="mt-2 text-sm text-slate-500">
              Votre coordinatrice reste disponible pour répondre aux questions liées au séjour médical.
            </p>
            <div className="mt-4 grid gap-2">
              <Button icon="messages-square">Discuter maintenant</Button>
              <Button variant="ghost" icon="phone">+212 5 24 00 11 22</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const PATIENT_PAGES = {
  "tableau-de-bord": PatientDashboard,
  "dossier-medical": MedicalPage,
  "plans-de-voyage": TravelPage,
  "rendez-vous": AppointmentsPage,
  facturation: BillingPage,
  securite: SecurityPage,
  compte: AccountPage,
  aide: HelpPage,
};

export function PatientApp() {
  const { page = "tableau-de-bord" } = useParams();
  const [sosOpen, setSosOpen] = useState(false);
  const CurrentPage = useMemo(
    () => PATIENT_PAGES[page] || PatientDashboard,
    [page],
  );

  if (!PATIENT_PAGES[page]) {
    return <Navigate to="/patient/tableau-de-bord" replace />;
  }

  return (
    <>
      <AppShell
        area="Patient"
        badge="Espace patient"
        navItems={patientNav}
        current={page}
        onSOS={() => setSosOpen(true)}
        user={patientProfile}
        searchPlaceholder="Rechercher un document, un rendez-vous, un voyage…"
        persona="patient"
        profileHref="/patient/compte"
      >
        <CurrentPage />
      </AppShell>
      <SosModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        title="Déclencher le SOS"
        body="Votre position sera transmise à votre coordinatrice et à la clinique la plus proche."
      />
    </>
  );
}
