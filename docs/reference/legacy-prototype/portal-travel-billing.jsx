/* Trivacare portal — Plans de voyage & Factures/paiements. */

const CLINIC_BY_CITY = {
  Marrakech: "Clinique Internationale Atlas", Casablanca: "Clinique Al Madina", Rabat: "Clinique Agdal",
  "Fès": "Clinique Verdun", Agadir: "Polyclinique Founty", Tanger: "Clinique Tingis", Essaouira: "Centre Médical Mogador",
};
/* Should be connected to DB, or migrate data from old to new DB*/
const MA_CITIES = Object.keys(CLINIC_BY_CITY);

/* ---------------- Plans de voyage ---------------- */
function TravelPlans() {
  const [departure, setDeparture] = uS("Lyon (France)");
  const [stops, setStops] = uS([
    { city: "Marrakech", arrival: "15 juin 2026", nights: 13 },
    { city: "Essaouira", arrival: "28 juin 2026", nights: 3 },
  ]);
  const [city, setCity] = uS("");
  const [arrival, setArrival] = uS("");
  const [nights, setNights] = uS(2);
  const add = (e) => {
    e.preventDefault();
    if (!city || !arrival) return;
    const d = new Date(arrival);
    const fmt = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    setStops((s) => [...s, { city, arrival: fmt, nights: Number(nights) }]);
    setCity(""); setArrival(""); setNights(2);
  };
  const totalNights = stops.reduce((a, s) => a + s.nights, 0);

  return (
    <div>
      <PageHead title="Plans de voyage" subtitle="Construisez votre itinéraire : nous préparons la coordination médicale à chaque étape.">
        <Btn variant="ghost" icon="download">Exporter</Btn>
        <Btn variant="primary" icon="check-check">Valider l'itinéraire</Btn>
      </PageHead>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard icon="map-pin" tone="blue" label="Étapes" value={String(stops.length)} sub="villes au Maroc" />
        <StatCard icon="calendar-days" tone="teal" label="Durée totale" value={`${totalNights} nuits`} sub="sur place" />
        <StatCard icon="building2" tone="amber" label="Cliniques sur le trajet" value={String(stops.length)} sub="pré-identifiées" />
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        {/* itinerary timeline */}
        <Card className="p-5 sm:p-6">
          <h3 className="font-display font-bold text-[17px] text-ink mb-5 flex items-center gap-2"><PIcon name="route" size={19} className="text-brand-600" /> Votre itinéraire</h3>

          <ol className="relative ps-1">
            {/* departure */}
            <li className="relative flex gap-4 pb-6">
              <div className="flex flex-col items-center">
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-slate-800 text-white shrink-0"><PIcon name="plane-takeoff" size={20} /></span>
                <span className="w-0.5 flex-1 bg-gradient-to-b from-slate-300 to-brand-300 mt-1"></span>
              </div>
              <div className="flex-1 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Départ</span>
                <p className="font-display font-bold text-[16px] text-ink">{departure}</p>
                <p className="text-[12.5px] text-slate-500">Point d'origine du voyage</p>
              </div>
            </li>

            {stops.map((s, i) => (
              <li key={i} className="relative flex gap-4 pb-6">
                <div className="flex flex-col items-center">
                  <span className="relative grid place-items-center w-11 h-11 rounded-2xl bg-brand-600 text-white shrink-0 shadow-glow">
                    <span className="font-display font-extrabold text-[15px]">{i + 1}</span>
                  </span>
                  {i < stops.length - 1 && <span className="w-0.5 flex-1 bg-brand-200 mt-1"></span>}
                </div>
                <div className="flex-1 pt-0.5">
                  <Card className="p-4 !shadow-none border-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display font-bold text-[16px] text-ink flex items-center gap-2"><PIcon name="map-pin" size={16} className="text-brand-600" />{s.city}</p>
                        <p className="text-[12.5px] text-slate-500 mt-0.5">Arrivée {s.arrival} · {s.nights} nuit{s.nights > 1 ? "s" : ""}</p>
                      </div>
                      <button onClick={() => setStops((arr) => arr.filter((_, j) => j !== i))} className="grid place-items-center w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 shrink-0"><PIcon name="trash-2" size={16} /></button>
                    </div>
                    <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 border border-teal-100">
                      <PIcon name="building2" size={16} className="text-teal-600 shrink-0" />
                      <span className="text-[12.5px] font-semibold text-teal-800 flex-1">{CLINIC_BY_CITY[s.city] || "Clinique partenaire"}</span>
                      <Badge tone="teal" icon="shield-check">Coordonnée</Badge>
                    </div>
                  </Card>
                </div>
              </li>
            ))}

            {stops.length === 0 && <li className="text-[13.5px] text-slate-400 ps-1 pb-4">Aucune étape pour le moment. Ajoutez votre première ville ci-dessous.</li>}
          </ol>
        </Card>

        {/* controls */}
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h3 className="font-display font-bold text-[16px] text-ink mb-4">Ville de départ</h3>
            <div className="relative">
              <select value={departure} onChange={(e) => setDeparture(e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                {["Lyon (France)", "Paris (France)", "Marseille (France)", "Bruxelles (Belgique)", "Genève (Suisse)", "Montréal (Canada)"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <PIcon name="plane-takeoff" size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-bold text-[16px] text-ink mb-4 flex items-center gap-2"><PIcon name="plus" size={17} className="text-brand-600" /> Ajouter une étape</h3>
            <form onSubmit={add} className="flex flex-col gap-3.5">
              <Field label="Ville (Maroc)">
                <div className="relative">
                  <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls + " appearance-none cursor-pointer"} required>
                    <option value="" disabled>Choisir une ville</option>
                    {MA_CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <PIcon name="chevron-down" size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Arrivée"><input type="date" value={arrival} onChange={(e) => setArrival(e.target.value)} className={inputCls + " font-mono text-[13px]"} required /></Field>
                <Field label="Nuits"><input type="number" min="1" max="60" value={nights} onChange={(e) => setNights(e.target.value)} className={inputCls} /></Field>
              </div>
              <Btn variant="primary" icon="plus" type="submit" className="w-full">Ajouter l'étape</Btn>
            </form>
            {city && CLINIC_BY_CITY[city] && (
              <p className="mt-3 text-[12px] text-slate-500 flex items-center gap-1.5"><PIcon name="info" size={14} className="text-teal-600" /> Clinique pressentie : <span className="font-semibold text-teal-700">{CLINIC_BY_CITY[city]}</span></p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Factures & paiements ---------------- */
const INVOICES = [
  { id: "TRV-2026-0042", label: "Consultation cardiologique", date: "02 juin 2026", amount: "600 MAD", status: "paid" },
  { id: "TRV-2026-0051", label: "Bilan sanguin — Laboratoire Atlas Bio", date: "03 juin 2026", amount: "420 MAD", status: "paid" },
  { id: "TRV-2026-0058", label: "Téléconsultation de coordination", date: "02 juin 2026", amount: "Incluse", status: "paid" },
  { id: "TRV-2026-0063", label: "Frais de coordination — juin 2026", date: "10 juin 2026", amount: "350 MAD", status: "pending" },
  { id: "TRV-2026-0064", label: "Consultation diabétologie (25 juin)", date: "25 juin 2026", amount: "750 MAD", status: "processing" },
];
const INV_STATUS = {
  paid: { tone: "green", icon: "check-check", label: "Payée" },
  pending: { tone: "amber", icon: "hourglass", label: "En attente" },
  processing: { tone: "blue", icon: "circle-dot", label: "En cours" },
};

function Billing() {
  const [tab, setTab] = uS("invoices");
  const [quotes, setQuotes] = uS([
    { id: "DV-2026-0012", label: "Holter tensionnel 24 h + interprétation", clinic: "Clinique Internationale Atlas", amount: "1 200 MAD", validity: "Valide 10 jours", status: "todo" },
    { id: "DV-2026-0009", label: "Séances d'éducation thérapeutique (diabète)", clinic: "Polyclinique du Sud", amount: "480 MAD", validity: "Accepté le 04 juin", status: "accepted" },
  ]);
  const accept = (id) => setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, status: "accepted", validity: "Accepté à l'instant" } : q));

  return (
    <div>
      <PageHead title="Factures & paiements" subtitle="Suivez vos paiements et approuvez les devis d'intervention." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard icon="check-check" tone="teal" label="Total réglé" value="1 020 MAD" sub="2 factures payées" />
        <StatCard icon="hourglass" tone="amber" label="En attente" value="350 MAD" sub="échéance 20 juin" />
        <StatCard icon="file-text" tone="blue" label="Devis à approuver" value="1 200 MAD" sub="1 intervention" />
      </div>

      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 w-fit mb-5">
        {[["invoices", "Factures", "receipt-text"], ["quotes", "Devis", "file-check-2"]].map(([id, lbl, ic]) => (
          <button key={id} onClick={() => setTab(id)}
            className={"flex items-center gap-2 h-10 px-4 rounded-xl text-[14px] font-bold transition-colors " + (tab === id ? "bg-white text-brand-700 shadow-soft" : "text-slate-500 hover:text-slate-700")}>
            <PIcon name={ic} size={16} />{lbl}
          </button>
        ))}
      </div>

      {tab === "invoices" ? (
        <Card className="overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[12px] font-bold uppercase tracking-wide text-slate-400">
            <span>Prestation</span><span>Date</span><span className="text-end">Montant</span><span className="text-end ps-4">Statut</span>
          </div>
          <div className="divide-y divide-slate-100">
            {INVOICES.map((inv) => {
              const s = INV_STATUS[inv.status];
              return (
                <div key={inv.id} className="grid sm:grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 shrink-0"><PIcon name="receipt-text" size={18} /></span>
                    <div className="min-w-0"><p className="text-[14px] font-semibold text-ink truncate">{inv.label}</p><p className="font-mono text-[11.5px] text-slate-400">{inv.id}</p></div>
                  </div>
                  <span className="text-[13px] text-slate-500 sm:text-center ps-13 sm:ps-0">{inv.date}</span>
                  <span className="font-display font-bold text-[15px] text-ink sm:text-end ps-13 sm:ps-0">{inv.amount}</span>
                  <span className="sm:text-end sm:ps-4 ps-13"><Badge tone={s.tone} icon={s.icon}>{s.label}</Badge></span>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[13px] text-slate-500">5 prestations · juin 2026</span>
            <Btn variant="ghost" icon="download" className="!h-10 !text-[13px]">Télécharger le relevé</Btn>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {quotes.map((q) => (
            <Card key={q.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid place-items-center w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 shrink-0"><PIcon name="file-check-2" size={21} /></span>
                  <div><p className="font-mono text-[11.5px] text-slate-400">{q.id}</p><h3 className="font-display font-bold text-[15.5px] text-ink leading-tight">{q.label}</h3></div>
                </div>
                {q.status === "accepted" ? <Badge tone="green" icon="check-check">Accepté</Badge> : <Badge tone="amber" icon="hourglass">À approuver</Badge>}
              </div>
              <p className="text-[13px] text-slate-500 flex items-center gap-1.5 mb-3"><PIcon name="building2" size={14} className="text-slate-400" />{q.clinic}</p>
              <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                <div><p className="text-[11.5px] text-slate-400">Montant estimé</p><p className="font-display font-extrabold text-2xl text-ink">{q.amount}</p><p className="text-[11.5px] text-slate-400 mt-0.5">{q.validity}</p></div>
                {q.status === "todo" ? (
                  <div className="flex gap-2">
                    <Btn variant="ghost" className="!h-10 !text-[13px]">Refuser</Btn>
                    <Btn variant="teal" icon="check" className="!h-10" onClick={() => accept(q.id)}>Approuver</Btn>
                  </div>
                ) : <Btn variant="subtle" icon="download" className="!h-10">PDF</Btn>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TravelPlans, Billing });
