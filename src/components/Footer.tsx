import { Repeat2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-foreground/5 bg-card/30">
      <div className="container py-12 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-2xl gradient-primary flex items-center justify-center shadow-soft">
              <Repeat2 className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg">Service Swap</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            The community marketplace for trading skills. Built with care for a more generous economy.
          </p>
        </div>

        {[
          { title: "Product", links: ["How it works", "Explore", "Rewards", "Mobile app"] },
          { title: "Company", links: ["About", "Community", "Trust & safety", "Contact"] },
        ].map((col) => (
          <div key={col.title}>
            <p className="font-semibold text-sm mb-3">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container py-6 border-t border-foreground/5 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
        <p>© 2026 Service Swap. Trade kindly.</p>
        <p>Made for the community, by the community.</p>
      </div>
    </footer>
  );
};

export default Footer;
