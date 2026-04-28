import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-32 w-[400px] h-[400px] rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <div className="container relative pt-4 pb-24 md:pt-8 md:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-foreground/5 shadow-soft text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Now live across British Columbia
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
            Your skills have value.
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Use them.
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M2 5.5C40 2 100 2 198 5.5" stroke="hsl(var(--accent))" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            List what you're good at, earn points, and use them for tutoring, design, fitness,
            coding and more.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/list-skill">
                List a Skill Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/matches">
                Browse Skills
              </Link>
            </Button>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-muted-foreground pt-2">
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success" /> Now live in BC</span>
            <span className="text-foreground/20">•</span>
            <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Trusted local community</span>
            <span className="text-foreground/20">•</span>
            <span className="inline-flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-warning" /> 410 bookings this month</span>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, hsl(${250 + i * 20} 80% 65%), hsl(${16 + i * 10} 90% 70%))` }}
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Loved by 50k+ members</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative lg:-mt-16 lg:scale-110 lg:origin-top"
        >
          <div className="relative rounded-[2rem] overflow-hidden shadow-float bg-card">
            <img
              src={heroImage}
              alt="Community members exchanging skills"
              width={1280}
              height={1024}
              className="w-full h-auto"
            />
          </div>

          {/* Floating cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute -left-4 md:-left-10 top-1/4 bg-card rounded-2xl p-4 shadow-card border border-foreground/5 max-w-[200px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Verified</p>
                <p className="text-sm font-semibold">Trust score 98%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -right-2 md:-right-6 bottom-10 bg-card rounded-2xl p-4 shadow-card border border-foreground/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Booked nearby</p>
                <p className="text-sm font-semibold">Logo design · 90 pts</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
