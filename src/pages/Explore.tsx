import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumExploreFeed from "@/components/PremiumExploreFeed";
import SEO from "@/components/SEO";

const Explore = () => {
  return (
    <div className="browse-theme min-h-screen">
      <SEO
        title="Browse Services — Service Swap"
        description="Browse skills offered by your local Service Swap community. Book tutoring, design, fitness, language lessons and more with points."
        canonical="/explore"
      />
      <Navbar />
      <main>
        <PremiumExploreFeed />
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
