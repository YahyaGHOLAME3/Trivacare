export const patientProfile = {
  name: "Amine El Fassi",
  initials: "AE",
  meta: "Marrakech",
  profile: "Maladie chronique · Diabète type 2",
  email: "amine.elfassi@gmail.com",
  phone: "+212 6 61 24 88 03",
  dob: "14/03/1968",
  nationality: "Franco-marocaine",
  insurer: "Allianz Travel — Police N° TR-99820145",
  blood: "O+",
  coordinator: "Dr. Salma Amrani",
};

export const patientNav = [
  { id: "tableau-de-bord", label: "Tableau de bord", icon: "layout-dashboard" },
  { id: "dossier-medical", label: "Dossier médical", icon: "folder-heart" },
  { id: "plans-de-voyage", label: "Plans de voyage", icon: "route" },
  { id: "rendez-vous", label: "Rendez-vous", icon: "calendar-check", badge: 2 },
  { id: "facturation", label: "Facturation", icon: "receipt-text" },
  { id: "securite", label: "Sécurité", icon: "shield-check" },
  { id: "compte", label: "Mon compte", icon: "user-round" },
  { id: "aide", label: "Aide", icon: "life-buoy" },
].map((item) => ({ ...item, href: `/patient/${item.id}` }));

export const patientAppointments = [
  {
    id: 1,
    title: "Consultation cardiologique",
    doctor: "Dr. Youssef Benali",
    specialty: "Cardiologie",
    date: "27 juin 2026",
    time: "14:30",
    clinic: "Clinique Internationale Atlas",
    city: "Marrakech",
    status: "confirmé",
    soon: "Dans 6 jours",
  },
  {
    id: 2,
    title: "Bilan diabétologie trimestriel",
    doctor: "Dr. Nadia Cherkaoui",
    specialty: "Diabétologie",
    date: "03 juillet 2026",
    time: "10:00",
    clinic: "Polyclinique du Sud",
    city: "Marrakech",
    status: "en attente",
  },
  {
    id: 3,
    title: "Téléconsultation de coordination",
    doctor: "Dr. Salma Amrani",
    specialty: "Coordination",
    date: "18 juin 2026",
    time: "09:15",
    clinic: "Téléconsultation",
    city: "À distance",
    status: "terminé",
  },
];

export const patientDocuments = [
  ["Ordonnance — Insuline Lantus", "PDF · 02 juin 2026"],
  ["Compte-rendu cardiologie 2019", "PDF · 12 mai 2026"],
  ["Bilan sanguin — HbA1c 7,1%", "PDF · 03 juin 2026"],
];

export const patientTrip = {
  departure: "Lyon (France)",
  stops: [
    { city: "Marrakech", arrival: "24 juin 2026", nights: 10, clinic: "Clinique Internationale Atlas" },
    { city: "Essaouira", arrival: "04 juillet 2026", nights: 3, clinic: "Centre Médical Mogador" },
  ],
};
