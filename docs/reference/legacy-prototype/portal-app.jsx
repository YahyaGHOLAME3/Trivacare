/* Trivacare patient portal — app shell + routing. */
function PortalApp() {
  const [view, setView] = uS(() => localStorage.getItem("triva_portal_view") || "dashboard");
  const [mobileOpen, setMobileOpen] = uS(false);
  const [sos, setSos] = uS(false);
  const [tour, setTour] = uS(false);
  const mainRef = uR(null);

  uE(() => {
    localStorage.setItem("triva_portal_view", view);
    if (mainRef.current) mainRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [view]);

  const views = {
    dashboard: <Dashboard setView={setView} />,
    medical: <MedicalFile />,
    travel: <TravelPlans />,
    rdv: <Appointments />,
    billing: <Billing />,
    security: <Security />,
    account: <Account />,
    help: <Help startTour={() => setTour(true)} />,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar view={view} setView={setView} onSOS={() => setSos(true)} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div ref={mainRef} className="flex-1 min-w-0 flex flex-col">
        <Topbar view={view} setMobileOpen={setMobileOpen} onSOS={() => setSos(true)} />
        <main className="flex-1 px-5 sm:px-7 py-6 sm:py-8 max-w-[1180px] w-full mx-auto" key={view}>
          <div className="rise">{views[view]}</div>
        </main>
      </div>
      <SOSModal open={sos} onClose={() => setSos(false)} />
      <Tour open={tour} onClose={() => setTour(false)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("portal-root")).render(<PortalApp />);
