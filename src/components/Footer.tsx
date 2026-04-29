import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";

type FooterLink = { label: string; to?: string; anchor?: string };

const links: FooterLink[] = [
  { label: "How it works", anchor: "#how" },
  { label: "Explore", anchor: "#explore" },
  { label: "Communities", to: "/communities" },
  { label: "Join Free", to: "/auth" },
  { label: "Partners", to: "/partners" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Contact", to: "/contact" },
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
      <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={logo}
            alt="Service Swap logo"
            className="w-7 h-7 rounded-lg object-cover shadow-glow group-hover:rotate-12 transition-bounce"
          />
          <span className="font-display font-bold text-sm tracking-tight">Service Swap</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {links.map((link) =>
            link.anchor ? (
              <a
                key={link.label}
                href={link.anchor}
                onClick={handleAnchor(link.anchor)}
                className="text-xs text-muted-foreground hover:text-primary transition-smooth"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to!}
                className="text-xs text-muted-foreground hover:text-primary transition-smooth"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <p className="text-xs text-muted-foreground">© 2026 Service Swap</p>
      </div>
    </footer>
  );
};

export default Footer;
