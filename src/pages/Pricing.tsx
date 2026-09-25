import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PricingSection from "@/components/PricingSection";

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <SEO title="Pricing — Service Swap" description="Browse free or subscribe for $4.99/month to swap services with zero fees." canonical="/pricing" />
    <Navbar />
    <main className="pt-4">
      <PricingSection />
    </main>
    <Footer />
  </div>
);

export default Pricing;
