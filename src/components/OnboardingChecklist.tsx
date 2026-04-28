import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PRONOUN_OPTIONS = ["she/her", "he/him", "they/them", "ze/zir"];

const OnboardingChecklist = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [pronouns, setPronouns] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("onboarding_completed, preferred_pronouns, location, skills")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled || !data) return;
      if (!data.onboarding_completed) {
        setPronouns(data.preferred_pronouns || "");
        setLocation(data.location || "");
        setSkills((data.skills || []).join(", "));
        setOpen(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const dismiss = async () => {
    if (!user) return;
    await (supabase as any).from("profiles").update({ onboarding_completed: true }).eq("user_id", user.id);
    setOpen(false);
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    const skillsArr = skills.split(",").map((s) => s.trim()).filter(Boolean);
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        preferred_pronouns: pronouns || null,
        location: location || null,
        skills: skillsArr.length ? skillsArr : null,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome aboard! 🌸", description: "Your profile is ready." });
      setOpen(false);
    }
  };

  const steps = [
    {
      title: "What pronouns feel right? 💜",
      desc: "Optional — you can change this anytime.",
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRONOUN_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPronouns(p)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold transition ${
                  pronouns === p
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-muted/60 text-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <Input
            placeholder="Or type your own"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
      ),
    },
    {
      title: "Where are you based? 🌍",
      desc: "Helps us connect you with nearby resources & people.",
      content: (
        <Input
          placeholder="City, State"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-12 rounded-2xl"
          autoFocus
        />
      ),
    },
    {
      title: "What are you good at? ✨",
      desc: "A few skills, comma-separated. Skip if unsure.",
      content: (
        <Input
          placeholder="e.g. Tailoring, Cooking, Design"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="h-12 rounded-2xl"
          autoFocus
        />
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="sm:max-w-md rounded-3xl glass-card border-border/40">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
            <Sparkles size={14} /> QUICK SETUP · {step + 1} of {steps.length}
          </div>
          <DialogTitle className="text-xl font-black">{current.title}</DialogTitle>
          <DialogDescription className="text-sm">{current.desc}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1.5 mt-1 mb-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="py-2"
          >
            {current.content}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={dismiss} className="text-muted-foreground rounded-2xl">
            Skip for now
          </Button>
          {isLast ? (
            <Button onClick={handleFinish} disabled={saving} className="rounded-2xl font-black shadow-glow">
              <Check size={16} className="mr-1.5" /> {saving ? "Saving..." : "Finish"}
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => s + 1)} className="rounded-2xl font-black shadow-glow">
              Next <ArrowRight size={16} className="ml-1.5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingChecklist;
