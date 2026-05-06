import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="Privacy Policy — ServiceSwap"
      description="Learn how ServiceSwap collects, uses, and protects your information."
      canonical="/privacy"
    />
    <Navbar />
    <main className="container max-w-3xl py-8 md:py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back home
      </Link>

      <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: May 2026</p>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="font-display font-semibold text-xl mb-2">Introduction</h2>
          <p>
            ServiceSwap ("we", "our", or "us") values your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use the ServiceSwap platform, website, and mobile application.
          </p>
          <p className="mt-3">By using ServiceSwap, you agree to the practices described in this policy.</p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-2">Information We Collect</h2>
          <p className="mb-2">We may collect:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Name or display name</li>
            <li>Email address</li>
            <li>Profile information</li>
            <li>Messages and service interactions</li>
            <li>Uploaded images or content</li>
            <li>Device and usage information</li>
            <li>Points and transaction activity within the platform</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-2">How We Use Information</h2>
          <p className="mb-2">We use collected information to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Create and manage accounts</li>
            <li>Enable skill exchanges between users</li>
            <li>Improve platform performance</li>
            <li>Prevent fraud and abuse</li>
            <li>Provide support and communication</li>
            <li>Analyze usage and improve features</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-2">Data Protection</h2>
          <p>We use secure technologies and encrypted connections to protect user data.</p>
          <p className="mt-3">We do not sell personal information to third parties.</p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-2">User Content</h2>
          <p>Users are responsible for content they upload or share on the platform.</p>
          <p className="mt-3">ServiceSwap may remove content that violates platform rules or community standards.</p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-2">Account Deletion</h2>
          <p>Users may request account deletion and data removal by contacting:</p>
          <p className="mt-2 font-medium">serviceswap455@gmail.com</p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-2">Third-Party Services</h2>
          <p className="mb-2">ServiceSwap may use trusted third-party providers including:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Google Authentication</li>
            <li>Supabase</li>
            <li>Hosting and analytics providers</li>
          </ul>
          <p className="mt-3">These services may process limited user data necessary for platform functionality.</p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-2">Children's Privacy</h2>
          <p>ServiceSwap is intended for users aged 18 and older.</p>
          <p className="mt-3">We do not knowingly collect data from children under 13.</p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-2">Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Updates will be posted on this page.</p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-2">Contact</h2>
          <p>For questions regarding this Privacy Policy:</p>
          <div className="mt-2 space-y-1">
            <p className="font-medium">ServiceSwap</p>
            <p>Email: serviceswap455@gmail.com</p>
            <p>
              Website:{" "}
              <a
                href="https://serviceswap.org"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://serviceswap.org
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
