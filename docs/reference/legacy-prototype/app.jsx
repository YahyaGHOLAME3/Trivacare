/* Trivacare — main app: language + RTL state, composition. */
function App() {
  const [lang, setLang] = React.useState(() => localStorage.getItem("triva_lang") || "fr");
  const t = window.TRIVA_I18N[lang] || window.TRIVA_I18N.fr;
  const rtl = t.dir === "rtl";

  React.useEffect(() => {
    localStorage.setItem("triva_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    document.body.dir = t.dir;
  }, [lang, t.dir]);

  return (
    <div>
      <Header t={t} lang={lang} setLang={setLang} />
      <main>
        <Hero t={t} />
        <Intake t={t} lang={lang} />
        <Services t={t} />
        <Workflow t={t} />
        <SOS t={t} rtl={rtl} />
      </main>
      <Footer t={t} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
