import { motion } from "framer-motion";
import { Users, MessageCircle, Sparkles, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunityPage from "./CommunityPage";
import MessagesPage from "./MessagesPage";
import AnonymousPage from "./AnonymousPage";
import heroImage from "@/assets/hero-community.jpg";

const ConnectPage = () => {
  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 h-[40vh]">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        <div className="relative z-10 container py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl md:text-3xl font-black mb-2 text-foreground drop-shadow-sm">Connect 💜</h1>
            <p className="text-muted-foreground text-sm font-medium max-w-md">
              Your community, your conversations, your people. Share stories, find support, and build meaningful connections.
            </p>

            <div className="flex flex-wrap gap-3 mt-5">
              <button className="glass-card inline-flex items-center gap-2 px-4 py-2.5 text-primary text-sm font-bold rounded-2xl hover:scale-[1.03] transition-all duration-300">
                <Sparkles size={14} /> Find Similar Journeys
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container py-4 relative z-10">
        <Tabs defaultValue="community" className="space-y-5">
          <TabsList className="w-full grid grid-cols-3 glass-card rounded-2xl p-1.5 h-auto">
            <TabsTrigger value="community" className="rounded-xl py-3 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all">
              <Users size={16} className="mr-2" /> Community
            </TabsTrigger>
            <TabsTrigger value="anonymous" className="rounded-xl py-3 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all">
              <EyeOff size={16} className="mr-2" /> Anonymous
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-xl py-3 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all">
              <MessageCircle size={16} className="mr-2" /> Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="mt-0">
            <CommunityPage />
          </TabsContent>

          <TabsContent value="anonymous" className="mt-0">
            <AnonymousPage />
          </TabsContent>

          <TabsContent value="messages" className="mt-0">
            <MessagesPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConnectPage;
