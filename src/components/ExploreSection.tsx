import { useState } from "react";
import ServiceCard, { Service } from "./ServiceCard";
import { cn } from "@/lib/utils";

const services: Service[] = [
  {
    id: "1",
    user: "Maya Chen",
    initials: "MC",
    avatarFrom: "hsl(250 80% 65%)",
    avatarTo: "hsl(280 80% 70%)",
    verified: true,
    rating: 4.9,
    reviews: 47,
    location: "Lisbon",
    category: "Design",
    title: "Brand identity & logo design for your startup",
    offers: "Logo + brand kit",
    wants: "Spanish lessons",
    tags: ["branding", "figma", "startup"],
  },
  {
    id: "2",
    user: "Jordan Reyes",
    initials: "JR",
    avatarFrom: "hsl(16 90% 65%)",
    avatarTo: "hsl(38 95% 65%)",
    verified: true,
    rating: 5.0,
    reviews: 82,
    location: "Brooklyn",
    category: "Fitness",
    title: "Personalized 1:1 yoga & mobility coaching",
    offers: "4 yoga sessions",
    wants: "Web development",
    tags: ["yoga", "wellness", "coaching"],
  },
  {
    id: "3",
    user: "Sara Bekele",
    initials: "SB",
    avatarFrom: "hsl(180 70% 50%)",
    avatarTo: "hsl(220 80% 65%)",
    verified: true,
    rating: 4.8,
    reviews: 31,
    location: "Berlin",
    category: "Tutoring",
    title: "Math & physics tutoring for high school students",
    offers: "10 hours tutoring",
    wants: "Photography session",
    tags: ["math", "physics", "education"],
  },
  {
    id: "4",
    user: "Liam O'Connor",
    initials: "LO",
    avatarFrom: "hsl(140 60% 50%)",
    avatarTo: "hsl(180 70% 55%)",
    verified: false,
    rating: 4.7,
    reviews: 19,
    location: "Dublin",
    category: "Code",
    title: "React component library setup & code reviews",
    offers: "20h dev mentoring",
    wants: "Cooking classes",
    tags: ["react", "typescript", "mentoring"],
  },
  {
    id: "5",
    user: "Aisha Nair",
    initials: "AN",
    avatarFrom: "hsl(320 75% 65%)",
    avatarTo: "hsl(0 80% 70%)",
    verified: true,
    rating: 4.95,
    reviews: 64,
    location: "Mumbai",
    category: "Music",
    title: "Vocal coaching & guitar lessons for beginners",
    offers: "Music lessons",
    wants: "Video editing",
    tags: ["music", "guitar", "vocals"],
  },
  {
    id: "6",
    user: "Noah Schmidt",
    initials: "NS",
    avatarFrom: "hsl(40 90% 60%)",
    avatarTo: "hsl(20 90% 60%)",
    verified: true,
    rating: 4.85,
    reviews: 28,
    location: "Vienna",
    category: "Cooking",
    title: "Authentic Italian home cooking, hands-on classes",
    offers: "3 cooking sessions",
    wants: "German lessons",
    tags: ["italian", "pasta", "cooking"],
  },
];

const filters = ["All", "Design", "Fitness", "Tutoring", "Code", "Music", "Cooking"];

const ExploreSection = () => {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? services : services.filter((s) => s.category === active);

  return (
    <section id="explore" className="container py-24 md:py-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Explore swaps</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4">
            Fresh skills, ready to trade.
          </h2>
          <p className="text-lg text-muted-foreground">
            Browse what your community is offering right now. Tap any card to start a swap.
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
        {filtered.map((service, i) => (
          <ServiceCard key={service.id} service={service} index={i} />
        ))}
      </div>
    </section>
  );
};

export default ExploreSection;
