import { motion } from "framer-motion";
import { ShieldCheck, Coins, Infinity as InfinityIcon } from "lucide-react";
import explainer from "@/assets/videos/serviceswap-explainer.mp4.asset.json";

const Hero = () => {
  return (
    <section className="container pt-4 md:pt-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl gradient-primary p-2 md:p-3 shadow-float"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Video explaining what ServiceSwap is and how to use it"
          src={explainer.url}
          className="block w-full aspect-video rounded-2xl bg-primary object-cover"
        />
      </motion.div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs md:text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2"><InfinityIcon className="h-4 w-4 text-primary" />Unlimited swaps</div>
        <div className="flex items-center justify-center gap-2"><Coins className="h-4 w-4 text-primary" />0% service fees</div>
        <div className="flex items-center justify-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Verified members</div>
      </div>
    </section>
  );
};

export default Hero;
