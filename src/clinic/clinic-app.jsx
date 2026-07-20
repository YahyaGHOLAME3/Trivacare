import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { clinicNav, clinicPipeline, clinicProfile, clinicQueue } from "../shared/data/backoffice";
import { getSession } from "../shared/auth";
import { AppShell } from "../shared/ui/shell";
import { Badge, Button, Card, Field, InfoList, PageHeader, StatCard, Toggle, inputClassName } from "../shared/ui/primitives";
import { SosModal } from "../shared/ui/modals";

function formatName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";
}

function buildClinicDisplay(session) {
  const user = session?.user || {};
  const organizationName = user.profile?.organizationName;
  const name = organizationName || formatName(user) || clinicProfile.name;

  return {
    name,
    initials: getInitials(name),
    meta: organizationName ? "Établissement clinique" : user.email || clinicProfile.meta,
  };
}

function ClinicDashboard() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Tableau de bord clinique"
        subtitle="Pilotage des admissions, des rendez-vous, des consentements et de la coordination avec Trivacare."
      >
        <Badge tone="teal" icon="briefcase-medical">Structure clinique active</Badge>
      </PageHeader>
      <div className="metric-grid">
        {clinicQueue.map(([label, value], index) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            sub="aujourd'hui"
            icon={["users-round", "calendar-days", "file-text", "messages-square"][index]}
            tone={["blue", "teal", "amber", "rose"][index]}
          />
        ))}
      </div>
      <div className="page-grid">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100">Admissions du jour</p>
            <h2 className="mt-2 text-2xl font-extrabold">Vision opérationnelle de l'établissement</h2>
            <p className="mt-2 max-w-2xl text-sm text-teal-50">
              Chaque admission, transfert et document clinique est centralisé dans un espace réservé à la structure.
            </p>
          </div>
          <div className="space-y-3 p-5">
            {clinicPipeline.map((entry) => (
              <div key={entry.patient} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">{entry.patient}</p>
                    <p className="text-xs text-slate-500">{entry.city} · {entry.eta}</p>
                  </div>
                  <Badge tone="amber">{entry.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="mb-4 text-lg font-bold text-ink">Points de contrôle</h3>
            <div className="space-y-3">
              {[
                "Valider les chambres PMR avant 12h00",
                "Confirmer les consentements de transfert",
                "Préparer les compte-rendus de sortie du jour",
              ].map((task) => (
                <div key={task} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  {task}
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-4 text-lg font-bold text-ink">Coordination Trivacare</h3>
            <p className="text-sm text-slate-500">
              Les échanges avec la coordination sont réservés à l'établissement et ne sont pas visibles par les autres personas.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ClinicPatientsPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Admissions et patients" subtitle="Accès structurel aux patients gérés par votre établissement.">
        <Button variant="primary" icon="plus">Préparer une admission</Button>
      </PageHeader>
      <Card className="p-5">
        <div className="mb-4 grid gap-4 lg:grid-cols-[1.1fr_1fr_180px]">
          <Field label="Recherche patient">
            <input className={inputClassName} placeholder="Nom, ville, créneau, spécialité" />
          </Field>
          <Field label="Statut d'admission">
            <select className={inputClassName}>
              <option>Tous les statuts</option>
              <option>Admission à confirmer</option>
              <option>Prise en charge lancée</option>
              <option>Sortie à clôturer</option>
            </select>
          </Field>
          <Field label="Unité">
            <select className={inputClassName}>
              <option>Cardiologie</option>
              <option>Diabétologie</option>
              <option>Coordination</option>
            </select>
          </Field>
        </div>
        <div className="space-y-3">
          {[
            ["Amine El Fassi", "Marrakech", "Cardiologie · admission 14:30", "Prioritaire"],
            ["Lina Rahmani", "Casablanca", "Diabétologie · chambre préparée", "À confirmer"],
            ["Paul Martin", "Agadir", "Sortie prévue · compte-rendu attendu", "En cours"],
          ].map(([name, city, meta, status]) => (
            <div key={name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink">{name}</p>
                  <p className="text-xs text-slate-500">{city} · {meta}</p>
                </div>
                <Badge tone={status === "Prioritaire" ? "rose" : "amber"}>{status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ClinicPlanningPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Planning clinique" subtitle="Organisation des créneaux, des salles et des admissions de l'établissement.">
        <Button variant="primary" icon="calendar-days">Créer un créneau</Button>
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ["Salle 1", "09:00 · Consultation cardiologique", "Amine El Fassi"],
          ["Salle 2", "11:30 · Bilan diabétologie", "Lina Rahmani"],
          ["Bloc PMR", "15:00 · Préparation de séjour", "Équipe clinique"],
        ].map(([room, time, patient]) => (
          <Card key={room} className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{room}</p>
            <p className="mt-2 text-lg font-bold text-ink">{time}</p>
            <p className="mt-1 text-sm text-slate-500">{patient}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ClinicCoordinationPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Coordination avec Trivacare" subtitle="Messagerie et suivi des échanges réservés à l'établissement.">
        <Button variant="primary" icon="messages-square">Nouveau message</Button>
      </PageHeader>
      <div className="page-grid">
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Conversations prioritaires</h3>
          <div className="space-y-3">
            {[
              ["Trivacare Coordination", "Confirmer l'accessibilité PMR avant 13h00"],
              ["Équipe parcours patient", "Consentement reçu pour le transfert de dossier"],
              ["Cellule d'urgence", "Alerte de proximité clôturée"],
            ].map(([sender, preview]) => (
              <div key={sender} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-ink">{sender}</p>
                <p className="mt-1 text-sm text-slate-500">{preview}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4 p-5">
          <h3 className="text-lg font-bold text-ink">Composer un message</h3>
          <Field label="Sujet">
            <input className={inputClassName} placeholder="Objet de coordination" />
          </Field>
          <Field label="Message">
            <textarea rows={7} className={`${inputClassName} h-auto resize-none py-3`} />
          </Field>
          <Button variant="primary">Envoyer</Button>
        </Card>
      </div>
    </div>
  );
}

function ClinicDocumentsPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Consentements et documents" subtitle="Suivi documentaire propre à l'établissement clinique.">
        <Button variant="primary" icon="file-text">Importer un document</Button>
      </PageHeader>
      <div className="grid gap-4 xl:grid-cols-3">
        {[
          ["Consentement de transfert", "Signé"],
          ["Ordonnance d'admission", "Disponible"],
          ["Compte-rendu de sortie", "À produire"],
        ].map(([label, status]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-bold text-ink">{label}</p>
            <Badge tone={status === "À produire" ? "amber" : "green"} className="mt-3">{status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ClinicSettingsPage({ clinic }) {
  const [alerts, setAlerts] = useState(true);
  return (
    <div className="space-y-5"> 
      <PageHeader title="Paramètres établissement" subtitle="Préférences de structure, alertes et accès clinique.">
        <Badge tone="green" icon="shield-check">Accès clinique distinct</Badge>
      </PageHeader>
      <div className="page-grid">
        <Card className="space-y-4 p-5 sm:p-6">
          <InfoList
            items={[
              ["Établissement", clinic.name],
              ["Référent", clinic.meta],
              ["Ville", clinicProfile.meta],
              ["Canal de garde", "Téléphone + messagerie"],
            ]}
          />
        </Card>
        <Card className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-ink">Alertes opérationnelles</h3>
              <p className="text-sm text-slate-500">Réception des alertes de coordination et des admissions critiques.</p>
            </div>
            <Toggle on={alerts} onClick={() => setAlerts((value) => !value)} label="Alertes opérationnelles" />
          </div>
        </Card>
      </div>
    </div>
  );
}

const CLINIC_PAGES = {
  "tableau-de-bord": ClinicDashboard,
  patients: ClinicPatientsPage,
  planning: ClinicPlanningPage,
  coordination: ClinicCoordinationPage,
  documents: ClinicDocumentsPage,
  parametres: ClinicSettingsPage,
};

export function ClinicApp() {
  const { page = "tableau-de-bord" } = useParams();
  const [sosOpen, setSosOpen] = useState(false);
  const CurrentPage = useMemo(() => CLINIC_PAGES[page] || ClinicDashboard, [page]);
  const clinic = useMemo(() => buildClinicDisplay(getSession("clinique")), []);

  if (!CLINIC_PAGES[page]) {
    return <Navigate to="/clinique/tableau-de-bord" replace />;
  }

  return (
    <>
      <AppShell
        area="Clinique"
        badge="Espace clinique"
        navItems={clinicNav}
        current={page}
        onSOS={() => setSosOpen(true)}
        user={clinic}
        headerTitle="Pilotage de l'établissement"
        searchPlaceholder="Rechercher un patient, une admission, un document…"
        persona="clinique"
        profileHref="/clinique/parametres"
      >
        <CurrentPage clinic={clinic} />
      </AppShell>
      <SosModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        title="Alerte clinique"
        body="Déclenchez une alerte interne réservée à la structure clinique et à la coordination Trivacare."
      />
    </>
  );
}
