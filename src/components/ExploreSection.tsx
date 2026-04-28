import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, BadgeCheck, Coins, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExploreListing {
  id: string;
  name: string;
  initials: string;
  city: string;
  province: string;
  category: string;
  title: string;
  description: string;
  points: number;
  delivery: "online" | "in_person" | "both";
  rating: number;
  reviews: number;
  verified: boolean;
}

const listings: ExploreListing[] = [
  {
    id: "1",
    name: "Sarah Chen",
    initials: "SC",
    city: "Vancouver",
    province: "BC",
    category: "Tutoring",
    title: "1-on-1 Math Tutoring (Grade 8–12)",
    description: "BC-curriculum tutor. Algebra, calculus, and exam prep. Patient and structured.",
    points: 45,
    delivery: "both",
    rating: 4.9,
    reviews: 38,
    verified: true,
  },
  {
    id: "2",
    name: "Marcus Rivera",
    initials: "MR",
    city: "Burnaby",
    province: "BC",
    category: "Graphic Design",
    title: "Logo & Brand Identity Design",
    description: "Boutique logos, colour palettes, typography. 2 concepts, 3 revisions included.",
    points: 80,
    delivery: "online",
    rating: 4.8,
    reviews: 24,
    verified: true,
  },
  {
    id: "3",
    name: "Priya Sharma",
    initials: "PS",
    city: "Victoria",
    province: "BC",
    category: "Resume Help",
    title: "Resume + LinkedIn Refresh",
    description: "ATS-optimized resume rewrite plus a polished LinkedIn headline & about section.",
    points: 35,
    delivery: "online",
    rating: 4.7,
    reviews: 51,
    verified: true,
  },
  {
    id: "4",
    name: "Jordan MacLeod",
    initials: "JM",
    city: "Surrey",
    province: "BC",
    category: "Fitness Coaching",
    title: "Personal Fitness Coaching",
    description: "Custom 4-week program + weekly check-ins. Strength, mobility, or fat loss focus.",
    points: 55,
    delivery: "in_person",
    rating: 5.0,
    reviews: 19,
    verified: true,
  },
  {
    id: "5",
    name: "Elena Vasquez",
    initials: "EV",
    city: "Kelowna",
    province: "BC",
    category: "Language Lessons",
    title: "Beginner Spanish Lessons",
    description: "Conversational Spanish for travel & work. Native speaker, 10+ years teaching.",
    points: 40,
    delivery: "both",
    rating: 4.9,
    reviews: 27,
    verified: true,
  },
  {
    id: "6",
    name: "Devon Park",
    initials: "DP",
    city: "Richmond",
    province: "BC",
    category: "Coding",
    title: "Web App MVP Coaching",
    description: "Senior dev. React/TypeScript code reviews and architecture guidance.",
    points: 110,
    delivery: "online",
    rating: 5.0,
    reviews: 12,
    verified: true,
  },
];

const filters = ["All", "Tutoring", "Graphic Design", "Fitness Coaching", "Language Lessons", "Coding", "Resume Help"];

const DeliveryBadge = ({ d }: { d: ExploreListing["delivery"] }) => (
  <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
    {d === "online" ? <><Globe2 className="w-3 h-3" /> Online</>
      : d === "both" ? <><Globe2 className="w-3 h-3" /> Online + Local</>
      : <><MapPin className="w-3 h-3" /> In-person</>}
  </span>
);

const ExploreSection = () => {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? listings : listings.filter((s) => s.category === active);

  return (
    <section id="explore" className="container py-24 md:py-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Explore skills</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4">
            Real people, real skills, near you.
          </h2>
          <p className="text-lg text-muted-foreground">
            Browse what your community is offering right now. Book with points — online or in-person.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold transition-smooth",
              active === f
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-card text-muted-foreground hover:text-foreground border border-foreground/5",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((l, i) => (
          <motion.article
            key={l.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.4 }}
            className="bg-card rounded-3xl p-6 shadow-soft hover:shadow-float transition-smooth hover:-translate-y-1 border border-foreground/5 flex flex-col"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft">
                  {l.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-sm truncate">{l.name}</p>
                    {l.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-0.5 text-warning font-semibold">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      {l.rating.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">({l.reviews})</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="w-3 h-3" />
                      {l.city}, {l.province}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-2xl text-primary leading-none flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  {l.points}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">points</p>
              </div>
            </div>

            <h3 className="font-display font-bold text-lg leading-tight mb-2 line-clamp-2">{l.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{l.description}</p>

            <div className="flex flex-wrap gap-1.5 mb-5">
              <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-[10px] font-semibold uppercase tracking-wider">
                {l.category}
              </span>
              <DeliveryBadge d={l.delivery} />
            </div>

            <Button asChild variant="default" size="sm" className="w-full mt-auto">
              <Link to="/matches">View & book</Link>
            </Button>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default ExploreSection;
