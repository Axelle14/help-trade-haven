import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, Menu, X } from "lucide-react";
import { NotificationsBell } from "@/components/NotificationsBell";
import { useAuth } from "@/contexts/AuthContext";
import { isModeratorOrAdmin } from "@/lib/moderation";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "How it works", href: "/#how" },
  { label: "Explore Skills", href: "/explore" },
  { label: "Local Communities", href: "/communities" },
];

const Navbar = () => {
  const { user } = useAuth();
  const [isMod, setIsMod] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) { setIsMod(false); return; }
    isModeratorOrAdmin().then(setIsMod);
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    // Smooth-scroll only when target is an in-page anchor on current page
    if (href.startsWith("/#") && window.location.pathname === "/") {
      const el = document.querySelector(href.slice(1));
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setMobileOpen(false);
      }
    } else {
      setMobileOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-smooth pt-safe",
        scrolled
          ? "backdrop-blur-xl bg-background/80 border-b border-foreground/5 shadow-soft"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <nav className="container flex items-center gap-1 sm:gap-2 lg:gap-4 h-18 py-4 pr-2 sm:pr-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img
            src={logo}
            alt="Service Swap logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover shadow-glow group-hover:rotate-12 transition-bounce"
          />
          <span className="hidden min-[380px]:inline font-display font-bold text-base sm:text-lg lg:text-xl tracking-tight whitespace-nowrap">Service Swap</span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-0 lg:gap-1 mx-auto min-w-0">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={handleNavClick(l.href)}
              className="px-2 lg:px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-smooth whitespace-nowrap"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 lg:gap-2 shrink-0 ml-auto md:ml-0">
          {isMod && (
            <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
              <Link to="/admin/moderation"><ShieldCheck className="w-4 h-4" /> Moderation</Link>
            </Button>
          )}
          {user && <div className="hidden md:block"><NotificationsBell /></div>}
          {user ? (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex font-semibold">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm" className="inline-flex font-bold text-foreground px-2 sm:px-3">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          <Button asChild variant="default" size="sm" className="inline-flex shadow-glow shrink-0 whitespace-nowrap px-3 sm:px-4">
            <Link to={user ? "/communities" : "/auth"}>
              <Sparkles className="w-4 h-4" />
              <span className="whitespace-nowrap">{user ? "Explore" : "Join Free"}</span>
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-foreground/5 transition-smooth shrink-0"
          >
            {mobileOpen ? <X className="w-7 h-7" strokeWidth={2.5} /> : <Menu className="w-7 h-7" strokeWidth={2.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out border-t border-foreground/5",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-transparent",
        )}
      >
        <div className="container py-4 flex flex-col gap-1 bg-background/95 backdrop-blur-xl">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={handleNavClick(l.href)}
              className="px-4 py-3 rounded-2xl text-sm font-medium text-foreground hover:bg-foreground/5 transition-smooth"
            >
              {l.label}
            </a>
          ))}
          <div className="h-px bg-foreground/5 my-2" />
          {user ? (
            <Button asChild variant="ghost" size="sm" className="justify-start" onClick={() => setMobileOpen(false)}>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm" className="justify-start" onClick={() => setMobileOpen(false)}>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          <Button asChild variant="default" size="sm" className="shadow-glow" onClick={() => setMobileOpen(false)}>
            <Link to={user ? "/communities" : "/auth"}>
              <Sparkles className="w-4 h-4" />
              {user ? "Explore" : "Join Free"}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
