export const clinicProfile = {
  name: "Clinique Internationale Atlas",
  initials: "CA",
  meta: "Marrakech",
};

export const practitionerProfile = {
  name: "Dr. Inès Berrada",
  initials: "IB",
  meta: "Cardiologie · Marrakech",
};

export const clinicNav = [
  { id: "tableau-de-bord", label: "Tableau de bord", icon: "layout-dashboard" },
  { id: "patients", label: "Admissions et patients", icon: "users-round", badge: 24 },
  { id: "planning", label: "Planning clinique", icon: "calendar-days" },
  { id: "coordination", label: "Coordination", icon: "messages-square", badge: 6 },
  { id: "documents", label: "Consentements et documents", icon: "file-text" },
  { id: "parametres", label: "Paramètres établissement", icon: "settings" },
].map((item) => ({ ...item, href: `/clinique/${item.id}` }));

export const practitionerNav = [
  { id: "tableau-de-bord", label: "Tableau de bord", icon: "layout-dashboard" },
  { id: "patients", label: "Mes patients", icon: "users-round", badge: 12 },
  { id: "dossier-patient", label: "Mon dossier patient", icon: "folder-heart" },
  { id: "planning", label: "Mon planning", icon: "calendar-days" },
  { id: "notes", label: "Notes de consultation", icon: "file-text", badge: 3 },
  { id: "prescriptions", label: "Prescriptions", icon: "file-check-2" },
  { id: "messages", label: "Historique des échanges", icon: "messages-square", badge: 4 },
  { id: "parametres", label: "Paramètres praticien", icon: "settings" },
].map((item) => ({ ...item, href: `/professionnel/${item.id}` }));

export const clinicPipeline = [
  { patient: "Amine El Fassi", city: "Marrakech", status: "Admission à confirmer", eta: "Aujourd'hui · 14:30" },
  { patient: "Lina Rahmani", city: "Casablanca", status: "Salle de soins préparée", eta: "Aujourd'hui · 16:00" },
  { patient: "Paul Martin", city: "Agadir", status: "Compte-rendu à envoyer", eta: "Demain · 09:00" },
];

export const practitionerNotes = [
  {
    title: "Note clinique du jour",
    body: "Patient stable, glycémie mieux contrôlée. Recommandation de surveillance rapprochée pendant le séjour à Marrakech.",
  },
  {
    title: "Prescription active",
    body: "Metformine 1000 mg matin et soir, contrôle HbA1c dans 8 semaines, bilan lipidique post-séjour.",
  },
];

export const patientQueue = [
  ["Arrivées aujourd'hui", "08"],
  ["Consultations en cours", "14"],
  ["Messages non lus", "06"],
  ["Dossiers à valider", "11"],
];

export const clinicQueue = [
  ["Admissions du jour", "08"],
  ["Créneaux actifs", "14"],
  ["Documents à valider", "06"],
  ["Consentements en attente", "11"],
];
