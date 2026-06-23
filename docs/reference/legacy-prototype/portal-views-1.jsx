/* Trivacare portal — views part 1: Dashboard, Dossier médical, Mes rendez-vous. */

const RDV_DATA = [
  { id: 1, status: "confirmed", date: "18 juin 2026", time: "14:30", clinic: "Clinique Internationale Atlas", doctor: "Dr. Youssef Benali", specialty: "Cardiologie", city: "Marrakech", address: "Av. Mohammed VI, Guéliz", type: "Consultation cardiologique", soon: "Dans 3 jours" },
  { id: 2, status: "pending", date: "25 juin 2026", time: "10:00", clinic: "Polyclinique du Sud", doctor: "Dr. Nadia Cherkaoui", specialty: "Diabétologie", city: "Marrakech", address: "Rue Ibn Aicha, Guéliz", type: "Bilan diabétologie trimestriel" },
  { id: 3, status: "past", date: "02 juin 2026", time: "09:15", clinic: "Téléconsultation", doctor: "Dr. Salma Amrani", specialty: "Coordination", city: "À distance", address: "Visioconférence sécurisée", type: "Entretien de coordination" },
  { id: 4, status: "past", date: "03 juin 2026", time: "08:00", clinic: "Laboratoire Atlas Bio", doctor: "Équipe biologie", specialty: "Analyses", city: "Marrakech", address: "Bd Zerktouni", type: "Bilan sanguin (HbA1c, lipides)" },
  { id: 5, status: "cancelled", date: "29 mai 2026", time: "16:00", clinic: "Centre Ophtalmologique Ennour", doctor: "Dr. Karim Saidi", specialty: "Ophtalmologie", city: "Marrakech", address: "Avenue Hassan II", type: "Fond d'œil (reporté)" },
];
const RDV_STATUS = {
  confirmed: { tone: "teal", icon: "check-check", label: "Confirmé" },
  pending: { tone: "amber", icon: "hourglass", label: "En attente" },
  past: { tone: "slate", icon: "check", label: "Terminé" },
  cancelled: { tone: "rose", icon: "x", label: "Annulé" },
};

function StatCard({ icon, tone = "blue", label, value, sub }) {
  const ic = { blue: "bg-brand-50 text-brand-600", teal: "bg-teal-50 text-teal-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600" }[tone];
  return (
    <Card className="p-4 flex items-center gap-3.5">
      <span className={"grid place-items-center w-12 h-12 rounded-2xl shrink-0 " + ic}><PIcon name={icon} size={23} /></span>
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold text-slate-500 truncate">{label}</p>
        <p className="font-display font-extrabold text-xl text-ink leading-tight truncate">{value}</p>
        {sub && <p className="text-[11.5px] text-slate-400 truncate">{sub}</p>}
      </div>
    </Card>
  );
}

const CARE_STEPS = [
  { icon: "clipboard-plus", label: "Demande reçue", done: true },
  { icon: "users-round", label: "Clinique assignée", done: true },
  { icon: "file-lock-2", label: "Dossier transféré", current: true },
  { icon: "heart-pulse", label: "Soins programmés", done: false },
];

function CoordinatorCard() {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-ink to-brand-950 text-white p-5">
        <div className="flex items-center gap-3">
          <span className="relative"><Avatar initials="SA" size={46} tone="teal" /><span className="absolute -bottom-0.5 -end-0.5 w-3.5 h-3.5 rounded-full bg-teal-400 ring-2 ring-ink"></span></span>
          <div>
            <p className="text-[11px] font-semibold text-teal-300 uppercase tracking-wide">Votre coordinatrice</p>
            <p className="font-display font-bold text-[16px] leading-tight">Dr. Salma Amrani</p>
            <p className="text-[12px] text-slate-300">En ligne · répond en ~5 min</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 h-11">
          <PIcon name="messages-square" size={17} className="text-slate-400" />
          <span className="flex-1 text-[13px] text-slate-400">Écrire un message sécurisé…</span>
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-brand-600 text-white"><PIcon name="send" size={14} /></span>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <Btn variant="subtle" icon="phone" className="w-full">Appeler</Btn>
          <Btn variant="subtle" icon="video" className="w-full">Visio</Btn>
        </div>
      </div>
    </Card>
  );
}

function Dashboard({ setView }) {
  const next = RDV_DATA[0];
  const st = RDV_STATUS[next.status];
  return (
    <div>
      <PageHead title={`Bonjour, ${PATIENT.first}`} subtitle="Aujourd'hui · lundi 15 juin 2026">
        <Btn variant="ghost" icon="calendar-days" onClick={() => setView("rdv")}>Mes rendez-vous</Btn>
        <Btn variant="primary" icon="plus" onClick={() => setView("travel")}>Nouveau voyage</Btn>
      </PageHead>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard icon="calendar-check" tone="blue" label="Prochain RDV" value="J-3" sub="18 juin · 14:30" />
        <StatCard icon="folder-heart" tone="teal" label="Dossier médical" value="85%" sub="complété" />
        <StatCard icon="map-pin" tone="amber" label="Séjour en cours" value="Marrakech" sub="jusqu'au 28 juin" />
        <StatCard icon="wallet" tone="rose" label="À régler" value="1 200 MAD" sub="1 devis en attente" />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div className="flex flex-col gap-5">
          {/* next RDV hero */}
          <Card className="overflow-hidden">
            <div className="p-5 sm:p-6 bg-gradient-to-br from-brand-600 to-brand-800 text-white relative overflow-hidden">
              <div className="absolute -top-12 -end-8 w-44 h-44 rounded-full bg-teal-400/20 blur-2xl"></div>
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white/15 backdrop-blur text-[12px] font-bold">Prochain rendez-vous · {next.soon}</span>
                  <h2 className="mt-3 font-display font-extrabold text-2xl leading-tight">{next.type}</h2>
                  <p className="mt-1 text-[14px] text-brand-100">{next.doctor} · {next.specialty}</p>
                </div>
                <Badge tone="teal" icon={st.icon} className="!bg-white/15 !text-white !border-white/20">{st.label}</Badge>
              </div>
              <div className="relative mt-5 grid sm:grid-cols-3 gap-3">
                {[["calendar-days", next.date], ["clock", next.time], ["map-pin", `${next.clinic}`]].map(([ic, tx]) => (
                  <div key={tx} className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur px-3 py-2.5">
                    <PIcon name={ic} size={17} className="text-teal-200 shrink-0" /><span className="text-[13px] font-semibold truncate">{tx}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 flex flex-wrap gap-2.5">
              <Btn variant="primary" icon="arrow-up-right" onClick={() => setView("rdv")}>Voir le détail</Btn>
              <Btn variant="ghost" icon="messages-square">Message coordinateur</Btn>
              <Btn variant="ghost" icon="navigation">Itinéraire</Btn>
            </div>
          </Card>

          {/* upcoming list */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-[17px] text-ink">Prochains rendez-vous</h3>
              <button onClick={() => setView("rdv")} className="text-[13px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">Tout voir <PIcon name="chevron-right" size={15} className="flip-x" /></button>
            </div>
            <div className="flex flex-col divide-y divide-slate-100">
              {RDV_DATA.filter((r) => ["confirmed", "pending"].includes(r.status)).map((r) => {
                const s = RDV_STATUS[r.status];
                return (
                  <div key={r.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="grid place-items-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
                      <span className="font-display font-extrabold text-[15px] text-brand-700 leading-none">{r.date.split(" ")[0]}</span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{r.date.split(" ")[1]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[14.5px] text-ink truncate">{r.type}</p>
                      <p className="text-[12.5px] text-slate-500 truncate">{r.doctor} · {r.time} · {r.city}</p>
                    </div>
                    <Badge tone={s.tone} icon={s.icon}>{s.label}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* right rail */}
        <div className="flex flex-col gap-5">
          <CoordinatorCard />
          <Card className="p-5">
            <h3 className="font-display font-bold text-[17px] text-ink mb-4">Suivi de votre prise en charge</h3>
            <ol className="flex flex-col gap-1">
              {CARE_STEPS.map((s, i) => (
                <li key={i} className="flex items-center gap-3.5">
                  <div className="flex flex-col items-center">
                    <span className={"grid place-items-center w-9 h-9 rounded-xl shrink-0 " + (s.done ? "bg-teal-600 text-white" : s.current ? "bg-brand-600 text-white shadow-glow" : "bg-slate-100 text-slate-400")}>
                      <PIcon name={s.done ? "check" : s.icon} size={17} strokeWidth={2.3} />
                    </span>
                    {i < CARE_STEPS.length - 1 && <span className={"w-0.5 h-5 " + (s.done ? "bg-teal-500" : "bg-slate-200")}></span>}
                  </div>
                  <span className={"text-[14px] font-semibold pb-5 " + (s.current ? "text-brand-700" : s.done ? "text-ink" : "text-slate-400")}>
                    {s.label}{s.current && <span className="block text-[12px] font-medium text-slate-400">En cours…</span>}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="p-5">
            <h3 className="font-display font-bold text-[17px] text-ink mb-3">Documents récents</h3>
            <div className="flex flex-col gap-2">
              {[["file-text", "Ordonnance — Insuline", "PDF · 02 juin"], ["image", "Radio thorax", "JPG · 28 mai"], ["audio-lines", "Antécédents (dictée)", "M4A · 1:42"]].map(([ic, n, m]) => (
                <button key={n} onClick={() => setView("medical")} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-start transition-colors">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 shrink-0"><PIcon name={ic} size={18} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-[13.5px] font-semibold text-ink truncate">{n}</span><span className="block text-[11.5px] text-slate-400">{m}</span></span>
                  <PIcon name="download" size={16} className="text-slate-400" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Mes rendez-vous ---------------- */
function Appointments() {
  const [tab, setTab] = uS("upcoming");
  const tabs = [
    { id: "upcoming", label: "À venir", match: ["confirmed", "pending"] },
    { id: "past", label: "Passés", match: ["past"] },
    { id: "cancelled", label: "Annulés", match: ["cancelled"] },
  ];
  const cur = tabs.find((t) => t.id === tab);
  const list = RDV_DATA.filter((r) => cur.match.includes(r.status));
  return (
    <div>
      <PageHead title="Mes rendez-vous" subtitle="Consultations, examens et téléconsultations coordonnés par Trivacare.">
        <Btn variant="primary" icon="plus">Demander un RDV</Btn>
      </PageHead>

      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 w-fit mb-5">
        {tabs.map((t) => {
          const n = RDV_DATA.filter((r) => t.match.includes(r.status)).length;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={"flex items-center gap-2 h-10 px-4 rounded-xl text-[14px] font-bold transition-colors " + (tab === t.id ? "bg-white text-brand-700 shadow-soft" : "text-slate-500 hover:text-slate-700")}>
              {t.label}<span className={"grid place-items-center min-w-5 h-5 px-1.5 rounded-full text-[11px] " + (tab === t.id ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-500")}>{n}</span>
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((r) => {
          const s = RDV_STATUS[r.status];
          const dim = ["past", "cancelled"].includes(r.status);
          return (
            <Card key={r.id} className={"p-5 " + (dim ? "opacity-80" : "")}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 shrink-0"><PIcon name="stethoscope" size={23} /></span>
                  <div>
                    <h3 className="font-display font-bold text-[16px] text-ink leading-tight">{r.type}</h3>
                    <p className="text-[13px] text-slate-500">{r.specialty}</p>
                  </div>
                </div>
                <Badge tone={s.tone} icon={s.icon}>{s.label}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13.5px]">
                <p className="flex items-center gap-2 text-slate-600"><PIcon name="calendar-days" size={15} className="text-slate-400" />{r.date}</p>
                <p className="flex items-center gap-2 text-slate-600"><PIcon name="clock" size={15} className="text-slate-400" />{r.time}</p>
                <p className="flex items-center gap-2 text-slate-600 col-span-2"><PIcon name="user-round" size={15} className="text-slate-400" />{r.doctor}</p>
                <p className="flex items-center gap-2 text-slate-600 col-span-2"><PIcon name="map-pin" size={15} className="text-slate-400" />{r.clinic} · {r.address}</p>
              </div>
              {["confirmed", "pending"].includes(r.status) && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                  <Btn variant="ghost" icon="navigation" className="!h-10 !text-[13px]">Itinéraire</Btn>
                  <Btn variant="ghost" icon="calendar-check" className="!h-10 !text-[13px]">Reprogrammer</Btn>
                  {r.status === "confirmed" && <Btn variant="subtle" icon="file-text" className="!h-10">Préparation</Btn>}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Appointments, RDV_DATA, RDV_STATUS, StatCard, CoordinatorCard });
