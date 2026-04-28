import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Users, ArrowRight, Sparkles } from "lucide-react";

const BC_CITIES = [
  "Vancouver", "Surrey", "Burnaby", "Richmond", "Coquitlam",
  "Langley", "Victoria", "Kelowna", "Abbotsford", "Nanaimo",
];

const LocalCommunitiesPromo = () => {
  return (
    <section id="community" className="container py-20 md:py-28">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">
            <MapPin className="w-3.5 h-3.5" /> Now live across British Columbia
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight leading-[1.1] mb-5">
            Trade skills with the<br /><span className="text-primary">people next door.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg">
            Local Communities turn Service Swap into a city-by-city movement.
            Chat, meet, and swap with verified neighbors — building real trust at street level.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" variant="hero" asChild>
              <Link to="/communities"><Sparkles className="w-4 h-4" /> Explore your city</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/communities">See all 10 BC cities <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
            <Users className="w-4 h-4" /> Join 10 active BC cities — more provinces coming soon.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {BC_CITIES.map((city, i) => (
            <Link
              key={city}
              to={`/communities/${city.toLowerCase()}`}
              className={`group rounded-2xl p-5 border border-foreground/10 bg-card hover:shadow-card hover:-translate-y-1 transition-smooth flex flex-col gap-2 ${i % 3 === 0 ? "row-span-1" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-lg">{city}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">BC · Canada</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocalCommunitiesPromo;
