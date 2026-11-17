import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsBell } from "@/components/NotificationsBell";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
const links = [{label:"Explore",to:"/explore"},{label:"AI Assistant",to:"/assistant"},{label:"Communities",to:"/communities"},{label:"Membership",to:"/pricing"}];
export default function Navbar() {
  const {user} = useAuth(); const location = useLocation(); const [open,setOpen] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 pt-safe backdrop-blur-lg"><nav className="mx-auto flex h-[72px] max-w-6xl items-center gap-3 px-4 sm:px-6"><Link to="/" className="flex shrink-0 items-center gap-2"><img src={logo} alt="Service Swap" width={32} height={32} className="h-8 w-8 rounded-full" /><span className="text-sm font-extrabold sm:text-lg">Service Swap</span></Link><div className="ml-auto hidden items-center gap-7 lg:flex">{links.map(l => <Link key={l.to} to={l.to} className={cn("text-xs font-semibold",location.pathname === l.to ? "text-primary" : "text-muted-foreground hover:text-foreground")}>{l.label}</Link>)}</div><div className="ml-auto flex shrink-0 items-center gap-1.5 lg:ml-6">{user ? <><NotificationsBell /><Button asChild variant="outline" size="sm"><Link to="/dashboard">Profile</Link></Button></> : <><Button asChild variant="ghost" size="sm" className="px-2 font-bold"><Link to="/auth">Sign in</Link></Button><Button asChild size="sm" className="px-3"><Link to="/auth">Join Free</Link></Button></>}<Button variant="ghost" size="icon" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)} className="h-9 w-9 lg:hidden">{open ? <X /> : <Menu />}</Button></div></nav>{open && <div className="border-t border-border px-4 py-3 lg:hidden">{links.map(l => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-semibold hover:bg-secondary">{l.label}</Link>)}</div>}</header>;
}
