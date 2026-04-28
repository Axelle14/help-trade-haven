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
    <section id="how" className="container py-24 md:py-32">
      <div className="max-w-2xl mb-16">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">How it works</p>
        <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4">
          A points economy for real human help.
        </h2>
        <p className="text-lg text-muted-foreground">
          No fees, no cash, no forced 1-to-1 trades. Earn points by helping, spend them on whatever you need next.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="relative bg-card rounded-3xl p-6 shadow-soft hover:shadow-card transition-smooth hover:-translate-y-1 border border-foreground/5"
          >
            <div className="absolute top-6 right-6 text-6xl font-display font-bold text-foreground/5 leading-none">
              0{i + 1}
            </div>
            <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-5`}>
              <step.icon className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
