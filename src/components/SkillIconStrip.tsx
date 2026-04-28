import { motion } from "framer-motion";
import {
  Guitar, Piano, Dumbbell, Code2, FileText, Languages,
  Camera, ChefHat, Palette, Wrench, GraduationCap, Sparkles,
} from "lucide-react";

const ICONS = [
  { icon: Guitar, label: "Guitar", color: "#E11D48" },
  { icon: Piano, label: "Piano", color: "#7C3AED" },
  { icon: Dumbbell, label: "Fitness", color: "#F97316" },
  { icon: Code2, label: "Coding", color: "#0EA5E9" },
  { icon: FileText, label: "Resume", color: "#0F766E" },
  { icon: Languages, label: "Languages", color: "#DB2777" },
  { icon: Camera, label: "Photo", color: "#9333EA" },
  { icon: ChefHat, label: "Cooking", color: "#D97706" },
  { icon: Palette, label: "Design", color: "#2563EB" },
  { icon: Wrench, label: "Repairs", color: "#475569" },
  { icon: GraduationCap, label: "Tutoring", color: "#16A34A" },
  { icon: Sparkles, label: "More", color: "#EAB308" },
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
            <span className="text-[10px] md:text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-smooth whitespace-nowrap leading-none">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SkillIconStrip;
