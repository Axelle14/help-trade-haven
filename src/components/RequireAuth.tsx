import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLoader from "@/components/AppLoader";

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Branded loader while session bootstraps — prevents auth flicker on cold
  // start (especially on Capacitor where storage is async).
  if (loading) return <AppLoader label="Restoring your session…" />;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
