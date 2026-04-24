import { motion } from "framer-motion";
import { Trophy, Zap, Gift, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  { icon: Zap, name: "Spark", points: "0–500", perk: "Welcome badge", color: "from-accent to-warning" },
  { icon: Gift, name: "Glow", points: "500–2k", perk: "Priority matching", color: "from-primary to-accent" },
  { icon: Trophy, name: "Star", points: "2k–10k", perk: "Verified badge", color: "from-primary to-primary-glow" },
  { icon: Crown, name: "Legend", points: "10k+", perk: "Featured profile", color: "from-primary-glow to-accent" },
];

const Rewards = () => {
  return (
    <section id="rewards" className="container py-24 md:py-32">
      <div className="relative overflow-hidden rounded-[2.5rem] gradient-hero p-10 md:p-16 shadow-float">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, white 0%, transparent 40%), radial-gradient(circle at 80% 70%, white 0%, transparent 40%)"
        }} />

        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3 opacity-90">Rewards</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-5">
              Every swap earns you points.
            </h2>
            <p className="text-lg opacity-90 mb-8 leading-relaxed max-w-md">
              Build your reputation, unlock perks, and climb the community ladder. The more you give, the more you get back.
            </p>
            <Button variant="outline" size="lg" className="bg-card/95 hover:bg-card border-0 text-foreground">
              See how it works
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card/95 backdrop-blur-sm rounded-3xl p-5 shadow-card hover:-translate-y-1 transition-smooth"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 shadow-soft`}>
                  <tier.icon className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <p className="font-display font-bold text-lg">{tier.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{tier.points} pts</p>
                <p className="text-xs font-medium text-foreground/80">{tier.perk}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rewards;
