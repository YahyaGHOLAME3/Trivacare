import { Navigate, useLocation } from "react-router-dom";

const STORAGE_PREFIX = "trivacare_session_";

function getDefaultApiUrl() {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:3001";
  }

  return `${window.location.protocol}//${window.location.hostname}:3001`;
}

export const API_URL = (import.meta.env.VITE_API_URL || getDefaultApiUrl()).replace(/\/$/, "");

export const PERSONA_TO_ROLE = {
  patient: "PATIENT",
  clinique: "CLINIC_ADMIN",
  professionnel: "PROFESSIONAL",
};

export const ROLE_TO_PERSONA = {
  PATIENT: "patient",
  CLINIC_ADMIN: "clinique",
  PROFESSIONAL: "professionnel",
  SUPER_ADMIN: "clinique",
};

const PERSONAS = ["patient", "clinique", "professionnel"];

const PERSONA_TO_TARGET = {
  patient: "/patient/compte",
  clinique: "/clinique/tableau-de-bord",
  professionnel: "/professionnel/tableau-de-bord",
};

const ROLE_TO_TARGET = {
  PATIENT: "/patient/compte",
  CLINIC_ADMIN: "/clinique/tableau-de-bord",
  PROFESSIONAL: "/professionnel/tableau-de-bord",
  SUPER_ADMIN: "/clinique/tableau-de-bord",
};

export function getSessionKey(persona) {
  return `${STORAGE_PREFIX}${persona}`;
}

export function getSession(persona) {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(getSessionKey(persona));
  if (!rawValue) {
    return getSuperAdminSessionForPersona(persona);
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    window.localStorage.removeItem(getSessionKey(persona));
    return getSuperAdminSessionForPersona(persona);
  }
}

function getSuperAdminSessionForPersona(persona) {
  if (typeof window === "undefined") return null;

  for (const candidate of PERSONAS) {
    const rawValue = window.localStorage.getItem(getSessionKey(candidate));
    if (!rawValue) continue;

    try {
      const session = JSON.parse(rawValue);

      if (session?.accessToken && session.user?.role === "SUPER_ADMIN") {
        return { ...session, persona };
      }
    } catch {
      window.localStorage.removeItem(getSessionKey(candidate));
    }
  }

  return null;
}

export function updateSession(persona, updates) {
  const current = getSession(persona);
  if (!current || typeof window === "undefined") return null;

  const next = { ...current, ...updates };
  window.localStorage.setItem(getSessionKey(persona), JSON.stringify(next));
  return next;
}

export function isAuthenticated(persona) {
  const session = getSession(persona);
  if (!session?.accessToken) return false;

  const expectedPersona = ROLE_TO_PERSONA[session.user?.role];
  if (session.user?.role === "SUPER_ADMIN") {
    return true;
  }

  return session.persona === persona && expectedPersona === persona;
}

function getErrorMessage(payload) {
  if (!payload) return "Une erreur est survenue.";
  if (Array.isArray(payload.message)) return payload.message.join(", ");
  if (typeof payload.message === "string") return payload.message;
  return "Une erreur est survenue.";
}

async function request(endpoint, body) {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Impossible de joindre le serveur Trivacare. Vérifiez que le backend est lancé sur le port 3001.",
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return payload;
}

export async function apiRequest(endpoint, { method = "GET", body, token } = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(
      "Impossible de joindre le serveur Trivacare. Vérifiez que le backend est lancé sur le port 3001.",
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return payload;
}

function persistSession(payload, preferredPersona) {
  const { user, tokens } = payload.data;
  const persona = preferredPersona || ROLE_TO_PERSONA[user.role] || "patient";
  const session = {
    persona,
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };

  if (user.role === "SUPER_ADMIN") {
    PERSONAS.forEach((targetPersona) => {
      window.localStorage.setItem(
        getSessionKey(targetPersona),
        JSON.stringify({ ...session, persona: targetPersona }),
      );
    });
  } else {
    window.localStorage.setItem(getSessionKey(persona), JSON.stringify(session));
  }

  return {
    ...session,
    targetPath:
      user.role === "SUPER_ADMIN" && preferredPersona
        ? PERSONA_TO_TARGET[preferredPersona]
        : ROLE_TO_TARGET[user.role] || "/patient/tableau-de-bord",
  };
}

export async function signIn({ email, password, expectedPersona }) {
  const payload = await request("/auth/login", { email, password });
  const actualPersona = ROLE_TO_PERSONA[payload.data?.user?.role];
  const isSuperAdmin = payload.data?.user?.role === "SUPER_ADMIN";

  if (expectedPersona && actualPersona !== expectedPersona && !isSuperAdmin) {
    throw new Error("Ce compte n'est pas autorisé pour cet espace.");
  }

  const session = persistSession(payload, isSuperAdmin ? expectedPersona : undefined);

  if (session.user?.role === "PATIENT") {
    return {
      ...session,
      targetPath: "/patient/compte",
    };
  }

  return session;
}

export async function signUp({
  email,
  password,
  firstName,
  lastName,
  phone,
  role,
  organizationName,
  specialty,
  licenseNumber,
  dateOfBirth,
  gender,
  address,
  nationality,
  insurer,
  bloodType,
  medicalSummary,
  emergencyContactName,
  emergencyContactPhone,
  medicalInterests,
}) {
  const payload = await request("/auth/register", {
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    organizationName,
    specialty,
    licenseNumber,
    dateOfBirth,
    gender,
    address,
    nationality,
    insurer,
    bloodType,
    medicalSummary,
    emergencyContactName,
    emergencyContactPhone,
    medicalInterests,
  });

  return persistSession(payload);
}

export function signOut(persona) {
  const session = getSession(persona);

  if (typeof window !== "undefined") {
    if (session?.user?.role === "SUPER_ADMIN") {
      PERSONAS.forEach((targetPersona) => {
        window.localStorage.removeItem(getSessionKey(targetPersona));
      });
    } else {
      window.localStorage.removeItem(getSessionKey(persona));
    }
  }

  if (session?.refreshToken) {
    void request("/auth/logout", {
      refreshToken: session.refreshToken,
    }).catch(() => undefined);
  }
}

export function RequireAuth({ persona, children }) {
  const location = useLocation();

  if (!isAuthenticated(persona)) {
    return (
      <Navigate
        to={`/connexion/${persona}`}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children;
}
