import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageCircle, Briefcase, MapPin, Heart, Users, 
  Sparkles, TrendingUp, Star, ArrowRight, Shield, Bot, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-community.jpg";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [stats, setStats] = useState({ jobs: 0, communities: 0, mentors: 0 });

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("name").eq("user_id", user.id).single()
        .then(({ data }) => setProfileName(data?.name || null));
    }
    
    Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("communities").select("*", { count: "exact", head: true }),
      supabase.from("mentors").select("*", { count: "exact", head: true }),
    ]).then(([jobs, communities, mentors]) => {
      setStats({
        jobs: jobs.count || 0,
        communities: communities.count || 0,
        mentors: mentors.count || 0,
      });
    });
  }, [user]);

  const quickActions = [
    { icon: Bot, label: "Talk to\nAI Support", path: "/support", iconBg: "from-primary/80 to-primary/50" },
    { icon: EyeOff, label: "Post\nAnonymously", path: "/connect", iconBg: "from-secondary/80 to-secondary/50" },
    { icon: Briefcase, label: "Find Jobs\nNear Me", path: "/grow", iconBg: "from-safe-green/70 to-primary/50" },
    { icon: MapPin, label: "Explore\nResources", path: "/find", iconBg: "from-accent/80 to-soft-purple/50" },
  ];

  const impactStats = [
    { value: "12,400+", label: "People Trained", icon: Users, gradient: "from-primary/12 to-primary/4" },
    { value: "3,200+", label: "Jobs Created", icon: Briefcase, gradient: "from-secondary/12 to-secondary/4" },
    { value: "452", label: "Businesses Started", icon: TrendingUp, gradient: "from-accent/12 to-accent/4" },
    { value: "85%", label: "Placement Rate", icon: Star, gradient: "from-safe-green/12 to-safe-green/4" },
  ];

  const stories = [
    { name: "Priya Sharma", role: "Runs a tailoring business", quote: "NextIdentity helped me find my first customers and connect with a mentor who understood my journey.", location: "Mumbai", emoji: "🪡" },
    { name: "Lakshmi N.", role: "Digital marketing freelancer", quote: "I learned digital skills here. Now I earn independently from home and feel so empowered.", location: "Chennai", emoji: "💻" },
    { name: "Aisha Khan", role: "Chef & Restaurant Owner", quote: "Our community started a restaurant together. Today we serve 200 meals a day with pride!", location: "Bangalore", emoji: "🍳" },
  ];

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      {/* Full-screen hero background */}
      <div className="relative">
        {/* Hero image as full background */}
        <div className="absolute inset-0 h-[70vh] md:h-[60vh]">
          <img 
            src={heroImage} 
            alt="Diverse group of Indian trans and gender-diverse people embracing with warmth and support"
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
            width={1280}
            height={640}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />
        </div>

        {/* Content overlaying the hero */}
        <div className="relative z-10">
          {/* Header bar — logo + safe space tag */}
          <div className="container pt-4 pb-2 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-full px-4 py-2 flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg gradient-warm flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-black text-[10px]">NI</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-black text-foreground">NextIdentity</span>
                <span className="text-[10px] font-semibold text-muted-foreground">Your safe space 🌈</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="pride-bar w-12 h-1.5 rounded-full shadow-glow"
            />
          </div>

          {/* Greeting */}
          <div className="container pt-10 pb-8 md:pt-20 md:pb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm font-bold text-primary/80 mb-2 tracking-wide uppercase">
                {user && profileName ? `Welcome back, ${profileName}` : "Welcome back"}
              </p>
              <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight drop-shadow-sm">
                You're not alone here <span className="inline-block">❤️</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-md mx-auto font-semibold">
                A graceful, warm space made just for you.
              </p>
            </motion.div>
          </div>

          {/* 2x2 Action Cards - Glassmorphism */}
          <div className="container pb-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass-card rounded-[2rem] p-5"
            >
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, i) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >
                    <Link
                      to={action.path}
                      className="glass-card rounded-2xl p-6 flex flex-col items-center text-center group hover:scale-[1.03] transition-all duration-300 block min-h-[150px] justify-center"
                    >
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${action.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-elevated glow-primary`}>
                        <action.icon size={36} className="text-primary-foreground" strokeWidth={2.2} />
                      </div>
                      <span className="text-sm font-black text-foreground whitespace-pre-line leading-tight">{action.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Daily Reminder - Glass */}
          <div className="container pb-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/support" className="glass-card rounded-2xl p-4 flex items-center justify-between group hover:scale-[1.01] transition-all duration-300 block">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-secondary shrink-0" />
                  <span className="text-sm font-extrabold text-foreground">Daily Reminder</span>
                </div>
                <ArrowRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {user && (
            <div className="container pb-8 grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <Link to="/messages" className="glass-card rounded-2xl p-4 flex items-center gap-3 group hover:scale-[1.02] transition-all duration-300 block">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <MessageCircle size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground leading-tight">Messages</p>
                    <p className="text-[11px] text-muted-foreground font-semibold">Direct chats</p>
                  </div>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link to="/connect" className="glass-card rounded-2xl p-4 flex items-center gap-3 group hover:scale-[1.02] transition-all duration-300 block">
                  <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0">
                    <Users size={18} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground leading-tight">Community Chats</p>
                    <p className="text-[11px] text-muted-foreground font-semibold">Group rooms</p>
                  </div>
                </Link>
              </motion.div>
            </div>
          )}

          {!user && (
            <div className="container pb-8">
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-3"
              >
                <Button size="lg" className="rounded-2xl shadow-glow font-black px-8 h-12 text-base" onClick={() => navigate("/auth")}>
                  Join the Community <ArrowRight size={18} className="ml-1.5" />
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Below-the-fold sections on solid background */}
      {/* Live Platform Stats */}
      <section className="container mb-10 mt-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active Jobs", count: stats.jobs, path: "/grow", emoji: "💼", gradient: "from-primary/10 to-primary/3" },
            { label: "Communities", count: stats.communities, path: "/connect", emoji: "👥", gradient: "from-secondary/10 to-secondary/3" },
            { label: "Mentors", count: stats.mentors, path: "/grow", emoji: "⭐", gradient: "from-accent/10 to-accent/3" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            >
              <Link
                to={item.path}
                className="block glass-card rounded-3xl p-5 text-center hover:scale-[1.03] transition-all duration-300"
              >
                <span className="text-2xl mb-2 block">{item.emoji}</span>
                <p className="text-2xl font-black text-foreground tabular-nums">{item.count}</p>
                <p className="text-xs text-muted-foreground font-semibold mt-1">{item.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Impact */}
      <section className="container mb-10">
        <h2 className="text-xl font-black mb-5 text-foreground">Community impact 🌍</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {impactStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="glass-card rounded-3xl p-5 text-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-card/90 flex items-center justify-center mx-auto mb-3 shadow-card">
                <stat.icon size={18} className="text-primary" />
              </div>
              <p className="text-xl font-black text-foreground tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-10 rounded-[2rem] mx-3 md:mx-0 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-strong" />
        <div className="container relative">
          <h2 className="text-xl font-black mb-6 text-foreground">Success stories 💛</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stories.map((story, i) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass-card rounded-3xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl gradient-warm flex items-center justify-center text-lg shadow-card">
                    {story.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{story.name}</p>
                    <p className="text-xs text-muted-foreground">{story.role} · {story.location}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{story.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/40">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl gradient-warm flex items-center justify-center shadow-card">
              <span className="text-primary-foreground font-black text-sm">NI</span>
            </div>
            <span className="font-black text-lg text-foreground">NextIdentity</span>
          </div>
          <div className="pride-bar w-24 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Empowering transgender & gender-diverse communities through dignity, skills & opportunity. 🌸
          </p>
          <p className="text-xs text-muted-foreground/60 mt-4">Made with ❤️ for the community</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
