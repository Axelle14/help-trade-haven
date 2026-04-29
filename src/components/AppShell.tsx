import { ReactNode } from "react";
import MobileTabBar from "@/components/MobileTabBar";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wraps every route. Adds bottom padding for the mobile tab bar
 * (only when a user is logged in, so the bar appears).
 */
const AppShell = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  return (
    <div className={user ? "pb-tabbar" : undefined}>
      {children}
      <MobileTabBar />
    </div>
  );
};

export default AppShell;
