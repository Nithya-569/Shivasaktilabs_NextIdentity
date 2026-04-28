import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-8 md:py-20">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
              🏳️‍⚧️ Empowering Transgender Communities
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground leading-tight">
              Your journey to independence{" "}
              <span className="text-primary">starts here.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Jobs, skills, community & business opportunities — all in one safe, inclusive space for India's transgender community.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl shadow-soft hover:shadow-card transition-all active:scale-[0.96]"
              >
                Find Jobs
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/skills"
                className="inline-flex items-center gap-2 px-6 py-3 bg-card text-foreground font-medium rounded-xl shadow-soft hover:shadow-card transition-all active:scale-[0.96] border border-border"
              >
                Learn Skills
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/10 text-secondary font-medium rounded-xl hover:bg-secondary/20 transition-all active:scale-[0.96]"
              >
                Join Community
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <img
              src={heroImage}
              alt="Diverse transgender individuals standing confidently together in an Indian city"
              className="rounded-2xl shadow-elevated w-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
