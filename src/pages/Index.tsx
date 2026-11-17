import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedServices from "@/components/FeaturedServices";
import BrowseCategories from "@/components/BrowseCategories";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
const Index = () => <div className="min-h-screen bg-background"><SEO title="Service Swap — Discover local skills and services" description="Find help nearby and exchange real skills with your community." canonical="/" /><Navbar /><main><Hero /><FeaturedServices /><BrowseCategories /></main><Footer /></div>;
export default Index;
