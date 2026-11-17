import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import TrustSafety from "@/components/TrustSafety";
import FeaturedServices from "@/components/FeaturedServices";
import WaitlistPopup from "@/components/WaitlistPopup";
import CategoryTiles from "@/components/CategoryTiles";
import PricingSection from "@/components/PricingSection";
import CTA from "@/components/CTA";
import ReferralBanner from "@/components/ReferralBanner";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Service Swap — Unlimited Skill Swaps for $4.99/month"
        description="Subscribe once and swap tutoring, design, repairs and more with zero service fees."
        canonical="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Service Swap",
          url: "https://serviceswap.org",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://serviceswap.org/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <Navbar />
      <main>
        <Hero />
        <CategoryTiles />
        <FeaturedServices />
        <HowItWorks />
        <PricingSection />
        <TrustSafety />
        <CTA />
        <ReferralBanner />
      </main>
      <Footer />
      <WaitlistPopup />
    </div>
  );
};

export default Index;
