import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, Coins, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import sarahImg from "@/assets/avatars/sarah.jpg";
import marcusImg from "@/assets/avatars/marcus.jpg";
import priyaImg from "@/assets/avatars/priya.jpg";
import jordanImg from "@/assets/avatars/jordan.jpg";

const proofAvatars = [sarahImg, marcusImg, priyaImg, jordanImg];

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Mesh gradient backdrop */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full bg-primary/25 blur-[120px] pointer-events-none" />
      <div className="absolute top-40 -left-20 w-[360px] h-[360px] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      <div className="container relative pt-6 pb-12 md:pt-14 md:pb-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-7 md:space-y-9"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass shadow-soft text-[11px] font-semibold uppercase tracking-wider text-primary"
          >
            <Sparkles className="w-3.5 h-3.5" />
            New · Live across British Columbia
          </motion.div>

          <h1 className="font-display font-bold text-[40px] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[72px] tracking-tight">
            Your skills
            <br />
            have <span className="text-gradient-primary">value.</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
            List what you're good at, earn points, and use them for tutoring,
            design, fitness, coding and more — no cash, no fees.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button asChild size="xl" className="rounded-2xl gradient-primary text-primary-foreground shadow-glow hover:shadow-float transition-smooth tap-scale">
              <Link to="/list-skill">
                List a Skill Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="rounded-2xl bg-card/60 backdrop-blur-md border-border tap-scale">
              <Link to="/explore">Browse Skills</Link>
            </Button>
          </div>

          {/* Social proof strip */}
          <div className="flex items-center gap-5 pt-2">
            <div className="flex -space-x-2.5">
              {proofAvatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full border-[2.5px] border-background object-cover shadow-soft"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                ))}
                <span className="text-xs font-semibold ml-1">4.9</span>
              </div>
              <p className="text-xs text-muted-foreground">1,000+ skills · Trusted across BC</p>
            </div>
          </div>
        </motion.div>

        {/* Phone mockup card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          <div className="relative rounded-[2.5rem] glass shadow-float p-5 md:p-6 animate-float-slow">
            {/* Card 1: Featured skill */}
            <div className="rounded-2xl bg-card p-4 shadow-soft border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={sarahImg}
                  alt="Sarah Chen"
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-2xl object-cover shadow-glow"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-sm truncate">Sarah Chen</p>
                    <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground">Math tutoring · 1.2 km</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-lg flex items-center gap-1 leading-none">
                    <Coins className="w-3.5 h-3.5 text-primary" />45
                  </p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full w-3/4 gradient-primary rounded-full" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">38 reviews · 4.9 ★</p>
            </div>

            {/* Card 2: Wallet preview */}
            <div className="mt-3 rounded-2xl gradient-primary text-primary-foreground p-4 shadow-glow">
              <p className="text-[11px] uppercase tracking-wider opacity-80">Your balance</p>
              <p className="font-display font-bold text-3xl flex items-center gap-1.5 mt-1">
                <Coins className="w-6 h-6" />340
                <span className="text-sm font-medium opacity-80 ml-1">points</span>
              </p>
              <div className="flex items-center justify-between mt-3 text-[11px] opacity-90">
                <span>+45 this week</span>
                <span className="font-semibold">Gold tier</span>
              </div>
            </div>

            {/* Card 3: Activity */}
            <div className="mt-3 rounded-2xl bg-card p-3.5 shadow-soft border border-border/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">Logo design booked</p>
                <p className="text-[11px] text-muted-foreground">Marcus · 2 min ago</p>
              </div>
              <span className="text-[11px] font-bold text-success">+80</span>
            </div>
          </div>

          {/* Floating glow tag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute -left-3 md:-left-6 top-8 glass rounded-2xl p-3 shadow-card border border-white/60 hidden sm:flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-semibold">410 swaps this month</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
