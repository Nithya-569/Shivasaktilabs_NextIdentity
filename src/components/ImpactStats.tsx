import { motion } from "framer-motion";
import { TrendingUp, Users, Briefcase, Store } from "lucide-react";

const stats = [
  { icon: Users, value: "12,400+", label: "People Trained", color: "bg-sky-50 text-sky-600" },
  { icon: Briefcase, value: "3,200+", label: "Jobs Created", color: "bg-pink-50 text-pink-500" },
  { icon: Store, value: "452", label: "Businesses Started", color: "bg-green-50 text-green-600" },
  { icon: TrendingUp, value: "85%", label: "Placement Rate", color: "bg-amber-50 text-amber-600" },
];

const ImpactStats = () => {
  return (
    <section className="py-8 md:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">Our Impact</h2>
          <p className="text-muted-foreground">Real change, measured in lives transformed</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-soft text-center"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
