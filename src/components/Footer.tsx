import { Repeat2 } from "lucide-react";

const columns = [
  {
    title: "Navigation",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Explore Skills", href: "#explore" },
      { label: "Community Stories", href: "#community" },
      { label: "Join Free", href: "#" },
    ],
  },
  {
    title: "Partnerships",
    links: [
      { label: "Partner With Us", href: "#" },
      { label: "Sponsor Community Growth", href: "#" },
      { label: "Business Waitlist", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const Footer = () => {
  const handleClick = (href: string) => (e: React.MouseEvent) => {
    if (href.startsWith("#") && href.length > 1) {
      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <footer className="border-t border-foreground/5 bg-card/40 backdrop-blur-sm">
      <div className="container py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:pr-8">
          <a href="#" className="flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow group-hover:rotate-12 transition-bounce">
              <Repeat2 className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Service Swap</span>
          </a>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Trade skills, not money.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-display font-semibold text-sm mb-4 tracking-wide uppercase text-foreground/80">
              {col.title}
            </p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={handleClick(link.href)}
                    className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {link.label}
                  </a>
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
