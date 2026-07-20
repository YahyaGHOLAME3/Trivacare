import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AppIcon } from "../assets/icons/app-icon";
import { patientNav } from "../shared/data/patient";
import { apiRequest, getSession, updateSession } from "../shared/auth";
import { AppShell } from "../shared/ui/shell";
import { Badge, Button, Card, Field, InfoList, PageHeader, PasswordInput, StatCard, Toggle, inputClassName } from "../shared/ui/primitives";
import { SosModal } from "../shared/ui/modals";

function formatName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.email || "Patient";
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";
}

function toDateInputValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function compactPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== ""),
  );
}

const APPOINTMENT_STATUS_LABELS = {
  REQUESTED: "demandé",
  CONFIRMED: "confirmé",
  CANCELLED: "annulé",
  COMPLETED: "terminé",
};

const BLOOD_GROUP_OPTIONS = [
  ["", "Sélectionner"],
  ["O-", "O négatif"],
  ["O+", "O positif"],
  ["A-", "A négatif"],
  ["A+", "A positif"],
  ["B-", "B négatif"],
  ["B+", "B positif"],
  ["AB-", "AB négatif"],
  ["AB+", "AB positif"],
];

const GENDER_OPTIONS = [
  ["", "Sélectionner"],
  ["Homme", "Homme"],
  ["Femme", "Femme"],
  ["Autre", "Autre"],
  ["Préfère ne pas répondre", "Préfère ne pas répondre"],
];

const DEFAULT_NOTIFICATION_PREFERENCES = {
  rdv: true,
  docs: true,
  billing: false,
  sos: true,
};

function normalizeNotificationPreferences(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...Object.fromEntries(
      Object.entries(value).filter(([, setting]) => typeof setting === "boolean"),
    ),
  };
}

function formatDateTime(value) {
  if (!value) {
    return {
      date: "Date à confirmer",
      time: "Heure à confirmer",
      day: "-",
      soon: "À planifier",
    };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      date: "Date à confirmer",
      time: "Heure à confirmer",
      day: "-",
      soon: "À planifier",
    };
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfAppointment = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.ceil((startOfAppointment - startOfToday) / 86400000);

  return {
    date: new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
    day: new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(date),
    soon: diffDays > 0 ? `Dans ${diffDays} jour${diffDays > 1 ? "s" : ""}` : diffDays === 0 ? "Aujourd'hui" : "Passé",
  };
}

function formatDate(value) {
  if (!value) return "Date inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTodayLabel() {
  const today = new Date();

  return `Aujourd'hui · ${new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(today)}`;
}

function formatCurrencyFromCents(amount, currency = "MAD") {
  const value = Number.isFinite(amount) ? amount / 100 : 0;

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function sumGroupedAmounts(groups = [], statuses = []) {
  return groups
    .filter((item) => !statuses.length || statuses.includes(item.status))
    .reduce((total, item) => total + (item?._sum?.amount || 0), 0);
}

function normalizeDocument(item) {
  return {
    id: item.id,
    label: item.fileName || item.documentType || "Document médical",
    meta: `${item.documentType || "Document"} · ${formatDate(item.createdAt)}`,
  };
}

function normalizeTrip(item) {
  return {
    ...item,
    displayDate: item.startDate ? formatDate(item.startDate) : "Date à confirmer",
    displayEndDate: item.endDate ? formatDate(item.endDate) : "Fin à confirmer",
    stops: Array.isArray(item.stops) ? item.stops : [],
  };
}

function normalizeSessionItem(item) {
  const label = item.device?.label || item.userAgent || "Session enregistrée";
  const isDesktop = item.device?.deviceType === "desktop";

  return {
    ...item,
    label,
    icon: isDesktop ? "monitor" : "smartphone",
    lastSeen: item.lastSeenAt ? formatDate(item.lastSeenAt) : "Activité inconnue",
  };
}

function normalizeThread(item) {
  const lastMessage = Array.isArray(item.messages) ? item.messages[0] : null;

  return {
    ...item,
    lastMessage,
    lastBody: lastMessage?.body || "Aucun message pour l'instant.",
    lastSender: formatName(lastMessage?.sender),
  };
}

function normalizeAppointment(item) {
  const professionalName = formatName(item?.professional?.user);
  const clinicName = item?.clinic?.name || "Clinique à confirmer";
  const location = item?.location || item?.clinic?.address || "Lieu à confirmer";
  const timing = formatDateTime(item?.scheduledAt);

  return {
    id: item?.id,
    title: item?.careRequest?.title || "Rendez-vous médical",
    doctor: professionalName === "Patient" ? "Professionnel de santé à assigner" : professionalName,
    specialty: item?.professional?.specialty || "Professionnel de santé",
    date: timing.date,
    time: timing.time,
    day: timing.day,
    clinic: clinicName,
    city: location,
    status: APPOINTMENT_STATUS_LABELS[item?.status] || "demandé",
    statusKey: item?.status || "REQUESTED",
    soon: timing.soon,
    scheduledAt: item?.scheduledAt || "",
  };
}

function getUpcomingAppointments(appointments) {
  return appointments
    .filter((item) => item.statusKey !== "COMPLETED" && item.statusKey !== "CANCELLED")
    .sort((a, b) => new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0));
}

function resolveHealthcareProfessional(careRequests = [], appointments = []) {
  const assignedRequest = careRequests.find((item) => item?.professional?.user);

  if (assignedRequest?.professional?.user) {
    return formatName(assignedRequest.professional.user);
  }

  const assignedAppointment = appointments.find((item) => (
    item?.doctor && item.doctor !== "Professionnel de santé à assigner"
  ));

  return assignedAppointment?.doctor || "Professionnel de santé à assigner";
}

function buildCareRequestSteps(careRequest, appointments) {
  if (!careRequest || careRequest.status === "DRAFT") return [];

  const scheduled = appointments.some((item) => (
    item.statusKey !== "CANCELLED" && item.statusKey !== "COMPLETED"
  ));
  const statusSteps = new Set(["UNDER_REVIEW", "SCHEDULED", "IN_PROGRESS", "COMPLETED"]);
  const steps = [
    {
      label: "Demande reçue",
      detail: careRequest.title || "Demande transmise à Trivacare",
      done: true,
    },
  ];

  if (careRequest.clinic) {
    steps.push({
      label: "Clinique assignée",
      detail: careRequest.clinic.name,
      done: true,
    });
  }

  if (statusSteps.has(careRequest.status)) {
    steps.push({
      label: "Dossier transmis",
      detail: "En cours de validation clinique",
      done: true,
    });
  }

  if (scheduled || ["SCHEDULED", "IN_PROGRESS", "COMPLETED"].includes(careRequest.status)) {
    steps.push({
      label: "Soins programmés",
      detail: scheduled ? "Rendez-vous ajouté à votre agenda" : "Programmation confirmée",
      done: ["SCHEDULED", "IN_PROGRESS", "COMPLETED"].includes(careRequest.status),
    });
  }

  return steps;
}

function getPatientProfileCompletion(session, profile) {
  const user = profile?.user || session?.user || {};
  const fields = [
    user.firstName,
    user.lastName,
    user.phone,
    profile?.dateOfBirth,
    profile?.nationality,
    profile?.bloodType,
    profile?.medicalSummary,
    profile?.emergencyContactPhone,
  ];
  const completed = fields.filter(Boolean).length;

  return Math.round((completed / fields.length) * 100);
}

function buildPatientDisplay(session, profile) {
  const user = profile?.user || session?.user || {};
  const name = formatName(user);
  const completion = getPatientProfileCompletion(session, profile);

  return {
    name,
    initials: getInitials(name),
    meta: profile?.address || profile?.nationality || "",
    profile: profile?.medicalSummary || "",
    email: user.email || "",
    phone: user.phone || "",
    dob: toDateInputValue(profile?.dateOfBirth),
    nationality: profile?.nationality || "",
    insurer: profile?.insurer || "",
    blood: profile?.bloodType || "",
    coordinator: profile?.primaryCoordinator || "Professionnel de santé à assigner",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    address: profile?.address || "",
    gender: profile?.gender || "",
    emergencyContactPhone: profile?.emergencyContactPhone || "",
    completion,
  };
}

function isPatientProfileIncomplete(session, profile) {
  return getPatientProfileCompletion(session, profile) < 100;
}

function PatientDashboard({
  patient,
  dashboard,
  documents = [],
  trips = [],
  billingSummary,
  appointments = [],
  appointmentsStatus = "idle",
  careRequests = [],
  onboarding = false,
}) {
  const upcomingAppointments = getUpcomingAppointments(appointments);
  const next = upcomingAppointments[0];
  const activeTrip = dashboard?.activeTrip || trips.find((item) => ["DRAFT", "ACTIVE"].includes(item.status)) || null;
  const pendingQuoteAmount = sumGroupedAmounts(
    billingSummary?.quotes || dashboard?.billing?.quotes || [],
    ["SENT", "APPROVED"],
  );
  const pendingInvoiceAmount = sumGroupedAmounts(
    billingSummary?.invoices || dashboard?.billing?.invoices || [],
    ["ISSUED", "OVERDUE"],
  );
  const amountDue = pendingQuoteAmount + pendingInvoiceAmount;
  const activeCareRequest = careRequests.find((item) => item.status !== "CANCELLED")
    || careRequests[0]
    || null;
  const careRequestSteps = buildCareRequestSteps(activeCareRequest, appointments);
  const healthcareProfessional = resolveHealthcareProfessional(careRequests, appointments);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Bonjour, ${patient.name.split(" ")[0]}`}
        subtitle={formatTodayLabel()}
      >
        <Button variant="ghost" icon="calendar-days">Mes rendez-vous</Button>
        <Button variant="primary" icon="plus">Nouveau voyage</Button>
      </PageHeader>

      <div className="metric-grid">
        <StatCard
          icon="calendar-check"
          tone="blue"
          label="Prochain rendez-vous"
          value={next ? next.soon : "Aucun"}
          sub={next ? `${next.date} · ${next.time}` : "Aucun rendez-vous programmé"}
        />
        <StatCard
          icon="folder-heart"
          tone="teal"
          label="Dossier médical"
          value={`${patient.completion}%`}
          sub={patient.completion === 100 ? "complété" : "à compléter"}
        />
        <StatCard
          icon="map-pin"
          tone="amber"
          label="Séjour en cours"
          value={activeTrip?.destination || activeTrip?.title || "Aucun"}
          sub={activeTrip ? `${activeTrip.status?.toLowerCase() || "actif"} · ${activeTrip.stops?.length || 0} étape(s)` : "Aucun séjour actif"}
        />
        <StatCard
          icon="wallet"
          tone="rose"
          label="À régler"
          value={formatCurrencyFromCents(amountDue)}
          sub={amountDue > 0 ? "D'après vos devis et factures" : "Aucun devis ou facture en attente"}
        />
      </div>

      <div className="page-grid">
        <div className="space-y-5">
          {next ? (
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
                    ["map-pin", next.city],
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
                <Button variant="ghost" icon="messages-square">Message coordination</Button>
                <Button variant="ghost" icon="navigation">Itinéraire</Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <Badge tone="slate" icon="calendar-check">Aucun rendez-vous</Badge>
              <h2 className="mt-4 text-2xl font-extrabold text-ink">Votre agenda est libre</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Les prochains rendez-vous apparaîtront ici dès qu'une clinique ou un professionnel les aura programmés.
              </p>
              {appointmentsStatus === "error" ? (
                <p className="mt-3 text-sm font-semibold text-amber-700">
                  Impossible de charger les rendez-vous pour le moment.
                </p>
              ) : null}
            </Card>
          )}

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-ink">Prochains rendez-vous</h3>
              <Button variant="ghost" className="min-h-9 px-3" iconEnd="chevron-right">Tout voir</Button>
            </div>
            {upcomingAppointments.length ? (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 2).map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-center shadow-soft">
                    <span className="font-display text-base font-extrabold text-brand-700">
                      {item.day}
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
            ) : (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                Aucun rendez-vous à venir.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-ink to-brand-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">
                Coordination santé
              </p>
              <h3 className="mt-2 text-xl font-bold">{healthcareProfessional}</h3>
              <p className="text-sm text-slate-300">Messagerie sécurisée du dossier patient</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-400">
                <AppIcon name="messages-square" size={16} />
                Écrire à la coordination santé…
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

          {careRequestSteps.length ? (
            <Card className="p-5">
              <h3 className="mb-4 text-lg font-bold text-ink">Suivi de prise en charge</h3>
              <div className="space-y-4">
                {careRequestSteps.map((step) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-2xl ${step.done ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                      <AppIcon name={step.done ? "check" : "heart-pulse"} size={16} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{step.label}</p>
                      {step.detail ? <p className="text-xs text-slate-400">{step.detail}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          <Card className="p-5">
            <h3 className="mb-4 text-lg font-bold text-ink">Documents récents</h3>
            {!documents.length ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                Aucun document ajouté à ce dossier patient.
              </p>
            ) : (
              <div className="space-y-2">
                {documents.slice(0, 3).map(({ id, label, meta }) => (
                  <button
                    key={id}
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
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function MedicalPage({
  patient,
  profile,
  session,
  documents = [],
  documentsStatus = "idle",
  onProfileSaved,
}) {
  const [medicalSummary, setMedicalSummary] = useState(patient.profile);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setMedicalSummary(patient.profile);
  }, [patient.profile]);

  const saveMedicalSummary = async () => {
    setSaveStatus("saving");
    setSaveError("");

    try {
      const payload = await apiRequest("/patients/me/profile", {
        method: "PUT",
        token: session.accessToken,
        body: {
          medicalSummary,
        },
      });

      onProfileSaved(payload.data, session);
      setSaveStatus("saved");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Impossible d'enregistrer le dossier.");
      setSaveStatus("error");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dossier médical"
        subtitle="Vos informations de santé, chiffrées et partagées uniquement avec votre accord."
      />
      <div className="page-grid">
        <Card className="space-y-5 p-5 sm:p-6">
          <div>
            <h3 className="text-lg font-bold text-ink">Informations médicales</h3>
            <p className="mt-1 text-sm text-slate-500">
              Données structurées pour faciliter le suivi avec la clinique et le praticien.
            </p>
          </div>
          <InfoList
            items={[
              ["Groupe sanguin", patient.blood || "À renseigner"],
              ["Nationalité", patient.nationality || "À renseigner"],
              ["Assurance", patient.insurer || "À renseigner"],
              ["Résumé médical", patient.profile || "À renseigner"],
            ]}
          />
          <Field label="Antécédents médicaux">
            <textarea
              rows={6}
              className={`${inputClassName} h-auto resize-none py-3`}
              value={medicalSummary}
              onChange={(event) => setMedicalSummary(event.target.value)}
            />
          </Field>
          {saveError ? (
            <p className="text-sm font-semibold text-rose-700">{saveError}</p>
          ) : null}
          {saveStatus === "saved" ? (
            <p className="text-sm font-semibold text-teal-700">Dossier médical enregistré.</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" icon="book-open">Ajouter un document</Button>
            <Button
              variant="teal"
              icon="check-check"
              type="button"
              onClick={saveMedicalSummary}
            >
              {saveStatus === "saving" ? "Enregistrement…" : "Enregistrer le dossier"}
            </Button>
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            {patient.completion === 100 ? (
              <>
                <Badge tone="teal" icon="check-check">Dossier complété</Badge>
                <h3 className="mt-4 text-lg font-bold text-ink">Dossier patient complété</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Votre dossier patient a été complété avec succès.
                </p>
              </>
            ) : (
              <>
                <h3 className="mb-3 text-lg font-bold text-ink">Complétude du dossier</h3>
                <div className="rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-brand-600 to-teal-500"
                    style={{ width: `${patient.completion}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Complétez votre profil à votre rythme depuis Mon compte.
                </p>
              </>
            )}
          </Card>
          <Card className="p-5">
            <h3 className="mb-4 text-lg font-bold text-ink">Documents et examens</h3>
            {!documents.length ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                {documentsStatus === "error"
                  ? "Les documents n'ont pas pu être chargés pour le moment."
                  : "Aucun document médical n'est encore associé à votre compte."}
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map(({ id, label, meta }) => (
                  <div key={id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
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
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function TravelPage({ trips = [], tripsStatus = "idle" }) {
  if (!trips.length) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Plans de voyage"
          subtitle="Vos itinéraires médicaux apparaîtront ici lorsqu'ils seront créés pour votre dossier."
        >
          <Button variant="primary" icon="plus">Créer un plan</Button>
        </PageHeader>
        <Card className="p-6">
          <Badge tone="slate" icon="route">Aucun plan</Badge>
          <h3 className="mt-4 text-xl font-extrabold text-ink">Aucun voyage médical associé</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {tripsStatus === "error"
              ? "Les plans de voyage n'ont pas pu être chargés pour le moment."
              : "Ce compte patient est indépendant. Aucun itinéraire ou séjour n'est partagé depuis un autre patient."}
          </p>
        </Card>
      </div>
    );
  }

  const activeTrip = trips[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Plans de voyage"
        subtitle="Construisez votre itinéraire et préparez le suivi médical à chaque étape."
      >
        <Button variant="ghost" icon="route">Exporter</Button>
        <Button variant="primary" icon="check-check">Valider l'itinéraire</Button>
      </PageHeader>
      <div className="metric-grid xl:grid-cols-3">
        <StatCard icon="map-pin" label="Étapes" value={`${activeTrip.stops.length}`} sub={activeTrip.destination || "destination à confirmer"} />
        <StatCard icon="calendar-days" tone="teal" label="Début" value={activeTrip.displayDate} sub={activeTrip.displayEndDate} />
        <StatCard icon="building2" tone="amber" label="Statut" value={activeTrip.status || "DRAFT"} sub="persisté dans le dossier" />
      </div>
      <div className="page-grid">
        <Card className="p-5 sm:p-6">
          <h3 className="mb-5 text-lg font-bold text-ink">Votre itinéraire</h3>
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Plan</p>
              <p className="mt-1 font-display text-xl font-bold text-ink">{activeTrip.title}</p>
            </div>
            {activeTrip.stops.map((stop, index) => (
              <div key={stop.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-ink">{stop.title}</p>
                    <p className="text-sm text-slate-500">
                      {stop.stopDate ? formatDate(stop.stopDate) : "Date à confirmer"} · {stop.location || "Lieu à confirmer"}
                    </p>
                    {stop.clinic?.name ? (
                      <div className="mt-3 rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
                        Clinique : {stop.clinic.name}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4 p-5">
          <h3 className="text-lg font-bold text-ink">Ajouter une étape</h3>
          <Field label="Ville">
            <select className={inputClassName} defaultValue="">
              <option value="">Sélectionner une ville</option>
              {["Casablanca", "Rabat", "Agadir", "Fès", "Tanger"].map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Arrivée">
              <input type="date" className={inputClassName} />
            </Field>
            <Field label="Nuits">
              <input type="number" className={inputClassName} min="1" />
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

function AppointmentsPage({ appointments = [], appointmentsStatus = "idle" }) {
  const [tab, setTab] = useState("avenir");
  const groups = {
    avenir: getUpcomingAppointments(appointments),
    passes: appointments.filter((item) => item.statusKey === "COMPLETED" || item.statusKey === "CANCELLED"),
  };
  const currentItems = groups[tab];

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
      {currentItems.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {currentItems.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                  <p className="text-sm text-slate-500">
                    {item.doctor} · {item.specialty}
                  </p>
                </div>
                <Badge tone={item.status === "confirmé" ? "teal" : item.status === "demandé" ? "amber" : "slate"}>
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
      ) : (
        <Card className="p-6">
          <Badge tone="slate" icon="calendar-check">Aucun rendez-vous</Badge>
          <h3 className="mt-4 text-xl font-extrabold text-ink">
            {tab === "avenir" ? "Aucun rendez-vous à venir" : "Aucun historique de rendez-vous"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {appointmentsStatus === "error"
              ? "Les rendez-vous n'ont pas pu être chargés pour le moment."
              : "Les rendez-vous créés pour ce dossier patient apparaîtront ici."}
          </p>
        </Card>
      )}
    </div>
  );
}

function BillingPage({
  billingSummary,
  quotes = [],
  invoices = [],
  billingStatus = "idle",
}) {
  const totalPaid = sumGroupedAmounts(billingSummary?.invoices || [], ["PAID"]);
  const pendingInvoices = sumGroupedAmounts(billingSummary?.invoices || [], ["ISSUED", "OVERDUE"]);
  const pendingQuotes = sumGroupedAmounts(billingSummary?.quotes || [], ["SENT"]);
  const billingItems = [
    ...quotes.map((quote) => ({
      id: `quote-${quote.id}`,
      label: quote.title,
      amount: quote.amount,
      currency: quote.currency,
      status: quote.status,
      meta: quote.clinic?.name || "Devis",
      type: "quote",
    })),
    ...invoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      label: invoice.number,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      meta: invoice.clinic?.name || "Facture",
      type: "invoice",
    })),
  ];

  if (!billingItems.length) {
    return (
      <div className="space-y-5">
        <PageHeader title="Facturation et paiements" subtitle="Vos factures, devis et paiements personnels." />
        <div className="metric-grid xl:grid-cols-3">
          <StatCard icon="check-check" tone="teal" label="Total réglé" value={formatCurrencyFromCents(totalPaid)} sub="factures payées" />
          <StatCard icon="hand-coins" tone="amber" label="En attente" value={formatCurrencyFromCents(pendingInvoices)} sub="factures ouvertes" />
          <StatCard icon="file-check-2" label="Devis à approuver" value={formatCurrencyFromCents(pendingQuotes)} sub="devis ouverts" />
        </div>
        <Card className="p-6">
          <Badge tone="slate" icon="receipt-text">Aucune facturation</Badge>
          <h3 className="mt-4 text-xl font-extrabold text-ink">Aucun élément de facturation</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {billingStatus === "error"
              ? "La facturation n'a pas pu être chargée pour le moment."
              : "Les factures et devis créés pour ce patient apparaîtront ici uniquement."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Facturation et paiements" subtitle="Suivez vos paiements et validez les devis d'intervention.">
        <Button variant="ghost" icon="receipt-text">Télécharger le relevé</Button>
      </PageHeader>
      <div className="metric-grid xl:grid-cols-3">
        <StatCard icon="check-check" tone="teal" label="Total réglé" value={formatCurrencyFromCents(totalPaid)} sub="factures payées" />
        <StatCard icon="hand-coins" tone="amber" label="En attente" value={formatCurrencyFromCents(pendingInvoices)} sub="factures ouvertes" />
        <StatCard icon="file-check-2" label="Devis à approuver" value={formatCurrencyFromCents(pendingQuotes)} sub="devis ouverts" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {billingItems.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink">{item.label}</h3>
                <p className="text-sm text-slate-500">{item.meta}</p>
              </div>
              <Badge tone={item.status === "PAID" ? "green" : "amber"}>{item.status}</Badge>
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-ink">
              {formatCurrencyFromCents(item.amount, item.currency)}
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="ghost">Détail</Button>
              {item.type === "quote" && item.status === "SENT" ? <Button variant="teal">Approuver</Button> : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SecurityPage({
  session,
  sessions = [],
  sessionsStatus = "idle",
  onSessionsChanged,
}) {
  const [twoFa, setTwoFa] = useState(false);
  const [revokeStatus, setRevokeStatus] = useState("idle");

  const revokeSession = async (sessionId) => {
    setRevokeStatus("saving");

    try {
      await apiRequest(`/security/sessions/${sessionId}`, {
        method: "DELETE",
        token: session.accessToken,
        body: {},
      });
      onSessionsChanged(sessions.filter((item) => item.id !== sessionId));
      setRevokeStatus("saved");
    } catch {
      setRevokeStatus("error");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Sécurité" subtitle="Protégez l'accès à votre dossier médical.">
        <Badge tone="green" icon="shield-check">Compte sécurisé</Badge>
      </PageHeader>
      <div className="page-grid">
        <Card className="space-y-4 p-5 sm:p-6">
          <h3 className="text-lg font-bold text-ink">Mot de passe</h3>
          <Field label="Mot de passe actuel">
            <PasswordInput autoComplete="current-password" />
          </Field>
          <Field label="Nouveau mot de passe" hint="12 caractères minimum, avec chiffres et symboles.">
            <PasswordInput autoComplete="new-password" />
          </Field>
          <Field label="Confirmation">
            <PasswordInput autoComplete="new-password" />
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
            {revokeStatus === "error" ? (
              <p className="mb-3 text-sm font-semibold text-rose-700">Impossible de déconnecter cette session.</p>
            ) : null}
            {!sessions.length ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                {sessionsStatus === "error"
                  ? "Les sessions n'ont pas pu être chargées pour le moment."
                  : "Aucun appareil actif enregistré."}
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-500">
                    <AppIcon name={item.icon} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{item.label}</span>
                    <span className="block text-xs text-slate-400">Dernière activité : {item.lastSeen}</span>
                  </span>
                  {item.isCurrent ? (
                    <Badge tone="teal">Cet appareil</Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => revokeSession(item.id)}
                      disabled={revokeStatus === "saving"}
                    >
                      Déconnecter
                    </Button>
                  )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function MessagesPage({
  session,
  profile,
  threads = [],
  threadsStatus = "idle",
  onThreadsChanged,
}) {
  const [selectedThreadId, setSelectedThreadId] = useState(() => threads[0]?.id || "");
  const [messages, setMessages] = useState([]);
  const [messagesStatus, setMessagesStatus] = useState("idle");
  const [draft, setDraft] = useState("");
  const [actionStatus, setActionStatus] = useState("idle");

  useEffect(() => {
    if (!threads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(threads[0]?.id || "");
    }
  }, [threads, selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      return undefined;
    }

    let cancelled = false;
    setMessagesStatus("loading");

    apiRequest(`/threads/${selectedThreadId}/messages`, {
      token: session.accessToken,
    })
      .then((payload) => {
        if (cancelled) return;
        setMessages(Array.isArray(payload.data) ? payload.data : []);
        setMessagesStatus("ready");
        void apiRequest(`/threads/${selectedThreadId}/read`, {
          method: "POST",
          token: session.accessToken,
          body: {},
        }).catch(() => undefined);
      })
      .catch(() => {
        if (cancelled) return;
        setMessages([]);
        setMessagesStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [selectedThreadId, session.accessToken]);

  const refreshThreads = async () => {
    const payload = await apiRequest("/threads", {
      token: session.accessToken,
    });
    onThreadsChanged(Array.isArray(payload.data) ? payload.data.map(normalizeThread) : []);
  };

  const startThread = async () => {
    setActionStatus("saving");

    try {
      const payload = await apiRequest("/threads", {
        method: "POST",
        token: session.accessToken,
        body: {
          anchorType: "PATIENT_CASE",
          anchorId: profile.id,
          subject: "Coordination santé",
          initialMessage: draft.trim() || "Bonjour, je souhaite échanger avec la coordination santé.",
        },
      });
      await refreshThreads();
      setSelectedThreadId(payload.data.id);
      setDraft("");
      setActionStatus("saved");
    } catch {
      setActionStatus("error");
    }
  };

  const sendMessage = async () => {
    if (!draft.trim()) return;
    setActionStatus("saving");

    try {
      if (!selectedThreadId) {
        await startThread();
        return;
      }

      const payload = await apiRequest(`/threads/${selectedThreadId}/messages`, {
        method: "POST",
        token: session.accessToken,
        body: {
          body: draft.trim(),
        },
      });
      setMessages((current) => [...current, payload.data]);
      await refreshThreads();
      setDraft("");
      setActionStatus("saved");
    } catch {
      setActionStatus("error");
    }
  };

  const selectedThread = threads.find((thread) => thread.id === selectedThreadId);

  return (
    <div className="space-y-5">
      <PageHeader title="Messages" subtitle="Échanges sécurisés avec votre coordinateur santé.">
        <Button variant="primary" icon="plus" type="button" onClick={startThread}>
          Nouveau fil
        </Button>
      </PageHeader>
      {actionStatus === "error" ? (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 shadow-none">
          Impossible de synchroniser la messagerie pour le moment.
        </Card>
      ) : null}
      <div className="page-grid">
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Conversations</h3>
          {!threads.length ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
              {threadsStatus === "error"
                ? "Les conversations n'ont pas pu être chargées."
                : "Aucune conversation patient n'est encore ouverte."}
            </p>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition-colors ${thread.id === selectedThreadId ? "border-brand-200 bg-brand-50" : "border-slate-100 bg-slate-50 hover:bg-white"}`}
                >
                  <span className="block text-sm font-bold text-ink">{thread.subject}</span>
                  <span className="mt-1 block truncate text-xs text-slate-500">{thread.lastBody}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
        <Card className="flex min-h-[480px] flex-col p-5">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-ink">{selectedThread?.subject || "Coordination santé"}</h3>
            <p className="text-sm text-slate-500">Messages persistés dans votre dossier patient.</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3">
            {!messages.length ? (
              <p className="rounded-2xl bg-white p-4 text-sm font-medium text-slate-500">
                {messagesStatus === "error"
                  ? "Les messages n'ont pas pu être chargés."
                  : "Aucun message dans ce fil."}
              </p>
            ) : (
              messages.map((message) => {
                const mine = message.senderId === session.user.id;

                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${mine ? "bg-brand-600 text-white" : "bg-white text-ink"}`}>
                      <p className="font-semibold">{mine ? "Vous" : formatName(message.sender)}</p>
                      <p className="mt-1 leading-6">{message.body}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              className={inputClassName}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Écrire à votre coordinateur santé..."
            />
            <Button
              type="button"
              icon="send"
              onClick={sendMessage}
              disabled={actionStatus === "saving"}
            >
              Envoyer
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AccountPage({
  patient,
  profile,
  session,
  appointments = [],
  careRequests = [],
  onboarding,
  onProfileSaved,
}) {
  const [form, setForm] = useState(() => ({
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    phone: patient.phone,
    dateOfBirth: patient.dob,
    gender: patient.gender,
    address: patient.address,
    nationality: patient.nationality,
    insurer: patient.insurer,
    bloodType: profile?.bloodType || "",
    medicalSummary: profile?.medicalSummary || "",
    primaryCoordinator: profile?.primaryCoordinator || "",
    emergencyContactPhone: patient.emergencyContactPhone,
  }));
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [notif, setNotif] = useState(() => (
    normalizeNotificationPreferences(profile?.notificationPreferences)
  ));
  const [notifStatus, setNotifStatus] = useState("idle");
  const [notifError, setNotifError] = useState("");

  useEffect(() => {
    setForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dob,
      gender: patient.gender,
      address: patient.address,
      nationality: patient.nationality,
      insurer: patient.insurer,
      bloodType: profile?.bloodType || "",
      medicalSummary: profile?.medicalSummary || "",
      primaryCoordinator: profile?.primaryCoordinator || "",
      emergencyContactPhone: patient.emergencyContactPhone,
    });
    setNotif(normalizeNotificationPreferences(profile?.notificationPreferences));
  }, [patient, profile]);

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const persistNotificationPreferences = async (nextPreferences) => {
    setNotifStatus("saving");
    setNotifError("");

    try {
      const payload = await apiRequest("/patients/me/profile", {
        method: "PUT",
        token: session.accessToken,
        body: {
          notificationPreferences: nextPreferences,
        },
      });

      onProfileSaved(payload.data);
      setNotifStatus("saved");
    } catch (error) {
      setNotifError(error instanceof Error ? error.message : "Impossible d'enregistrer les préférences.");
      setNotifStatus("error");
    }
  };

  const toggleNotificationPreference = (key) => {
    setNotif((current) => {
      const next = { ...current, [key]: !current[key] };
      void persistNotificationPreferences(next);
      return next;
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaveStatus("saving");
    setSaveError("");

    try {
      const [userPayload, profilePayload] = await Promise.all([
        apiRequest("/users/me", {
          method: "PATCH",
          token: session.accessToken,
          body: {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
          },
        }),
        apiRequest("/patients/me/profile", {
          method: "PUT",
          token: session.accessToken,
          body: compactPayload({
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            address: form.address,
            nationality: form.nationality,
            insurer: form.insurer,
            bloodType: form.bloodType,
            medicalSummary: form.medicalSummary,
            emergencyContactPhone: form.emergencyContactPhone,
            notificationPreferences: notif,
          }),
        }),
      ]);

      const updatedSession = updateSession("patient", {
        user: userPayload.data,
      });

      onProfileSaved(profilePayload.data, updatedSession);
      setSaveStatus("saved");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Impossible d'enregistrer le profil.");
      setSaveStatus("error");
    }
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <PageHeader title="Mon compte" subtitle="Vos informations personnelles et préférences.">
        <Button variant="primary" icon="check-check" type="submit">
          {saveStatus === "saving" ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </PageHeader>
      {onboarding ? (
        <Card className="border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-none">
          <p className="text-sm font-bold">Profil patient à compléter</p>
          <p className="mt-1 text-sm">
            Ce compte est nouveau. Renseignez ces informations pour ouvrir le tableau de bord et les autres espaces patient.
          </p>
        </Card>
      ) : null}
      {saveError ? (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 shadow-none">
          {saveError}
        </Card>
      ) : null}
      {saveStatus === "saved" ? (
        <Card className="border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-700 shadow-none">
          Profil patient enregistré.
        </Card>
      ) : null}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-display text-2xl font-bold text-white">
            {patient.initials}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-ink">{patient.name}</h2>
            {onboarding ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="rose" icon="triangle-alert">Profil à compléter</Badge>
              </div>
            ) : null}
          </div>
        </div>
      </Card>
      <div className="page-grid">
        <Card className="space-y-4 p-5 sm:p-6">
          <h3 className="text-lg font-bold text-ink">Informations personnelles</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom"><input className={inputClassName} value={form.firstName} onChange={updateField("firstName")} required /></Field>
            <Field label="Nom"><input className={inputClassName} value={form.lastName} onChange={updateField("lastName")} required /></Field>
            <Field label="E-mail" className="sm:col-span-2"><input className={inputClassName} value={form.email} readOnly /></Field>
            <Field label="Téléphone"><input className={inputClassName} value={form.phone} onChange={updateField("phone")} required /></Field>
            <Field label="Date de naissance"><input type="date" className={inputClassName} value={form.dateOfBirth} onChange={updateField("dateOfBirth")} required /></Field>
            <Field label="Genre">
              <select className={inputClassName} value={form.gender} onChange={updateField("gender")}>
                {GENDER_OPTIONS.map(([value, label]) => (
                  <option key={value || "empty"} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ville / adresse"><input className={inputClassName} value={form.address} onChange={updateField("address")} placeholder="Votre ville ou adresse" /></Field>
            <Field label="Nationalité"><input className={inputClassName} value={form.nationality} onChange={updateField("nationality")} required /></Field>
            <Field label="Assurance" className="sm:col-span-2"><input className={inputClassName} value={form.insurer} onChange={updateField("insurer")} placeholder="Assureur et numéro de police" /></Field>
            <Field label="Groupe sanguin">
              <select
                className={inputClassName}
                value={form.bloodType}
                onChange={updateField("bloodType")}
                required
              >
                {BLOOD_GROUP_OPTIONS.map(([value, label]) => (
                  <option key={value || "empty"} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Professionnel de santé">
              <input
                className={inputClassName}
                value={resolveHealthcareProfessional(careRequests, appointments)}
                readOnly
              />
            </Field>
            <Field label="Contact d'urgence">
              <input
                className={inputClassName}
                value={form.emergencyContactPhone}
                onChange={updateField("emergencyContactPhone")}
                placeholder="+212..."
                required
              />
            </Field>
            <Field label="Résumé médical" className="sm:col-span-2">
              <textarea
                rows={4}
                className={`${inputClassName} h-auto resize-none py-3`}
                value={form.medicalSummary}
                onChange={updateField("medicalSummary")}
                placeholder="Pathologies, allergies, traitements principaux…"
                required
              />
            </Field>
          </div>
        </Card>
        <Card className="space-y-4 p-5 sm:p-6">
          <h3 className="text-lg font-bold text-ink">Préférences et alertes</h3>
          {notifStatus === "saving" ? (
            <p className="text-sm font-semibold text-slate-500">Enregistrement des préférences...</p>
          ) : null}
          {notifStatus === "saved" ? (
            <p className="text-sm font-semibold text-teal-700">Préférences enregistrées.</p>
          ) : null}
          {notifStatus === "error" ? (
            <p className="text-sm font-semibold text-rose-700">{notifError}</p>
          ) : null}
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
                onClick={() => toggleNotificationPreference(key)}
                label={label}
              />
            </div>
          ))}
        </Card>
      </div>
    </form>
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
                ["Comment fonctionne le SOS ?", "Votre position est transmise à votre professionnel de santé et à l'équipe Trivacare."],
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
              Votre professionnel de santé reste disponible pour répondre aux questions liées au séjour médical.
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
  messages: MessagesPage,
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
  const [session, setSession] = useState(() => getSession("patient"));
  const [profile, setProfile] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [appointmentsStatus, setAppointmentsStatus] = useState("idle");
  const [careRequests, setCareRequests] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentsStatus, setDocumentsStatus] = useState("idle");
  const [trips, setTrips] = useState([]);
  const [tripsStatus, setTripsStatus] = useState("idle");
  const [billingSummary, setBillingSummary] = useState(null);
  const [billingStatus, setBillingStatus] = useState("idle");
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionsStatus, setSessionsStatus] = useState("idle");
  const [threads, setThreads] = useState([]);
  const [threadsStatus, setThreadsStatus] = useState("idle");
  const CurrentPage = useMemo(
    () => PATIENT_PAGES[page] || PatientDashboard,
    [page],
  );
  const patient = useMemo(
    () => buildPatientDisplay(session, profile),
    [session, profile],
  );
  const normalizedAppointments = useMemo(
    () => appointments.map(normalizeAppointment),
    [appointments],
  );
  const normalizedDocuments = useMemo(
    () => documents.map(normalizeDocument),
    [documents],
  );
  const normalizedTrips = useMemo(
    () => trips.map(normalizeTrip),
    [trips],
  );
  const normalizedSessions = useMemo(
    () => sessions.map(normalizeSessionItem),
    [sessions],
  );
  const normalizedThreads = useMemo(
    () => threads.map(normalizeThread),
    [threads],
  );
  const appointmentBadgeCount = useMemo(
    () => getUpcomingAppointments(normalizedAppointments).length,
    [normalizedAppointments],
  );
  const navItems = useMemo(
    () => patientNav.map((item) => (
      item.id === "rendez-vous" && appointmentBadgeCount > 0
        ? { ...item, badge: appointmentBadgeCount }
        : item
    )),
    [appointmentBadgeCount],
  );
  const onboarding = isPatientProfileIncomplete(session, profile);

  useEffect(() => {
    const currentSession = getSession("patient");
    setSession(currentSession);

    if (!currentSession?.accessToken) {
      setLoadStatus("error");
      setLoadError("Session patient introuvable.");
      return undefined;
    }

    let cancelled = false;
    setLoadStatus("loading");
    setLoadError("");

    apiRequest("/patients/me/profile", {
      token: currentSession.accessToken,
    })
      .then((payload) => {
        if (cancelled) return;
        setProfile(payload.data);
        setLoadStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : "Impossible de charger le profil patient.");
        setLoadStatus("error");
      });

    apiRequest("/patients/me/dashboard", {
      token: currentSession.accessToken,
    })
      .then((payload) => {
        if (cancelled) return;
        setDashboard(payload.data);
      })
      .catch(() => {
        if (cancelled) return;
        setDashboard(null);
      });

    setAppointmentsStatus("loading");
    apiRequest("/patients/me/appointments?limit=50", {
      token: currentSession.accessToken,
    })
      .then((payload) => {
        if (cancelled) return;
        setAppointments(Array.isArray(payload.data) ? payload.data : []);
        setAppointmentsStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setAppointments([]);
        setAppointmentsStatus("error");
      });

    apiRequest("/patients/me/care-requests?limit=20", {
      token: currentSession.accessToken,
    })
      .then((payload) => {
        if (cancelled) return;
        setCareRequests(Array.isArray(payload.data) ? payload.data : []);
      })
      .catch(() => {
        if (cancelled) return;
        setCareRequests([]);
      });

    setDocumentsStatus("loading");
    apiRequest("/patients/me/documents?limit=50", {
      token: currentSession.accessToken,
    })
      .then((payload) => {
        if (cancelled) return;
        setDocuments(Array.isArray(payload.data) ? payload.data : []);
        setDocumentsStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setDocuments([]);
        setDocumentsStatus("error");
      });

    setTripsStatus("loading");
    apiRequest("/patients/me/trips", {
      token: currentSession.accessToken,
    })
      .then((payload) => {
        if (cancelled) return;
        setTrips(Array.isArray(payload.data) ? payload.data : []);
        setTripsStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setTrips([]);
        setTripsStatus("error");
      });

    setBillingStatus("loading");
    Promise.all([
      apiRequest("/billing/summary", { token: currentSession.accessToken }),
      apiRequest("/billing/quotes", { token: currentSession.accessToken }),
      apiRequest("/billing/invoices", { token: currentSession.accessToken }),
    ])
      .then(([summaryPayload, quotesPayload, invoicesPayload]) => {
        if (cancelled) return;
        setBillingSummary(summaryPayload.data);
        setQuotes(Array.isArray(quotesPayload.data) ? quotesPayload.data : []);
        setInvoices(Array.isArray(invoicesPayload.data) ? invoicesPayload.data : []);
        setBillingStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setBillingSummary(null);
        setQuotes([]);
        setInvoices([]);
        setBillingStatus("error");
      });

    setSessionsStatus("loading");
    apiRequest("/security/sessions", {
      token: currentSession.accessToken,
    })
      .then((payload) => {
        if (cancelled) return;
        setSessions(Array.isArray(payload.data) ? payload.data : []);
        setSessionsStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setSessions([]);
        setSessionsStatus("error");
      });

    setThreadsStatus("loading");
    apiRequest("/threads", {
      token: currentSession.accessToken,
    })
      .then((payload) => {
        if (cancelled) return;
        setThreads(Array.isArray(payload.data) ? payload.data : []);
        setThreadsStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setThreads([]);
        setThreadsStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!PATIENT_PAGES[page]) {
    return <Navigate to={onboarding ? "/patient/compte" : "/patient/tableau-de-bord"} replace />;
  }

  if (loadStatus === "loading") {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <Card className="max-w-md p-6 text-center">
          <p className="text-sm font-bold text-ink">Chargement du profil patient…</p>
        </Card>
      </div>
    );
  }

  if (loadStatus === "error") {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <Card className="max-w-md p-6 text-center">
          <p className="text-sm font-bold text-rose-700">{loadError}</p>
        </Card>
      </div>
    );
  }

  if (onboarding && page !== "compte") {
    return <Navigate to="/patient/compte" replace />;
  }

  return (
    <>
      <AppShell
        area="Patient"
        badge="Espace patient"
        navItems={navItems}
        current={page}
        onSOS={() => setSosOpen(true)}
        user={patient}
        searchPlaceholder="Rechercher un document, un rendez-vous, un voyage…"
        persona="patient"
        profileHref="/patient/compte"
        notifications={[]}
      >
        <CurrentPage
          patient={patient}
          profile={profile}
          session={session}
          dashboard={dashboard}
          onboarding={onboarding}
          documents={normalizedDocuments}
          documentsStatus={documentsStatus}
          trips={normalizedTrips}
          tripsStatus={tripsStatus}
          billingSummary={billingSummary}
          billingStatus={billingStatus}
          quotes={quotes}
          invoices={invoices}
          sessions={normalizedSessions}
          sessionsStatus={sessionsStatus}
          threads={normalizedThreads}
          threadsStatus={threadsStatus}
          appointments={normalizedAppointments}
          appointmentsStatus={appointmentsStatus}
          careRequests={careRequests}
          onSessionsChanged={setSessions}
          onThreadsChanged={setThreads}
          onProfileSaved={(nextProfile, nextSession) => {
            setProfile(nextProfile);
            if (nextSession) setSession(nextSession);
          }}
        />
      </AppShell>
      <SosModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        title="Déclencher le SOS"
        body="Votre position sera transmise à votre professionnel de santé et à l'équipe Trivacare."
      />
    </>
  );
}
