import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ExploreSection from "@/components/ExploreSection";
import SwapTracker from "@/components/SwapTracker";
import LocalCommunitiesPromo from "@/components/LocalCommunitiesPromo";
import Rewards from "@/components/Rewards";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Service Swap — Trade Skills, Not Cash"
        description="Barter your skills with verified neighbours across British Columbia. Design for tutoring, yoga for code reviews — no money required."
        canonical="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Service Swap",
          url: "https://help-trade-haven.lovable.app",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://help-trade-haven.lovable.app/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <ExploreSection />
        <SwapTracker />
        <LocalCommunitiesPromo />
        <Rewards />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
