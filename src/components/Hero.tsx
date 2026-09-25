import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldCheck, Coins, Infinity as InfinityIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroSkillsImg from "@/assets/hero-skills-exchange.jpg";

const popular = ["Logo design", "Math tutoring", "Resume help", "Guitar lessons", "Home repairs"];

const Hero = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const go = (term: string) => navigate(`/explore${term.trim() ? `?q=${encodeURIComponent(term.trim())}` : ""}`);

  return (
    <section className="container pt-4 md:pt-8">
      <div className="relative overflow-hidden rounded-3xl gradient-primary text-primary-foreground shadow-float">
        <img
          src={heroSkillsImg}
          alt="Community members exchanging skills"
          width={960}
          height={1280}
          className="absolute inset-y-0 right-0 hidden md:block h-full w-[42%] object-cover opacity-90"
        />
        <div className="relative px-6 py-10 md:px-12 md:py-16 md:max-w-[60%]">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight"
          >
            One subscription. <span className="italic">Unlimited</span> skill swaps.
          </motion.h1>
          <p className="mt-4 text-base md:text-lg opacity-90 max-w-lg">
            Find local talent for tutoring, design, repairs and more. Trade with points — zero service fees.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); go(q); }}
            className="mt-6 flex items-center rounded-xl bg-card p-1.5 shadow-card max-w-xl"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What service are you looking for?"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" className="shrink-0 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90">
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="opacity-80">Popular:</span>
            {popular.map((p) => (
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
