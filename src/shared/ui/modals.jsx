import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { icon } from "leaflet";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { AppIcon } from "../../assets/icons/app-icon";
import { Button, Card } from "./primitives";

const MARRAKECH = [31.6295, -7.9811];
const PATIENT_MARKER = icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function SosMapPreview() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-[1.1rem] border border-slate-200 bg-slate-100 sm:h-[240px]">
      <MapContainer
        center={MARRAKECH}
        zoom={14}
        minZoom={5}
        maxZoom={19}
        attributionControl
        zoomControl
        dragging
        scrollWheelZoom={false}
        doubleClickZoom
        boxZoom
        keyboard
        touchZoom
        className="h-full w-full bg-slate-100"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={MARRAKECH}
          radius={24}
          pathOptions={{
            color: "rgba(225,29,72,0.34)",
            weight: 2,
            fillColor: "#f43f5e",
            fillOpacity: 0.12,
          }}
        />
        <Marker position={MARRAKECH} icon={PATIENT_MARKER}>
          <Popup>
            <strong>Position du patient</strong>
            <br />
            Marrakech · 31.6295° N, 7.9811° W
          </Popup>
        </Marker>
      </MapContainer>
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
        Maroc
      </div>
      <div className="pointer-events-none absolute bottom-7 left-3 z-[500] rounded-full bg-[#0f1d31]/92 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
        Point d&apos;urgence · Marrakech
      </div>
    </div>
  );
}

export function SosModal({ open, onClose, title, body }) {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) setSent(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-ink/55 backdrop-blur-sm"
        aria-label="Fermer la fenêtre d'urgence"
        onClick={onClose}
      />
      <Card className="reveal-visible relative z-[210] my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain p-5 sm:max-h-[calc(100dvh-3rem)] sm:p-7">
        {!sent ? (
          <>
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-600">
                <AppIcon name="triangle-alert" size={26} />
              </span>
              <div>
                <h3 className="font-display text-xl font-extrabold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{body}</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-ink">Position détectée</p>
              <p className="mt-1 font-mono text-xs text-slate-500">
                Marrakech · 31.6295° N, 7.9811° W
              </p>
              <div className="sos-map-shell mt-4 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#f8fafc_0%,#eef6f2_100%)] p-2 sm:p-3">
                <SosMapPreview />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={onClose}>
                Annuler
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => setSent(true)}>
                Confirmer l&apos;alerte
              </Button>
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-teal-600">
              <AppIcon name="check-check" size={30} />
            </span>
            <h3 className="mt-4 font-display text-xl font-extrabold text-ink">Alerte transmise</h3>
            <p className="mt-2 text-sm text-slate-500">
              La coordination médicale a bien reçu votre SOS et vous rappelle immédiatement.
            </p>
            <Button variant="ghost" className="mt-5" onClick={onClose}>
              Fermer
            </Button>
          </div>
        )}
      </Card>
    </div>,
    document.body,
  );
}
