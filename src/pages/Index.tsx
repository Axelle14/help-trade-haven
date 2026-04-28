import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ExploreSection from "@/components/ExploreSection";
import SwapTracker from "@/components/SwapTracker";
import LocalCommunitiesPromo from "@/components/LocalCommunitiesPromo";
import Rewards from "@/components/Rewards";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
