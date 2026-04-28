import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Users, Store, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    icon: Briefcase,
    title: "Find Jobs",
    description: "Connect with inclusive employers who value your skills.",
    path: "/jobs",
    accent: "border-b-4 border-sky-400",
    iconBg: "bg-sky-50 text-sky-600",
  },
  {
    icon: GraduationCap,
    title: "Learn Skills",
    description: "Free training in cooking, beauty, digital skills & more.",
    path: "/skills",
    accent: "border-b-4 border-pink-400",
    iconBg: "bg-pink-50 text-pink-500",
  },
  {
    icon: Users,
    title: "Join Community",
    description: "Find support, mentors, and start projects together.",
    path: "/community",
    accent: "border-b-4 border-violet-400",
    iconBg: "bg-violet-50 text-violet-600",
  },
  {
    icon: Store,
    title: "Sell Products",
    description: "List your handicrafts, food, clothing & artwork.",
    path: "/marketplace",
    accent: "border-b-4 border-amber-400",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    icon: MapPin,
    title: "Explore Near Me",
    description: "Find businesses, training centers & safe spaces nearby.",
    path: "/map",
    accent: "border-b-4 border-green-400",
    iconBg: "bg-green-50 text-green-600",
  },
  {
    icon: Heart,
    title: "Find a Mentor",
    description: "Get guidance in business, cooking, marketing & more.",
    path: "/mentors",
    accent: "border-b-4 border-secondary",
    iconBg: "bg-pink-50 text-secondary",
  },
];

const ActionCards = () => {
  return (
    <section className="py-8 md:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">What would you like to do?</h2>
          <p className="text-muted-foreground">Choose your path to independence</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
            >
              <Link
                to={action.path}
                className={`block bg-card p-6 rounded-2xl shadow-soft ${action.accent} transition-shadow hover:shadow-card`}
              >
                <div className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center mb-4`}>
                  <action.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground">{action.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActionCards;
