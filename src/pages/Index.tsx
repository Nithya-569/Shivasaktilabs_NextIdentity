import HeroSection from "@/components/HeroSection";
import ActionCards from "@/components/ActionCards";
import ImpactStats from "@/components/ImpactStats";
import SuccessStories from "@/components/SuccessStories";

const Index = () => {
  return (
    <div className="pb-20 md:pb-0">
      <HeroSection />
      <ActionCards />
      <ImpactStats />
      <SuccessStories />

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">TC</span>
            </div>
            <span className="font-semibold text-foreground">TransConnect India</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Empowering transgender communities through dignity, skills & opportunity.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
