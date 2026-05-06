import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const DeleteAccount = () => (
  <div className="min-h-screen bg-background">
    <SEO title="Delete Your Account | ServiceSwap" description="Request permanent deletion of your ServiceSwap account and associated data." />
    <Navbar />
    <main className="container max-w-3xl py-8 md:py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-8">
        <ArrowLeft className="w-4 h-4" /> Back home
      </Link>

      <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-6">
        Delete Your ServiceSwap Account
      </h1>

      <div className="space-y-6 text-foreground/90 leading-relaxed">
        <p>Users may request permanent deletion of their ServiceSwap account and associated data.</p>

        <section>
          <h2 className="font-display font-bold text-2xl mb-3">To request deletion:</h2>
          <p>
            Email:{" "}
            <a href="mailto:serviceswap455@gmail.com" className="text-primary hover:underline">
              serviceswap455@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-2xl mb-3">Include:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Your account email</li>
            <li>Your display name</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-2xl mb-3">Deleted data may include:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Profile information</li>
            <li>Messages</li>
            <li>Listings</li>
            <li>Uploaded content</li>
          </ul>
        </section>

        <p>Some records may be temporarily retained for security, fraud prevention, or legal compliance purposes.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default DeleteAccount;
