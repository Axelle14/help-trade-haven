import { motion } from "framer-motion";
import { UserPlus, Coins, Search, Sparkles } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Join & get 100 points",
    desc: "Sign up free and we drop 100 starter points in your wallet — enough to book your first service.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Sparkles,
    title: "List a skill",
    desc: "Offer what you're great at. Our pricing engine suggests a fair point price based on category and time.",
    color: "bg-accent/15 text-accent",
  },
  {
    icon: Search,
    title: "Book what you need",
    desc: "Browse local in-person help or online services from anywhere. Spend points — no cash, no haggling.",
    color: "bg-success/15 text-success",
  },
  {
    icon: Coins,
    title: "Earn as you help",
    desc: "Every service you deliver tops up your wallet. Stack points, build trust, keep the loop going.",
    color: "bg-warning/15 text-warning",
  },
];

const HowItWorks = () => {
  return (
    <section id="how" className="container py-8 md:py-10">
      <div className="max-w-2xl mb-6 md:mb-8">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">How it works</p>
        <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight mb-2">
          A points economy for Community help.
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Earn points by helping, spend them on whatever you need next.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="relative bg-card rounded-2xl p-4 shadow-soft hover:shadow-card transition-smooth hover:-translate-y-1 border border-foreground/5"
          >
            <div className="absolute top-3 right-4 text-4xl font-display font-bold text-foreground/5 leading-none">
              0{i + 1}
            </div>
            <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center mb-3`}>
              <step.icon className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <h3 className="font-display font-bold text-base mb-1">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
