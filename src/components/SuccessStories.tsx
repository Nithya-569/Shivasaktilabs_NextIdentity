import { motion } from "framer-motion";
import VerifiedBadge from "./VerifiedBadge";

const stories = [
  {
    name: "Priya Sharma",
    role: "Runs a tailoring business",
    quote: "TransConnect helped me find my first customers and connect with a mentor who taught me to manage finances.",
    location: "Mumbai",
  },
  {
    name: "Lakshmi Narayanan",
    role: "Digital marketing freelancer",
    quote: "I learned digital skills through a training program here. Now I earn independently from home.",
    location: "Chennai",
  },
  {
    name: "Aisha Khan",
    role: "Chef & Restaurant Owner",
    quote: "Our community started a small restaurant together. Today we serve 200 meals a day!",
    location: "Bangalore",
  },
];

const SuccessStories = () => {
  return (
    <section className="py-8 md:py-16 bg-muted/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">Success Stories</h2>
          <p className="text-muted-foreground text-balance">Real people, real journeys to independence</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stories.map((story, i) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {story.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{story.name}</p>
                    <VerifiedBadge />
                  </div>
                  <p className="text-xs text-muted-foreground">{story.role} • {story.location}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{story.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
