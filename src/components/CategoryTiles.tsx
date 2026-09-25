import { Link } from "react-router-dom";

const tiles = [
  { label: "Design", emoji: "🎨" },
  { label: "Tech", emoji: "💻" },
  { label: "Writing", emoji: "📝" },
  { label: "Photography", emoji: "📷" },
  { label: "Tutoring", emoji: "🎓" },
  { label: "Home Services", emoji: "🌿" },
  { label: "Music", emoji: "🎵" },
  { label: "Other", emoji: "✨" },
];

const CategoryTiles = () => (
  <section className="container py-8 md:py-12">
    <h2 className="font-display text-2xl md:text-3xl mb-5">Explore by category</h2>
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
      {tiles.map((t) => (
        <Link
          key={t.label}
          to={`/explore?category=${encodeURIComponent(t.label)}`}
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 md:p-4 text-center transition-smooth hover:border-primary hover:shadow-card"
        >
          <span className="text-2xl md:text-3xl">{t.emoji}</span>
          <span className="text-[11px] md:text-xs font-semibold leading-tight">{t.label}</span>
        </Link>
      ))}
    </div>
  </section>
);

export default CategoryTiles;
