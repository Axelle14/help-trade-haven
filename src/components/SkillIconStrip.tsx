import { motion } from "framer-motion";
import {
  Guitar, Piano, Dumbbell, Code2, FileText, Languages,
  Camera, ChefHat, Palette, Wrench, GraduationCap, Sparkles,
} from "lucide-react";

const ICONS = [
  { icon: Guitar, label: "Guitar", color: "#8B6A45" },
  { icon: Piano, label: "Piano", color: "#A5713F" },
  { icon: Dumbbell, label: "Fitness", color: "#9C826A" },
  { icon: Code2, label: "Coding", color: "#7A6A52" },
  { icon: FileText, label: "Resume", color: "#6F5A46" },
  { icon: Languages, label: "Languages", color: "#B08659" },
  { icon: Camera, label: "Photo", color: "#8A7256" },
  { icon: ChefHat, label: "Cooking", color: "#C79A63" },
  { icon: Palette, label: "Design", color: "#7E6B57" },
  { icon: Wrench, label: "Repairs", color: "#5E5044" },
  { icon: GraduationCap, label: "Tutoring", color: "#96794F" },
  { icon: Sparkles, label: "More", color: "#A9825A" },
];

interface SkillIconStripProps {
  caption?: string;
  className?: string;
}

const SkillIconStrip = ({
  caption = "A little bit of everything",
  className = "",
}: SkillIconStripProps) => {
  return (
    <div className={className}>
      {caption && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-5 text-center">
          {caption}
        </p>
      )}
      <div className="grid grid-cols-6 md:flex md:flex-wrap items-start md:items-center justify-items-center md:justify-center gap-x-2 gap-y-4 md:gap-x-9 md:gap-y-6">
        {ICONS.map(({ icon: Icon, label, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
            className="group flex flex-col items-center gap-2 cursor-default"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 2.6 + (i % 4) * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.18,
              }}
              whileHover={{ scale: 1.18, rotate: [-6, 6, -4, 0], transition: { duration: 0.5 } }}
            >
              <Icon
                className="w-9 h-9 md:w-11 md:h-11 drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_10px_22px_rgba(0,0,0,0.28)] transition-smooth"
                style={{ color }}
                strokeWidth={2}
              />
            </motion.div>
            <span className="text-[10px] md:text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-smooth md:whitespace-nowrap leading-tight text-center">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SkillIconStrip;
