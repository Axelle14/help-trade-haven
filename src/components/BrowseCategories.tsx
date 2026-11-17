import { Link } from "react-router-dom";
import { Camera, Music, Code2, Shapes, BookOpen, Wrench, PenLine, Sparkles } from "lucide-react";
const items = [
  { name: "Photography", sub: "Editing, portraits, film", icon: Camera },
  { name: "Music", sub: "Guitar, piano, vocals", icon: Music },
  { name: "Coding", sub: "Web, mobile, data", icon: Code2 },
  { name: "Design", sub: "UI/UX, graphics, branding", icon: Shapes },
  { name: "Tutoring", sub: "Lessons, languages, learning", icon: BookOpen },
  { name: "Handyman", sub: "Repairs, home, maintenance", icon: Wrench },
  { name: "Writing", sub: "Copywriting, editing, resumes", icon: PenLine },
  { name: "Other", sub: "More skills to discover", icon: Sparkles },
];
export default function BrowseCategories() {
  return <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6"><h2 className="mb-5 text-base font-bold">Browse Categories</h2><div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">{items.map(item => <Link key={item.name} to={`/explore?category=${encodeURIComponent(item.name)}`} className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card"><item.icon className="h-5 w-5" strokeWidth={1.6} /></span><div className="min-w-0"><p className="text-xs font-semibold">{item.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{item.sub}</p></div></Link>)}</div></section>;
}