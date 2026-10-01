import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Coins, Infinity as InfinityIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const prompts = [
  "I need a cleaner",
  "Find a plumber",
  "Book a hairdresser",
  "Find someone to paint my house",
  "Get a quote for landscaping",
  "Find someone nearby",
];

const Hero = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const go = (term: string) => {
    if (!term.trim()) return;
    navigate(`/assistant?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <section className="container pt-4 md:pt-8">
      <div className="relative overflow-hidden rounded-3xl gradient-primary text-primary-foreground shadow-float">
        <div className="relative px-6 py-10 md:px-12 md:py-16 max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight"
          >
            Get things done with the help of AI
          </motion.h1>
          <p className="mt-4 text-base md:text-lg opacity-90">
            Find trusted local service providers or let your ServiceSwap AI agent handle it for you.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); go(q); }}
            className="mt-7 rounded-2xl bg-card p-2 shadow-card text-left"
          >
            <label htmlFor="ai-ask" className="block px-3 pt-2 text-xs font-semibold text-foreground">What do you need help with?</label>
            <textarea
              id="ai-ask"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(q); } }}
              rows={2}
              placeholder="I need someone to clean my apartment in Surrey tomorrow afternoon."
              className="w-full resize-none bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="flex flex-col sm:flex-row gap-2 px-1 pb-1">
              <Button type="submit" className="sm:flex-1">Find someone</Button>
              <Button asChild variant="outline" className="sm:flex-1"><Link to="/explore">Browse services</Link></Button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {prompts.map((p) => (
              <button
                key={p}
                onClick={() => go(p)}
                className="rounded-full border border-primary-foreground/40 px-3 py-1 hover:bg-primary-foreground/15"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs md:text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2"><InfinityIcon className="h-4 w-4 text-primary" />Unlimited swaps</div>
        <div className="flex items-center justify-center gap-2"><Coins className="h-4 w-4 text-primary" />0% service fees</div>
        <div className="flex items-center justify-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Verified members</div>
      </div>
    </section>
  );
};

export default Hero;
