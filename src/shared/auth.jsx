import { Navigate, useLocation } from "react-router-dom";

const STORAGE_PREFIX = "trivacare_session_";

export function getSessionKey(persona) {
  return `${STORAGE_PREFIX}${persona}`;
}

export function isAuthenticated(persona) {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(getSessionKey(persona)) === "active";
}

export function signIn(persona) {
  window.localStorage.setItem(getSessionKey(persona), "active");
}

export function signOut(persona) {
  window.localStorage.removeItem(getSessionKey(persona));
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
