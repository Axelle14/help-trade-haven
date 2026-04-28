import { motion } from "framer-motion";
import { Palette, GraduationCap, Code2, Camera, Dumbbell, Wrench, Music, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  { icon: Palette, label: "Logo design", points: 80, color: "bg-primary/10 text-primary" },
  { icon: GraduationCap, label: "1hr tutoring", points: 40, color: "bg-accent/15 text-accent" },
  { icon: Code2, label: "Code review", points: 60, color: "bg-success/15 text-success" },
  { icon: Camera, label: "Photo session", points: 120, color: "bg-warning/15 text-warning" },
  { icon: Dumbbell, label: "Fitness coaching", points: 50, color: "bg-primary/10 text-primary" },
  { icon: Wrench, label: "Home repair help", points: 90, color: "bg-accent/15 text-accent" },
  { icon: Music, label: "Music lesson", points: 45, color: "bg-success/15 text-success" },
  { icon: ChefHat, label: "Cooking class", points: 70, color: "bg-warning/15 text-warning" },
];

const WhatPointsBuy = () => {
  return (
    <section id="points" className="container py-20 md:py-28">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">What 100 points buy</p>
        <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 leading-[1.1]">
          Real services. <span className="text-primary">No cash needed.</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Your starter 100 points are enough to book your first service today. Here's a taste of what your neighbours are offering.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="bg-card rounded-3xl p-5 shadow-soft hover:shadow-card transition-smooth hover:-translate-y-1 border border-foreground/5"
          >
            <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-4`}>
              <item.icon className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <p className="font-display font-bold text-base mb-1">{item.label}</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">{item.points}</span> pts avg
            </p>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
        >
          Claim your 100 free points →
        </Link>
      </div>
    </section>
  );
};

export default WhatPointsBuy;
