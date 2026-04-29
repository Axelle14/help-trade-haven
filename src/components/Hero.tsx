import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, Coins, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import sarahImg from "@/assets/avatars/sarah.jpg";
import marcusImg from "@/assets/avatars/marcus.jpg";
import priyaImg from "@/assets/avatars/priya.jpg";
import jordanImg from "@/assets/avatars/jordan.jpg";
import heroSkillsImg from "@/assets/hero-skills-exchange.jpg";

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
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-float animate-float-slow border border-white/40">
            <img
              src={heroSkillsImg}
              alt="Diverse community members exchanging skills"
              width={960}
              height={1280}
              className="w-full h-auto object-cover aspect-[4/5]"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/55 via-black/15 to-transparent">
              <div className="glass rounded-2xl p-3.5 flex items-center gap-3 shadow-card">
                <img
                  src={sarahImg}
                  alt="Sarah Chen"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-xs truncate">Sarah Chen</p>
                    <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">Math tutoring · 1.2 km</p>
                </div>
                <p className="font-display font-bold text-base flex items-center gap-1 leading-none text-primary">
                  <Coins className="w-3.5 h-3.5" />45
                </p>
              </div>
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
