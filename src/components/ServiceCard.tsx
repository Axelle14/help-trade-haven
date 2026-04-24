import { Button } from "@/components/ui/button";
import { Star, MapPin, BadgeCheck, Repeat2 } from "lucide-react";
import { motion } from "framer-motion";

export interface Service {
  id: string;
  user: string;
  initials: string;
  avatarFrom: string;
  avatarTo: string;
  verified: boolean;
  rating: number;
  reviews: number;
  location: string;
  category: string;
  title: string;
  offers: string;
  wants: string;
  tags: string[];
}

interface Props {
  service: Service;
  index?: number;
}

const ServiceCard = ({ service, index = 0 }: Props) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group bg-card rounded-3xl p-6 shadow-soft hover:shadow-float transition-smooth hover:-translate-y-1 border border-foreground/5 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft"
            style={{ background: `linear-gradient(135deg, ${service.avatarFrom}, ${service.avatarTo})` }}
          >
            {service.initials}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="font-semibold text-sm">{service.user}</p>
              {service.verified && <BadgeCheck className="w-4 h-4 text-primary fill-primary/15" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-warning text-warning" />
                {service.rating} ({service.reviews})
              </span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {service.location}
              </span>
            </div>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-secondary text-[10px] font-semibold uppercase tracking-wider">
          {service.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-lg mb-4 leading-tight group-hover:text-primary transition-smooth">
        {service.title}
      </h3>

      {/* Swap visualization */}
      <div className="bg-background/60 rounded-2xl p-4 mb-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-success tracking-wider w-12">Offers</span>
          <span className="text-sm font-medium">{service.offers}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Repeat2 className="w-3.5 h-3.5 ml-12 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-accent tracking-wider w-12">Wants</span>
          <span className="text-sm font-medium">{service.wants}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {service.tags.map((tag) => (
          <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[11px] font-medium">
            #{tag}
          </span>
        ))}
      </div>

      <Button variant="default" size="sm" className="w-full mt-auto">
        Propose a swap
      </Button>
    </motion.article>
  );
};

export default ServiceCard;
