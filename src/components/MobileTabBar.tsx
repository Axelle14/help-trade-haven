import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Compass, Plus, MessageCircle, User, Sparkles, HelpCircle, Pencil } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Premium floating glassmorphism tab bar.
 * Hidden on md+ screens. Hidden when user is logged out.
 */
type Tab = {
  to: string;
  label: string;
  icon: typeof Home;
  primary?: boolean;
  matchPrefix?: string;
};

const tabs: Tab[] = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "__create__", label: "Create", icon: Plus, primary: true },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/dashboard?tab=profile", label: "Profile", icon: User, matchPrefix: "/dashboard" },
];

const MobileTabBar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!user) return null;

  const isActive = (to: string, matchPrefix?: string) => {
    if (to === "__create__") return false;
    const path = matchPrefix ?? to;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
      <div
        aria-hidden
        className="md:hidden fixed bottom-0 inset-x-0 z-30 pointer-events-none h-24"
        style={{
          background: "linear-gradient(to top, hsl(var(--background)) 30%, transparent)",
        }}
      />

      <nav
        aria-label="Primary"
        className="md:hidden fixed inset-x-0 z-40 px-4 pb-safe"
        style={{ bottom: "max(12px, var(--sa-bottom))" }}
      >
        <motion.ul
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className="glass-tab shadow-tab rounded-[28px] grid grid-cols-5 h-16 max-w-md mx-auto px-2 border border-white/60 relative"
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = isActive(t.to, t.matchPrefix);

            if (t.primary) {
              return (
                <li key={t.label} className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    aria-label="Create"
                    className="-mt-7 w-16 h-16 rounded-full gradient-primary text-primary-foreground shadow-glow flex items-center justify-center active:scale-90 transition-bounce ring-4 ring-background"
                  >
                    <Icon className="w-7 h-7" strokeWidth={2.6} />
                  </button>
                </li>
              );
            }

            return (
              <li key={t.to} className="flex">
                <Link
                  to={t.to}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-0.5 rounded-2xl mx-0.5 transition-smooth min-h-[44px] tap-scale relative",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-1 rounded-2xl bg-primary/10"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={cn("w-[22px] h-[22px] relative z-10 transition-bounce", active && "scale-110")}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={cn("text-[10px] font-semibold leading-none relative z-10", active && "text-primary")}>
                    {t.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </motion.ul>
      </nav>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[32px] pb-safe border-t-0 bg-card">
          <div className="mx-auto -mt-2 mb-3 h-1.5 w-10 rounded-full bg-muted" />
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-2xl">Create something</SheetTitle>
            <SheetDescription>Pick what you'd like to do.</SheetDescription>
          </SheetHeader>
          <div className="mt-5 space-y-2.5">
            <ActionRow
              icon={<Sparkles className="w-5 h-5" />}
              title="List a skill"
              subtitle="Offer what you're good at"
              onClick={() => { setSheetOpen(false); navigate("/list-skill"); }}
            />
            <ActionRow
              icon={<HelpCircle className="w-5 h-5" />}
              title="Request help"
              subtitle="Find someone in your area"
              onClick={() => { setSheetOpen(false); navigate("/explore"); }}
            />
            <ActionRow
              icon={<Pencil className="w-5 h-5" />}
              title="Quick post"
              subtitle="Share in your city chat"
              onClick={() => { setSheetOpen(false); navigate("/communities"); }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

const ActionRow = ({
  icon, title, subtitle, onClick,
}: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-3xl bg-secondary/50 hover:bg-secondary tap-scale transition-smooth text-left min-h-[64px] border border-border/40"
  >
    <span className="w-12 h-12 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-glow">
      {icon}
    </span>
    <span className="flex-1">
      <span className="block font-semibold text-[15px]">{title}</span>
      <span className="block text-xs text-muted-foreground mt-0.5">{subtitle}</span>
    </span>
  </button>
);

export default MobileTabBar;
