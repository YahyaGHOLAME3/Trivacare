/* Trivacare portal — Sécurité, Mon compte, Aide (+ guided tour). */

/* ---------------- Sécurité ---------------- */
function PwField({ label, hint }) {
  const [show, setShow] = uS(false);
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input type={show ? "text" : "password"} defaultValue="••••••••••" className={inputCls + " pe-11"} />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute end-2.5 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100"><PIcon name={show ? "eye-off" : "eye"} size={17} /></button>
      </div>
    </Field>
  );
}

function Security() {
  const [twoFA, setTwoFA] = uS(true);
  const [method, setMethod] = uS("sms");
  const sessions = [
    { device: "iPhone 14 · Safari", loc: "Marrakech, Maroc", last: "Actif maintenant", icon: "smartphone", current: true },
    { device: "MacBook Pro · Chrome", loc: "Lyon, France", last: "Il y a 2 jours", icon: "monitor", current: false },
    { device: "iPad · Application", loc: "Lyon, France", last: "Il y a 6 jours", icon: "smartphone", current: false },
  ];
  return (
    <div>
      <PageHead title="Sécurité" subtitle="Protégez l'accès à votre dossier médical." >
        <Badge tone="green" icon="shield-check">Compte sécurisé</Badge>
      </PageHead>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        {/* password */}
        <Card className="p-5 sm:p-6">
          <h3 className="font-display font-bold text-[17px] text-ink mb-5 flex items-center gap-2"><PIcon name="key-round" size={19} className="text-brand-600" /> Mot de passe</h3>
          <div className="flex flex-col gap-4">
            <PwField label="Mot de passe actuel" />
            <PwField label="Nouveau mot de passe" hint="12 caractères minimum, avec chiffres et symboles." />
            <PwField label="Confirmer le nouveau mot de passe" />
            <div className="flex items-center gap-2">
              <div className="flex-1 flex gap-1.5">{[1,2,3,4].map((i) => <span key={i} className={"h-1.5 flex-1 rounded-full " + (i <= 3 ? "bg-teal-500" : "bg-slate-200")}></span>)}</div>
              <span className="text-[12px] font-bold text-teal-600">Solide</span>
            </div>
            <Btn variant="teal" icon="save" className="w-fit">Mettre à jour</Btn>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          {/* 2FA */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-[17px] text-ink flex items-center gap-2"><PIcon name="shield-check" size={19} className="text-brand-600" /> Double authentification (2FA)</h3>
              <Toggle on={twoFA} onClick={() => setTwoFA((v) => !v)} label="Activer 2FA" />
            </div>
            <p className="text-[13.5px] text-slate-500 mb-4">Une vérification supplémentaire est demandée à chaque connexion depuis un nouvel appareil.</p>
            {twoFA && (
              <div className="flex flex-col gap-2.5 rise">
                {[["sms", "smartphone", "Par SMS", `Code envoyé au ${PATIENT.phone}`], ["app", "qr-code", "Application d'authentification", "Google Authenticator, Authy…"]].map(([id, ic, t, d]) => (
                  <button key={id} onClick={() => setMethod(id)} className={"flex items-center gap-3 p-3.5 rounded-2xl border text-start transition-colors " + (method === id ? "bg-brand-50 border-brand-300" : "bg-white border-slate-200 hover:border-slate-300")}>
                    <span className={"grid place-items-center w-10 h-10 rounded-xl shrink-0 " + (method === id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500")}><PIcon name={ic} size={19} /></span>
                    <span className="flex-1"><span className="block text-[14px] font-bold text-ink">{t}</span><span className="block text-[12px] text-slate-500">{d}</span></span>
                    <span className={"grid place-items-center w-5 h-5 rounded-full border-2 " + (method === id ? "border-brand-600 bg-brand-600" : "border-slate-300")}>{method === id && <PIcon name="check" size={12} className="text-white" strokeWidth={3} />}</span>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* sessions */}
          <Card className="p-5 sm:p-6">
            <h3 className="font-display font-bold text-[17px] text-ink mb-4 flex items-center gap-2"><PIcon name="monitor" size={19} className="text-brand-600" /> Appareils connectés</h3>
            <div className="flex flex-col gap-2">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 shrink-0"><PIcon name={s.icon} size={18} /></span>
                  <div className="flex-1 min-w-0"><p className="text-[13.5px] font-bold text-ink truncate">{s.device}</p><p className="text-[12px] text-slate-500 truncate">{s.loc} · {s.last}</p></div>
                  {s.current ? <Badge tone="teal" icon="circle-dot">Cet appareil</Badge> : <button className="text-[12.5px] font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50">Déconnecter</button>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Mon compte ---------------- */
function Account() {
  const [lang, setLang] = uS("fr");
  const [notif, setNotif] = uS({ rdv: true, docs: true, billing: false, sos: true });
  return (
    <div>
      <PageHead title="Mon compte" subtitle="Vos informations personnelles et préférences." >
        <Btn variant="primary" icon="save">Enregistrer</Btn>
      </PageHead>

      <Card className="p-5 sm:p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="relative"><Avatar initials={PATIENT.initials} size={72} /><button className="absolute -bottom-1 -end-1 grid place-items-center w-8 h-8 rounded-full bg-white border border-slate-200 shadow-soft text-slate-600 hover:text-brand-600"><PIcon name="pen-line" size={15} /></button></span>
          <div className="flex-1">
            <h2 className="font-display font-extrabold text-2xl text-ink">{PATIENT.first} {PATIENT.last}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge tone="blue" icon="activity">{PATIENT.profile}</Badge>
              <Badge tone="rose" icon="droplet">{PATIENT.blood}</Badge>
              <Badge tone="slate" icon="map-pin">{PATIENT.city}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <Card className="p-5 sm:p-6">
          <h3 className="font-display font-bold text-[17px] text-ink mb-5 flex items-center gap-2"><PIcon name="user-round" size={19} className="text-brand-600" /> Informations personnelles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Prénom"><input className={inputCls} defaultValue={PATIENT.first} /></Field>
            <Field label="Nom"><input className={inputCls} defaultValue={PATIENT.last} /></Field>
            <Field label="E-mail" className="sm:col-span-2"><input className={inputCls} defaultValue={PATIENT.email} /></Field>
            <Field label="Téléphone"><input className={inputCls} defaultValue={PATIENT.phone} /></Field>
            <Field label="Date de naissance"><input className={inputCls} defaultValue={PATIENT.dob} /></Field>
            <Field label="Nationalité"><input className={inputCls} defaultValue={PATIENT.nationality} /></Field>
            <Field label="Adresse de résidence"><input className={inputCls} defaultValue="22 rue de la République, Lyon" /></Field>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="p-5 sm:p-6">
            <h3 className="font-display font-bold text-[17px] text-ink mb-5 flex items-center gap-2"><PIcon name="triangle-alert" size={19} className="text-rose-500" /> Contact d'urgence & assurance</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Personne à contacter"><input className={inputCls} defaultValue="Leïla El Fassi" /></Field>
              <Field label="Lien"><input className={inputCls} defaultValue="Épouse" /></Field>
              <Field label="Téléphone d'urgence" className="sm:col-span-2"><input className={inputCls} defaultValue="+212 6 70 11 22 33" /></Field>
              <Field label="Assureur voyage" className="sm:col-span-2"><input className={inputCls} defaultValue={PATIENT.insurer} /></Field>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h3 className="font-display font-bold text-[17px] text-ink mb-4 flex items-center gap-2"><PIcon name="settings" size={19} className="text-brand-600" /> Préférences</h3>
            <Field label="Langue de l'interface" className="mb-4">
              <div className="flex gap-2">
                {[["fr", "Français"], ["en", "English"], ["ar", "العربية"]].map(([id, lbl]) => (
                  <button key={id} onClick={() => setLang(id)} className={"flex-1 h-11 rounded-xl text-[13.5px] font-bold border transition-colors " + (lang === id ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300")}>{lbl}</button>
                ))}
              </div>
            </Field>
            <div className="flex flex-col gap-1">
              {[["rdv", "Rappels de rendez-vous"], ["docs", "Nouveaux documents"], ["billing", "Factures & devis"], ["sos", "Alertes de sécurité"]].map(([k, lbl]) => (
                <div key={k} className="flex items-center justify-between py-2.5">
                  <span className="text-[14px] font-medium text-slate-700">{lbl}</span>
                  <Toggle on={notif[k]} onClick={() => setNotif((n) => ({ ...n, [k]: !n[k] }))} label={lbl} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Aide + guided tour ---------------- */
function Tour({ open, onClose }) {
  const steps = [
    { icon: "layout-dashboard", title: "Tableau de bord", body: "Votre point de départ : prochain rendez-vous, suivi de prise en charge et accès direct à votre coordinatrice." },
    { icon: "folder-heart", title: "Dossier médical", body: "Renseignez vos antécédents (au clavier ou à la voix), déposez documents et imagerie, et enregistrez des notes audio." },
    { icon: "route", title: "Plans de voyage", body: "Indiquez votre ville de départ puis ajoutez chaque étape au Maroc : nous identifions la clinique sur votre trajet." },
    { icon: "calendar-check", title: "Mes rendez-vous", body: "Retrouvez vos consultations à venir, passées et annulées, avec itinéraire et reprogrammation en un clic." },
    { icon: "receipt-text", title: "Factures & paiements", body: "Suivez vos paiements et approuvez les devis d'intervention proposés par les cliniques." },
    { icon: "shield-check", title: "Sécurité", body: "Activez la double authentification, gérez votre mot de passe et vos appareils connectés." },
  ];
  const [i, setI] = uS(0);
  uE(() => { if (open) setI(0); }, [open]);
  if (!open) return null;
  const s = steps[i];
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-5" role="dialog" aria-modal="true" aria-label="Visite guidée">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md rounded-[1.75rem] bg-white shadow-lift overflow-hidden rise">
        <div className="p-7 bg-gradient-to-br from-brand-600 to-brand-800 text-white relative overflow-hidden">
          <div className="absolute -top-10 -end-8 w-40 h-40 rounded-full bg-teal-400/20 blur-2xl"></div>
          <button onClick={onClose} className="absolute top-4 end-4 grid place-items-center w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white"><PIcon name="x" size={18} /></button>
          <span className="relative grid place-items-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur mb-4"><PIcon name={s.icon} size={28} /></span>
          <p className="relative text-[12px] font-bold uppercase tracking-wide text-brand-200">Étape {i + 1} / {steps.length}</p>
          <h2 className="relative font-display font-extrabold text-2xl mt-1">{s.title}</h2>
        </div>
        <div className="p-7">
          <p className="text-[15px] text-slate-600 leading-relaxed min-h-[72px]">{s.body}</p>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex gap-1.5">{steps.map((_, j) => <span key={j} className={"h-2 rounded-full transition-all " + (j === i ? "w-6 bg-brand-600" : "w-2 bg-slate-200")}></span>)}</div>
            <div className="flex gap-2">
              {i > 0 && <Btn variant="ghost" className="!h-10" onClick={() => setI(i - 1)}>Précédent</Btn>}
              {i < steps.length - 1
                ? <Btn variant="primary" iconEnd="arrow-right" className="!h-10" onClick={() => setI(i + 1)}>Suivant</Btn>
                : <Btn variant="teal" icon="check-check" className="!h-10" onClick={onClose}>Terminer</Btn>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const items = [
    ["Comment Trivacare protège mes données médicales ?", "Vos données sont chiffrées de bout en bout et hébergées sur une infrastructure de santé certifiée. Elles ne sont transmises à une clinique qu'avec votre consentement explicite, étape par étape."],
    ["Que se passe-t-il quand je déclenche le SOS ?", "Votre position géolocalisée est immédiatement transmise à votre coordinatrice, qui vous rappelle et oriente les secours vers la clinique partenaire la plus proche."],
    ["Puis-je utiliser Trivacare dans plusieurs villes ?", "Oui. Ajoutez chaque étape dans Plans de voyage : nous coordonnons une clinique partenaire à chaque ville de votre itinéraire."],
    ["Comment fonctionne la dictée vocale du dossier ?", "Depuis le Dossier médical, appuyez sur « Dicter » et parlez : vos antécédents sont transcrits automatiquement, sans clavier."],
  ];
  const [open, setOpen] = uS(0);
  return (
    <Card className="p-5 sm:p-6">
      <h3 className="font-display font-bold text-[17px] text-ink mb-4">Questions fréquentes</h3>
      <div className="flex flex-col divide-y divide-slate-100">
        {items.map(([q, a], i) => (
          <div key={i} className="py-1">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-3 py-3 text-start">
              <span className="text-[14.5px] font-bold text-ink">{q}</span>
              <PIcon name="chevron-down" size={18} className={"text-slate-400 shrink-0 transition-transform " + (open === i ? "rotate-180" : "")} />
            </button>
            {open === i && <p className="pb-3 text-[14px] text-slate-600 leading-relaxed rise">{a}</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function Help({ startTour }) {
  return (
    <div>
      <PageHead title="Aide" subtitle="Prenez en main Trivacare et trouvez des réponses rapides." />
      <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <Card className="p-6 sm:p-7 bg-gradient-to-br from-ink to-brand-950 text-white relative overflow-hidden">
            <div className="absolute -top-12 -end-10 w-48 h-48 rounded-full bg-teal-400/20 blur-3xl"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <span className="grid place-items-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur shrink-0"><PIcon name="sparkles" size={32} className="text-teal-300" /></span>
              <div className="flex-1">
                <h3 className="font-display font-extrabold text-2xl">Visite guidée de l'application</h3>
                <p className="mt-1.5 text-[14.5px] text-slate-300">Découvrez chaque espace en 6 étapes : dossier, voyages, rendez-vous, paiements et sécurité.</p>
              </div>
              <Btn variant="primary" icon="play" className="shrink-0" onClick={startTour}>Démarrer la visite</Btn>
            </div>
          </Card>
          <FAQ />
        </div>

        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h3 className="font-display font-bold text-[16px] text-ink mb-3">Besoin d'aide humaine ?</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="relative"><Avatar initials="SA" size={44} tone="teal" /><span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-teal-400 ring-2 ring-white"></span></span>
              <div><p className="text-[14px] font-bold text-ink">{PATIENT.coordinator}</p><p className="text-[12px] text-teal-600 font-semibold">En ligne · votre coordinatrice</p></div>
            </div>
            <div className="flex flex-col gap-2">
              <Btn variant="primary" icon="messages-square" className="w-full">Discuter maintenant</Btn>
              <Btn variant="ghost" icon="phone" className="w-full">+212 5 24 00 11 22</Btn>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-display font-bold text-[16px] text-ink mb-3">Ressources</h3>
            <div className="flex flex-col gap-1">
              {[["file-text", "Guide du voyageur (PDF)"], ["shield-check", "Charte de confidentialité"], ["life-buoy", "Centre d'assistance"]].map(([ic, n]) => (
                <a key={n} href="#" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="grid place-items-center w-9 h-9 rounded-lg bg-slate-100 text-slate-500"><PIcon name={ic} size={17} /></span>
                  <span className="flex-1 text-[13.5px] font-semibold text-ink">{n}</span>
                  <PIcon name="arrow-up-right" size={15} className="text-slate-400" />
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Security, Account, Help, Tour });
