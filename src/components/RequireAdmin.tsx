import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLoader from "@/components/AppLoader";
import { isAdmin } from "@/lib/admin";
import { ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";

const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { setAllowed(false); return; }
    isAdmin().then(setAllowed).catch(() => setAllowed(false));
  }, [user, loading]);

  if (loading || allowed === null) return <AppLoader label="Checking access…" />;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }

  if (!allowed) {
    return (
      <>
        <Navbar />
        <main className="container py-16 text-center">
          <ShieldAlert className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-display font-bold">Admin access only</h1>
          <p className="text-muted-foreground mt-2">You don't have permission to view this page.</p>
        </main>
      </>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;
