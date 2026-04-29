import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumExploreFeed from "@/components/PremiumExploreFeed";
import SEO from "@/components/SEO";

const Explore = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Explore Skills — Service Swap"
        description="Browse skills offered by your local Service Swap community. Book tutoring, design, fitness, language lessons and more with points."
        canonical="/explore"
      />
      <Navbar />
      <main className="pt-2 md:pt-6">
        <PremiumExploreFeed />
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
