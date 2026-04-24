import { motion } from "framer-motion";
import { UserPlus, Search, Repeat2, Star } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create your profile",
    desc: "List the skills you offer and what you'd love to learn or get help with.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Search,
    title: "Find the perfect match",
    desc: "Our matching engine pairs you with members whose offers fit your needs.",
    color: "bg-accent/15 text-accent",
  },
  {
    icon: Repeat2,
    title: "Swap your services",
    desc: "Chat, agree on terms, and complete your barter — tracked end-to-end.",
    color: "bg-success/15 text-success",
  },
  {
    icon: Star,
    title: "Rate & earn points",
    desc: "Build your reputation, unlock perks, and rise up the community ladder.",
    color: "bg-warning/15 text-warning",
  },
];

const HowItWorks = () => {
  return (
    <section id="how" className="container py-24 md:py-32">
      <div className="max-w-2xl mb-16">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">How it works</p>
        <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4">
          Four steps to your first swap.
        </h2>
        <p className="text-lg text-muted-foreground">
          No fees, no awkward negotiations. Just a clear, friendly exchange between humans who want to help each other.
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
