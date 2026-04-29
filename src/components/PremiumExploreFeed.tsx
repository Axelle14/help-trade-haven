import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Sparkles, Star, MapPin, BadgeCheck, Coins, Globe2,
  GraduationCap, Palette, Dumbbell, Languages, Code, FileText,
  Music, Camera, Wrench, ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import sarahImg from "@/assets/avatars/sarah.jpg";
import marcusImg from "@/assets/avatars/marcus.jpg";
import priyaImg from "@/assets/avatars/priya.jpg";
import jordanImg from "@/assets/avatars/jordan.jpg";
import elenaImg from "@/assets/avatars/elena.jpg";
import devonImg from "@/assets/avatars/devon.jpg";

interface ExploreListing {
  id: string;
  name: string;
  photo: string;
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
  distanceKm: number;
}

const listings: ExploreListing[] = [
  { id: "1", name: "Sarah Chen", photo: sarahImg, city: "Vancouver", province: "BC", category: "Tutoring", title: "1-on-1 Math Tutoring (Grade 8–12)", description: "BC-curriculum tutor. Algebra, calculus, exam prep.", points: 45, delivery: "both", rating: 4.9, reviews: 38, verified: true, distanceKm: 1.2 },
  { id: "2", name: "Marcus Rivera", photo: marcusImg, city: "Burnaby", province: "BC", category: "Design", title: "Logo & Brand Identity Design", description: "Boutique logos, palettes, typography. 2 concepts.", points: 80, delivery: "online", rating: 4.8, reviews: 24, verified: true, distanceKm: 3.4 },
  { id: "3", name: "Priya Sharma", photo: priyaImg, city: "Victoria", province: "BC", category: "Resume", title: "Resume + LinkedIn Refresh", description: "ATS-optimized rewrite plus LinkedIn polish.", points: 35, delivery: "online", rating: 4.7, reviews: 51, verified: true, distanceKm: 6.0 },
  { id: "4", name: "Jordan MacLeod", photo: jordanImg, city: "Surrey", province: "BC", category: "Fitness", title: "Personal Fitness Coaching", description: "4-week program + weekly check-ins.", points: 55, delivery: "in_person", rating: 5.0, reviews: 19, verified: true, distanceKm: 2.1 },
  { id: "5", name: "Elena Vasquez", photo: elenaImg, city: "Kelowna", province: "BC", category: "Languages", title: "Beginner Spanish Lessons", description: "Conversational Spanish for travel & work.", points: 40, delivery: "both", rating: 4.9, reviews: 27, verified: true, distanceKm: 0.8 },
  { id: "6", name: "Devon Park", photo: devonImg, city: "Richmond", province: "BC", category: "Coding", title: "Web App MVP Coaching", description: "Senior dev. React/TypeScript code reviews.", points: 110, delivery: "online", rating: 5.0, reviews: 12, verified: true, distanceKm: 4.5 },
];

const categories = [
  { label: "All", icon: Sparkles, color: "hsl(var(--primary))" },
  { label: "Tutoring", icon: GraduationCap, color: "#6C4BFF" },
  { label: "Design", icon: Palette, color: "#F59E0B" },
  { label: "Fitness", icon: Dumbbell, color: "#EC4899" },
  { label: "Languages", icon: Languages, color: "#06B6D4" },
  { label: "Coding", icon: Code, color: "#8B5CF6" },
  { label: "Resume", icon: FileText, color: "#10B981" },
  { label: "Music", icon: Music, color: "#F97316" },
  { label: "Photo", icon: Camera, color: "#3B82F6" },
  { label: "Repairs", icon: Wrench, color: "#64748B" },
  { label: "Cooking", icon: ChefHat, color: "#EF4444" },
];

const aiSuggestions = ["Math tutor near me", "Logo design under 100", "Spanish lessons", "Personal trainer"];

const PremiumExploreFeed = () => {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);

  const filtered = active === "All" ? listings : listings.filter((l) => l.category === active);
  const popular = [...listings].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4);

  return (
    <section className="pt-2 pb-10 md:pt-6">
      {/* Header + AI search */}
      <div className="container">
        <div className="mb-5 md:mb-7">
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mb-1.5">Explore</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">Find a skill</h1>
        </div>

        <div className="relative">
          <div className="relative flex items-center gap-2 rounded-3xl bg-card border border-border shadow-soft p-2.5 pl-5 focus-within:shadow-card focus-within:border-primary/30 transition-smooth">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="search"
              placeholder="Search skills, names, cities…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              className="flex-1 bg-transparent border-0 outline-none text-base placeholder:text-muted-foreground"
            />
            <button
              type="button"
              className="shrink-0 h-11 px-4 rounded-2xl gradient-primary text-primary-foreground text-sm font-semibold shadow-glow tap-scale flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              AI
            </button>
          </div>

          {showSuggest && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 rounded-3xl bg-card border border-border shadow-card p-2 z-20"
            >
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2">Try</p>
              {aiSuggestions.map((s) => (
                <button
                  key={s}
                  onMouseDown={() => setQuery(s)}
                  className="w-full text-left px-3 py-2.5 rounded-2xl text-sm hover:bg-secondary tap-scale transition-smooth flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Category icons rail */}
      <div className="container mt-6">
        <div className="grid grid-cols-4 min-[380px]:grid-cols-5 sm:grid-cols-6 md:grid-cols-11 gap-x-2 gap-y-4">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = active === c.label;
            return (
              <button
                key={c.label}
                onClick={() => setActive(c.label)}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1.5 tap-scale transition-smooth pt-1",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-smooth border",
                    isActive
                      ? "shadow-glow text-primary-foreground border-transparent"
                      : "bg-card border-border/50 shadow-soft",
                  )}
                  style={isActive ? { background: "var(--gradient-primary)" } : { color: c.color }}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.2} />
                </span>
                <span className="w-full text-center text-[11px] font-semibold leading-tight">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular near you */}
      {active === "All" && (
        <div className="container pt-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mb-1.5">Popular near you</p>
              <h2 className="font-display font-bold text-xl md:text-2xl tracking-tight">Top picks in your city</h2>
            </div>
          </div>
          <div className="-mx-4 px-4 overflow-x-auto no-scrollbar md:mx-0 md:px-0 md:overflow-visible">
            <div className="flex gap-3 pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:pb-0">
              {popular.map((l) => (
                <Link
                  key={l.id}
                  to="/matches"
                  className="shrink-0 w-[300px] md:w-auto rounded-3xl bg-card border border-border/50 shadow-soft p-4 tap-scale hover:shadow-card transition-smooth"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={l.photo}
                      alt={l.name}
                      loading="lazy"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-2xl object-cover shadow-soft shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{l.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{l.title}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                        <span className="flex items-center gap-0.5 font-semibold text-warning">
                          <Star className="w-3 h-3 fill-warning" />{l.rating}
                        </span>
                        <span className="text-muted-foreground">· {l.distanceKm} km</span>
                      </div>
                    </div>
                    <span className="text-primary font-bold text-sm flex items-center gap-0.5">
                      <Coins className="w-3 h-3" />{l.points}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="container pt-8">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display font-bold text-xl md:text-2xl tracking-tight">
            {active === "All" ? "All skills" : active}
          </h2>
          <span className="text-xs text-muted-foreground">{filtered.length} results</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l, i) => (
            <motion.article
              key={l.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: Math.min(i * 0.04, 0.25), duration: 0.35 }}
              className="bg-card rounded-3xl p-5 shadow-soft hover:shadow-card transition-smooth border border-border/50 flex flex-col tap-scale"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={l.photo}
                    alt={l.name}
                    loading="lazy"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-2xl object-cover shadow-soft shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm truncate">{l.name}</p>
                      {l.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-0.5 text-warning font-semibold">
                        <Star className="w-3 h-3 fill-warning" />{l.rating.toFixed(1)}
                      </span>
                      <span>({l.reviews})</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />{l.distanceKm} km
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-xl text-primary leading-none flex items-center gap-1 justify-end">
                    <Coins className="w-3.5 h-3.5" />{l.points}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">points</p>
                </div>
              </div>

              <h3 className="font-display font-bold text-base leading-snug mb-1.5 line-clamp-2">{l.title}</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{l.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  {l.category}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-secondary text-foreground/70 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  {l.delivery === "online" ? <><Globe2 className="w-3 h-3" /> Online</>
                    : l.delivery === "both" ? <><Globe2 className="w-3 h-3" /> Hybrid</>
                    : <><MapPin className="w-3 h-3" /> In-person</>}
                </span>
              </div>

              <Link
                to="/matches"
                className="mt-auto h-11 rounded-2xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center shadow-soft hover:shadow-glow tap-scale transition-smooth"
              >
                Book now
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumExploreFeed;
