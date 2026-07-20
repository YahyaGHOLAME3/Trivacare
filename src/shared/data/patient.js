export const patientNav = [
  { id: "tableau-de-bord", label: "Tableau de bord", icon: "layout-dashboard" },
  { id: "dossier-medical", label: "Dossier médical", icon: "folder-heart" },
  { id: "messages", label: "Messages", icon: "messages-square" },
  { id: "plans-de-voyage", label: "Plans de voyage", icon: "route" },
  { id: "rendez-vous", label: "Rendez-vous", icon: "calendar-check" },
  { id: "facturation", label: "Facturation", icon: "receipt-text" },
  { id: "securite", label: "Sécurité", icon: "shield-check" },
  { id: "compte", label: "Mon compte", icon: "user-round" },
  { id: "aide", label: "Aide", icon: "life-buoy" },
].map((item) => ({ ...item, href: `/patient/${item.id}` }));
