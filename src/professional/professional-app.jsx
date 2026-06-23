import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { practitionerNav, practitionerNotes, practitionerProfile } from "../shared/data/backoffice";
import { AppShell } from "../shared/ui/shell";
import { Badge, Button, Card, Field, InfoList, PageHeader, StatCard, Toggle, inputClassName } from "../shared/ui/primitives";
import { SosModal } from "../shared/ui/modals";

function ProfessionalDashboard() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Tableau de bord praticien"
        subtitle="Vision personnelle du professionnel de santé sur ses patients, ses rendez-vous et ses notes cliniques."
      >
        <Badge tone="blue" icon="stethoscope">Accès praticien nominatif</Badge>
      </PageHeader>
      <div className="metric-grid">
        {[
          ["Patients suivis", "12", "cette semaine", "users-round", "blue"],
          ["Consultations du jour", "05", "à confirmer", "calendar-days", "teal"],
          ["Notes à signer", "03", "avant 18h00", "file-text", "amber"],
          ["Messages non lus", "04", "coordination", "messages-square", "rose"],
        ].map(([label, value, sub, icon, tone]) => (
          <StatCard key={label} label={label} value={value} sub={sub} icon={icon} tone={tone} />
        ))}
      </div>
      <div className="page-grid">
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Patients du jour</h3>
          <div className="space-y-3">
            {[
              ["Amine El Fassi", "Consultation cardiologique · 14:30"],
              ["Lina Rahmani", "Bilan diabétologie · 10:00"],
              ["Paul Martin", "Téléconsultation de suivi · 17:00"],
            ].map(([name, slot]) => (
              <div key={name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-ink">{name}</p>
                <p className="mt-1 text-sm text-slate-500">{slot}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Notes récentes</h3>
          <div className="space-y-3">
            {practitionerNotes.map((note) => (
              <div key={note.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-ink">{note.title}</p>
                <p className="mt-2 text-sm text-slate-500">{note.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProfessionalPatientsPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Mes patients" subtitle="Liste des patients suivis par le professionnel connecté, sans visibilité sur les autres praticiens.">
        <Button variant="ghost" icon="users-round">Exporter la liste</Button>
      </PageHeader>
      <Card className="p-5">
        <div className="space-y-3">
          {[
            ["Amine El Fassi", "Cardiologie · suivi actif"],
            ["Lina Rahmani", "Diabétologie · rendez-vous confirmé"],
            ["Paul Martin", "Téléconsultation · compte-rendu à signer"],
          ].map(([name, meta]) => (
            <div key={name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-ink">{name}</p>
              <p className="mt-1 text-sm text-slate-500">{meta}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ProfessionalPatientFilePage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Mon dossier patient" subtitle="Vue praticien personnalisée sur le patient en cours de suivi.">
        <Badge tone="teal" icon="user-round">Amine El Fassi</Badge>
      </PageHeader>
      <div className="page-grid">
        <Card className="space-y-4 p-5 sm:p-6">
          <InfoList
            items={[
              ["Patient", "Amine El Fassi"],
              ["Orientation", "Consultation cardiologique"],
              ["Pathologie", "Diabète type 2 · antécédents coronariens"],
              ["Coordinateur", "Dr. Salma Amrani"],
            ]}
          />
          <Field label="Synthèse praticien">
            <textarea
              rows={7}
              className={`${inputClassName} h-auto resize-none py-3`}
              defaultValue="État stable. Surveillance rapprochée recommandée pendant le séjour. Pas de contre-indication à la poursuite du traitement actuel."
            />
          </Field>
        </Card>
        <Card className="space-y-4 p-5 sm:p-6">
          <h3 className="text-lg font-bold text-ink">Actions rapides</h3>
          <div className="grid gap-2">
            <Button variant="teal" icon="file-text">Signer le compte-rendu</Button>
            <Button variant="ghost" icon="messages-square">Écrire à la coordination</Button>
            <Button variant="ghost" icon="calendar-days">Reprogrammer</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProfessionalSchedulePage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Mon planning" subtitle="Agenda personnel du praticien connecté.">
        <Button variant="primary" icon="calendar-days">Bloquer un créneau</Button>
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ["10:00", "Lina Rahmani", "Bilan diabétologie"],
          ["14:30", "Amine El Fassi", "Consultation cardiologique"],
          ["17:00", "Paul Martin", "Téléconsultation"],
        ].map(([time, patient, type]) => (
          <Card key={time} className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{time}</p>
            <p className="mt-2 text-lg font-bold text-ink">{patient}</p>
            <p className="mt-1 text-sm text-slate-500">{type}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProfessionalNotesPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Notes de consultation" subtitle="Rédaction et validation des notes propres au praticien connecté.">
        <Button variant="primary" icon="file-text">Nouvelle note</Button>
      </PageHeader>
      <div className="space-y-4">
        {practitionerNotes.map((note) => (
          <Card key={note.title} className="p-5">
            <h3 className="text-lg font-bold text-ink">{note.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{note.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProfessionalPrescriptionsPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Prescriptions et compte-rendus" subtitle="Documents médicaux liés au suivi du praticien connecté.">
        <Button variant="primary" icon="file-check-2">Créer un compte-rendu</Button>
      </PageHeader>
      <div className="grid gap-4 xl:grid-cols-2">
        {[
          ["Ordonnance active", "Metformine 1000 mg matin et soir", "Disponible"],
          ["Compte-rendu cardiologie", "À signer aujourd'hui", "À produire"],
        ].map(([title, body, status]) => (
          <Card key={title} className="p-5">
            <p className="text-sm font-bold text-ink">{title}</p>
            <p className="mt-2 text-sm text-slate-500">{body}</p>
            <Badge tone={status === "À produire" ? "amber" : "green"} className="mt-3">{status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProfessionalMessagesPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Historique des échanges" subtitle="Messages liés au praticien connecté, sans visibilité sur les autres professionnels.">
        <Button variant="primary" icon="messages-square">Nouveau message</Button>
      </PageHeader>
      <div className="page-grid">
        <Card className="p-5">
          <div className="space-y-3">
            {[
              ["Trivacare Coordination", "Besoin d'un retour clinique avant 16h00"],
              ["Clinique Internationale Atlas", "Consentement patient vérifié"],
              ["Assistant médical", "Compte-rendu à compléter"],
            ].map(([sender, preview]) => (
              <div key={sender} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-ink">{sender}</p>
                <p className="mt-1 text-sm text-slate-500">{preview}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4 p-5">
          <Field label="Message">
            <textarea rows={7} className={`${inputClassName} h-auto resize-none py-3`} />
          </Field>
          <Button variant="primary">Envoyer</Button>
        </Card>
      </div>
    </div>
  );
}

function ProfessionalSettingsPage() {
  const [alerts, setAlerts] = useState(true);
  const [signature, setSignature] = useState(true);
  return (
    <div className="space-y-5">
      <PageHeader title="Paramètres praticien" subtitle="Préférences personnelles et sécurité du professionnel connecté.">
        <Badge tone="green" icon="shield-check">Compte personnel distinct</Badge>
      </PageHeader>
      <div className="page-grid">
        <Card className="space-y-4 p-5 sm:p-6">
          <InfoList
            items={[
              ["Professionnel", practitionerProfile.name],
              ["Spécialité", "Cardiologie"],
              ["Ville", "Marrakech"],
              ["Mode d'accès", "Compte nominatif"],
            ]}
          />
        </Card>
        <Card className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-ink">Alertes de coordination</h3>
              <p className="text-sm text-slate-500">Notifications personnalisées sur vos patients et rendez-vous.</p>
            </div>
            <Toggle on={alerts} onClick={() => setAlerts((value) => !value)} label="Alertes" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-ink">Signature rapide</h3>
              <p className="text-sm text-slate-500">Active la validation accélérée des notes et comptes-rendus.</p>
            </div>
            <Toggle on={signature} onClick={() => setSignature((value) => !value)} label="Signature rapide" />
          </div>
        </Card>
      </div>
    </div>
  );
}

const PROFESSIONAL_PAGES = {
  "tableau-de-bord": ProfessionalDashboard,
  patients: ProfessionalPatientsPage,
  "dossier-patient": ProfessionalPatientFilePage,
  planning: ProfessionalSchedulePage,
  notes: ProfessionalNotesPage,
  prescriptions: ProfessionalPrescriptionsPage,
  messages: ProfessionalMessagesPage,
  parametres: ProfessionalSettingsPage,
};

export function ProfessionalApp() {
  const { page = "tableau-de-bord" } = useParams();
  const [sosOpen, setSosOpen] = useState(false);
  const CurrentPage = useMemo(
    () => PROFESSIONAL_PAGES[page] || ProfessionalDashboard,
    [page],
  );

  if (!PROFESSIONAL_PAGES[page]) {
    return <Navigate to="/professionnel/tableau-de-bord" replace />;
  }

  return (
    <>
      <AppShell
        area="Professionnel"
        badge="Espace professionnel"
        navItems={practitionerNav}
        current={page}
        onSOS={() => setSosOpen(true)}
        user={practitionerProfile}
        headerTitle="Suivi praticien"
        searchPlaceholder="Rechercher un patient, une note, une prescription…"
        persona="professionnel"
        profileHref="/professionnel/parametres"
      >
        <CurrentPage />
      </AppShell>
      <SosModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        title="Alerte praticien"
        body="Déclenchez une alerte de coordination liée à votre suivi clinique personnel."
      />
    </>
  );
}
