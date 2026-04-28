import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const COPY: Record<string, { title: string; intro: string; body: string[] }> = {
  "/privacy": {
    title: "Privacy Policy",
    intro: "We respect your data and only collect what's needed to power swaps.",
    body: [
      "We store your account, profile, services, swaps, messages, and reviews to operate Service Swap.",
      "We never sell your personal data. Aggregated, non-identifying analytics may be used to improve the product.",
      "You can request export or deletion of your data at any time by contacting us.",
    ],
  },
  "/terms": {
    title: "Terms of Service",
    intro: "Plain-English ground rules for trading skills on Service Swap.",
    body: [
      "Be honest about the skills you offer and respectful in every interaction.",
      "No money exchange, no scams, no harassment. Reports are reviewed by our moderation team.",
      "We may suspend accounts that violate the community trust standards.",
    ],
  },
  "/contact": {
    title: "Contact",
    intro: "We'd love to hear from you.",
    body: [
      "Email: hello@serviceswap.app",
      "For partnerships, see our Partners page.",
      "For abuse or safety reports, use the in-app Report button on any profile.",
    ],
  },
  "/partners": {
    title: "Partner With Us",
    intro: "Help us grow community-led skill swaps in your city.",
    body: [
      "Sponsor a city launch and reach engaged local members.",
      "Join the Business Waitlist to be first in line when team accounts open.",
      "Reach out at partners@serviceswap.app.",
    ],
  },
};

const Legal = () => {
  const { pathname } = useLocation();
  const page = COPY[pathname] ?? COPY["/contact"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-3xl py-8 md:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>
        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4">
          {page.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-10">{page.intro}</p>
        <div className="space-y-5 text-foreground/90 leading-relaxed">
          {page.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Legal;
