/* Trivacare portal — Dossier médical (form, voice dictation, uploads, audio, images). */

function Recorder({ rec, onAdd }) {
  const [recording, setRecording] = uS(false);
  const [secs, setSecs] = uS(0);
  const [playing, setPlaying] = uS(null);
  const timer = uR(null);
  uE(() => {
    if (recording) { timer.current = setInterval(() => setSecs((s) => s + 1), 1000); }
    else clearInterval(timer.current);
    return () => clearInterval(timer.current);
  }, [recording]);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const stop = () => { if (secs > 0) onAdd(fmt(secs)); setRecording(false); setSecs(0); };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-[17px] text-ink flex items-center gap-2"><PIcon name="audio-lines" size={19} className="text-brand-600" /> Enregistrements audio</h3>
        <Badge tone="teal">{rec.length}</Badge>
      </div>

      <div className={"flex items-center gap-4 p-4 rounded-2xl border transition-colors " + (recording ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200")}>
        <button onClick={() => (recording ? stop() : setRecording(true))}
          className={"relative grid place-items-center w-14 h-14 rounded-full text-white shrink-0 transition-colors " + (recording ? "bg-rose-600" : "bg-brand-600 hover:bg-brand-700")}>
          {recording && <span className="absolute inset-0 rounded-full bg-rose-500/50" style={{ animation: "pulse-ring 1.6s ease-out infinite" }}></span>}
          <PIcon name={recording ? "pause" : "mic"} size={24} />
        </button>
        <div className="flex-1">
          <p className="font-bold text-[14px] text-ink">{recording ? "Enregistrement en cours…" : "Dictez vos symptômes ou antécédents"}</p>
          <p className="text-[12.5px] text-slate-500">{recording ? "Appuyez pour arrêter et sauvegarder" : "Transcription médicale automatique · sans clavier"}</p>
        </div>
        {recording && <span className="font-mono font-bold text-[18px] text-rose-600 tabular-nums">{fmt(secs)}</span>}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {rec.map((r, i) => {
          const on = playing === i;
          return (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-100">
              <button onClick={() => setPlaying(on ? null : i)} className="grid place-items-center w-9 h-9 rounded-full bg-brand-50 text-brand-600 shrink-0 hover:bg-brand-100"><PIcon name={on ? "pause" : "play"} size={15} /></button>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-semibold text-ink truncate">{r.name}</p>
                <div className="mt-1 flex items-center gap-1 h-3">
                  {Array.from({ length: 28 }).map((_, b) => (
                    <span key={b} className={"w-1 rounded-full " + (on ? "bg-brand-400" : "bg-slate-200")} style={{ height: `${4 + ((b * 7) % 11)}px` }}></span>
                  ))}
                </div>
              </div>
              <span className="font-mono text-[12px] text-slate-400">{r.dur}</span>
              <span className="grid place-items-center w-7 h-7 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"><PIcon name="trash-2" size={15} /></span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MedicalFile() {
  const [antecedents, setAntecedents] = uS("Diabète de type 2 diagnostiqué en 2009. Hypertension artérielle traitée. Pose d'un stent coronarien en 2019.");
  const [dictating, setDictating] = uS(false);
  const [allergies, setAllergies] = uS(["Pénicilline", "Arachides"]);
  const [allergyInput, setAllergyInput] = uS("");
  const [treatments, setTreatments] = uS([
    "Metformine 1000 mg — matin & soir",
    "Insuline Lantus — 18 UI le soir",
    "Aspirine 100 mg — matin",
  ]);
  const [treatInput, setTreatInput] = uS("");
  const [blood, setBlood] = uS("O+");
  const [docs, setDocs] = uS([
    { icon: "file-text", name: "Ordonnance — Insuline Lantus", meta: "PDF · 02 juin 2026" },
    { icon: "file-text", name: "Compte-rendu cardiologie 2019", meta: "PDF · 12 mai 2026" },
    { icon: "file-check-2", name: "Bilan sanguin — HbA1c 7,1%", meta: "PDF · 03 juin 2026" },
  ]);
  const [rec, setRec] = uS([
    { name: "Antécédents médicaux (dictée)", dur: "1:42" },
    { name: "Symptômes ressentis", dur: "0:48" },
  ]);
  const fileRef = uR(null);

  const dictate = () => {
    if (dictating) {
      setDictating(false);
      setAntecedents((t) => t + " Épisodes d'hypoglycémie matinale signalés depuis avril 2026.");
    } else setDictating(true);
  };
  const addAllergy = (e) => { e.preventDefault(); const v = allergyInput.trim(); if (v) { setAllergies((a) => [...a, v]); setAllergyInput(""); } };
  const addTreat = (e) => { e.preventDefault(); const v = treatInput.trim(); if (v) { setTreatments((t) => [...t, v]); setTreatInput(""); } };
  const onFiles = (e) => {
    const fs = [...(e.target.files || [])];
    if (fs.length) setDocs((d) => [...fs.map((f) => ({ icon: /image|png|jpg|jpeg/i.test(f.type) ? "image" : "file-text", name: f.name, meta: `${(f.size / 1024).toFixed(0)} Ko · à l'instant` })), ...d]);
  };

  return (
    <div>
      <PageHead title="Dossier médical" subtitle="Vos informations de santé, chiffrées et partagées uniquement avec votre accord.">
        <Badge tone="teal" icon="lock-keyhole">Chiffré de bout en bout</Badge>
      </PageHead>

      {/* completeness */}
      <Card className="p-4 mb-5 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13.5px] font-bold text-ink">Complétude du dossier</p>
            <p className="text-[13px] font-bold text-teal-700">85%</p>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden"><span className="block h-full w-[85%] rounded-full bg-gradient-to-r from-brand-600 to-teal-500"></span></div>
          <p className="mt-2 text-[12px] text-slate-400">Ajoutez votre carte d'assurance pour atteindre 100%.</p>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-5 items-start">
        {/* form */}
        <Card className="p-5 sm:p-6">
          <h3 className="font-display font-bold text-[17px] text-ink mb-5 flex items-center gap-2"><PIcon name="clipboard-plus" size={19} className="text-brand-600" /> Informations médicales</h3>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Field label="Groupe sanguin">
              <div className="relative">
                <select value={blood} onChange={(e) => setBlood(e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((b) => <option key={b}>{b}</option>)}
                </select>
                <PIcon name="droplet" size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="Médecin traitant (origine)">
              <input className={inputCls} defaultValue="Dr. Philippe Moreau — Lyon" />
            </Field>
          </div>

          {/* antecedents with dictation */}
          <Field label="Antécédents médicaux" className="mb-4">
            <div className="relative">
              <textarea value={antecedents} onChange={(e) => setAntecedents(e.target.value)} rows={4}
                className={inputCls + " !h-auto py-3 resize-none leading-relaxed"} />
              <button onClick={dictate} type="button"
                className={"absolute end-2.5 bottom-2.5 flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-bold transition-colors " + (dictating ? "bg-rose-600 text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100")}>
                <span className="relative grid place-items-center">{dictating && <span className="absolute inset-0 -m-1 rounded-full bg-rose-400/50" style={{ animation: "pulse-ring 1.4s ease-out infinite" }}></span>}<PIcon name="mic" size={14} /></span>
                {dictating ? "Arrêter" : "Dicter"}
              </button>
            </div>
            {dictating && <span className="block mt-1 text-[12px] font-semibold text-rose-600">Écoute en cours… parlez naturellement.</span>}
          </Field>

          {/* allergies chips */}
          <Field label="Allergies connues" className="mb-4">
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-11">
              {allergies.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 h-8 ps-3 pe-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-semibold">
                  <PIcon name="triangle-alert" size={13} /> {a}
                  <button onClick={() => setAllergies((arr) => arr.filter((_, j) => j !== i))} className="grid place-items-center w-5 h-5 rounded text-rose-400 hover:bg-rose-100"><PIcon name="x" size={12} /></button>
                </span>
              ))}
              <form onSubmit={addAllergy} className="flex-1 min-w-[120px]">
                <input value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} placeholder="Ajouter…" className="w-full h-8 px-2 bg-transparent text-[13px] outline-none" />
              </form>
            </div>
          </Field>

          {/* treatments */}
          <Field label="Traitements en cours" className="mb-5">
            <div className="flex flex-col gap-2">
              {treatments.map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 h-11 rounded-xl bg-slate-50 border border-slate-200">
                  <PIcon name="pill" size={16} className="text-teal-600 shrink-0" />
                  <span className="flex-1 text-[13.5px] font-medium text-ink">{t}</span>
                  <button onClick={() => setTreatments((arr) => arr.filter((_, j) => j !== i))} className="grid place-items-center w-7 h-7 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50"><PIcon name="trash-2" size={15} /></button>
                </div>
              ))}
              <form onSubmit={addTreat} className="flex items-center gap-2">
                <input value={treatInput} onChange={(e) => setTreatInput(e.target.value)} placeholder="Nom du médicament, dosage, fréquence…" className={inputCls} />
                <Btn variant="subtle" icon="plus" className="!h-11 shrink-0" type="submit">Ajouter</Btn>
              </form>
            </div>
          </Field>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <p className="text-[12px] text-slate-400 flex items-center gap-1.5"><PIcon name="info" size={14} /> Dernière mise à jour : aujourd'hui</p>
            <Btn variant="teal" icon="save">Enregistrer</Btn>
          </div>
        </Card>

        {/* right: uploads + audio + images */}
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h3 className="font-display font-bold text-[17px] text-ink mb-4">Documents & examens</h3>
            <button onClick={() => fileRef.current && fileRef.current.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-7 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50/50 transition-colors text-center">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600"><PIcon name="upload-cloud" size={24} /></span>
              <span className="text-[14px] font-bold text-ink">Glissez vos fichiers ou parcourez</span>
              <span className="text-[12px] text-slate-400">Ordonnances, analyses, imagerie · PDF, JPG, PNG, M4A</span>
            </button>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={onFiles} accept=".pdf,.jpg,.jpeg,.png,.m4a" />
            <div className="mt-4 flex flex-col gap-2">
              {docs.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-100">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 shrink-0"><PIcon name={d.icon} size={18} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-[13.5px] font-semibold text-ink truncate">{d.name}</span><span className="block text-[11.5px] text-slate-400">{d.meta}</span></span>
                  <button className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100"><PIcon name="download" size={16} /></button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-bold text-[17px] text-ink mb-4 flex items-center gap-2"><PIcon name="image" size={19} className="text-brand-600" /> Imagerie & photos</h3>
            <div className="grid grid-cols-3 gap-3">
              {[["Radio thorax", "from-slate-700 to-slate-900"], ["ECG", "from-teal-600 to-teal-800"], ["Ordonnance", "from-brand-600 to-brand-800"]].map(([n, g], i) => (
                <div key={i} className={"relative aspect-square rounded-2xl bg-gradient-to-br overflow-hidden group cursor-pointer " + g}>
                  <span className="absolute inset-0 grid place-items-center text-white/80"><PIcon name={i === 2 ? "file-text" : "image"} size={28} strokeWidth={1.5} /></span>
                  <span className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent text-white text-[11px] font-semibold">{n}</span>
                </div>
              ))}
              <button className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50/50 grid place-items-center text-slate-400 hover:text-brand-600 transition-colors"><PIcon name="plus" size={24} /></button>
            </div>
          </Card>

          <Recorder rec={rec} onAdd={(dur) => setRec((r) => [{ name: `Nouvel enregistrement`, dur }, ...r])} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MedicalFile });
