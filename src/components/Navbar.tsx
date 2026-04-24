import { Button } from "@/components/ui/button";
import { Repeat2, Sparkles } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-foreground/5">
      <nav className="container flex items-center justify-between h-18 py-4">
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow group-hover:rotate-12 transition-bounce">
            <Repeat2 className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Service Swap</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-smooth">How it works</a>
          <a href="#explore" className="hover:text-foreground transition-smooth">Explore skills</a>
          <a href="#community" className="hover:text-foreground transition-smooth">Community</a>
          <a href="#rewards" className="hover:text-foreground transition-smooth">Rewards</a>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
          <Button variant="default" size="sm">
            <Sparkles className="w-4 h-4" />
            Join free
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
