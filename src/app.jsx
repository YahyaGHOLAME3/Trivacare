import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { PatientApp } from "./patient/patient-app";
import { ClinicApp } from "./clinic/clinic-app";
import { ProfessionalApp } from "./professional/professional-app";
import { PetPreview } from "./pet/pet-preview";
import { LoginPage } from "./shared/ui/login-page";
import { HomePage } from "./shared/ui/home-page";
import { RequireAuth } from "./shared/auth";

export function App() {
  const location = useLocation();

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll(
        ".motion-fade-up, .motion-fade-down, .motion-fade-left, .motion-fade-right, .motion-card",
      ),
    );

    if (!targets.length) return undefined;

    targets.forEach((node) => node.classList.remove("reveal-visible"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    targets.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className="app-frame relative min-h-screen overflow-hidden bg-[#f8f6f2] transition-colors duration-300">
      <div aria-hidden="true" className="site-ambient">
        <div className="site-ambient__orb site-ambient__orb--blue" />
        <div className="site-ambient__orb site-ambient__orb--teal" />
        <div className="site-ambient__orb site-ambient__orb--violet" />
        <div className="site-ambient__mesh" />
        <div className="site-ambient__beam site-ambient__beam--one" />
        <div className="site-ambient__beam site-ambient__beam--two" />
        <div className="site-ambient__beam site-ambient__beam--three" />
        <span className="site-ambient__particle site-ambient__particle--one" />
        <span className="site-ambient__particle site-ambient__particle--two" />
        <span className="site-ambient__particle site-ambient__particle--three" />
        <span className="site-ambient__particle site-ambient__particle--four" />
        <span className="site-ambient__particle site-ambient__particle--five" />
      </div>

      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pet-preview" element={<PetPreview />} />
          <Route path="/connexion/:persona" element={<LoginPage />} />
          <Route path="/inscription/:persona" element={<LoginPage />} />
          <Route
            path="/patient/:page"
            element={
              <RequireAuth persona="patient">
                <PatientApp />
              </RequireAuth>
            }
          />
          <Route
            path="/clinique/:page"
            element={
              <RequireAuth persona="clinique">
                <ClinicApp />
              </RequireAuth>
            }
          />
          <Route
            path="/professionnel/:page"
            element={
              <RequireAuth persona="professionnel">
                <ProfessionalApp />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
