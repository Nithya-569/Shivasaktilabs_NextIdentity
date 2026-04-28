import { motion } from "framer-motion";
import { MapPin, ShoppingBag, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunityMapPage from "./CommunityMapPage";
import MarketplacePage from "./MarketplacePage";
import EventsPage from "./EventsPage";
import heroImage from "@/assets/hero-community.jpg";

const FindPage = () => {
  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 h-[40vh]">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        <div className="relative z-10 container py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl md:text-3xl font-black mb-2 text-foreground drop-shadow-sm">Find 📍</h1>
            <p className="text-muted-foreground text-sm font-medium max-w-md">
              Discover safe spaces, resources, shops & events near you. You're never far from support.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-4 relative z-10">
        <Tabs defaultValue="map" className="space-y-5">
          <TabsList className="w-full grid grid-cols-3 glass-card rounded-2xl p-1.5 h-auto">
            <TabsTrigger value="map" className="rounded-xl py-3 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all">
              <MapPin size={14} className="mr-1.5" /> Map
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="rounded-xl py-3 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all">
              <ShoppingBag size={14} className="mr-1.5" /> Shop
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl py-3 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card transition-all">
              <Calendar size={14} className="mr-1.5" /> Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-0"><CommunityMapPage /></TabsContent>
          <TabsContent value="marketplace" className="mt-0"><MarketplacePage /></TabsContent>
          <TabsContent value="events" className="mt-0"><EventsPage /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FindPage;
