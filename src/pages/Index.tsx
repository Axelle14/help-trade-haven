import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import TrustSafety from "@/components/TrustSafety";
import ScrollingTestimonials from "@/components/ScrollingTestimonials";
import WaitlistPopup from "@/components/WaitlistPopup";
import CTA from "@/components/CTA";
import ReferralBanner from "@/components/ReferralBanner";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Service Swap — Trade Skills, Earn Points, Get Help in BC"
        description="Join your city's skill-sharing community in BC. Get 100 free points to book tutoring, design, fitness, repairs and more — no cash, no fees."
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
        <ScrollingTestimonials />
        <HowItWorks />
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
