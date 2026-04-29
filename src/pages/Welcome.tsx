import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Repeat2, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    Icon: Sparkles,
    title: "Your skills have value.",
    body: "List what you're good at — tutoring, design, fixing things, music. No cash needed.",
  },
  {
    Icon: Repeat2,
    title: "Trade, don't pay.",
    body: "Earn points when you help someone. Spend them on the help you need.",
  },
  {
    Icon: MapPin,
    title: "Built for your city.",
    body: "Service Swap is hyper-local. Meet neighbours, build trust, get things done.",
  },
];

/**
 * Native-style mobile onboarding (3 swipeable screens).
 * Reachable at /welcome. Skip & Get Started both go to /auth.
 */
const Welcome = () => {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const last = i === slides.length - 1;
  const Cur = slides[i].Icon;

  const next = () => (last ? navigate("/auth") : setI(i + 1));

  return (
    <div className="min-h-safe-screen flex flex-col bg-background pt-safe pb-safe px-safe">
      <div className="flex items-center justify-between px-6 pt-4">
        <span className="font-display font-bold text-lg">Service Swap</span>
        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground min-h-[44px] px-2"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6 max-w-sm"
          >
            <div className="w-24 h-24 mx-auto rounded-[2rem] gradient-primary shadow-glow flex items-center justify-center">
              <Cur className="w-12 h-12 text-primary-foreground" strokeWidth={2} />
            </div>
            <h1 className="font-display font-bold text-3xl leading-tight">{slides[i].title}</h1>
            <p className="text-base text-muted-foreground leading-relaxed">{slides[i].body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-8 pb-8 space-y-6">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-2 bg-foreground/20"}`}
            />
          ))}
        </div>
        <Button onClick={next} size="lg" className="w-full shadow-glow">
          {last ? "Get Started" : "Next"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
