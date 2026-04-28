import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Scale, Phone, ExternalLink, Bot, Smile, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIChatbot from "@/components/AIChatbot";
import MoodJournal from "@/components/MoodJournal";
import heroImage from "@/assets/hero-community.jpg";

const SupportPage = () => {
  const [showChat, setShowChat] = useState(false);
  const [showMood, setShowMood] = useState(false);

  const resources = [
    {
      icon: "🧘",
      title: "Mental Health Support",
      description: "Access free counseling resources, helplines, and self-care tools designed for the transgender community.",
      links: [
        { label: "iCall (Tata Institute)", url: "https://icallhelpline.org/", phone: "9152987821" },
        { label: "Vandrevala Foundation", url: "https://www.vandrevalafoundation.com/", phone: "1860-2662-345" },
      ],
    },
    {
      icon: "⚖️",
      title: "Legal & Identity Guidance",
      description: "Step-by-step guides for name change, gender marker change, Aadhaar updates, and your rights under NALSA judgment.",
      steps: [
        "1. Obtain affidavit declaring gender identity",
        "2. Apply for name/gender change in gazette",
        "3. Update Aadhaar with supporting documents",
        "4. Update PAN, passport, voter ID",
      ],
    },
    {
      icon: "🏥",
      title: "Healthcare Resources",
      description: "Find trans-affirming doctors, clinics, and healthcare providers across India.",
      links: [
        { label: "List of affirming clinics", url: "#" },
        { label: "Hormone therapy guide", url: "#" },
      ],
    },
    {
      icon: "📞",
      title: "Emergency Helplines",
      description: "If you're in immediate danger or crisis, reach out to these services.",
      links: [
        { label: "Police (Emergency)", phone: "112" },
        { label: "Women Helpline", phone: "181" },
        { label: "KIRAN Mental Health", phone: "1800-599-0019" },
      ],
    },
  ];

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 h-[40vh]">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        <div className="relative z-10 container py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl md:text-3xl font-black mb-2 text-foreground drop-shadow-sm">Support 💛</h1>
            <p className="text-muted-foreground text-sm font-medium max-w-md">
              Mental health, legal guidance & safety resources. We're here for you, always.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-6 space-y-6 relative z-10">
        {/* AI Chatbot Hero Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-card rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 bg-primary/8 rounded-full blur-[60px]" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5">
              <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow shrink-0" style={{ width: 72, height: 72 }}>
                <Bot size={36} className="text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-foreground mb-1.5">AI Mental Health Companion 🤗</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  A warm, gender-affirming chatbot available 24/7 for emotional support. Talk about anything — your feelings, your journey, or just to have someone listen.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setShowChat(true)} className="rounded-2xl font-black shadow-glow px-6 h-11">
                    <Bot size={16} className="mr-2" /> Talk to AI Companion <ArrowRight size={14} className="ml-1" />
                  </Button>
                  <Button variant="outline" onClick={() => setShowMood(true)} className="rounded-2xl font-bold border-2 border-primary/30 h-11 hover:shadow-card glass-card">
                    <Smile size={16} className="mr-2" /> Mood Journal
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-3 italic">
                  ⚠️ This is not a replacement for professional mental health care. If you're in crisis, call 1800-599-0019.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass-card rounded-3xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">Your privacy matters</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This section is completely private. No data from your visits here is tracked or shared. You're in a safe space. 🌸
              </p>
            </div>
          </div>
        </motion.div>

        {/* Resource Cards */}
        <div className="space-y-4">
          {resources.map((resource, i) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
            >
              <div className="glass-card rounded-3xl p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/15 to-accent/10 flex items-center justify-center text-2xl shrink-0 shadow-soft">{resource.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-black text-foreground mb-1.5">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{resource.description}</p>

                    {resource.steps && (
                      <div className="space-y-2 mb-3">
                        {resource.steps.map((step) => (
                          <p key={step} className="text-xs text-muted-foreground flex items-start gap-2">
                            <Scale size={12} className="shrink-0 mt-0.5 text-primary" />
                            {step}
                          </p>
                        ))}
                      </div>
                    )}

                    {resource.links && (
                      <div className="flex flex-wrap gap-2">
                        {resource.links.map((link) => (
                          <div key={link.label} className="flex items-center gap-2">
                            {link.url && link.url !== "#" && (
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-bold">
                                <ExternalLink size={10} /> {link.label}
                              </a>
                            )}
                            {link.phone && (
                              <a href={`tel:${link.phone}`} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold hover:bg-primary/20 hover:shadow-soft transition-all">
                                <Phone size={10} /> {link.phone}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="glass-card p-5 rounded-3xl">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            ⚠️ The resources listed here are for information only and do not replace professional medical, legal, or mental health advice. If you are in crisis, please contact emergency services (112) or the KIRAN helpline (1800-599-0019) immediately.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showChat && <AIChatbot onClose={() => setShowChat(false)} />}
        {showMood && <MoodJournal onClose={() => setShowMood(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default SupportPage;
