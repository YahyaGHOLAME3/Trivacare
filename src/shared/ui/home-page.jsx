import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppIcon } from "../../assets/icons/app-icon";

const LANDING_COPY = {
  fr: {
    dir: "ltr",
    label: "Français",
    nav: {
      services: "Services",
      workflow: "Comment ça marche",
      security: "Sécurité",
      contact: "Contact",
      login: "Se connecter",
      cta: "Commencer mon parcours",
    },
    hero: {
      eyebrow: "Coordination médicale pour voyageurs",
      titleA: "Votre partenaire santé",
      titleB: "lors de vos voyages au Maroc",
      trust: "Données chiffrées · Conforme RGPD · Médecins coordinateurs francophones",
      network: {
        sub: "Un réseau de cliniques de confiance dans tout le Maroc, coordonné pour vous — où que vous voyagiez.",
        cities: ["Tanger", "Rabat", "Casablanca", "Fès", "Marrakech", "Agadir", "Essaouira"],
        stats: [["80+", "cliniques"], ["7", "villes"], ["24/7", "assistance"]],
        sosTitle: "Urgence géolocalisée",
        sosSub: "couverture nationale",
      },
    },
    intake: {
      title: "Démarrons votre parcours de soins",
      sub: "Trois informations suffisent pour préparer votre coordination.",
      typeLabel: "Profil du voyageur",
      typePlaceholder: "Sélectionnez votre profil",
      types: [
        "Maladie chronique (diabète, cardiaque...)",
        "Personne à mobilité réduite",
        "Senior nécessitant un suivi",
        "Besoin médical spécifique",
        "Grossesse à suivre",
      ],
      cityLabel: "Ville de destination",
      cityPlaceholder: "Choisissez une ville",
      cities: ["Marrakech", "Casablanca", "Rabat", "Fès", "Agadir", "Tanger", "Essaouira"],
      dateLabel: "Date d'arrivée",
      submit: "Préparer ma coordination",
      reassure: "Sans engagement · Réponse d'un coordinateur sous 2 h",
      successTitle: "Parcours initialisé",
      successBody: (type, city) => `Un coordinateur médical prépare votre dossier pour un profil "${type}" à ${city}. Vous pouvez maintenant créer votre espace sécurisé.`,
      successCta: "Créer mon espace patient",
      edit: "Modifier mes informations",
    },
    services: {
      eyebrow: "Nos quatre piliers",
      title: "Une prise en charge complète, du départ au retour",
      sub: "Cliquez sur un pilier pour découvrir comment nous prenons soin de vous.",
      items: [
        {
          icon: "stethoscope",
          title: "Coordination médicale experte",
          short: "Des médecins coordinateurs orchestrent chaque étape de vos soins.",
          long: "Nos coordinateurs francophones évaluent votre dossier, identifient la clinique adaptée et organisent rendez-vous, transferts et suivi.",
          points: ["Médecin coordinateur dédié", "Cliniques vérifiées et accréditées", "Suivi post-consultation"],
        },
        {
          icon: "shield-check",
          title: "Sécurité & confidentialité",
          short: "Vos données médicales sont chiffrées et ne sont partagées qu'avec votre accord.",
          long: "Chiffrement, hébergement de données de santé certifié et consentement granulaire : vous décidez qui accède à quoi.",
          points: ["Chiffrement de bout en bout", "Consentement granulaire", "Hébergement de santé certifié"],
        },
        {
          icon: "messages-square",
          title: "Communication en temps réel",
          short: "Messagerie sécurisée et bouton SOS reliés à votre coordinateur, 24h/24.",
          long: "Échangez par chat sécurisé, partagez photos et documents, et déclenchez le SOS géolocalisé en cas d'urgence.",
          points: ["Chat médical sécurisé", "SOS géolocalisé 24h/24", "Partage avec les proches"],
        },
        {
          icon: "accessibility",
          title: "Accessibilité innovante",
          short: "Dictez vos antécédents à la voix — transcription médicale instantanée.",
          long: "La saisie vocale et les interfaces accessibles simplifient les démarches pour les voyageurs fragiles ou accompagnés.",
          points: ["Antécédents à la voix", "Interface accessible", "Navigation clavier & lecteur d'écran"],
        },
      ],
    },
    workflow: {
      eyebrow: "Le parcours Trivacare",
      title: "De votre demande aux soins, en quatre étapes",
      sub: "Suivez le déroulé d'une prise en charge, étape par étape.",
      play: "Lancer la démo",
      pause: "Mettre en pause",
      steps: [
        { icon: "clipboard-plus", tag: "Étape 1 · Vous", title: "Demande de soins", desc: "Vous décrivez votre besoin depuis l'application, par texte ou à la voix.", meta: "Demande reçue · horodatée" },
        { icon: "users-round", tag: "Étape 2 · Trivacare", title: "Coordination & affectation", desc: "Un coordinateur analyse votre dossier et affecte la clinique la plus adaptée.", meta: "Clinique assignée · Marrakech" },
        { icon: "file-lock-2", tag: "Étape 3 · Sécurisé", title: "Transfert sécurisé du dossier", desc: "Vos documents sont transmis de façon chiffrée, avec votre consentement.", meta: "Dossier chiffré · transmis" },
        { icon: "heart-pulse", tag: "Étape 4 · Clinique", title: "Soins délivrés", desc: "Vous êtes accueilli et soigné. Le compte-rendu remonte dans votre espace.", meta: "Soins confirmés · suivi actif" },
      ],
    },
    sos: {
      eyebrow: "Urgences",
      title: "Un bouton. Votre position. De l'aide immédiate.",
      sub: "Le SOS géolocalisé alerte instantanément votre coordinateur et oriente les secours vers votre position exacte, où que vous soyez au Maroc.",
      points: ["Géolocalisation précise en temps réel", "Coordinateur médical alerté immédiatement", "Orientation vers l'hôpital le plus proche"],
      button: "SOS",
      buttonSub: "Maintenir 2 s",
      idle: "Système prêt · couverture nationale",
      active: "Position transmise · coordinateur alerté",
      locating: "Localisation...",
      cardTitle: "Clinique la plus proche",
      cardName: "Clinique Internationale Atlas",
      cardDistance: "1,2 km · 4 min",
      cardEta: "Coordinateur en ligne",
    },
    footer: {
      tagline: "La coordination médicale qui voyage avec vous.",
      colProduct: "Produit",
      colCompany: "Entreprise",
      colLegal: "Légal",
      product: ["Services", "Comment ça marche", "Sécurité", "Tarifs"],
      company: ["À propos", "Cliniques partenaires", "Carrières", "Contact"],
      legal: ["Confidentialité", "Conditions", "Mentions légales", "RGPD"],
      rights: "© 2026 Trivacare. Tous droits réservés.",
      made: "Conçu avec soin pour les voyageurs au Maroc.",
      compliance: "CNDP Loi 09-08 [En cours]",
    },
  },
  en: {
    dir: "ltr",
    label: "English",
    nav: {
      services: "Services",
      workflow: "How it works",
      security: "Security",
      contact: "Contact",
      login: "Log in",
      cta: "Start my journey",
    },
    hero: {
      eyebrow: "Medical coordination for travelers",
      titleA: "Your health partner",
      titleB: "for your travels in Morocco",
      trust: "Encrypted data · GDPR compliant · French-speaking coordinating doctors",
      network: {
        sub: "A network of trusted clinics across Morocco, coordinated for you — wherever you travel.",
        cities: ["Tangier", "Rabat", "Casablanca", "Fès", "Marrakech", "Agadir", "Essaouira"],
        stats: [["80+", "clinics"], ["7", "cities"], ["24/7", "support"]],
        sosTitle: "Geo-located emergency",
        sosSub: "nationwide coverage",
      },
    },
    intake: {
      title: "Let's start your care journey",
      sub: "Three details are enough to prepare your coordination.",
      typeLabel: "Traveler profile",
      typePlaceholder: "Select your profile",
      types: ["Chronic illness", "Reduced mobility", "Senior needing follow-up", "Specific medical need", "Pregnancy to monitor"],
      cityLabel: "Destination city",
      cityPlaceholder: "Choose a city",
      cities: ["Marrakech", "Casablanca", "Rabat", "Fès", "Agadir", "Tangier", "Essaouira"],
      dateLabel: "Arrival date",
      submit: "Prepare my coordination",
      reassure: "No commitment · A coordinator replies within 2 h",
      successTitle: "Journey initialized",
      successBody: (type, city) => `A medical coordinator is preparing your file for a "${type}" profile in ${city}. You can now create your secure space.`,
      successCta: "Create my patient space",
      edit: "Edit my details",
    },
    services: {
      eyebrow: "Our four pillars",
      title: "Complete care, from departure to return",
      sub: "Tap a pillar to see how we take care of you.",
      items: [
        { icon: "stethoscope", title: "Expert medical coordination", short: "Coordinating doctors orchestrate every step of your care.", long: "Our coordinators review your file, identify the right clinic, and arrange appointments, transfers and follow-up.", points: ["Dedicated coordinating doctor", "Verified clinics", "Post-consultation follow-up"] },
        { icon: "shield-check", title: "Security & confidentiality", short: "Your medical data is encrypted and shared only with consent.", long: "Encryption, certified health hosting and granular consent keep control in your hands.", points: ["End-to-end encryption", "Granular consent", "Certified health hosting"] },
        { icon: "messages-square", title: "Real-time communication", short: "Secure messaging and SOS linked to your coordinator, 24/7.", long: "Chat securely, share documents, and trigger geo-located SOS in an emergency.", points: ["Secure medical chat", "Geo-located SOS 24/7", "Family sharing"] },
        { icon: "accessibility", title: "Innovative accessibility", short: "Dictate your history by voice — instant medical transcription.", long: "Voice input and accessible interfaces simplify the journey for fragile travelers.", points: ["History by voice", "Accessible interface", "Keyboard & screen-reader ready"] },
      ],
    },
    workflow: {
      eyebrow: "The Trivacare journey",
      title: "From your request to care, in four steps",
      sub: "Follow how a case is handled, step by step.",
      play: "Play demo",
      pause: "Pause",
      steps: [
        { icon: "clipboard-plus", tag: "Step 1 · You", title: "Care request", desc: "You describe your need in the app by text or voice.", meta: "Request received · timestamped" },
        { icon: "users-round", tag: "Step 2 · Trivacare", title: "Coordination & assignment", desc: "A coordinator reviews your file and assigns the best clinic.", meta: "Clinic assigned · Marrakech" },
        { icon: "file-lock-2", tag: "Step 3 · Secure", title: "Secure file transfer", desc: "Your documents are sent encrypted, with your consent.", meta: "File encrypted · transmitted" },
        { icon: "heart-pulse", tag: "Step 4 · Clinic", title: "Care delivered", desc: "You are welcomed and treated. Reports return to your space.", meta: "Care confirmed · follow-up active" },
      ],
    },
    sos: {
      eyebrow: "Emergencies",
      title: "One button. Your location. Help right away.",
      sub: "Geo-located SOS instantly alerts your coordinator and directs help to your exact position, anywhere in Morocco.",
      points: ["Precise real-time geolocation", "Medical coordinator alerted instantly", "Routed to the nearest hospital"],
      button: "SOS",
      buttonSub: "Hold 2 s",
      idle: "System ready · nationwide coverage",
      active: "Location sent · coordinator alerted",
      locating: "Locating...",
      cardTitle: "Nearest clinic",
      cardName: "Atlas International Clinic",
      cardDistance: "1.2 km · 4 min",
      cardEta: "Coordinator online",
    },
    footer: {
      tagline: "Medical coordination that travels with you.",
      colProduct: "Product",
      colCompany: "Company",
      colLegal: "Legal",
      product: ["Services", "How it works", "Security", "Pricing"],
      company: ["About", "Partner clinics", "Careers", "Contact"],
      legal: ["Privacy", "Terms", "Legal notice", "GDPR"],
      rights: "© 2026 Trivacare. All rights reserved.",
      made: "Crafted with care for travelers in Morocco.",
      compliance: "CNDP Law 09-08 [In progress]",
    },
  },
  ar: {
    dir: "rtl",
    label: "العربية",
    nav: {
      services: "الخدمات",
      workflow: "كيف نعمل",
      security: "الأمان",
      contact: "اتصل بنا",
      login: "تسجيل الدخول",
      cta: "ابدأ رحلتي",
    },
    hero: {
      eyebrow: "تنسيق طبي للمسافرين",
      titleA: "شريكك الصحي",
      titleB: "خلال أسفارك في المغرب",
      trust: "بيانات مشفرة · متوافق مع GDPR · أطباء منسقون ناطقون بالفرنسية",
      network: {
        sub: "شبكة من العيادات الموثوقة في كل المغرب، منسقة من أجلك أينما سافرت.",
        cities: ["طنجة", "الرباط", "الدار البيضاء", "فاس", "مراكش", "أكادير", "الصويرة"],
        stats: [["80+", "عيادة"], ["7", "مدن"], ["24/7", "مساعدة"]],
        sosTitle: "طوارئ محددة جغرافيا",
        sosSub: "تغطية وطنية",
      },
    },
    intake: {
      title: "لنبدأ رحلة رعايتك",
      sub: "ثلاث معلومات تكفي لتحضير التنسيق الخاص بك.",
      typeLabel: "ملف المسافر",
      typePlaceholder: "اختر ملفك",
      types: ["مرض مزمن", "حركة محدودة", "مسن يحتاج متابعة", "احتياج طبي خاص", "حمل قيد المتابعة"],
      cityLabel: "مدينة الوجهة",
      cityPlaceholder: "اختر مدينة",
      cities: ["مراكش", "الدار البيضاء", "الرباط", "فاس", "أكادير", "طنجة", "الصويرة"],
      dateLabel: "تاريخ الوصول",
      submit: "حضر التنسيق",
      reassure: "بدون التزام · يرد المنسق خلال ساعتين",
      successTitle: "تم بدء الرحلة",
      successBody: (type, city) => `يقوم منسق طبي بتحضير ملفك لملف "${type}" في ${city}. يمكنك الآن إنشاء فضائك الآمن.`,
      successCta: "إنشاء فضائي كمريض",
      edit: "تعديل معلوماتي",
    },
    services: {
      eyebrow: "ركائزنا الأربع",
      title: "رعاية متكاملة، من المغادرة إلى العودة",
      sub: "انقر على ركيزة لاكتشاف كيف نعتني بك.",
      items: [
        { icon: "stethoscope", title: "تنسيق طبي خبير", short: "أطباء منسقون يديرون كل خطوة من رعايتك.", long: "يراجع منسقونا ملفك ويحددون العيادة المناسبة وينظمون المواعيد والمتابعة.", points: ["طبيب منسق مخصص", "عيادات موثوقة", "متابعة بعد الاستشارة"] },
        { icon: "shield-check", title: "الأمان والسرية", short: "بياناتك الطبية مشفرة ولا تشارك إلا بموافقتك.", long: "التشفير والاستضافة الصحية والموافقة الدقيقة تبقي التحكم بين يديك.", points: ["تشفير من طرف إلى طرف", "موافقة دقيقة", "استضافة صحية معتمدة"] },
        { icon: "messages-square", title: "تواصل فوري", short: "مراسلة آمنة وزر SOS مرتبط بمنسقك، 24/24.", long: "تواصل بأمان وشارك الوثائق وأطلق SOS المحدد جغرافيا عند الطوارئ.", points: ["دردشة طبية آمنة", "SOS جغرافي 24/24", "مشاركة مع الأقارب"] },
        { icon: "accessibility", title: "إتاحة مبتكرة", short: "أمل سوابقك صوتيا — تفريغ طبي فوري.", long: "الإدخال الصوتي والواجهات المتاحة يبسطان الرحلة للمسافرين الأكثر احتياجا.", points: ["سوابق بالصوت", "واجهة متاحة", "دعم لوحة المفاتيح وقارئ الشاشة"] },
      ],
    },
    workflow: {
      eyebrow: "مسار Trivacare",
      title: "من طلبك إلى الرعاية، في أربع خطوات",
      sub: "تابع كيف تتم معالجة الحالة، خطوة بخطوة.",
      play: "تشغيل العرض",
      pause: "إيقاف مؤقت",
      steps: [
        { icon: "clipboard-plus", tag: "خطوة 1 · أنت", title: "طلب الرعاية", desc: "تصف حاجتك من التطبيق كتابة أو صوتا.", meta: "تم استلام الطلب · مؤرخ" },
        { icon: "users-round", tag: "خطوة 2 · Trivacare", title: "تنسيق وتخصيص", desc: "يحلل المنسق ملفك ويخصص أنسب عيادة.", meta: "عيادة مخصصة · مراكش" },
        { icon: "file-lock-2", tag: "خطوة 3 · آمن", title: "نقل آمن للملف", desc: "ترسل وثائقك بشكل مشفر وبموافقتك.", meta: "ملف مشفر · مرسل" },
        { icon: "heart-pulse", tag: "خطوة 4 · العيادة", title: "تقديم الرعاية", desc: "تستقبل وتعالج، ويعود التقرير إلى فضائك.", meta: "رعاية مؤكدة · متابعة نشطة" },
      ],
    },
    sos: {
      eyebrow: "الطوارئ",
      title: "زر واحد. موقعك. مساعدة فورية.",
      sub: "ينبه SOS الجغرافي منسقك فورا ويوجه المساعدة إلى موقعك بالضبط، أينما كنت في المغرب.",
      points: ["تحديد جغرافي دقيق وفوري", "تنبيه المنسق الطبي فورا", "توجيه نحو أقرب مستشفى"],
      button: "SOS",
      buttonSub: "اضغط ثانيتين",
      idle: "النظام جاهز · تغطية وطنية",
      active: "تم إرسال الموقع · تنبيه المنسق",
      locating: "جار تحديد الموقع...",
      cardTitle: "أقرب عيادة",
      cardName: "عيادة أطلس الدولية",
      cardDistance: "1.2 كم · 4 د",
      cardEta: "المنسق متصل",
    },
    footer: {
      tagline: "التنسيق الطبي الذي يسافر معك.",
      colProduct: "المنتج",
      colCompany: "الشركة",
      colLegal: "قانوني",
      product: ["الخدمات", "كيف نعمل", "الأمان", "الأسعار"],
      company: ["من نحن", "العيادات الشريكة", "الوظائف", "اتصل بنا"],
      legal: ["الخصوصية", "الشروط", "إشعار قانوني", "GDPR"],
      rights: "© 2026 Trivacare. كل الحقوق محفوظة.",
      made: "صمم بعناية للمسافرين في المغرب.",
      compliance: "CNDP القانون 09-08 [قيد الإنجاز]",
    },
  },
};

const LANGS = ["fr", "en", "ar"];

const HERO_NETWORK_BOUNDS = {
  west: -10.55,
  east: -2.65,
  north: 36.15,
  south: 29.35,
};

function projectHeroPoint(lon, lat) {
  return {
    x: ((lon - HERO_NETWORK_BOUNDS.west) / (HERO_NETWORK_BOUNDS.east - HERO_NETWORK_BOUNDS.west)) * 100,
    y: ((HERO_NETWORK_BOUNDS.north - lat) / (HERO_NETWORK_BOUNDS.north - HERO_NETWORK_BOUNDS.south)) * 100,
  };
}

const HERO_CITY_POINTS = [
  { lon: -5.812, lat: 35.759, labelDx: 0, labelDy: 9 },
  { lon: -6.85, lat: 34.021, labelDx: 8, labelDy: 8 },
  { lon: -7.59, lat: 33.573, labelDx: -9, labelDy: 8 },
  { lon: -4.999, lat: 34.033, labelDx: 2, labelDy: 8 },
  { lon: -7.981, lat: 31.63, labelDx: 8, labelDy: 8 },
  { lon: -9.598, lat: 30.428, labelDx: 0, labelDy: 9 },
  { lon: -9.76, lat: 31.508, labelDx: -3, labelDy: 9 },
];

const HERO_NODES = HERO_CITY_POINTS.map((city) => ({
  ...projectHeroPoint(city.lon, city.lat),
  labelDx: city.labelDx,
  labelDy: city.labelDy,
}));
const HERO_HUB = projectHeroPoint(-6.35, 32.34);

function LandingLogo({ light = false }) {
  return (
    <span className="flex items-center gap-2.5 select-none">
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-600 shadow-glow">
        <AppIcon name="heart-pulse" size={22} className="text-white" strokeWidth={2.2} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-teal-300 ring-2 ring-white" />
      </span>
      <span className={`font-display text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        Triva<span className="text-brand-600">care</span>
      </span>
    </span>
  );
}

function LangToggle({ lang, setLang, light = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors ${
          light ? "text-white/90 hover:bg-white/10" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        <AppIcon name="globe" size={18} className={light ? "text-teal-300" : "text-brand-600"} />
        <span className="uppercase tracking-wide">{lang}</span>
        <AppIcon name="chevron-down" size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <ul role="listbox" className="rise absolute right-0 z-50 mt-2 w-44 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lift">
          {LANGS.map((item) => (
            <li key={item}>
              <button
                type="button"
                role="option"
                aria-selected={lang === item}
                onClick={() => {
                  setLang(item);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  lang === item ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{LANDING_COPY[item].label}</span>
                {lang === item ? <AppIcon name="check" size={16} className="text-brand-600" /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Header({ t, lang, setLang }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const links = [
    ["services", "#services"],
    ["workflow", "#workflow"],
    ["security", "#security"],
    ["contact", "#contact"],
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${
        scrolled ? "border-slate-200/70 bg-white/85 shadow-soft backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <a href="#top" className="shrink-0" aria-label="Trivacare">
            <LandingLogo light={!scrolled} />
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            {links.map(([key, href]) => (
              <a
                key={key}
                href={href}
                className={`rounded-lg px-3.5 py-2 text-[15px] font-semibold transition-colors ${
                  scrolled ? "text-slate-600 hover:bg-brand-50 hover:text-brand-700" : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.nav[key]}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:block">
              <LangToggle lang={lang} setLang={setLang} light={!scrolled} />
            </div>
            <Link
              to="/connexion/patient"
              className={`hidden h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors md:flex ${
                scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white/90 hover:bg-white/10"
              }`}
            >
              <AppIcon name="log-in" size={18} /> {t.nav.login}
            </Link>
            <Link
              to="/inscription/patient"
              className="hidden h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-brand-500 sm:flex"
            >
              {t.nav.cta} <AppIcon name="arrow-right" size={17} className="flip-x" />
            </Link>
            <button
              type="button"
              onClick={() => setMenu(true)}
              className={`grid h-11 w-11 place-items-center rounded-xl transition-colors lg:hidden ${
                scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
              }`}
              aria-label="Menu"
            >
              <AppIcon name="menu" size={24} />
            </button>
          </div>
        </div>
      </div>

      {menu ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setMenu(false)} />
          <div className="rise absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-white p-5 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <LandingLogo />
              <button type="button" onClick={() => setMenu(false)} className="grid h-11 w-11 place-items-center rounded-xl text-slate-700 hover:bg-slate-100" aria-label="Fermer">
                <AppIcon name="x" size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Navigation mobile">
              {links.map(([key, href]) => (
                <a key={key} href={href} onClick={() => setMenu(false)} className="rounded-xl px-4 py-3.5 text-lg font-semibold text-slate-800 hover:bg-brand-50 hover:text-brand-700">
                  {t.nav[key]}
                </a>
              ))}
            </nav>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <LangToggle lang={lang} setLang={setLang} />
            </div>
            <div className="mt-auto flex flex-col gap-2.5 pt-5">
              <Link to="/connexion/patient" onClick={() => setMenu(false)} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
                <AppIcon name="log-in" size={18} /> {t.nav.login}
              </Link>
              <Link to="/inscription/patient" onClick={() => setMenu(false)} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 font-bold text-white shadow-glow">
                {t.nav.cta} <AppIcon name="arrow-right" size={18} className="flip-x" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Hero({ t }) {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-br from-ink via-brand-950 to-slate-950">
      <div className="grain absolute inset-0 opacity-30" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(120,160,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(120,160,255,.06) 1px,transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <div className="pointer-events-none absolute right-[18%] top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-[420px] w-[420px] rounded-full bg-teal-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-5 pb-28 pt-[112px] sm:px-8 lg:pb-36 lg:pt-[136px]">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-8">
          <div className="rise text-center lg:text-left">
            <span className="inline-flex h-8 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 text-[12.5px] font-bold text-teal-300 backdrop-blur">
              <AppIcon name="waypoints" size={14} /> {t.hero.eyebrow}
            </span>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,5.2vw,3.7rem)] font-extrabold leading-[1.04] text-white">
              {t.hero.titleA} <span className="text-teal-300">{t.hero.titleB}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-slate-300 sm:text-lg lg:mx-0">{t.hero.network.sub}</p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link to="/inscription/patient" className="flex min-h-12 items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 font-bold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-brand-500 active:scale-[.98]">
                {t.nav.cta} <AppIcon name="arrow-right" size={19} className="flip-x" />
              </Link>
              <a href="#workflow" className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition-colors hover:bg-white/15">
                {t.nav.workflow}
              </a>
            </div>

            <p className="mt-6 flex items-center justify-center gap-2 text-[13.5px] font-semibold text-teal-300 lg:justify-start">
              <AppIcon name="lock-keyhole" size={16} /> {t.hero.trust}
            </p>

            <dl className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:justify-start">
              {t.hero.network.stats.map(([value, label]) => (
                <div key={label} className="leading-tight">
                  <dd className="font-display text-[1.7rem] font-extrabold text-white">{value}</dd>
                  <dt className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="rise relative h-[360px] sm:h-[440px] lg:h-[500px]" style={{ animationDelay: "100ms" }}>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <defs>
                <radialGradient id="heroHubGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#33b89c" stopOpacity=".5" />
                  <stop offset="100%" stopColor="#33b89c" stopOpacity="0" />
                </radialGradient>
              </defs>
              {HERO_NODES.map((node, index) => (
                <line key={index} x1={HERO_HUB.x} y1={HERO_HUB.y} x2={node.x} y2={node.y} stroke="rgba(140,178,255,.35)" strokeWidth=".4" strokeDasharray="1.4 1.4" />
              ))}
              <circle cx={HERO_HUB.x} cy={HERO_HUB.y} r="15" fill="url(#heroHubGlow)" />
            </svg>

            <span className="absolute" style={{ left: `${HERO_HUB.x}%`, top: `${HERO_HUB.y}%`, transform: "translate(-50%,-50%)" }}>
              <span className="absolute inset-0 -m-3 rounded-2xl bg-teal-400/30" style={{ animation: "pulse-ring 2.4s ease-out infinite" }} />
              <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 text-white shadow-glow">
                <AppIcon name="heart-pulse" size={22} strokeWidth={2.2} />
              </span>
            </span>

            {HERO_NODES.map((node, index) => (
              <span key={index} className="absolute" style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%,-50%)" }}>
                <span className="absolute inset-0 -m-1 rounded-full bg-brand-400/40" style={{ animation: "pulse-ring 2.2s ease-out infinite", animationDelay: `${index * 0.3}s` }} />
                <span className="relative grid h-4 w-4 place-items-center rounded-full bg-teal-300 ring-4 ring-teal-300/20" />
                <span
                  className="absolute left-1/2 top-full whitespace-nowrap rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 text-[10.5px] font-bold text-white/90 backdrop-blur"
                  style={{ transform: `translate(calc(-50% + ${node.labelDx}px), ${node.labelDy}px)` }}
                >
                  {t.hero.network.cities[index]}
                </span>
              </span>
            ))}

            <div className="absolute bottom-0 right-0 flex items-center gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-500/15 px-3.5 py-2.5 backdrop-blur" style={{ animation: "floaty 6s ease-in-out infinite" }}>
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-rose-500 font-display text-[11px] font-extrabold text-white">
                SOS
                <span className="absolute inset-0 rounded-full bg-rose-500/50" style={{ animation: "pulse-ring 2s ease-out infinite" }} />
              </span>
              <span className="leading-tight">
                <span className="block text-[12.5px] font-bold text-white">{t.hero.network.sosTitle}</span>
                <span className="block font-mono text-[10.5px] text-rose-200">{t.hero.network.sosSub}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Intake({ t }) {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [done, setDone] = useState(false);
  const ready = type && city && date;
  const today = new Date().toISOString().split("T")[0];
  const inputClass = "h-12 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-[15px] font-medium text-ink transition-colors hover:border-brand-300 focus-visible:border-brand-500";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (ready) setDone(true);
  };

  return (
    <section id="intake" className="relative z-10 -mt-12 scroll-mt-24 px-5 pb-4 sm:px-8 lg:-mt-16">
      <div className="mx-auto max-w-[1040px]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lift">
          <div className="grid md:grid-cols-[1fr_1.55fr]">
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 p-7 text-white sm:p-8">
              <div className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-teal-400/20 blur-2xl" />
              <span className="inline-flex h-7 items-center gap-2 rounded-full bg-white/15 px-3 text-[12px] font-bold backdrop-blur">
                <AppIcon name="sparkles" size={13} /> {t.hero.eyebrow}
              </span>
              <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight sm:text-[28px]">{t.intake.title}</h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-brand-100">{t.intake.sub}</p>
              <p className="mt-6 flex items-center gap-2 text-[13px] font-semibold text-teal-200">
                <AppIcon name="shield-check" size={17} /> {t.intake.reassure}
              </p>
            </div>

            <div className="p-7 sm:p-8">
              {!done ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-slate-700">
                      <AppIcon name="users-round" size={15} className="text-brand-600" /> {t.intake.typeLabel}
                    </span>
                    <div className="relative">
                      <select value={type} onChange={(event) => setType(event.target.value)} className={inputClass} required>
                        <option value="" disabled>{t.intake.typePlaceholder}</option>
                        {t.intake.types.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                      <AppIcon name="chevron-down" size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-slate-700">
                        <AppIcon name="map-pin" size={15} className="text-brand-600" /> {t.intake.cityLabel}
                      </span>
                      <div className="relative">
                        <select value={city} onChange={(event) => setCity(event.target.value)} className={inputClass} required>
                          <option value="" disabled>{t.intake.cityPlaceholder}</option>
                          {t.intake.cities.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                        <AppIcon name="chevron-down" size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-slate-700">
                        <AppIcon name="calendar-days" size={15} className="text-brand-600" /> {t.intake.dateLabel}
                      </span>
                      <input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} className={`${inputClass} font-mono text-sm`} required />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!ready}
                    className={`mt-1 flex min-h-12 items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all ${
                      ready ? "bg-brand-600 shadow-glow hover:-translate-y-0.5 hover:bg-brand-700 active:scale-[.98]" : "cursor-not-allowed bg-slate-300"
                    }`}
                  >
                    {t.intake.submit} <AppIcon name="arrow-right" size={18} className="flip-x" />
                  </button>
                </form>
              ) : (
                <div className="rise flex h-full flex-col justify-center py-4 text-center">
                  <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-teal-600" style={{ animation: "floaty 4s ease-in-out infinite" }}>
                    <AppIcon name="badge-check" size={36} strokeWidth={2} />
                  </span>
                  <h3 className="font-display text-2xl font-extrabold text-ink">{t.intake.successTitle}</h3>
                  <p className="mx-auto mt-2.5 max-w-sm text-[15px] leading-relaxed text-slate-600">{t.intake.successBody(type, city)}</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => navigate("/inscription/patient")} className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-glow">
                      {t.intake.successCta}
                    </button>
                    <button type="button" onClick={() => setDone(false)} className="text-[14px] font-bold text-brand-600 underline underline-offset-4 hover:text-brand-700">
                      {t.intake.edit}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12.5px] font-extrabold uppercase tracking-[.14em] text-brand-600">
      <span className="h-px w-6 bg-brand-300" />
      {children}
    </span>
  );
}

function Services({ t }) {
  const [active, setActive] = useState(0);
  const current = t.services.items[active];

  return (
    <section id="services" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <Eyebrow>{t.services.eyebrow}</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] font-extrabold leading-[1.08] text-brand-600">{t.services.title}</h2>
          <p className="mt-4 text-lg text-slate-600">{t.services.sub}</p>
        </div>

        <div className="mt-10 grid items-start gap-5 lg:grid-cols-2 lg:gap-7">
          <div className="grid gap-4 sm:grid-cols-2">
            {t.services.items.map((item, index) => {
              const selected = index === active;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={selected}
                  className={`group rounded-3xl border p-5 text-left transition-all duration-200 ${
                    selected ? "bg-white border-brand-300 shadow-lift -translate-y-0.5 ring-1 ring-brand-200" : "border-slate-200 bg-white/70 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft"
                  }`}
                >
                  <span className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl transition-colors ${selected ? "bg-brand-600 text-white shadow-glow" : "bg-brand-50 text-brand-600 group-hover:bg-brand-100"}`}>
                    <AppIcon name={item.icon} size={24} strokeWidth={1.9} />
                  </span>
                  <h3 className="font-display text-[17px] font-bold leading-snug text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-slate-500">{item.short}</p>
                </button>
              );
            })}
          </div>

          <div key={active} className="rise relative min-h-[340px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink to-brand-950 p-7 text-white shadow-lift sm:p-9">
            <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-12 h-60 w-60 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="relative">
              <span className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/15 backdrop-blur">
                <AppIcon name={current.icon} size={28} strokeWidth={1.8} />
              </span>
              <h3 className="font-display text-2xl font-extrabold leading-tight sm:text-[26px]">{current.title}</h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-slate-300">{current.long}</p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {current.points.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-[15px] font-semibold">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-400/20 text-teal-300">
                      <AppIcon name="check" size={14} strokeWidth={2.6} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Workflow({ t }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(() => {
    try {
      return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return true;
    }
  });
  const steps = t.workflow.steps;
  const current = steps[step];
  const pct = steps.length > 1 ? (step / (steps.length - 1)) * 100 : 0;

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setStep((value) => (value + 1) % steps.length), 2600);
    return () => window.clearInterval(timer);
  }, [playing, steps.length]);

  const jump = (index) => {
    setPlaying(false);
    setStep(index);
  };

  return (
    <section id="workflow" className="scroll-mt-16 border-y border-slate-200/70 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <Eyebrow>{t.workflow.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] font-extrabold leading-[1.08] text-ink">{t.workflow.title}</h2>
            <p className="mt-4 text-lg text-slate-600">{t.workflow.sub}</p>
          </div>
          <button type="button" onClick={() => setPlaying((value) => !value)} className="flex h-12 shrink-0 items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-5 font-bold text-brand-700 transition-colors hover:bg-brand-100">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white">
              <AppIcon name={playing ? "x" : "arrow-right"} size={14} strokeWidth={2.6} className={playing ? "" : "flip-x"} />
            </span>
            {playing ? t.workflow.pause : t.workflow.play}
          </button>
        </div>

        <div className="mt-12">
          <div className="relative hidden md:block">
            <div className="absolute inset-x-[7%] top-7 h-1 rounded-full bg-slate-200" />
            <div className="absolute left-[7%] top-7 h-1 rounded-full bg-gradient-to-r from-brand-600 to-teal-500 transition-all duration-500" style={{ width: `calc(${pct}% * 0.86)` }} />
            <ol className="relative grid grid-cols-4 gap-4">
              {steps.map((item, index) => {
                const reached = index <= step;
                const selected = index === step;
                return (
                  <li key={item.title} className="flex flex-col items-center text-center">
                    <button type="button" onClick={() => jump(index)} className={`relative grid h-14 w-14 place-items-center rounded-2xl border-2 bg-white transition-all duration-300 ${reached ? "border-brand-600 text-brand-600 shadow-soft" : "border-slate-200 text-slate-400"} ${selected ? "scale-110 bg-brand-600 !text-white shadow-glow" : ""}`}>
                      <AppIcon name={item.icon} size={24} strokeWidth={1.9} />
                      {selected ? <span className="absolute inset-0 rounded-2xl border-2 border-brand-400" style={{ animation: "pulse-ring 1.8s ease-out infinite" }} /> : null}
                    </button>
                    <span className={`mt-3 text-[11px] font-bold uppercase tracking-wide ${reached ? "text-brand-600" : "text-slate-400"}`}>{item.tag}</span>
                    <span className={`mt-1 font-display text-[15px] font-bold leading-tight ${reached ? "text-ink" : "text-slate-400"}`}>{item.title}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <ol className="relative flex flex-col md:hidden">
            {steps.map((item, index) => {
              const reached = index <= step;
              const selected = index === step;
              return (
                <li key={item.title} className="relative flex gap-4 pb-5 last:pb-0">
                  <div className="flex flex-col items-center self-stretch">
                    <button type="button" onClick={() => jump(index)} className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 bg-white transition-all duration-300 ${reached ? "border-brand-600 text-brand-600 shadow-soft" : "border-slate-200 text-slate-400"} ${selected ? "bg-brand-600 !text-white shadow-glow" : ""}`}>
                      <AppIcon name={item.icon} size={24} strokeWidth={1.9} />
                    </button>
                    {index < steps.length - 1 ? <span className="my-1.5 h-9 w-1 shrink-0 overflow-hidden rounded-full bg-slate-200"><span className={`block w-full rounded-full bg-gradient-to-b from-brand-600 to-teal-500 transition-all duration-500 ${index < step ? "h-full" : "h-0"}`} /></span> : null}
                  </div>
                  <button type="button" onClick={() => jump(index)} className="flex-1 pt-2.5 text-left">
                    <span className={`block text-[11px] font-bold uppercase tracking-wide ${reached ? "text-brand-600" : "text-slate-400"}`}>{item.tag}</span>
                    <span className={`block font-display text-[16px] font-bold leading-tight ${reached ? "text-ink" : "text-slate-400"}`}>{item.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div key={step} className="rise mt-10 grid items-stretch gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-7 sm:p-9">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
                <AppIcon name={current.icon} size={24} />
              </span>
              <span className="text-[12px] font-extrabold uppercase tracking-[.12em] text-brand-600">{current.tag}</span>
            </div>
            <h3 className="font-display text-2xl font-extrabold leading-tight text-ink sm:text-[28px]">{current.title}</h3>
            <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-slate-600">{current.desc}</p>
          </div>

          <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-ink p-6 text-white sm:p-7">
            <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-[12px] text-teal-300">
                <span className="h-2 w-2 rounded-full bg-teal-400" style={{ animation: "floaty 2s ease-in-out infinite" }} />
                trivacare · live
              </span>
              <span className="font-mono text-[12px] text-slate-400">#TRV-2418</span>
            </div>
            <div className="relative mt-5">
              <div className="mb-3 flex items-end gap-1.5">
                {steps.map((item, index) => <span key={item.title} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${index <= step ? "bg-teal-400" : "bg-white/15"}`} />)}
              </div>
              <p className="flex items-center gap-2 font-mono text-[14px] text-white">
                <AppIcon name="check" size={16} className="text-teal-400" strokeWidth={3} /> {current.meta}
              </p>
              <p className="mt-2 font-mono text-[12px] text-slate-400">{String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")} · {current.tag}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SOS({ t }) {
  const [active, setActive] = useState(false);
  const [locating, setLocating] = useState(false);

  const trigger = () => {
    if (active) {
      setActive(false);
      return;
    }

    setLocating(true);
    window.setTimeout(() => {
      setLocating(false);
      setActive(true);
    }, 1300);
  };

  return (
    <section id="security" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-br from-ink via-brand-950 to-slate-950 py-20 sm:py-28">
      <div className="grain absolute inset-0 opacity-40" />
      <div className="absolute -top-24 left-1/4 h-[420px] w-[420px] rounded-full bg-brand-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-10 h-[360px] w-[360px] rounded-full bg-rose-600/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex h-8 items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/15 px-3.5 text-[12.5px] font-extrabold uppercase tracking-[.12em] text-rose-300">
              <AppIcon name="triangle-alert" size={15} /> {t.sos.eyebrow}
            </span>
            <h2 className="mt-5 font-display text-[clamp(2rem,3.8vw,3rem)] font-extrabold leading-[1.06] text-white">{t.sos.title}</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-300">{t.sos.sub}</p>
            <ul className="mt-7 flex flex-col gap-3">
              {t.sos.points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-[15.5px] font-semibold text-white">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-400/20 text-teal-300">
                    <AppIcon name="check" size={15} strokeWidth={2.6} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-[2.25rem] border border-white/10 bg-white/[.04] p-7 shadow-lift backdrop-blur-xl sm:p-9">
              <div className="relative h-52 overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
                <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(rgba(80,120,200,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(80,120,200,.18) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 55%, rgba(0,82,204,.35), transparent 60%)" }} />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M-10 60 L160 90 L260 50 L420 80" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="10" />
                  <path d="M80 -10 L120 110 L90 210" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
                  <path d="M40 150 L420 140" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
                </svg>
                <div className="absolute" style={{ left: "50%", top: "55%", transform: "translate(-50%,-50%)" }}>
                  <span className={`absolute inset-0 -m-2 rounded-full ${(active || locating) ? "bg-rose-500/40" : "bg-brand-500/30"}`} style={{ animation: "pulse-ring 1.8s ease-out infinite" }} />
                  <span className={`relative grid h-10 w-10 place-items-center rounded-full text-white shadow-lg ${(active || locating) ? "bg-rose-500" : "bg-brand-600"}`}>
                    <AppIcon name="navigation" size={18} className="flip-x" />
                  </span>
                </div>
                <div className={`absolute transition-opacity duration-500 ${active ? "opacity-100" : "opacity-40"}`} style={{ left: "72%", top: "30%", transform: "translate(-50%,-50%)" }}>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-400 text-teal-950 shadow-lg">
                    <AppIcon name="plus" size={16} strokeWidth={3} />
                  </span>
                </div>
                <span className="absolute left-3 top-3 flex items-center gap-1.5 font-mono text-[10.5px] text-white/60">
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-rose-400" : "bg-teal-400"}`} />
                  {locating ? t.sos.locating : active ? "31.6295° N, 7.9811° W" : "Marrakech · GPS"}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-5">
                <button type="button" onClick={trigger} aria-pressed={active} className={`relative grid h-24 w-24 shrink-0 place-items-center rounded-full font-display text-xl font-extrabold text-white shadow-[0_10px_40px_-6px_rgba(225,29,72,.55)] transition-all active:scale-95 ${active ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600"}`}>
                  {(active || locating) ? <span className="absolute inset-0 rounded-full bg-rose-500/50" style={{ animation: "pulse-ring 1.6s ease-out infinite" }} /> : null}
                  <span className="relative leading-none">{t.sos.button}</span>
                  <span className="relative mt-1 text-[10px] font-semibold text-rose-100">{t.sos.buttonSub}</span>
                </button>
                <div className="min-w-0">
                  <p className={`flex items-center gap-2 text-[13.5px] font-bold ${active ? "text-rose-300" : "text-teal-300"}`}>
                    <span className={`h-2 w-2 rounded-full ${active ? "bg-rose-400" : "bg-teal-400"}`} style={{ animation: "floaty 2s ease-in-out infinite" }} />
                    {active ? t.sos.active : t.sos.idle}
                  </p>
                  <div className={`mt-3 rounded-2xl border border-white/10 bg-white/[.06] p-3.5 transition-all duration-500 ${active ? "translate-y-0 opacity-100" : "opacity-50"}`}>
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      <AppIcon name="map-pin" size={13} /> {t.sos.cardTitle}
                    </p>
                    <p className="mt-1 font-display text-[15px] font-bold leading-tight text-white">{t.sos.cardName}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-teal-300">
                      <span className="flex items-center gap-1"><AppIcon name="navigation" size={12} /> {t.sos.cardDistance}</span>
                      <span className="flex items-center gap-1 text-slate-300"><AppIcon name="phone" size={12} /> {t.sos.cardEta}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ t }) {
  const columns = [
    [t.footer.colProduct, t.footer.product],
    [t.footer.colCompany, t.footer.company],
    [t.footer.colLegal, t.footer.legal],
  ];

  return (
    <footer id="contact" className="scroll-mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <LandingLogo />
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-slate-600">{t.footer.tagline}</p>
            <p className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-teal-700">
              <AppIcon name="shield-check" size={16} /> {t.footer.compliance}
            </p>
          </div>
          {columns.map(([title, items]) => (
            <div key={title}>
              <h4 className="font-display text-[13px] font-bold uppercase tracking-wide text-slate-400">{title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#top" className="text-[15px] font-semibold text-slate-600 transition-colors hover:text-brand-700">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-7 text-[13.5px] text-slate-500 sm:flex-row">
          <p>{t.footer.rights}</p>
          <p className="flex items-center gap-1.5 font-semibold text-slate-600">
            <AppIcon name="heart-pulse" size={15} className="text-brand-600" /> {t.footer.made}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function HomePage() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("triva_lang") || "fr";
    } catch {
      return "fr";
    }
  });
  const t = useMemo(() => LANDING_COPY[lang] || LANDING_COPY.fr, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem("triva_lang", lang);
    } catch {
      // Local storage can be unavailable in private contexts.
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    document.body.dir = t.dir;
  }, [lang, t.dir]);

  return (
    <div className="legacy-landing min-h-screen text-ink">
      <Header t={t} lang={lang} setLang={setLang} />
      <main>
        <Hero t={t} />
        <Intake t={t} />
        <Services t={t} />
        <Workflow t={t} />
        <SOS t={t} />
      </main>
      <Footer t={t} />
    </div>
  );
}
