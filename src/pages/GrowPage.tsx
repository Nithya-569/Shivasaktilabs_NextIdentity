import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Award, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobsPage from "./JobsPage";
import SkillsPage from "./SkillsPage";
import MentorsPage from "./MentorsPage";
import heroImage from "@/assets/hero-community.jpg";

const GrowPage = () => {
  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 h-[40vh]">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        <div className="relative z-10 container py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card inline-flex items-center gap-2 px-3 py-1.5 text-primary text-xs font-black rounded-full mb-3">
              <Sparkles size={12} /> AI-powered recommendations
            </div>
            <h1 className="text-2xl md:text-3xl font-black mb-2 text-foreground drop-shadow-sm">Grow 🌱</h1>
            <p className="text-muted-foreground text-sm font-medium max-w-md">
              Build your future at your own pace. Jobs, skills & mentorship — all designed to support your journey.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-4 relative z-10">
        <Tabs defaultValue="jobs" className="space-y-5">
          <TabsList className="w-full grid grid-cols-3 glass-card rounded-2xl p-1.5 h-auto">
            <TabsTrigger value="jobs" className="rounded-xl py-3 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all">
              <Briefcase size={14} className="mr-1.5" /> Jobs
            </TabsTrigger>
            <TabsTrigger value="skills" className="rounded-xl py-3 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all">
              <GraduationCap size={14} className="mr-1.5" /> Skills
            </TabsTrigger>
            <TabsTrigger value="mentors" className="rounded-xl py-3 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all">
              <Award size={14} className="mr-1.5" /> Mentors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-0"><JobsPage /></TabsContent>
          <TabsContent value="skills" className="mt-0"><SkillsPage /></TabsContent>
          <TabsContent value="mentors" className="mt-0"><MentorsPage /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GrowPage;
