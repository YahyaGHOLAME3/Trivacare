import { Navigate, useLocation } from "react-router-dom";

const STORAGE_PREFIX = "trivacare_session_";
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

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

const ROLE_TO_TARGET = {
  PATIENT: "/patient/tableau-de-bord",
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
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch {
    window.localStorage.removeItem(getSessionKey(persona));
    return null;
  }
}

export function isAuthenticated(persona) {
  return Boolean(getSession(persona)?.accessToken);
}

function getErrorMessage(payload) {
  if (!payload) return "Une erreur est survenue.";
  if (Array.isArray(payload.message)) return payload.message.join(", ");
  if (typeof payload.message === "string") return payload.message;
  return "Une erreur est survenue.";
}

async function request(endpoint, body) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return payload;
}

function persistSession(payload) {
  const { user, tokens } = payload.data;
  const persona = ROLE_TO_PERSONA[user.role] || "patient";
  const session = {
    persona,
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };

  window.localStorage.setItem(getSessionKey(persona), JSON.stringify(session));

  return {
    ...session,
    targetPath: ROLE_TO_TARGET[user.role] || "/patient/tableau-de-bord",
  };
}

export async function signIn({ email, password }) {
  const payload = await request("/auth/login", { email, password });
  return persistSession(payload);
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
  });

  return persistSession(payload);
}

export function signOut(persona) {
  const session = getSession(persona);

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(getSessionKey(persona));
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
