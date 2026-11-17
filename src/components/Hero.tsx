import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import helpPhoto from "@/assets/skills-sharing-group.png";

export default function Hero() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  return <section className="relative mx-auto max-w-6xl overflow-hidden sm:mt-4 sm:rounded-lg">
    <img src={helpPhoto} alt="A group of people sharing skills outdoors with a guitar and laptop" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover object-[65%_35%]" />
    <div className="photo-shade absolute inset-0" />
    <div className="relative px-6 py-12 text-primary-foreground sm:px-10 sm:py-16 md:py-20">
      <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-base font-extrabold text-primary-foreground shadow-glow md:text-lg"><Sparkles className="h-5 w-5" />ServiceSwap</p>
      <h1 className="max-w-lg text-4xl font-bold leading-tight md:text-5xl">Your skills have values,<br />use them</h1>
      <form onSubmit={e => { e.preventDefault(); if(query.trim()) navigate(`/assistant?q=${encodeURIComponent(query.trim())}`); }} className="mt-7 flex max-w-md items-center gap-2 rounded-full bg-card p-1.5 text-foreground shadow-soft">
        <input aria-label="How can I help you?" placeholder="How can I help you?" value={query} onChange={e => setQuery(e.target.value)} className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground" />
        <Button type="submit" size="icon" className="shrink-0 rounded-full" aria-label="Find someone"><ArrowRight /></Button>
      </form>
    </div>
  </section>;
}
