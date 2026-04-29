import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
 * Native-style bottom tab bar.
 * Hidden on md+ screens. Hidden when user is logged out.
 * Center "+" opens an action sheet (per design choice).
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
      <nav
        aria-label="Primary"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-foreground/5 bg-background/95 backdrop-blur-xl pb-safe"
        style={{ height: "calc(var(--tabbar-h) + var(--sa-bottom))" }}
      >
        <ul className="grid grid-cols-5 h-16 max-w-md mx-auto px-2">
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
                    className="-mt-6 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-glow flex items-center justify-center active:scale-95 transition-bounce"
                  >
                    <Icon className="w-7 h-7" strokeWidth={2.5} />
                  </button>
                </li>
              );
            }

            return (
              <li key={t.to} className="flex">
                <Link
                  to={t.to}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl mx-0.5 transition-smooth min-h-[44px]",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className={cn("w-6 h-6 transition-bounce", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
                  <span className={cn("text-[10px] font-semibold leading-none", active && "text-primary")}>
                    {t.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-safe">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display">Create something</SheetTitle>
            <SheetDescription>Pick what you'd like to do.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-2">
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
    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/40 hover:bg-secondary active:scale-[0.99] transition-smooth text-left min-h-[60px]"
  >
    <span className="w-11 h-11 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center shrink-0">
      {icon}
    </span>
    <span className="flex-1">
      <span className="block font-semibold">{title}</span>
      <span className="block text-xs text-muted-foreground">{subtitle}</span>
    </span>
  </button>
);

export default MobileTabBar;
