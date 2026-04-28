import { Repeat2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

type FooterLink = { label: string; to?: string; anchor?: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Navigation",
    links: [
      { label: "How it works", anchor: "#how" },
      { label: "Explore Skills", anchor: "#explore" },
      { label: "Local Communities", to: "/communities" },
      { label: "Join Free", to: "/auth" },
    ],
  },
  {
    title: "Partnerships",
    links: [
      { label: "Partner With Us", to: "/partners" },
      { label: "Sponsor Community Growth", to: "/partners#sponsor" },
      { label: "Business Waitlist", to: "/partners#waitlist" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAnchor = (anchor: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/" + anchor);
      return;
    }
    const el = document.querySelector(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="border-t border-foreground/5 bg-card/40 backdrop-blur-sm">
      <div className="container py-6 grid gap-6 md:gap-8 grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="col-span-2 lg:col-span-1 lg:pr-8">
          <Link to="/" className="flex items-center gap-2 mb-2 group">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-glow group-hover:rotate-12 transition-bounce">
              <Repeat2 className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Service Swap</span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            Trade skills, not money.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-display font-semibold text-xs mb-2 tracking-wide uppercase text-foreground/80">
              {col.title}
            </p>
            <ul className="space-y-1.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.anchor ? (
                    <a
                      href={link.anchor}
                      onClick={handleAnchor(link.anchor)}
                      className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to!}
                      className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-foreground/5">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 Service Swap. Built for community growth.</p>
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            A community-driven marketplace
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
